import { motion } from "framer-motion";
import { Zap, Calendar, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import WorkoutCard from "@/components/WorkoutCard";
import heroPlanner from "@/assets/hero-planner.jpg";
import heroSquat from "@/assets/hero-squat.jpg";
import heroPullup from "@/assets/hero-pullup.jpg";
import heroPushup from "@/assets/hero-pushup.jpg";
import heroDumbbell from "@/assets/hero-dumbbell.jpg";

const dayImages: Record<string, string> = {
  segunda: heroSquat,
  terca: heroPullup,
  quarta: heroDumbbell,
  quinta: heroSquat,
  sexta: heroPushup,
  sabado: heroDumbbell,
  domingo: heroPullup,
};

const REST_TITLES = ["descanso", "rest", "folga"];

const isRestDay = (title: string) =>
  REST_TITLES.some((r) => title.toLowerCase().includes(r));

const RestDayCard = ({ dayKey }: { dayKey: string }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-card">
    <span className="inline-flex items-center gap-1.5 rounded-full bg-tag px-3 py-1 text-xs font-medium text-tag-foreground">
      <Calendar className="h-3 w-3" /> {dayKey.toUpperCase()}
    </span>
    <div className="flex items-center gap-2">
      <Zap className="h-5 w-5 text-primary" />
      <span className="font-display text-lg font-bold">Descanso</span>
    </div>
  </div>
);

const TrainingPlanPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Fetch ALL plans for user
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["all_training_plans", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_plans")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch workout days + exercises for all plans
  const planIds = plans?.map((p) => p.id) ?? [];
  const { data: workoutDays, isLoading: daysLoading } = useQuery({
    queryKey: ["all_workout_days", planIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_days")
        .select("*, exercises(*)")
        .in("plan_id", planIds)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: planIds.length > 0,
  });

  const isLoading = authLoading || plansLoading || daysLoading;

  // Auto-expand active plan
  const activePlan = plans?.find((p) => p.is_active);
  const currentExpanded = expandedPlanId ?? activePlan?.id ?? null;

  const togglePlan = (id: string) => {
    setExpandedPlanId((prev) => (prev === id ? "" : id));
  };

  const getDaysForPlan = (planId: string) =>
    workoutDays?.filter((d) => d.plan_id === planId) ?? [];

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
            💪 MEUS PLANOS
          </span>
          <h1 className="font-display text-2xl font-bold text-hero-dark-foreground">Planos de Treino</h1>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-4 px-5 pt-5">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && (!plans || plans.length === 0) && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Nenhum plano encontrado.</p>
            <button
              onClick={() => navigate("/ai")}
              className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground"
            >
              Criar plano com IA
            </button>
          </div>
        )}

        {!isLoading &&
          plans?.map((plan) => {
            const days = getDaysForPlan(plan.id);
            const isExpanded = currentExpanded === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
              >
                {/* Plan header */}
                <button
                  onClick={() => togglePlan(plan.id)}
                  className="flex w-full items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <h2 className="font-display text-lg font-bold text-foreground">{plan.name}</h2>
                      <p className="text-xs text-muted-foreground">
                        {days.length} dias · {plan.is_active ? "✅ Ativo" : "Inativo"}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {/* Expanded days */}
                {isExpanded && (
                  <div className="space-y-3 px-4 pb-4">
                    {days.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        Nenhum dia de treino cadastrado.
                      </p>
                    )}
                    {days.map((day, i) => {
                      const exerciseCount = (day as any).exercises?.length ?? 0;
                      const image = dayImages[day.day_key] || heroDumbbell;

                      return (
                        <motion.div
                          key={day.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          {isRestDay(day.title) ? (
                            <RestDayCard dayKey={day.day_key} />
                          ) : (
                            <WorkoutCard
                              day={day.day_key.toUpperCase()}
                              title={day.title}
                              duration="45min"
                              exercises={exerciseCount}
                              image={image}
                              onClick={() => navigate(`/treino/${day.day_key}`)}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
      </div>

      <BottomNav />
    </div>
  );
};

export default TrainingPlanPage;
