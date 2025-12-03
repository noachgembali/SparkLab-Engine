export type GenerationType = "image" | "video";

export type GenerationStatus = "queued" | "running" | "success" | "failed";

export interface GenerationParams {
  aspectRatio?: string;
  steps?: number;
  promptStrength?: number;
  seed?: number;
  style?: string;
  referenceImageUrl?: string;
  outputCount?: number;
  [key: string]: unknown;
}

export interface GenerationMeta extends GenerationParams {
  urls?: string[];
}

export interface Generation {
  id: string;
  engine: string;
  type: GenerationType;
  status: GenerationStatus;
  resultUrl: string | null;
  resultMeta: GenerationMeta | null;
  rawResponse?: Record<string, unknown> | null;
  params?: GenerationParams | null;
  prompt: string;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

const ENGINE_NAME_MAP: Record<string, string> = {
  image_engine_a: "Image Engine A",
  image_engine_b: "Image Engine B",
  image_engine_c: "Image Engine C",
  video_engine_a: "Video Engine A",
};

export const getFriendlyEngineName = (engine: string) =>
  ENGINE_NAME_MAP[engine] ||
  engine
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const normalizeGeneration = (payload: any): Generation => {
  const createdAt = payload.createdAt || payload.created_at || new Date().toISOString();
  return {
    id: payload.id,
    engine: payload.engine,
    type: payload.type,
    status: payload.status,
    resultUrl: payload.resultUrl ?? payload.result_url ?? payload.url ?? null,
    resultMeta: payload.resultMeta ?? payload.result_meta ?? payload.meta ?? null,
    rawResponse: payload.rawResponse ?? payload.raw_response ?? null,
    params: payload.params ?? null,
    prompt: payload.prompt,
    error: payload.error ?? null,
    createdAt,
    updatedAt: payload.updatedAt ?? payload.updated_at ?? createdAt,
  };
};
