import { Request, Response } from "express";
import { getMcpTools, callMcpTool } from "../../services/mcp/supabaseClient.js";
import {
  buildCandidates,
  convertMcpToolsToOpenAI,
  extractFileText,
  FALLBACK,
  MAX_TOOL_ITERATIONS,
  type FileAttachment,
  type ProviderConfig,
} from "../../services/ai/providerService.js";

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  reasoning_details?: string;
  tool_calls?: Array<{
    id: string;
    type: string;
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
  name?: string;
}

const SYSTEM_PROMPT = `You are EnovAIt, an enterprise ESG and BRSR operations platform assistant.

What you are:
- An AI assistant for EnovAIt, an India-first ESG and BRSR (Business Responsibility and Sustainability Reporting) operations platform.
- You help users with ESG compliance, BRSR filing, sustainability reporting, and related business operations.

What you can do:
- Answer questions about ESG frameworks, BRSR requirements, and sustainability reporting.
- Query and analyze organizational data stored in the EnovAIt database using Supabase tools.
- Help users understand their ESG readiness, evidence ingestion status, and review queues.
- Create and manage BRSR modules, templates, and workflows.
- Guide users through WhatsApp Baileys setup, channel configuration, and evidence ingestion.

Primary guardrail:
- EnovAIt handles ESG, sustainability, compliance, evidence, BRSR, and closely related responsible business operations only.
- If a request is outside ESG or sustainability scope, do not answer it directly.
- Instead, reply briefly that EnovAIt only supports ESG and sustainability topics, then redirect the user to a relevant ESG/BRSR task you can help with.
- Do not roleplay as a general assistant for unrelated topics.

What you cannot do:
- You cannot access external websites, browse the internet, or look up real-time information.
- You cannot read PDF files directly. If a user uploads a PDF, tell them to use the Evidence Upload feature in the Data section, which extracts text automatically.
- You cannot perform actions outside the EnovAIt platform.
- You do not have access to personal information about individuals unless it is provided in the conversation.
- You cannot modify system settings or change platform configurations.

RBAC Roles in EnovAIt:
- Chief Sustainability Officer (cso): Full access to all BRSR modules, can review, approve, and assign ESG tasks.
- Senior Manager: Full access to all BRSR modules, can review and assign, but cannot approve final filings.
- Executive: Limited access. Can only submit ground-level data for assigned modules (typically P3 Employee Wellbeing and P6 Environment).
- Owner/Admin: Full platform access.

When asked about people, companies, or topics outside of EnovAIt's scope, politely refuse and redirect to ESG/BRSR work inside EnovAIt.`;

const USER_FRIENDLY_ERRORS: Record<string, { message: string; suggestion: string }> = {
  "401": {
    message: "The AI service couldn't verify your request.",
    suggestion: "This is a configuration issue — please check that your API keys are set up correctly.",
  },
  "403": {
    message: "You don't have permission to use the AI service.",
    suggestion: "Contact your administrator to enable AI access for your account.",
  },
  "404": {
    message: "The AI model you requested doesn't exist.",
    suggestion: "Try switching to a different model or contact support.",
  },
  "429": {
    message: "You've hit the usage limit for the AI service.",
    suggestion: "Wait a minute and try again. If this keeps happening, your team may need to increase its rate limit.",
  },
  "500": {
    message: "The AI service encountered an unexpected error.",
    suggestion: "Try again in a moment. If it keeps failing, contact support.",
  },
  "502": {
    message: "The AI service is temporarily unavailable.",
    suggestion: "This usually means the provider is having issues. Try again in a few minutes.",
  },
  "503": {
    message: "No AI provider is configured.",
    suggestion: "An administrator needs to set up an AI provider (Groq, OpenRouter, etc.) in the settings.",
  },
  timeout: {
    message: "The AI request took too long to respond.",
    suggestion: "Try again, or use a simpler prompt. If it keeps timing out, the AI provider may be overloaded.",
  },
  network: {
    message: "Couldn't reach the AI service.",
    suggestion: "Check your internet connection and try again. If the problem persists, the AI provider may be down.",
  },
};

function buildUserFriendlyError(status: number | null, rawMessage: string): { message: string; suggestion: string } {
  if (status === null) {
    if (rawMessage.toLowerCase().includes("timeout") || rawMessage.toLowerCase().includes("abort")) {
      return USER_FRIENDLY_ERRORS["timeout"];
    }
    if (
      rawMessage.toLowerCase().includes("fetch") ||
      rawMessage.toLowerCase().includes("network") ||
      rawMessage.toLowerCase().includes("connect")
    ) {
      return USER_FRIENDLY_ERRORS["network"];
    }
    return {
      message: "The AI request failed for an unknown reason.",
      suggestion: "Try again in a moment. If it keeps failing, contact support.",
    };
  }

  const known = USER_FRIENDLY_ERRORS[String(status)];
  if (known) return known;

  if (status >= 400 && status < 500) {
    return {
      message: "The AI request was rejected.",
      suggestion:
        "The server returned error ${status}. This is likely a configuration issue — contact support if it persists.",
    };
  }

  return {
    message: "The AI service is having trouble right now.",
    suggestion: "The server returned error ${status}. Try again in a few minutes.",
  };
}

