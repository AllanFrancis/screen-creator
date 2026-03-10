import { motion } from "framer-motion";
import { ArrowLeft, Clock, Dumbbell, Calendar, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import ExerciseItem from "@/components/ExerciseItem";
import heroPushup from "@/assets/hero-pushup.jpg";
import heroSquat from "@/assets/hero-squat.jpg";
import heroPullup from "@/assets/hero-pullup.jpg";
import heroDumbbell from "@/assets/hero-dumbbell.jpg";

const heroMap: Record<string, string> = {
  inferior: heroSquat,
  perna: heroSquat,
  costas: heroPullup,
  peito: heroPushup,
  superior: heroPushup,
  braço: heroDumbbell,
  ombro: heroDumbbell,
};

function getHeroImage(title: string) {
  const lower = title.toLowerCase();
  for (const [key, img] of Object.entries(heroMap)) {
    if (lower.includes(key)) return img;
  }
  return heroPushup;
}

const WorkoutDayPage = () => {
  const navigate = useNavigate();
  const { dayId } = useParams();
  const { user } = useAuth();

  const { data: workoutDay, isLoading } = useQuery({
    queryKey: ["workout_day", dayId, user?.id],
    enabled: !!user && !!dayId,
    queryFn: async () => {
      const { data } = await supabase
        .from("workout_days")
        .select("*, exercises(*)")
        .eq("user_id", user!.id)
        .eq("day_key", dayId!)
        .order("sort_order", { referencedTable: "exercises", ascending: true })
        .maybeSingle();
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!workoutDay) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex items-center gap-3 px-5 pt-5">
          <button onClick={() => navigate(-1)} className="text-foreground"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="flex-1 text-center font-display text-lg font-bold">Treino não encontrado</h1>
          <div className="w-5" />
        </div>
        <p className="mt-10 text-center text-muted-foreground">Nenhum treino encontrado para este dia.</p>
        <BottomNav />
      </div>
    );
  }

  const exercises = workoutDay.exercises || [];
  const heroImg = getHeroImage(workoutDay.title);
  const dayLabel = workoutDay.day_key.charAt(0).toUpperCase() + workoutDay.day_key.slice(1);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-5">
        <button onClick={() => navigate(-1)} className="text-foreground"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="flex-1 text-center font-display text-lg font-bold">{dayLabel}</h1>
        <div className="w-5" />
      </div>

      <div className="mx-auto max-w-md px-5 pt-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative h-44 overflow-hidden rounded-2xl">
          <img src={heroImg} alt={workoutDay.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="gradient-hero absolute inset-0" />
          <div className="relative z-10 flex h-full flex-col justify-between p-4">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-xs font-medium">
              <Calendar className="h-3 w-3" /> {dayLabel}
            </span>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold text-hero-dark-foreground">{workoutDay.title}</h2>
                <div className="mt-1 flex items-center gap-3 text-xs text-hero-dark-foreground/80">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 45min</span>
                  <span className="flex items-center gap-1"><Dumbbell className="h-3 w-3" /> {exercises.length} exercícios</span>
                </div>
              </div>
              <button className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">
                Iniciar Treino
              </button>
            </div>
          </div>
        </motion.div>

        <div className="mt-4 space-y-3">
          {exercises.map((ex, i) => (
            <motion.div key={ex.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <ExerciseItem
                name={ex.name}
                sets={ex.sets}
                reps={parseInt(ex.reps) || 12}
                rest={parseInt(ex.rest) || 60}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default WorkoutDayPage;
