import { motion } from "framer-motion";
import { Weight, Ruler, Percent, User, LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { Switch } from "@/components/ui/switch";
import BottomNav from "@/components/BottomNav";

const stats = [
  { icon: Weight, value: "78.5", unit: "KG", color: "text-primary" },
  { icon: Ruler, value: "178", unit: "CM", color: "text-primary" },
  { icon: Percent, value: "12-15%", unit: "GC", color: "text-primary" },
  { icon: User, value: "26", unit: "ANOS", color: "text-primary" },
];

const ProfilePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <h1 className="font-display text-lg font-bold text-destructive">FIT.AI</h1>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <User className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">Paulo da Silva</h2>
            <p className="text-sm text-muted-foreground">Plano Básico</p>
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

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate("/")}
          className="mt-8 flex w-full items-center justify-center gap-2 text-destructive font-medium"
        >
          Sair da conta <LogOut className="h-4 w-4" />
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
