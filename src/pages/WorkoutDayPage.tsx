import { motion } from "framer-motion";
import { ArrowLeft, Clock, Dumbbell, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import ExerciseItem from "@/components/ExerciseItem";
import heroPushup from "@/assets/hero-pushup.jpg";
import heroSquat from "@/assets/hero-squat.jpg";

const workouts: Record<string, { day: string; title: string; image: string; exercises: { name: string; sets: number; reps: number; rest: number }[] }> = {
  segunda: {
    day: "SEGUNDA", title: "Inferiores", image: "", exercises: [
      { name: "Agachamento Livre", sets: 3, reps: 12, rest: 60 },
      { name: "Leg Press 45°", sets: 3, reps: 12, rest: 60 },
      { name: "Cadeira Extensora", sets: 3, reps: 12, rest: 60 },
      { name: "Stiff", sets: 3, reps: 12, rest: 60 },
      { name: "Panturrilha", sets: 3, reps: 15, rest: 45 },
    ],
  },
  terca: {
    day: "TERÇA", title: "Superiores", image: "", exercises: [
      { name: "Supino Reto", sets: 3, reps: 12, rest: 60 },
      { name: "Supino Inclinado", sets: 3, reps: 12, rest: 60 },
      { name: "Crucifixo", sets: 3, reps: 12, rest: 60 },
      { name: "Desenvolvimento", sets: 3, reps: 12, rest: 60 },
      { name: "Tríceps Corda", sets: 3, reps: 12, rest: 60 },
    ],
  },
  quinta: {
    day: "QUINTA", title: "Inferiores", image: "", exercises: [
      { name: "Agachamento Búlgaro", sets: 3, reps: 12, rest: 60 },
      { name: "Cadeira Flexora", sets: 3, reps: 12, rest: 60 },
      { name: "Cadeira Abdutora", sets: 3, reps: 12, rest: 60 },
      { name: "Elevação Pélvica", sets: 3, reps: 12, rest: 60 },
      { name: "Panturrilha", sets: 3, reps: 15, rest: 45 },
    ],
  },
  sexta: {
    day: "SEXTA", title: "Superiores", image: "", exercises: [
      { name: "Supino Inclinado", sets: 3, reps: 12, rest: 60 },
      { name: "Remada Curvada", sets: 3, reps: 12, rest: 60 },
      { name: "Puxada Frontal", sets: 3, reps: 12, rest: 60 },
      { name: "Elevação Lateral", sets: 3, reps: 12, rest: 60 },
      { name: "Rosca Direta", sets: 3, reps: 12, rest: 60 },
    ],
  },
};

const WorkoutDayPage = () => {
  const navigate = useNavigate();
  const { dayId } = useParams();
  const workout = workouts[dayId || "sexta"] || workouts.sexta;
  const isLower = workout.title === "Inferiores";
  const heroImg = isLower ? heroSquat : heroPushup;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center font-display text-lg font-bold">{workout.day.charAt(0) + workout.day.slice(1).toLowerCase()}</h1>
        <div className="w-5" />
      </div>

      <div className="mx-auto max-w-md px-5 pt-4">
        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative h-44 overflow-hidden rounded-2xl">
          <img src={heroImg} alt={workout.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="gradient-hero absolute inset-0" />
          <div className="relative z-10 flex h-full flex-col justify-between p-4">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-xs font-medium">
              <Calendar className="h-3 w-3" /> {workout.day}
            </span>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold text-hero-dark-foreground">{workout.title}</h2>
                <div className="mt-1 flex items-center gap-3 text-xs text-hero-dark-foreground/80">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 45min</span>
                  <span className="flex items-center gap-1"><Dumbbell className="h-3 w-3" /> {workout.exercises.length} exercícios</span>
                </div>
              </div>
              <button className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">
                Iniciar Treino
              </button>
            </div>
          </div>
        </motion.div>

        {/* Exercises */}
        <div className="mt-4 space-y-3">
          {workout.exercises.map((ex, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <ExerciseItem name={ex.name} sets={ex.sets} reps={ex.reps} rest={ex.rest} />
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default WorkoutDayPage;
