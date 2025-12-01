import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Sparkles, Shield, CheckCircle2 } from "lucide-react";

const ENGINE_NAMES: Record<string, string> = {
  image_engine_a: "Image Engine A",
  image_engine_b: "Image Engine B",
  image_engine_c: "Image Engine C",
  video_engine_a: "Video Engine A",
};

export default function EngineAuth() {
  const { engineKey } = useParams<{ engineKey: string }>();
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const engineName = engineKey ? ENGINE_NAMES[engineKey] || engineKey : "Unknown Engine";

  useEffect(() => {
    // Validate that this page was opened as a popup
    if (!window.opener) {
      console.warn("EngineAuth page should be opened in a popup window");
    }
  }, []);

  const handleConnect = () => {
    if (!engineKey) return;

    setConnecting(true);

    // Simulate a brief connection delay for realism
    setTimeout(() => {
      setConnected(true);

      // Send message to parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "ENGINE_OAUTH_COMPLETE",
            engineKey: engineKey,
          },
          window.origin
        );
      }

      // Close popup after a brief success display
      setTimeout(() => {
        window.close();
      }, 800);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-primary/20 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          {/* SparkLab Logo */}
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div>
            <CardTitle className="text-2xl mb-2 text-gradient">
              Connect {engineName}
            </CardTitle>
            <CardDescription className="text-base">
              This is a SparkLab-branded connection window. In the future this will handle secure OAuth to the underlying AI provider.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Feature Preview */}
          <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/50">
            <p className="text-sm font-medium text-foreground mb-3">What will happen:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-muted-foreground">Secure OAuth authentication</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-muted-foreground">Encrypted token storage</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-muted-foreground">Automatic connection sync</span>
              </div>
            </div>
          </div>

          {/* Success State */}
          {connected && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/30 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-success">Connection Successful!</p>
                  <p className="text-sm text-muted-foreground">Closing window...</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!connected && (
            <Button
              variant="glow"
              size="lg"
              className="w-full"
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Simulate Successful Connection
                </>
              )}
            </Button>
          )}

          {/* Info Text */}
          <p className="text-xs text-center text-muted-foreground">
            This simulates OAuth flow. Real provider integration coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
