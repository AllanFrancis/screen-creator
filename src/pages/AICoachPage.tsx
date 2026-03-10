import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import heroDumbbell from "@/assets/hero-dumbbell.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickActions = ["Alterar plano de treino", "Mudar objetivo", "Atualizar dados"];

const AICoachPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
  { role: "assistant", content: "Olá! Sou sua IA personal. Como posso ajudar com seu treino hoje?" }]
  );
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    // Mock AI response
    setTimeout(() => {
      setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Entendi! Vou te ajudar com isso. Posso adaptar seu plano de treino conforme sua necessidade. O que você gostaria de mudar?" }]
      );
    }, 1000);
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
        {isOpen &&
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="mx-4 -mt-8 relative flex flex-col rounded-2xl border border-border bg-card shadow-card z-40"
          style={{ height: "calc(100vh - 200px)" }}>
          
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
              {messages.map((msg, i) =>
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              
                  <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user" ?
                "bg-primary text-primary-foreground rounded-br-md" :
                "bg-muted text-foreground rounded-bl-md"}`
                }>
                
                    {msg.content}
                  </div>
                </motion.div>
            )}
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 overflow-x-auto px-4 py-2">
              {quickActions.map((action) =>
            <button
              key={action}
              onClick={() => {
                setInput(action);
              }}
              className="whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted">
              
                  {action}
                </button>
            )}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-border px-4 py-3">
              <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Digite sua mensagem"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            
              <button
              onClick={handleSend}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95">
              
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      {!isOpen &&
      <div className="flex items-center justify-center mt-20">
          <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg">
            <Sparkles className="h-5 w-5" /> Abrir Coach AI
          </button>
        </div>
      }

      <BottomNav />
    </div>);

};

export default AICoachPage;