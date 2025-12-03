import { useState } from "react";
import { Generation, getFriendlyEngineName } from "@/types/generation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Video,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GenerationCardProps {
  generation: Generation;
}

const statusConfig: Record<
  Generation["status"],
  { icon: typeof Clock; label: string; className: string; iconClassName?: string }
> = {
  queued: {
    icon: Clock,
    label: "Queued",
    className: "bg-white/5 text-muted-foreground border-white/10",
  },
  running: {
    icon: Loader2,
    label: "Running",
    className: "bg-primary/10 text-primary border-primary/30",
    iconClassName: "animate-spin",
  },
  success: {
    icon: CheckCircle2,
    label: "Complete",
    className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

const formatDate = (value: string) => format(new Date(value), "MMM d, yyyy • h:mm a");

export default function GenerationCard({ generation }: GenerationCardProps) {
  const [open, setOpen] = useState(false);
  const isImage = generation.type === "image";
  const status = statusConfig[generation.status];
  const StatusIcon = status.icon;

  const thumbnail =
    isImage && (generation.resultMeta?.urls?.[0] || generation.resultUrl)
      ? generation.resultMeta?.urls?.[0] ?? generation.resultUrl
      : null;

  const imageUrls =
    generation.type === "image"
      ? generation.resultMeta?.urls?.length
        ? generation.resultMeta.urls
        : generation.resultUrl
          ? [generation.resultUrl]
          : []
      : [];

  const aspectRatio = generation.resultMeta?.aspectRatio ?? generation.params?.aspectRatio;
  const style = generation.resultMeta?.style ?? generation.params?.style;
  const steps = generation.resultMeta?.steps ?? generation.params?.steps;
  const promptStrength = generation.resultMeta?.promptStrength ?? generation.params?.promptStrength;
  const seed = generation.resultMeta?.seed ?? generation.params?.seed;
  const outputCount = generation.resultMeta?.outputCount ?? generation.params?.outputCount;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="group relative cursor-pointer overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_20px_70px_-30px_rgba(93,135,255,0.65)]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-950 via-slate-900 to-black">
            {isImage && thumbnail ? (
              <img
                src={thumbnail}
                alt={generation.prompt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/15">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">Video</p>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

            <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
              <Badge variant="secondary" className="gap-1 bg-white/10 text-white backdrop-blur">
                {isImage ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                <span className="text-xs font-medium">{isImage ? "Image" : "Video"}</span>
              </Badge>

              <Badge className={`gap-1 ${status.className}`}>
                <StatusIcon className={`h-3 w-3 ${status.iconClassName || ""}`} />
                <span className="text-xs font-semibold">{status.label}</span>
              </Badge>
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  {formatDate(generation.createdAt)}
                  <span className="text-white/30"> • </span>
                  {formatDistanceToNow(new Date(generation.createdAt), { addSuffix: true })}
                </p>
                <h3 className="text-base font-semibold leading-tight">
                  {getFriendlyEngineName(generation.engine)}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{generation.prompt}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {aspectRatio && (
                <Badge className="bg-white/5 text-white border-white/10">AR {aspectRatio}</Badge>
              )}
              {style && style !== "none" && (
                <Badge className="bg-primary/10 text-primary border-primary/20 capitalize">
                  {style}
                </Badge>
              )}
              {steps && (
                <Badge className="bg-white/5 text-white border-white/10">{steps} steps</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-5xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-lg">Generation Details</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {getFriendlyEngineName(generation.engine)} • {isImage ? "Image" : "Video"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-3">
              {generation.type === "image" ? (
                imageUrls.length > 1 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {imageUrls.slice(0, 4).map((imageUrl, index) => (
                      <div
                        key={imageUrl + index}
                        className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/50 aspect-square"
                      >
                        <img
                          src={imageUrl}
                          alt={`Generated image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/50">
                    {imageUrls[0] ? (
                      <img
                        src={imageUrls[0]}
                        alt="Generated content"
                        className="h-full w-full max-h-[520px] object-contain"
                      />
                    ) : (
                      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                        Image not available
                      </div>
                    )}
                  </div>
                )
              ) : generation.resultUrl ? (
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black">
                  <video
                    src={generation.resultUrl}
                    controls
                    className="h-full w-full max-h-[520px] rounded-xl"
                  />
                </div>
              ) : (
                <div className="flex h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/20 bg-black/50 text-muted-foreground">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10">
                    <Play className="h-6 w-6" />
                  </div>
                  Video result pending
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Engine</p>
                  <p className="text-lg font-semibold leading-tight">{getFriendlyEngineName(generation.engine)}</p>
                  <p className="text-xs text-muted-foreground">{generation.engine}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className="gap-1 bg-white/10 text-white border-white/20">
                    {isImage ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                    {isImage ? "Image" : "Video"}
                  </Badge>
                  <Badge className={`gap-1 ${status.className}`}>
                    <StatusIcon className={`h-3 w-3 ${status.iconClassName || ""}`} />
                    {status.label}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="rounded-lg bg-white/5 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.08em]">Type</p>
                  <p className="text-foreground font-medium capitalize">{generation.type}</p>
                </div>
                <div className="rounded-lg bg-white/5 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.08em]">Created</p>
                  <p className="text-foreground font-medium">{formatDate(generation.createdAt)}</p>
                </div>
                <div className="rounded-lg bg-white/5 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.08em]">Status</p>
                  <p className="text-foreground font-medium capitalize">{generation.status}</p>
                </div>
                {generation.resultMeta?.aspectRatio && (
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.08em]">Aspect Ratio</p>
                    <p className="text-foreground font-medium">{generation.resultMeta.aspectRatio}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground mb-2">Prompt</p>
              <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm leading-relaxed">
                {generation.prompt}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Advanced Params</p>
              <div className="flex flex-wrap gap-2 text-sm">
                {aspectRatio && (
                  <Badge className="bg-white/5 text-white border-white/10">AR {aspectRatio}</Badge>
                )}
                {style && style !== "none" && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 capitalize">
                    Style: {style}
                  </Badge>
                )}
                {steps && (
                  <Badge className="bg-white/5 text-white border-white/10">{steps} steps</Badge>
                )}
                {promptStrength && (
                  <Badge className="bg-white/5 text-white border-white/10">
                    Prompt Strength {promptStrength}
                  </Badge>
                )}
                {seed !== undefined && (
                  <Badge className="bg-white/5 text-white border-white/10">Seed {seed}</Badge>
                )}
                {outputCount && (
                  <Badge className="bg-white/5 text-white border-white/10">
                    Outputs {outputCount}
                  </Badge>
                )}
                {!aspectRatio && !style && !steps && !promptStrength && !seed && !outputCount && (
                  <span className="text-xs text-muted-foreground">No advanced parameters</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
