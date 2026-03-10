import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Dumbbell, User, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DAYS_OPTIONS = [
  { key: "segunda", label: "Segunda" },
  { key: "terca", label: "Terça" },
  { key: "quarta", label: "Quarta" },
  { key: "quinta", label: "Quinta" },
  { key: "sexta", label: "Sexta" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

interface WorkoutDay {
  dayKey: string;
  title: string;
  exercises: { name: string; sets: number; reps: string; rest: string }[];
}

const SetupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1 - Profile
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");

  // Step 2 - Plan
  const [planName, setPlanName] = useState("Meu Plano");
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [editingDayIdx, setEditingDayIdx] = useState<number | null>(null);

  // Step 2 helpers
  const addDay = (dayKey: string) => {
    if (workoutDays.find((d) => d.dayKey === dayKey)) return;
    setWorkoutDays((prev) => [...prev, { dayKey, title: "", exercises: [] }]);
  };

  const removeDay = (dayKey: string) => {
    setWorkoutDays((prev) => prev.filter((d) => d.dayKey !== dayKey));
    if (editingDayIdx !== null) setEditingDayIdx(null);
  };

  const updateDay = (idx: number, field: keyof WorkoutDay, value: any) => {
    setWorkoutDays((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  };

  const addExercise = (dayIdx: number) => {
    setWorkoutDays((prev) =>
      prev.map((d, i) =>
        i === dayIdx ? { ...d, exercises: [...d.exercises, { name: "", sets: 3, reps: "12", rest: "60s" }] } : d
      )
    );
  };

  const updateExercise = (dayIdx: number, exIdx: number, field: string, value: any) => {
    setWorkoutDays((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? { ...d, exercises: d.exercises.map((e, j) => (j === exIdx ? { ...e, [field]: value } : e)) }
          : d
      )
    );
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    setWorkoutDays((prev) =>
      prev.map((d, i) => (i === dayIdx ? { ...d, exercises: d.exercises.filter((_, j) => j !== exIdx) } : d))
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // 1. Update profile
      await supabase
        .from("profiles")
        .update({
          weight: weight ? parseFloat(weight) : null,
          height: height ? parseFloat(height) : null,
          goal: goal || null,
        })
        .eq("id", user.id);

      // 2. Create training plan
      const { data: plan, error: planErr } = await supabase
        .from("training_plans")
        .insert({ name: planName, user_id: user.id })
        .select("id")
        .single();

      if (planErr || !plan) throw planErr;

      // 3. Create workout days + exercises
      for (let i = 0; i < workoutDays.length; i++) {
        const wd = workoutDays[i];
        const { data: dayData, error: dayErr } = await supabase
          .from("workout_days")
          .insert({
            plan_id: plan.id,
            user_id: user.id,
            day_key: wd.dayKey,
            title: wd.title || DAYS_OPTIONS.find((d) => d.key === wd.dayKey)?.label || wd.dayKey,
            sort_order: i,
          })
          .select("id")
          .single();

        if (dayErr || !dayData) throw dayErr;

        if (wd.exercises.length > 0) {
          const exercises = wd.exercises.map((ex, j) => ({
            workout_day_id: dayData.id,
            user_id: user.id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            rest: ex.rest,
            sort_order: j,
          }));
          const { error: exErr } = await supabase.from("exercises").insert(exercises);
          if (exErr) throw exErr;
        }
      }

      toast.success("Setup concluído! 🎉");
      navigate("/home");
    } catch (err: any) {
      toast.error("Erro ao salvar: " + (err?.message || "Tente novamente"));
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { icon: User, label: "Perfil" },
    { icon: Calendar, label: "Plano" },
    { icon: Dumbbell, label: "Exercícios" },
  ];

  const canAdvance =
    step === 0 ||
    (step === 1 && workoutDays.length > 0 && workoutDays.every((d) => d.title.trim())) ||
    step === 2;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-display text-lg font-bold text-primary">FIT.AI</h1>
          <span className="text-sm text-muted-foreground">Setup</span>
        </div>

        {/* Stepper */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                  i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-8 rounded ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="mt-8 space-y-5"
            >
              <h2 className="font-display text-xl font-bold">Seus dados</h2>
              <p className="text-sm text-muted-foreground">Informações básicas para personalizar seu treino.</p>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Peso (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ex: 75"
                    className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Altura (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Ex: 175"
                    className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Objetivo</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Selecione...</option>
                    <option value="Hipertrofia">Hipertrofia</option>
                    <option value="Emagrecimento">Emagrecimento</option>
                    <option value="Força">Força</option>
                    <option value="Resistência">Resistência</option>
                    <option value="Saúde Geral">Saúde Geral</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="mt-8 space-y-5"
            >
              <h2 className="font-display text-xl font-bold">Monte seu plano</h2>
              <div>
                <label className="mb-1 block text-sm font-medium">Nome do plano</label>
                <input
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <p className="text-sm text-muted-foreground">Selecione os dias de treino:</p>
              <div className="flex flex-wrap gap-2">
                {DAYS_OPTIONS.map((d) => {
                  const active = workoutDays.some((w) => w.dayKey === d.key);
                  return (
                    <button
                      key={d.key}
                      onClick={() => (active ? removeDay(d.key) : addDay(d.key))}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              {workoutDays.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Nomeie cada treino:</p>
                  {workoutDays.map((wd, i) => (
                    <div key={wd.dayKey} className="flex items-center gap-2">
                      <span className="w-20 text-xs font-medium text-muted-foreground">
                        {DAYS_OPTIONS.find((d) => d.key === wd.dayKey)?.label}
                      </span>
                      <input
                        value={wd.title}
                        onChange={(e) => updateDay(i, "title", e.target.value)}
                        placeholder="Ex: Superiores, Perna, Full Body..."
                        className="flex-1 rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="mt-8 space-y-5"
            >
              <h2 className="font-display text-xl font-bold">Adicione exercícios</h2>
              <p className="text-sm text-muted-foreground">Toque em um dia para adicionar exercícios.</p>

              <div className="space-y-3">
                {workoutDays.map((wd, dayIdx) => (
                  <div key={wd.dayKey} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                    <button
                      onClick={() => setEditingDayIdx(editingDayIdx === dayIdx ? null : dayIdx)}
                      className="flex w-full items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {DAYS_OPTIONS.find((d) => d.key === wd.dayKey)?.label}
                        </span>
                        <span className="font-display font-bold">{wd.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{wd.exercises.length} exercícios</span>
                    </button>

                    <AnimatePresence>
                      {editingDayIdx === dayIdx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 space-y-3 overflow-hidden"
                        >
                          {wd.exercises.map((ex, exIdx) => (
                            <div key={exIdx} className="flex items-start gap-2 rounded-xl bg-muted p-3">
                              <div className="flex-1 space-y-2">
                                <input
                                  value={ex.name}
                                  onChange={(e) => updateExercise(dayIdx, exIdx, "name", e.target.value)}
                                  placeholder="Nome do exercício"
                                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <label className="text-[10px] text-muted-foreground">Séries</label>
                                    <input
                                      type="number"
                                      value={ex.sets}
                                      onChange={(e) => updateExercise(dayIdx, exIdx, "sets", parseInt(e.target.value) || 0)}
                                      className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-[10px] text-muted-foreground">Reps</label>
                                    <input
                                      value={ex.reps}
                                      onChange={(e) => updateExercise(dayIdx, exIdx, "reps", e.target.value)}
                                      className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-[10px] text-muted-foreground">Descanso</label>
                                    <input
                                      value={ex.rest}
                                      onChange={(e) => updateExercise(dayIdx, exIdx, "rest", e.target.value)}
                                      className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => removeExercise(dayIdx, exIdx)}
                                className="mt-1 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addExercise(dayIdx)}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/40 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                          >
                            <Plus className="h-4 w-4" /> Adicionar exercício
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
          ) : (
            <div />
          )}
          {step < 2 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance}
              className="flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
            >
              Próximo <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Concluir"} <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
