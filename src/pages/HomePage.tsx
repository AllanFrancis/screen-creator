import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import WorkoutCard from "@/components/WorkoutCard";
import heroPushup from "@/assets/hero-pushup.jpg";
import heroDumbbell from "@/assets/hero-dumbbell.jpg";

const weekDays = ["S", "T", "Q", "Q", "S", "S", "D"];
const trainedDays = [true, true, false, false, false, false, false];

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.user_metadata?.name?.split(" ")[0] || "Usuário";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative h-72 overflow-hidden rounded-b-3xl">
        <img src={heroDumbbell} alt="Hero" className="absolute inset-0 h-full w-full object-cover" />
        <div className="gradient-hero absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col justify-between p-5">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display text-lg font-bold text-hero-dark-foreground"
          >
            FIT.AI
          </motion.span>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-end justify-between"
          >
            <div>
              <h1 className="font-display text-2xl font-bold text-hero-dark-foreground">Olá, {firstName}</h1>
              <p className="text-sm text-hero-dark-foreground/70">Bora treinar hoje?</p>
            </div>
            <button
              onClick={() => navigate("/treino/sexta")}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
            >
              Bora!
            </button>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5">
        {/* Consistência */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Consistência</h2>
            <button onClick={() => navigate("/evolucao")} className="text-sm font-medium text-primary">
              Ver histórico
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-card">
              {weekDays.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={`h-7 w-7 rounded-md ${
                      trainedDays[i]
                        ? "bg-primary"
                        : "border border-border bg-muted"
                    }`}
                  />
                  <span className="text-[10px] font-medium text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
            <div className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-xl border border-border bg-card shadow-card">
              <Flame className="h-5 w-5 text-streak" />
              <span className="text-lg font-bold text-foreground">15</span>
            </div>
          </div>
        </motion.section>

        {/* Treino de Hoje */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Treino de Hoje</h2>
            <button onClick={() => navigate("/plano")} className="text-sm font-medium text-primary">
              Ver treinos
            </button>
          </div>
          <div className="mt-3">
            <WorkoutCard
              day="SEXTA"
              title="Superiores"
              duration="45min"
              exercises={4}
              image={heroPushup}
              onClick={() => navigate("/treino/sexta")}
            />
          </div>
        </motion.section>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;
