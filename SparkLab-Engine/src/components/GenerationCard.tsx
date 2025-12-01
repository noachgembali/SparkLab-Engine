import { Generation } from "@/hooks/useGenerations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Image, 
  Video, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GenerationCardProps {
  generation: Generation;
}

const statusConfig: Record<string, { icon: typeof Clock; label: string; className: string; iconClassName?: string }> = {
  queued: {
    icon: Clock,
    label: "Queued",
    className: "bg-muted text-muted-foreground",
  },
  running: {
    icon: Loader2,
    label: "Running",
    className: "bg-warning/10 text-warning border-warning/20",
    iconClassName: "animate-spin",
  },
  success: {
    icon: CheckCircle2,
    label: "Complete",
    className: "bg-success/10 text-success border-success/20",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export default function GenerationCard({ generation }: GenerationCardProps) {
  const status = statusConfig[generation.status];
  const StatusIcon = status.icon;
  const isImage = generation.type === "image";

  return (
    <Card className="group overflow-hidden hover:border-primary/30 transition-all duration-300">
      {/* Preview Area */}
      <div className="relative aspect-video bg-muted/50 overflow-hidden">
        {generation.status === "success" && generation.url ? (
          <img
            src={generation.url}
            alt={generation.prompt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {generation.status === "running" || generation.status === "queued" ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">
                  {generation.status === "queued" ? "Waiting..." : "Generating..."}
                </span>
              </div>
            ) : generation.status === "failed" ? (
              <div className="flex flex-col items-center gap-2 text-destructive">
                <XCircle className="w-8 h-8" />
                <span className="text-sm">Generation failed</span>
              </div>
            ) : (
              <div className="p-4 rounded-full bg-muted">
                {isImage ? (
                  <Image className="w-8 h-8 text-muted-foreground" />
                ) : (
                  <Video className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="gap-1 bg-background/80 backdrop-blur-sm">
            {isImage ? <Image className="w-3 h-3" /> : <Video className="w-3 h-3" />}
            {generation.type}
          </Badge>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <Badge className={`gap-1 ${status.className}`}>
            <StatusIcon className={`w-3 h-3 ${status.iconClassName || ""}`} />
            {status.label}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Prompt */}
        <p className="text-sm line-clamp-2 mb-3 text-foreground">
          {generation.prompt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-mono bg-muted px-2 py-0.5 rounded">
            {generation.engine.replace(/_/g, " ")}
          </span>
          <span>
            {formatDistanceToNow(new Date(generation.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Generation Details - only show if params exist */}
        {generation.params && Object.keys(generation.params).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {generation.params.aspectRatio && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {generation.params.aspectRatio}
              </span>
            )}
            {generation.params.style && generation.params.style !== "none" && (
              <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full capitalize">
                {generation.params.style}
              </span>
            )}
            {generation.params.steps && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {generation.params.steps} steps
              </span>
            )}
          </div>
        )}

        {/* Error message */}
        {generation.status === "failed" && generation.error && (
          <p className="mt-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
            {generation.error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}