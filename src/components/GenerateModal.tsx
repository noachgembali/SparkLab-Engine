import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Zap, Image, Video } from "lucide-react";

const promptSchema = z.string().trim().min(1, "Prompt is required").max(1000, "Prompt must be under 1000 characters");

const ENGINES = [
  { id: "image_engine_a", name: "Image Engine A", type: "image", description: "Fast image generation" },
  { id: "image_engine_b", name: "Image Engine B", type: "image", description: "High quality images" },
  { id: "image_engine_c", name: "Image Engine C", type: "image", description: "Artistic style" },
  { id: "video_engine_a", name: "Video Engine A", type: "video", description: "Short video clips" },
] as const;

interface GenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function GenerateModal({ open, onOpenChange, onSuccess }: GenerateModalProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const [engine, setEngine] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedEngine = ENGINES.find((e) => e.id === engine);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const promptValidation = promptSchema.safeParse(prompt);
    if (!promptValidation.success) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: promptValidation.error.errors[0].message,
      });
      return;
    }

    if (!engine) {
      toast({
        variant: "destructive",
        title: "Select an Engine",
        description: "Please select an AI engine to use",
      });
      return;
    }

    if (!session?.access_token) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "Please sign in to generate",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          engine,
          type: selectedEngine?.type || "image",
          prompt: promptValidation.data,
          params: {},
        },
      });

      if (error) throw error;

      if (data?.code === "LIMIT_REACHED") {
        toast({
          variant: "destructive",
          title: "Limit Reached",
          description: data.message,
        });
        return;
      }

      toast({
        title: "Generation Started",
        description: "Your AI generation has been queued",
      });

      setPrompt("");
      setEngine("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Generate error:", error);
      
      // Try to parse the error body for custom error codes
      let errorMessage = "Failed to create generation";
      try {
        if (error.context?.body) {
          const body = JSON.parse(error.context.body);
          if (body.code === "LIMIT_REACHED") {
            errorMessage = body.message;
          }
        }
      } catch {}

      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            New Generation
          </DialogTitle>
          <DialogDescription>
            Select an engine and describe what you want to create
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Engine Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Engine</label>
            <Select value={engine} onValueChange={setEngine}>
              <SelectTrigger>
                <SelectValue placeholder="Select an engine" />
              </SelectTrigger>
              <SelectContent>
                {ENGINES.map((eng) => (
                  <SelectItem key={eng.id} value={eng.id}>
                    <div className="flex items-center gap-2">
                      {eng.type === "image" ? (
                        <Image className="w-4 h-4 text-primary" />
                      ) : (
                        <Video className="w-4 h-4 text-accent" />
                      )}
                      <span>{eng.name}</span>
                      <span className="text-muted-foreground text-xs">
                        — {eng.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt</label>
            <Textarea
              placeholder="Describe what you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {prompt.length} / 1000
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              className="flex-1"
              disabled={loading || !engine || !prompt.trim()}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}