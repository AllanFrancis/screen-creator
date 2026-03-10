import { useState, useEffect } from "react";
import { Download, Smartphone, Share, MoreVertical, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">App Instalado!</h1>
          <p className="text-muted-foreground">O FIT.AI já está na sua tela inicial.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-sm w-full text-center space-y-8">
        <div className="space-y-2">
          <Smartphone className="w-14 h-14 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Instalar FIT.AI</h1>
          <p className="text-muted-foreground text-sm">Tenha acesso rápido ao seu coach de treino direto da tela inicial.</p>
        </div>

        {isIOS ? (
          <div className="bg-card rounded-2xl p-6 space-y-4 text-left border border-border">
            <p className="text-sm font-semibold text-foreground">No Safari:</p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Share className="w-5 h-5 text-primary shrink-0" />
              <span>Toque no botão <strong>Compartilhar</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Download className="w-5 h-5 text-primary shrink-0" />
              <span>Selecione <strong>"Adicionar à Tela Inicial"</strong></span>
            </div>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} size="lg" className="w-full rounded-xl text-base gap-2">
            <Download className="w-5 h-5" /> Instalar Agora
          </Button>
        ) : (
          <div className="bg-card rounded-2xl p-6 space-y-4 text-left border border-border">
            <p className="text-sm font-semibold text-foreground">No navegador:</p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MoreVertical className="w-5 h-5 text-primary shrink-0" />
              <span>Toque no menu <strong>(⋮)</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Download className="w-5 h-5 text-primary shrink-0" />
              <span>Selecione <strong>"Instalar app"</strong></span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InstallPage;
