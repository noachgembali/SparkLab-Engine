import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useGenerations, Generation } from "@/hooks/useGenerations";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  LogOut, 
  Plus, 
  Image, 
  Video, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Sparkles,
  Crown,
  RefreshCw,
  Paintbrush,
  User
} from "lucide-react";
import GenerateModal from "@/components/GenerateModal";
import GenerationCard from "@/components/GenerationCard";
import { PlanBadge } from "@/components/PlanBadge";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const { generations, loading: genLoading, refetch: refetchGenerations } = useGenerations();
  const { toast } = useToast();
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

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

  const handleGenerationSuccess = () => {
    refetchProfile();
    refetchGenerations();
  };

  const handleRefresh = () => {
    refetchProfile();
    refetchGenerations();
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isFreeTier = profile?.plan === "free";
  const limitReached = isFreeTier && (profile?.remainingGenerations === 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 glass-strong">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-gradient">SparkLab</span>
          </div>

          <div className="flex items-center gap-4">
            <PlanBadge />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/workspace")}
              className="hidden sm:flex"
            >
              <Paintbrush className="w-4 h-4 mr-2" />
              Workspace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/account")}
              className="hidden sm:flex"
            >
              <User className="w-4 h-4 mr-2" />
              Account
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
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

      <main className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Plan Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                {isFreeTier ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  <Crown className="w-4 h-4 text-warning" />
                )}
                Current Plan
              </CardDescription>
              <CardTitle className="text-2xl capitalize">
                {profileLoading ? (
                  <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                ) : (
                  profile?.plan || "—"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {isFreeTier
                  ? "Upgrade for unlimited generations"
                  : "Unlimited AI generations"}
              </p>
            </CardContent>
          </Card>

          {/* Usage Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Generations Used</CardDescription>
              <CardTitle className="text-2xl">
                {profileLoading ? (
                  <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                ) : (
                  profile?.usedGenerations || 0
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Total generations created
              </p>
            </CardContent>
          </Card>

          {/* Remaining Card */}
          <Card className={limitReached ? "border-destructive/50" : ""}>
            <CardHeader className="pb-2">
              <CardDescription>Remaining</CardDescription>
              <CardTitle className="text-2xl">
                {profileLoading ? (
                  <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                ) : profile?.remainingGenerations === "unlimited" ? (
                  <span className="text-success">Unlimited</span>
                ) : (
                  <span className={limitReached ? "text-destructive" : ""}>
                    {profile?.remainingGenerations} / 5
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {limitReached
                  ? "Upgrade to continue"
                  : "Available generations"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Generate Button */}
        <div className="mb-8">
          <Button
            variant="glow"
            size="xl"
            onClick={() => setShowGenerateModal(true)}
            disabled={limitReached}
            className="w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            New Generation
          </Button>
          {limitReached && (
            <p className="mt-2 text-sm text-destructive">
              Free trial limit reached. Upgrade to continue generating.
            </p>
          )}
        </div>

        {/* Generations List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your Generations</h2>
            <span className="text-sm text-muted-foreground">
              {generations.length} total
            </span>
          </div>

          {genLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-64 animate-pulse">
                  <div className="h-full bg-muted/50 rounded-xl" />
                </Card>
              ))}
            </div>
          ) : generations.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                <Image className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No generations yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first AI generation to get started
              </p>
              <Button
                variant="glow"
                onClick={() => setShowGenerateModal(true)}
                disabled={limitReached}
              >
                <Plus className="w-4 h-4" />
                Create First Generation
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generations.map((gen) => (
                <GenerationCard key={gen.id} generation={gen} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Generate Modal */}
      <GenerateModal
        open={showGenerateModal}
        onOpenChange={setShowGenerateModal}
        onSuccess={handleGenerationSuccess}
      />
    </div>
  );
}