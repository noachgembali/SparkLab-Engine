import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function PlanBadge() {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();

  if (loading || !profile) {
    return null;
  }

  const isFreeTier = profile.plan === "free";
  const usageText = isFreeTier 
    ? `${profile.usedGenerations}/5 generations used`
    : "Unlimited generations";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`cursor-pointer transition-all hover:scale-105 ${
              isFreeTier
                ? "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 text-foreground"
                : "bg-gradient-to-r from-warning/20 to-warning/10 border-warning/40 text-foreground"
            }`}
            onClick={() => navigate("/account")}
          >
            {isFreeTier ? (
              <>
                <Sparkles className="w-3 h-3 mr-1.5" />
                <span className="font-medium">Free</span>
                <span className="mx-1.5">·</span>
                <span>{profile.remainingGenerations}/5</span>
              </>
            ) : (
              <>
                <Crown className="w-3 h-3 mr-1.5 text-warning" />
                <span className="font-medium text-warning">Pro</span>
                <span className="mx-1.5">·</span>
                <span>Unlimited</span>
              </>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{usageText}</p>
          <p className="text-xs text-muted-foreground mt-1">Click to manage plan</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
