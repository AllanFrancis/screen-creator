import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Dumbbell, Target, ShieldAlert, ExternalLink } from "lucide-react";

interface ExerciseHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
}

interface ExerciseHelp {
  instructions: string;
  muscles: string;
  tips: string;
  youtubeSearchUrl: string;
}

const ExerciseHelpDialog = ({ open, onOpenChange, exerciseName }: ExerciseHelpDialogProps) => {
  const [data, setData] = useState<ExerciseHelp | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHelp = async () => {
    if (data) return; // already fetched
    setLoading(true);
    setError("");
    try {
      const { data: res, error: fnError } = await supabase.functions.invoke("exercise-help", {
        body: { exerciseName },
      });
      if (fnError) throw fnError;
      if (res?.error) throw new Error(res.error);
      setData(res);
    } catch (e: any) {
      setError(e.message || "Erro ao buscar informações");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (isOpen) fetchHelp();
    if (!isOpen) {
      setData(null);
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Dumbbell className="h-5 w-5 text-primary" />
            {exerciseName}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Consultando o Coach AI...</p>
          </div>
        )}

        {error && (
          <p className="py-6 text-center text-sm text-destructive">{error}</p>
        )}

        {data && !loading && (
          <div className="space-y-5">
            {/* Instructions */}
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Target className="h-4 w-4 text-primary" /> Como executar
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {data.instructions}
              </p>
            </div>

            {/* Muscles */}
            {data.muscles && (
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Dumbbell className="h-4 w-4 text-primary" /> Músculos trabalhados
                </h3>
                <p className="text-sm text-muted-foreground">{data.muscles}</p>
              </div>
            )}

            {/* Tips */}
            {data.tips && (
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldAlert className="h-4 w-4 text-primary" /> Dicas de segurança
                </h3>
                <p className="whitespace-pre-line text-sm text-muted-foreground">{data.tips}</p>
              </div>
            )}

            {/* YouTube */}
            <a
              href={data.youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Ver vídeo no YouTube
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseHelpDialog;
