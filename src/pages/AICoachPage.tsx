import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles, X, Loader2, Save, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import BottomNav from "@/components/BottomNav";
import heroDumbbell from "@/assets/hero-dumbbell.jpg";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`;
const SAVE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-training-plan`;

const quickActions = ["Criar plano de treino", "Mudar objetivo", "Dicas de nutrição"];

async function streamChat({
  messages,
  onDelta,
  onDone,
}: {
  messages: Message[];
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Erro de conexão" }));
    throw new Error(err.error || `Erro ${resp.status}`);
  }

  if (!resp.body) throw new Error("Sem resposta");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

// Heuristic: plan is likely generated if assistant message has exercise-like content
function looksLikePlan(content: string): boolean {
  const indicators = ["séries", "series", "repetições", "reps", "descanso", "Dia A", "Dia B", "Dia C", "Supino", "Agachamento", "exercício"];
  let matches = 0;
  for (const ind of indicators) {
    if (content.toLowerCase().includes(ind.toLowerCase())) matches++;
  }
  return matches >= 3;
}

const AICoachPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! 💪 Sou seu Coach AI personal trainer. Vou te ajudar a criar um plano de treino personalizado!\n\nPara começar, qual é o seu **objetivo principal**? (ex: hipertrofia, emagrecimento, condicionamento físico)" },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Check if a plan was generated after each new assistant message
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant" && looksLikePlan(lastMsg.content)) {
      setShowSaveButton(true);
      setPlanSaved(false);
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || isLoading) return;

    const userMsg: Message = { role: "user", content: msgText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setShowSaveButton(false);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > newMessages.length) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev.slice(0, newMessages.length), { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: newMessages,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      toast.error(e instanceof Error ? e.message : "Erro ao conectar com a IA");
    }
  };

  const handleSavePlan = async () => {
    if (!session?.access_token) {
      toast.error("Faça login para salvar o plano de treino");
      return;
    }

    setIsSaving(true);
    try {
      const resp = await fetch(SAVE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Erro ao salvar plano");
      }

      setPlanSaved(true);
      setShowSaveButton(false);
      toast.success(`Plano "${data.plan_name}" salvo com sucesso! 🎉`);
      
      // Redirect to training plan page after a brief delay
      setTimeout(() => navigate("/plano"), 1200);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Erro ao salvar plano");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero background */}
      <div className="relative h-28 overflow-hidden">
        <img src={heroDumbbell} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="gradient-hero absolute inset-0" />
        <span className="relative z-10 block pt-4 pl-5 font-display text-lg font-bold text-hero-dark-foreground">
          FIT.AI
        </span>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="mx-4 -mt-8 relative flex flex-col rounded-2xl border border-border bg-card shadow-card z-40"
            style={{ height: "calc(100vh - 200px)" }}
          >
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm">Coach AI</p>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Save plan button */}
            {showSaveButton && !planSaved && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-2"
              >
                <button
                  onClick={handleSavePlan}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Salvando plano...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Salvar plano de treino
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {planSaved && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 py-2"
              >
                <div className="flex items-center justify-center gap-2 rounded-xl bg-muted py-3 text-sm font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Plano salvo com sucesso
                </div>
              </motion.div>
            )}

            {/* Quick actions */}
            <div className="flex gap-2 overflow-x-auto px-4 py-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleSend(action)}
                  disabled={isLoading}
                  className="whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-border px-4 py-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Digite sua mensagem"
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <div className="flex items-center justify-center mt-20">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg"
          >
            <Sparkles className="h-5 w-5" /> Abrir Coach AI
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default AICoachPage;
