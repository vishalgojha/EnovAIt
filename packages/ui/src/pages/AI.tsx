import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Paperclip, 
  RefreshCcw,
  MessageSquarePlus,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: "user" | "bot";
  content: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hello! I'm your EnovAIt AI companion. How can I help you with your ESG reporting or data analysis today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: "You are EnovAIt, a professional AI assistant for an enterprise operating model specializing in ESG (Environment, Social, and Governance) and BRSR (Business Responsibility and Sustainability Reporting). Keep responses concise and structured. Use a professional, authoritative tone.",
        }
      });

      const botResponse = result.text || "I apologize, I'm having trouble processing that request.";
      setMessages(prev => [...prev, { role: "bot", content: botResponse }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "bot", content: "I encountered an error connecting to my core processing unit. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col gap-4">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Intelligence Workspace</h1>
        <p className="text-xs text-gray-500 italic">Connected to Gemini 3 Flash</p>
      </div>

      <Card className="flex-1 overflow-hidden border-gray-200 bg-white shadow-sm flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Active Session</h3>
          <Button variant="ghost" size="sm" onClick={() => setMessages([messages[0]])} className="text-[10px] uppercase font-bold tracking-widest text-[#4A6741]">
            New Thread
          </Button>
        </div>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex max-w-[85%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${
                        msg.role === "user" ? "bg-brand-charcoal text-white" : "bg-[#4A6741] text-white"
                      }`}>
                        {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed shadow-sm border ${
                        msg.role === "user" 
                          ? "bg-gray-50 border-gray-200 text-gray-900 rounded-tr-none" 
                          : "bg-white border-gray-100 text-gray-800 rounded-tl-none"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded bg-[#4A6741] text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-3 text-xs border border-gray-100 shadow-sm">
                        <div className="h-1 w-1 animate-bounce rounded-full bg-[#4A6741] [animation-delay:-0.3s]"></div>
                        <div className="h-1 w-1 animate-bounce rounded-full bg-[#4A6741] [animation-delay:-0.15s]"></div>
                        <div className="h-1 w-1 animate-bounce rounded-full bg-[#4A6741]"></div>
                      </div>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="relative">
              <Input
                placeholder="Ask Enov360 Intelligence..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="pr-24 h-12 bg-white border-gray-200 shadow-sm focus-visible:ring-1 focus-visible:ring-brand-green text-sm"
                disabled={isLoading}
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSend} 
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="bg-brand-green text-white hover:bg-brand-green/90 text-[10px] uppercase font-bold tracking-widest h-8 px-4"
                >
                  Ask AI
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
