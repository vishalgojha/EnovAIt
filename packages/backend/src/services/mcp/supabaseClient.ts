import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CallToolResultSchema, ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "../../lib/logger.js";

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpToolCallResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

let mcpClient: Client | null = null;
let toolsCache: McpToolDefinition[] | null = null;
let isConnected = false;

export const getMcpClient = async (): Promise<Client | null> => {
  if (isConnected && mcpClient) {
    return mcpClient;
  }

  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF;

  if (!accessToken || !projectRef) {
    logger.warn("SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF not set, MCP disabled");
    return null;
  }

  try {
    const transport = new StdioClientTransport({
      command: "npx",
      args: ["-y", "@supabase/mcp-server-supabase"],
      env: {
        ...process.env,
        SUPABASE_ACCESS_TOKEN: accessToken,
        SUPABASE_PROJECT_REF: projectRef,
      },
    });

    mcpClient = new Client(
      { name: "enovait-backend", version: "1.0.0" },
      { capabilities: {} }
    );

    await mcpClient.connect(transport);
    isConnected = true;
    logger.info("Supabase MCP client connected");
    return mcpClient;
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to Supabase MCP server");
    return null;
  }
};

export const getMcpTools = async (): Promise<McpToolDefinition[]> => {
  if (toolsCache) {
    return toolsCache;
  }

  const client = await getMcpClient();
  if (!client) {
    return [];
  }

  try {
    const result = await client.request({ method: "tools/list" }, ListToolsResultSchema);
    toolsCache = result.tools.map((tool) => ({
      name: tool.name,
      description: tool.description || "",
      inputSchema: tool.inputSchema as Record<string, unknown>,
    }));
    logger.info({ count: toolsCache.length }, "Loaded Supabase MCP tools");
    return toolsCache;
  } catch (error) {
    logger.error({ err: error }, "Failed to list MCP tools");
    return [];
  }
};

export const callMcpTool = async (
  toolName: string,
  args: Record<string, unknown>
): Promise<McpToolCallResult> => {
  const client = await getMcpClient();
  if (!client) {
    return {
      content: [{ type: "text", text: "MCP client not connected" }],
      isError: true,
    };
  }

  try {
    const result = await client.request(
      {
        method: "tools/call",
        params: { name: toolName, arguments: args },
      },
      CallToolResultSchema
    );
    return result as McpToolCallResult;
  } catch (error) {
    logger.error({ err: error, tool: toolName }, "MCP tool call failed");
    return {
      content: [
        {
          type: "text",
          text: error instanceof Error ? error.message : "Tool call failed",
        },
      ],
      isError: true,
    };
  }
};

export const disconnectMcpClient = async (): Promise<void> => {
  if (mcpClient) {
    await mcpClient.close();
    mcpClient = null;
    toolsCache = null;
    isConnected = false;
    logger.info("Supabase MCP client disconnected");
  }
};
