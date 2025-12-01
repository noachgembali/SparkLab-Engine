import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { signOut } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  LogOut, 
  User, 
  Crown, 
  Calendar,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  ArrowLeft,
  Image,
  Video,
  Plug
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface EngineConnection {
  id: string;
  user_id: string;
  engine_key: string;
  status: string;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export default function Account() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const { toast } = useToast();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [engineConnectModalOpen, setEngineConnectModalOpen] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<{ id: string; name: string } | null>(null);
  const [engineConnections, setEngineConnections] = useState<Record<string, EngineConnection>>({});
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [savingConnection, setSavingConnection] = useState(false);

  // Define engines array before useEffect hooks
  const engines = [
    {
      id: "image_engine_a",
      name: "Image Engine A",
      description: "Fast general image generation",
      type: "image" as const,
    },
    {
      id: "image_engine_b",
      name: "Image Engine B",
      description: "Creative and stylized images",
      type: "image" as const,
    },
    {
      id: "image_engine_c",
      name: "Image Engine C",
      description: "Image + reference image capabilities",
      type: "image" as const,
    },
    {
      id: "video_engine_a",
      name: "Video Engine A",
      description: "AI-powered video generation",
      type: "video" as const,
    },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch engine connections
  useEffect(() => {
    const fetchEngineConnections = async () => {
      if (!user) return;
      
      setLoadingConnections(true);
      try {
        const { data, error } = await supabase.functions.invoke('engine-connections', {
          method: 'GET',
        });

        if (error) {
          console.error('Error fetching engine connections:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load engine connections",
          });
          return;
        }

        // Map connections by engine_key for easy lookup
        const connectionsMap: Record<string, EngineConnection> = {};
        if (data?.connections) {
          data.connections.forEach((conn: EngineConnection) => {
            connectionsMap[conn.engine_key] = conn;
          });
        }
        setEngineConnections(connectionsMap);
      } catch (err) {
        console.error('Error fetching engine connections:', err);
      } finally {
        setLoadingConnections(false);
      }
    };

    fetchEngineConnections();
  }, [user, toast]);

  // Listen for OAuth popup messages
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Security: Only accept messages from same origin
      if (event.origin !== window.origin) {
        return;
      }

      // Check for ENGINE_OAUTH_COMPLETE message
      if (event.data?.type === 'ENGINE_OAUTH_COMPLETE') {
        const { engineKey } = event.data;
        
        if (!engineKey) return;

        // Save the connection
        setSavingConnection(true);
        try {
          const { data, error } = await supabase.functions.invoke('engine-connections', {
            method: 'POST',
            body: {
              engineKey: engineKey,
              status: 'connected',
            },
          });

          if (error) {
            console.error('Error saving engine connection:', error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to save engine connection",
            });
            return;
          }

          // Update local state
          if (data?.connection) {
            setEngineConnections(prev => ({
              ...prev,
              [data.connection.engine_key]: data.connection,
            }));
          }

          // Find engine name for toast
          const engine = engines.find(e => e.id === engineKey);
          toast({
            title: "Success",
            description: `${engine?.name || 'Engine'} connected successfully`,
          });
        } catch (err) {
          console.error('Error connecting engine:', err);
          toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred",
          });
        } finally {
          setSavingConnection(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast, engines]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out",
      });
    } else {
      navigate("/auth");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isFreeTier = profile?.plan === "free";
  const usagePercent = isFreeTier && profile?.usedGenerations 
    ? (profile.usedGenerations / 5) * 100 
    : 0;

  const handleEngineConnect = (engineId: string, engineName: string) => {
    // Open OAuth popup
    const popupWidth = 500;
    const popupHeight = 650;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;
    
    const popup = window.open(
      `/engine-auth/${engineId}`,
      'sparklab-engine-auth',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=no,scrollbars=yes`
    );

    if (!popup) {
      toast({
        variant: "destructive",
        title: "Popup Blocked",
        description: "Please allow popups for SparkLab to connect engines",
      });
    }
  };

  const handleConfirmConnect = async () => {
    if (!selectedEngine) return;

    setSavingConnection(true);
    try {
      const { data, error } = await supabase.functions.invoke('engine-connections', {
        method: 'POST',
        body: {
          engineKey: selectedEngine.id,
          status: 'connected',
        },
      });

      if (error) {
        console.error('Error saving engine connection:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save engine connection",
        });
        return;
      }

      // Update local state
      if (data?.connection) {
        setEngineConnections(prev => ({
          ...prev,
          [data.connection.engine_key]: data.connection,
        }));
      }

      toast({
        title: "Success",
        description: `${selectedEngine.name} connected successfully`,
      });

      setEngineConnectModalOpen(false);
    } catch (err) {
      console.error('Error connecting engine:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setSavingConnection(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 glass-strong">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-gradient">SparkLab</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={refetchProfile}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account & Plan</h1>
          <p className="text-muted-foreground">Manage your SparkLab profile and subscription</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile
              </CardTitle>
              <CardDescription>Your SparkLab account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                {/* Avatar placeholder */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <User className="w-10 h-10 text-primary" />
                </div>
                
                {/* Profile info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="text-foreground font-medium">
                      {profileLoading ? (
                        <span className="inline-block h-5 w-48 bg-muted rounded animate-pulse" />
                      ) : (
                        profile?.email || user?.email || "—"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Member since</p>
                    <div className="flex items-center gap-2 text-foreground">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {profileLoading ? (
                        <span className="inline-block h-5 w-32 bg-muted rounded animate-pulse" />
                      ) : (
                        profile?.createdAt 
                          ? new Date(profile.createdAt).toLocaleDateString("en-US", { 
                              year: "numeric", 
                              month: "long", 
                              day: "numeric" 
                            })
                          : "—"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Plan Card */}
          <Card className={isFreeTier ? "" : "border-warning/50 bg-gradient-to-br from-warning/5 to-transparent"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isFreeTier ? (
                  <Sparkles className="w-5 h-5 text-primary" />
                ) : (
                  <Crown className="w-5 h-5 text-warning" />
                )}
                Current Plan
              </CardTitle>
              <CardDescription>Your SparkLab subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Badge */}
              <div className="flex items-center gap-3">
                <Badge 
                  variant={isFreeTier ? "secondary" : "default"} 
                  className={isFreeTier 
                    ? "text-base px-4 py-2" 
                    : "text-base px-4 py-2 bg-gradient-to-r from-warning to-warning/80"
                  }
                >
                  {profileLoading ? (
                    <span className="inline-block h-5 w-16 bg-muted rounded animate-pulse" />
                  ) : (
                    <span className="capitalize font-semibold">
                      {profile?.plan === "free" ? "Free Trial" : "Pro"}
                    </span>
                  )}
                </Badge>
              </div>

              {/* Usage Display */}
              {isFreeTier ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Generations used</span>
                    <span className="font-medium">
                      {profileLoading ? "..." : `${profile?.usedGenerations || 0} of 5`}
                    </span>
                  </div>
                  <Progress 
                    value={usagePercent} 
                    className="h-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    {profile?.remainingGenerations === 0 
                      ? "You've used all your free generations" 
                      : `${profile?.remainingGenerations || 0} free generations remaining`
                    }
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Unlimited Generations</p>
                      <p className="text-sm text-muted-foreground">Create without limits</p>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              {isFreeTier ? (
                <Button 
                  variant="glow" 
                  size="lg" 
                  className="w-full"
                  onClick={() => setUpgradeModalOpen(true)}
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Unlimited (Pro)
                </Button>
              ) : (
                <div className="p-4 rounded-xl border border-border/50 bg-muted/20 text-center">
                  <div className="flex items-center justify-center gap-2 text-success font-medium">
                    <Crown className="w-5 h-5" />
                    You are on the Pro plan
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SparkLab Engines Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="w-5 h-5 text-primary" />
                SparkLab Engines
              </CardTitle>
              <CardDescription>Manage your unified AI generation engines securely</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {engines.map((engine) => {
                  const connection = engineConnections[engine.id];
                  const isConnected = connection?.status === 'connected';
                  
                  return (
                    <Card 
                      key={engine.id}
                      className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card/80 to-card/40 hover:border-primary/30 transition-all duration-300"
                    >
                      <CardContent className="p-5">
                        {/* Engine Icon */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex-shrink-0">
                            {engine.type === "image" ? (
                              <Image className="w-5 h-5 text-primary" />
                            ) : (
                              <Video className="w-5 h-5 text-accent" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                              {engine.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {engine.description}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          {loadingConnections ? (
                            <div className="h-6 w-28 bg-muted rounded animate-pulse" />
                          ) : (
                            <Badge 
                              variant="outline" 
                              className={isConnected 
                                ? "bg-success/10 text-success border-success/30" 
                                : "bg-muted/50 text-muted-foreground border-border/50"
                              }
                            >
                              {isConnected ? "Connected" : "Not Connected"}
                            </Badge>
                          )}

                          {/* Connect Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEngineConnect(engine.id, engine.name)}
                            disabled={loadingConnections}
                            className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                          >
                            {isConnected ? "Reconnect" : "Connect"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Info Banner */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">
                      Secure OAuth Coming Soon
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Connect your SparkLab Engines with secure OAuth authentication. Your tokens will be safely encrypted and stored.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Upgrade Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-warning" />
              Pro Upgrade Coming Soon
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                Pro upgrade will be available soon. We currently support one simple plan:
              </p>
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
                <p className="text-foreground font-semibold mb-2">Pro Plan</p>
                <p className="text-2xl font-bold text-gradient mb-1">₹100–₹200 / month</p>
                <p className="text-sm text-muted-foreground">Unlimited generations</p>
              </div>
              <p className="text-sm text-muted-foreground">
                We're working on payment integration. Stay tuned for updates!
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setUpgradeModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Engine Connect Modal */}
      <Dialog open={engineConnectModalOpen} onOpenChange={setEngineConnectModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                <Plug className="w-5 h-5 text-primary" />
              </div>
              Connect SparkLab Engines
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Coming Soon Badge */}
            <div className="flex justify-center">
              <Badge className="bg-gradient-to-r from-primary/20 to-accent/20 text-foreground border-primary/30 px-4 py-1.5">
                Coming Soon
              </Badge>
            </div>

            {/* Main Message */}
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 mb-2">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground">
                Secure OAuth Authentication
              </h3>
              
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                You will soon be able to securely authenticate and connect SparkLab Engines using SparkLab-branded OAuth. Tokens will be safely stored.
              </p>
              
              <p className="text-sm text-muted-foreground">
                This feature is currently under development.
              </p>
            </div>

            {/* Feature Preview */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
              <p className="text-sm font-medium text-foreground">What to expect:</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  One-click OAuth flow
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Encrypted token storage
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Automatic token refresh
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Easy disconnect/reconnect
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setEngineConnectModalOpen(false)}
              className="min-w-[120px]"
              disabled={savingConnection}
            >
              Cancel
            </Button>
            <Button 
              variant="glow" 
              onClick={handleConfirmConnect}
              className="min-w-[120px]"
              disabled={savingConnection}
            >
              {savingConnection ? "Connecting..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
