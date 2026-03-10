import { motion } from "framer-motion";
import { Zap, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import WorkoutCard from "@/components/WorkoutCard";
import heroPlanner from "@/assets/hero-planner.jpg";
import heroSquat from "@/assets/hero-squat.jpg";
import heroPullup from "@/assets/hero-pullup.jpg";
import heroPushup from "@/assets/hero-pushup.jpg";

const restDay = (day: string) => (
  <div key={day} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-card">
    <span className="inline-flex items-center gap-1.5 rounded-full bg-tag px-3 py-1 text-xs font-medium text-tag-foreground">
      <Calendar className="h-3 w-3" /> {day}
    </span>
    <div className="flex items-center gap-2">
      <Zap className="h-5 w-5 text-primary" />
      <span className="font-display text-lg font-bold">Descanso</span>
    </div>
  </div>
);

const TrainingPlanPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative h-56 overflow-hidden rounded-b-3xl">
        <img src={heroPlanner} alt="Planner" className="absolute inset-0 h-full w-full object-cover" />
        <div className="gradient-hero absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col justify-end p-5">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute left-5 top-5 font-display text-lg font-bold text-hero-dark-foreground"
          >
            FIT.AI
          </motion.span>
          <span className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            💪 HIPERTROFIA & FORÇA
          </span>
          <h1 className="font-display text-2xl font-bold text-hero-dark-foreground">Plano de Treino</h1>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-4 px-5 pt-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <WorkoutCard day="SEGUNDA" title="Inferiores" duration="45min" exercises={4} image={heroSquat} onClick={() => navigate("/treino/segunda")} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <WorkoutCard day="TERÇA" title="Superiores" duration="45min" exercises={4} image={heroPullup} onClick={() => navigate("/treino/terca")} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {restDay("QUARTA")}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <WorkoutCard day="QUINTA" title="Inferiores" duration="45min" exercises={4} image={heroSquat} onClick={() => navigate("/treino/quinta")} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <WorkoutCard day="SEXTA" title="Superiores" duration="45min" exercises={4} image={heroPushup} onClick={() => navigate("/treino/sexta")} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          {restDay("SÁBADO")}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          {restDay("DOMINGO")}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default TrainingPlanPage;
