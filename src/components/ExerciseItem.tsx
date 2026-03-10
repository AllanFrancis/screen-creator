import { HelpCircle, Zap } from "lucide-react";

interface ExerciseItemProps {
  name: string;
  sets: number;
  reps: number;
  rest: number;
  onHelp?: () => void;
}

const ExerciseItem = ({ name, sets, reps, rest, onHelp }: ExerciseItemProps) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card">
      <div>
        <h4 className="font-display font-semibold text-foreground">{name}</h4>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-tag px-3 py-1 text-xs font-medium text-tag-foreground">
            {sets} SÉRIES
          </span>
          <span className="rounded-full bg-tag px-3 py-1 text-xs font-medium text-tag-foreground">
            {reps} REPS
          </span>
          <span className="flex items-center gap-1 rounded-full bg-tag px-3 py-1 text-xs font-medium text-tag-foreground">
            <Zap className="h-3 w-3" /> {rest}S
          </span>
        </div>
      </div>
      <button onClick={onHelp} className="text-muted-foreground hover:text-primary transition-colors">
        <HelpCircle className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ExerciseItem;
