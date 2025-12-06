export type EngineKey =
  | "image_engine_a"
  | "image_engine_b"
  | "image_engine_c"
  | "video_engine_a";

export interface EngineConfig {
  key: EngineKey;
  label: string;
  type: "image" | "video";
  supportsReferenceImage: boolean;
  supportsMasks: boolean;
  maxOutputs: number;
  // TODO: In the future, use these to read provider credentials
  // const apiKey = Deno.env.get(engineConfig.envApiKeyName!)
  // const apiBase = Deno.env.get(engineConfig.envApiBaseUrlName!)
  envApiKeyName?: string;
  envApiBaseUrlName?: string;
}

export const ENGINE_CONFIGS: Record<EngineKey, EngineConfig> = {
  // TODO: Map to Meta Images
  image_engine_a: {
    key: "image_engine_a",
    label: "Image Engine A",
    type: "image",
    supportsReferenceImage: false,
    supportsMasks: false,
    maxOutputs: 4,
    envApiKeyName: "META_IMAGE_API_KEY",
    envApiBaseUrlName: "META_IMAGE_API_BASE_URL",
  },
  // TODO: Map to Google ImageFX
  image_engine_b: {
    key: "image_engine_b",
    label: "Image Engine B",
    type: "image",
    supportsReferenceImage: false,
    supportsMasks: false,
    maxOutputs: 4,
    envApiKeyName: "IMAGEFX_API_KEY",
    envApiBaseUrlName: "IMAGEFX_API_BASE_URL",
  },
  // TODO: Map to Google MixBoard (reference image support)
  image_engine_c: {
    key: "image_engine_c",
    label: "Image Engine C",
    type: "image",
    supportsReferenceImage: true,
    supportsMasks: false,
    maxOutputs: 4,
    envApiKeyName: "MIXBOARD_API_KEY",
    envApiBaseUrlName: "MIXBOARD_API_BASE_URL",
  },
  // TODO: Map to Meta Video
  video_engine_a: {
    key: "video_engine_a",
    label: "Video Engine A",
    type: "video",
    supportsReferenceImage: false,
    supportsMasks: false,
    maxOutputs: 1,
    envApiKeyName: "META_VIDEO_API_KEY",
    envApiBaseUrlName: "META_VIDEO_API_BASE_URL",
  },
};

export function getEngineConfig(engineKey: EngineKey): EngineConfig {
  const config = ENGINE_CONFIGS[engineKey];
  if (!config) {
    throw new Error(`Unknown engine: ${engineKey}`);
  }
  return config;
}