async function processToolCalls(
  toolCalls: Array<{ id: string; type: string; function: { name: string; arguments: string } }>
): Promise<ChatMessage[]> {
  const results: ChatMessage[] = [];
  for (const tc of toolCalls) {
    let args: Record<string, unknown>;
    try {
      args = JSON.parse(tc.function.arguments);
    } catch {
      args = {};
    }
    const result = await callMcpTool(tc.function.name, args);
    const textContent = result.content.filter((c) => c.type === "text").map((c) => c.text).join("\n");
    results.push({
      role: "tool",
      content: textContent,
      tool_call_id: tc.id,
      name: tc.function.name,
    });
  }
  return results;
}

export async function chatHandler(req: Request, res: Response): Promise<void> {
  const { messages, model: reqModel, use_tools: useTools, files } = req.body as {
    messages?: ChatMessage[];
    model?: string;
    use_tools?: boolean;
    files?: FileAttachment[];
  };
  if (!messages?.length) {
    res.status(400).json({ error: "Messages required" });
    return;
  }

  let fileContext = "";
  if (files && files.length > 0) {
    const extracted = await Promise.all(files.map(extractFileText));
    fileContext = "\n\nAttached files:\n" + extracted.join("\n\n");
  }

  const candidates = buildCandidates(reqModel);
  if (!candidates.length) {
    res.status(503).json({ error: "No AI provider configured" });
    return;
  }

  const mcpTools = useTools !== false ? await getMcpTools() : [];
  const openAiTools = mcpTools.length > 0 ? convertMcpToolsToOpenAI(mcpTools) : undefined;

  const messagesWithSystem =
    messages[0]?.role === "system"
      ? messages
      : [{ role: "system" as const, content: SYSTEM_PROMPT + fileContext }, ...messages];

  const tryChat = async (candidate: ProviderConfig, currentMessages: ChatMessage[]) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (candidate.apiKey) {
      headers.Authorization = `Bearer ${candidate.apiKey}`;
    }

    if (candidate.provider === "OpenRouter") {
      headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL || "https://enov360.com";
      headers["X-Title"] = process.env.OPENROUTER_APP_NAME || "EnovAIt";
    }

    const body: Record<string, unknown> = {
      model: candidate.model,
      messages: currentMessages,
      stream: false,
      temperature: req.body.temperature ?? 0.3,
      max_tokens: req.body.max_tokens ?? 4096,
    };

    if (openAiTools && openAiTools.length > 0) {
      body.tools = openAiTools;
      body.tool_choice = "auto";
    }

    if (candidate.model.includes("gemma") || candidate.model.includes("gemini")) {
      body.reasoning = { enabled: true };
    }

    const timeoutMs = candidate.provider === "Groq" ? 10000 : 60000;

    const resp = await fetch(`${candidate.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`${resp.status}: ${text.substring(0, 300)}`);
    }

    return resp.json();
  };

  const errors: string[] = [];

  for (const candidate of candidates) {
    try {
      let currentMessages = [...messagesWithSystem];
      let finalResponse: unknown = null;

      for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
        const data = await tryChat(candidate, currentMessages);
        const msg = (data as { choices?: Array<{ message: ChatMessage }> }).choices?.[0]?.message;

        if (msg?.tool_calls && msg.tool_calls.length > 0 && openAiTools) {
          currentMessages.push(msg);
          const toolResults = await processToolCalls(msg.tool_calls);
          currentMessages.push(...toolResults);
          continue;
        }

        finalResponse = data;
        break;
      }

      if (!finalResponse) {
        res.status(502).json({ error: "Tool call loop exceeded limit" });
        return;
      }

      const msg = (finalResponse as { choices?: Array<{ message: ChatMessage }> }).choices?.[0]?.message;
      res.json({
        content: msg?.content || FALLBACK,
        reasoning: msg?.reasoning_details,
        model: candidate.model,
        provider: candidate.provider,
        ...(finalResponse as Record<string, unknown>),
      });
      return;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${candidate.provider}/${candidate.model}: ${message.substring(0, 200)}`);

      continue;
    }
  }

  const firstError = errors[0] || "No AI provider succeeded";
  const statusMatch = firstError.match(/^(\d{3})\s*:/);
  const status = statusMatch ? Number(statusMatch[1]) : null;
  const friendly = buildUserFriendlyError(status, firstError);

  res.status(status ? (status >= 500 ? 502 : status) : 502).json({
    error: friendly.message,
    suggestion: friendly.suggestion,
    technical_detail: firstError.substring(0, 200),
  });
}