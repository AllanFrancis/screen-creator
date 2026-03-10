import { motion } from "framer-motion";
import { Flame, CheckCircle2, Target, Hourglass } from "lucide-react";
import BottomNav from "@/components/BottomNav";

// Generate mock heatmap data
const months = ["Jan", "Fev", "Mar", "Abril", "Maio"];
const rows = 6;
const cols = months.length * 5;
const heatmapData = Array.from({ length: rows * cols }, () => Math.random() > 0.3);

const EvolutionPage = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <h1 className="font-display text-lg font-bold">FIT.AI</h1>

        {/* Streak card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex flex-col items-center rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 p-6"
        >
          <Flame className="h-10 w-10 text-hero-dark-foreground" />
          <span className="mt-2 font-display text-5xl font-bold text-hero-dark-foreground">0 dias</span>
          <span className="mt-1 text-sm text-hero-dark-foreground/60">Sequência Atual</span>
        </motion.div>

        {/* Consistência heatmap */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-6">
          <h2 className="font-display text-lg font-semibold">Consistência</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex gap-6 mb-2">
              {months.map((m) => (
                <span key={m} className="text-xs text-muted-foreground font-medium min-w-[40px]">{m}</span>
              ))}
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {heatmapData.map((active, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-sm ${
                    active ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4 shadow-card">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            <span className="mt-2 font-display text-2xl font-bold">135</span>
            <span className="text-xs text-muted-foreground">Treinos Feitos</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4 shadow-card">
            <Target className="h-5 w-5 text-primary" />
            <span className="mt-2 font-display text-2xl font-bold">64%</span>
            <span className="text-xs text-muted-foreground">Taxa de conclusão</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-3">
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4 shadow-card">
            <Hourglass className="h-5 w-5 text-muted-foreground" />
            <span className="mt-2 font-display text-2xl font-bold">115h40m</span>
            <span className="text-xs text-muted-foreground">Tempo Total</span>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default EvolutionPage;
