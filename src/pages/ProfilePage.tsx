import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Weight, Ruler, Percent, User, LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import BottomNav from "@/components/BottomNav";

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  weight: number | null;
  height: number | null;
  goal: string | null;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, avatar_url, weight, height, goal")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [user]);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || "Usuário";

  const stats = [
    { icon: Weight, value: profile?.weight?.toString() || "--", unit: "KG", color: "text-primary" },
    { icon: Ruler, value: profile?.height?.toString() || "--", unit: "CM", color: "text-primary" },
    { icon: Percent, value: "--", unit: "GC", color: "text-primary" },
    { icon: User, value: "--", unit: "ANOS", color: "text-primary" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <h1 className="font-display text-lg font-bold text-primary">FIT.AI</h1>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <User className="h-7 w-7 text-muted-foreground" />
            </div>
          )}
          <div>
            <h2 className="font-display text-lg font-bold">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{profile?.goal || "Plano Básico"}</p>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex flex-col items-center rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="mt-3 font-display text-2xl font-bold">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.unit}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-8 flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card"
        >
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            <span className="font-medium text-sm">Modo Escuro</span>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleSignOut}
          className="mt-6 flex w-full items-center justify-center gap-2 text-destructive font-medium"
        >
          Sair da conta <LogOut className="h-4 w-4" />
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
