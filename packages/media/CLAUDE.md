# @repo/media — Multi-Provider Media Generation

Framework-agnostic TypeScript library for generating **images, video, audio, and 3D** assets with multiple AI providers. Use in Convex actions, Next.js API routes, Edge functions, or any Node/browser environment.

## Providers

1. **OpenAI** — gpt-image-1 and gpt-image-1-mini models; supports image editing with input images
2. **Fal.ai** — 600+ models for images, video (Veo3, Minimax), audio (Maestro), and 3D generation
3. **OpenRouter** — Access to Gemini 2.5 Flash Image Preview and other image models with aspect ratio control

## Installation

Already included in TurboKit. For external projects:

```bash
pnpm add @ai-sdk/openai @fal-ai/client @openrouter/sdk ai openai
```

## Environment Variables

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Fal.ai
FAL_API_KEY=...

# OpenRouter
OPENROUTER_API_KEY=...
OPENROUTER_REFERER=https://your-app.com  # Optional HTTP-Referer header
OPENROUTER_TITLE=Your App Name           # Optional X-Title header
```

## Server Usage (Actions, API Routes)

### MediaClient

```typescript
import { MediaClient } from '@repo/media';

const media = new MediaClient({
  // Optional: pass API keys explicitly (otherwise uses process.env)
  OPENAI_API_KEY: '...',
  FAL_API_KEY: '...',
  OPENROUTER_API_KEY: '...',
});

// OpenAI — Image generation
const imageResult = await media.generateWithOpenAI({
  prompt: 'A serene landscape',
  model: 'gpt-image-1', // or 'gpt-image-1-mini'
  size: '1024x1024',
  quality: 'high', // 'low' | 'medium' | 'high'
});
// Returns: ImageMediaResult { type: 'image', url: string, b64?: string, width?, height?, ... }

// OpenAI — Image editing with input
const editResult = await media.generateWithOpenAI({
  prompt: 'Transform this into a watercolor painting',
  model: 'gpt-image-1', // Note: mini doesn't support inputImage
  inputImage: 'https://example.com/input.png', // or data URL or base64
  size: '1024x1024',
  quality: 'medium',
});

// Fal.ai — Generic API (supports ANY Fal model)
const falResult = await media.generateWithFal({
  model: 'fal-ai/flux-pro', // Image generation
  input: {
    prompt: 'A cat in space',
    image_size: { width: 1024, height: 1024 },
    num_inference_steps: 28,
  },
});
// Returns: MediaResult (type: 'image' | 'video' | 'audio' | '3d')

// Fal.ai — Video generation
const videoResult = await media.generateWithFal({
  model: 'fal-ai/veo3',
  input: {
    prompt: 'Cinematic shot of a sunset over mountains',
    duration_seconds: 5,
  },
});
// Returns: VideoMediaResult { type: 'video', url: string, duration?, hasAudio?, ... }

// Fal.ai — Audio generation
const audioResult = await media.generateWithFal({
  model: 'fal-ai/maestro/music',
  input: {
    prompt: 'Upbeat electronic music',
    duration_seconds: 30,
  },
});
// Returns: AudioMediaResult { type: 'audio', url: string, duration?, ... }

// OpenRouter — Image with aspect ratio
const orResult = await media.generateWithOpenRouter({
  prompt: 'Cyberpunk cityscape',
  model: 'google/gemini-2.5-flash-image-preview',
  aspectRatio: '16:9', // Optional: '1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'
});
// Returns: ImageMediaResult { type: 'image', url: string, b64?: string, ... }
```

### MediaResult — Discriminated Union

All generation methods return a `MediaResult` type that's discriminated by the `type` field:

```typescript
// Type discrimination example
const result = await media.generateWithFal({ model: 'fal-ai/veo3', input: { prompt: '...' } });

if (result.type === 'image') {
  console.log(result.url, result.b64, result.width, result.height);
} else if (result.type === 'video') {
  console.log(result.url, result.duration, result.hasAudio);
} else if (result.type === 'audio') {
  console.log(result.url, result.duration);
} else if (result.type === '3d') {
  console.log(result.url, result.format, result.previewUrl);
}
```

## Client Usage (React Hooks)

### useOpenAI

```tsx
'use client';
import { useOpenAI } from '@repo/media/react';

export function ImageGenerator() {
  const { image, isLoading, error, generate, cancel } = useOpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Optional
  });

  const handleGenerate = async () => {
    const result = await generate({
      prompt: 'A serene landscape',
      model: 'gpt-image-1',
      quality: 'high',
      size: '1024x1024',
    });
    console.log('Generated:', result); // ImageMediaResult
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
      {error && <p>Error: {error.message}</p>}
      {image && <img src={image.url} alt="Generated" />}
    </div>
  );
}
```

**Backward Compatibility:** `useImageGen1` is still available as an alias:
```tsx
import { useImageGen1 } from '@repo/media/react';
// Works identically to useOpenAI
```

### useFal

```tsx
'use client';
import { useFal } from '@repo/media/react';

export function FalGenerator() {
  const { result, isLoading, generate } = useFal({
    apiKey: process.env.NEXT_PUBLIC_FAL_API_KEY,
  });

  const handleImageGen = async () => {
    const img = await generate({
      model: 'fal-ai/flux-pro',
      input: {
        prompt: 'Anime character',
        image_size: { width: 1024, height: 1024 },
      },
    });
    console.log('Image:', img.url);
  };

  const handleVideoGen = async () => {
    const vid = await generate({
      model: 'fal-ai/veo3',
      input: {
        prompt: 'Epic cinematic scene',
        duration_seconds: 5,
      },
    });
    console.log('Video:', vid.url);
  };

  return (
    <div>
      <button onClick={handleImageGen} disabled={isLoading}>
        Generate Image
      </button>
      <button onClick={handleVideoGen} disabled={isLoading}>
        Generate Video
      </button>
      {result?.type === 'image' && <img src={result.url} alt="Generated" />}
      {result?.type === 'video' && <video src={result.url} controls />}
    </div>
  );
}
```

**Important:** Fal uses a **generic input** approach. Consult [fal.ai/models](https://fal.ai/models) for model-specific parameters.

### useOpenRouter

```tsx
'use client';
import { useOpenRouter } from '@repo/media/react';

export function OpenRouterGenerator() {
  const { image, isLoading, generate } = useOpenRouter({
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
    referer: 'https://your-app.com',
    title: 'Your App',
  });

  return (
    <button
      onClick={() =>
        generate({
          prompt: 'Cyberpunk cityscape',
          model: 'google/gemini-2.5-flash-image-preview',
          aspectRatio: '16:9',
        })
      }
    >
      Generate with OpenRouter
    </button>
  );
}
```

## Dynamic Model Discovery

### Fetching Available Models

Instead of hardcoded model IDs, fetch models dynamically from provider APIs:

```typescript
// Server-side (Convex actions)
import { fetchOpenAIModels, fetchOpenRouterModels } from '@repo/media/server';

const openaiModels = await fetchOpenAIModels(process.env.OPENAI_API_KEY);
// Returns: ModelInfo[] with id, name, capabilities, pricing

const openrouterModels = await fetchOpenRouterModels(
  process.env.OPENROUTER_API_KEY,
  { outputModalities: ['image'] } // Optional filter
);
```

**Note:** Fal.ai doesn't provide a model listing API. Browse [fal.ai/models](https://fal.ai/models) for 600+ available models.

### Client-Side Model Discovery (via Convex)

All model fetching goes through Convex backend for security (keeps API keys server-side):

```tsx
// 1. Create hook in your app (one-time setup)
// apps/app/src/hooks/useAvailableModels.ts
import { createUseAvailableModels } from '@repo/media/react';
import { api } from '@/convex/_generated/api';

export const useAvailableModels = createUseAvailableModels(api);

// 2. Use in components
import { useAvailableModels } from '@/hooks/useAvailableModels';

function ModelSelector() {
  const { models, isLoading, cached, stale } = useAvailableModels('openai');

  return (
    <select>
      {models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.name || model.id}
        </option>
      ))}
    </select>
  );
}
```

**How it works:**
1. Client calls `useAvailableModels('openai')` → queries Convex
2. Convex checks DB cache (1-hour TTL)
3. If stale, schedules background action to refresh
4. Action fetches from provider API (server-side keys)
5. Results cached in DB, returned to client

## Prompt Templates

### XML-Based Prompt System

TurboKit images use XML-structured prompts for provider-agnostic generation:

```typescript
import { animeTemplate } from '@repo/media';

const promptXML = animeTemplate.toXML({
  subject: 'A cat wearing a wizard hat',
  output: 'sticker',
});

const result = await media.generateWithOpenAI({ prompt: promptXML });
```

**Built-in templates:**
- `animeTemplate` — Transform into anime/manga style

### Creating Custom Templates

See `AGENTS.md` for the template creation metaprompt and structure guide.

```typescript
import { PromptTemplate, compileXML } from '@repo/media';

export type MyVars = Record<'subject' | 'style', string>;

const xml = `<?xml version="1.0"?>
<prompt>
  <name>custom</name>
  <style_description>{{style}}</style_description>
  <transformation>{{subject}}</transformation>
</prompt>`;

export const myTemplate: PromptTemplate<MyVars> = {
  id: 'custom',
  title: 'Custom Style',
  vars: [
    { name: 'subject', required: true },
    { name: 'style', required: true },
  ],
  toXML: (vars) => compileXML(xml, vars, [
    { name: 'subject', required: true },
    { name: 'style', required: true },
  ]),
};
```

## Integration with Convex Backend

For production use, integrate with `packages/backend/convex/app/images/` for:
- Job tracking and status updates
- Retry logic with exponential backoff
- Rate limiting and concurrency control (via Workpool)
- Caching (via ActionCache)

See backend integration docs for the mutation→action pattern.

## Type Reference

### MediaResult (Discriminated Union)

```typescript
type MediaResult = ImageMediaResult | VideoMediaResult | AudioMediaResult | ThreeDMediaResult;

interface ImageMediaResult {
  type: 'image';
  url: string;
  b64?: string;           // Base64-encoded image data (optional)
  width?: number;
  height?: number;
  contentType?: string;
  meta?: Record<string, unknown>;
}

interface VideoMediaResult {
  type: 'video';
  url: string;
  duration?: number;      // Duration in seconds
  hasAudio?: boolean;
  contentType?: string;
  fileName?: string;
  fileSize?: number;
  meta?: Record<string, unknown>;
}

interface AudioMediaResult {
  type: 'audio';
  url: string;
  duration?: number;
  contentType?: string;
  meta?: Record<string, unknown>;
}

interface ThreeDMediaResult {
  type: '3d';
  url: string;
  format?: string;        // e.g., 'glb', 'obj'
  previewUrl?: string;    // Preview image URL
  meta?: Record<string, unknown>;
}
```

### Input Types

```typescript
interface OpenAIImageInput {
  prompt: string;
  model?: string;         // 'gpt-image-1' | 'gpt-image-1-mini'
  size?: '1024x1024' | '1536x1024' | '1024x1536';
  quality?: 'low' | 'medium' | 'high';
  inputImage?: string;    // URL, data URL, or base64 (not supported by mini)
  outputFormat?: 'png' | 'jpeg';
  numImages?: number;     // 1-10
}

interface FalInput {
  model: string;          // Any Fal model (e.g., 'fal-ai/flux-pro', 'fal-ai/veo3')
  input: Record<string, unknown>; // Model-specific parameters
  options?: {
    downloadAndEncode?: boolean;  // Download and base64-encode (images only)
    timeout?: number;              // Timeout in milliseconds
    onQueueUpdate?: (update: FalQueueUpdate) => void;
  };
}

interface OpenRouterImageInput {
  prompt: string;
  model?: string;         // Default: 'google/gemini-2.5-flash-image-preview'
  aspectRatio?: '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9';
}
```

### ModelInfo

```typescript
interface ModelInfo {
  id: string;
  name?: string;
  capabilities?: string[];
  pricing?: {
    prompt?: number;
    completion?: number;
    image?: number;
    request?: number;
  };
}
```

### ProviderError

```typescript
interface ProviderError {
  provider: Provider;
  message: string;
  cause?: unknown;
}

enum Provider {
  OPENAI = 'openai',
  FAL = 'fal',
  OPENROUTER = 'openrouter',
}
```

## OpenRouter Image Generation

### Supported Models

OpenRouter provides access to image generation through models with `"image"` in their `output_modalities`:

- **google/gemini-2.5-flash-image-preview** (default) — Gemini's image generation model with contextual understanding
- Visit [OpenRouter Models](https://openrouter.ai/models) and filter by "image" output modality for the latest models

### Aspect Ratios

Gemini image generation models support custom aspect ratios via the `aspectRatio` parameter:

| Ratio | Dimensions | Use Case |
|-------|------------|----------|
| `1:1` | 1024×1024 | Square (default) |
| `2:3` | 832×1248 | Portrait |
| `3:2` | 1248×832 | Landscape |
| `3:4` | 864×1184 | Portrait |
| `4:3` | 1184×864 | Landscape |
| `4:5` | 896×1152 | Portrait |
| `5:4` | 1152×896 | Landscape |
| `9:16` | 768×1344 | Vertical (mobile) |
| `16:9` | 1344×768 | Widescreen |
| `21:9` | 1536×672 | Ultrawide |

Example:
```typescript
const result = await media.generateWithOpenRouter({
  prompt: 'A futuristic cityscape at sunset',
  model: 'google/gemini-2.5-flash-image-preview',
  aspectRatio: '16:9',
});
```

### How It Works

The implementation uses OpenRouter's native API with:
1. **`modalities: ['image', 'text']`** — Required parameter for image generation
2. **`image_config.aspect_ratio`** — Optional aspect ratio control (Gemini models)
3. **Direct fetch** — Uses `/chat/completions` endpoint with proper response parsing
4. **Base64 data URLs** — Images returned as `data:image/png;base64,...` format

## Best Practices

1. **Use OpenAI gpt-image-1 as default** — Fastest, highest quality, supports edits
2. **Use gpt-image-1-mini for cost savings** — Cheaper alternative, no input image support
3. **Fal.ai for video/audio/3D** — 600+ models for all media types
4. **OpenRouter for model variety** — Access to multiple image generation models
5. **Cache deterministic results** — Use ActionCache for prompt+model+params combos
6. **Limit concurrency** — Use Workpool to avoid quota burnout
7. **Fetch models dynamically** — Use model discovery APIs instead of hardcoding IDs

## Troubleshooting

**Error: Missing API_KEY**
- Set environment variable or pass to MediaClient constructor
- For hooks, use `NEXT_PUBLIC_` prefix for client-side keys

**Error: No media data found in response**
- Check provider API status
- Verify API key has correct permissions
- Ensure prompt is valid

**Fal.ai timeout**
- Increase timeout in options: `{ options: { timeout: 30000 } }`
- Check Fal.ai status page
- Some models (video, 3D) take longer than default 15s

**OpenRouter: No images in response**
- Verify model ID supports image generation (check `output_modalities` on OpenRouter)
- Ensure model has image generation capability
- Check API key permissions and credits

**OpenRouter: Invalid aspect ratio**
- Only use aspect ratios from the supported list
- Aspect ratios only work with Gemini models
- Omit `aspectRatio` parameter to use default (1:1)

**Fal: Model-specific errors**
- Consult [fal.ai/models](https://fal.ai/models) for model documentation
- Verify input parameters match model requirements
- Check model status (some models may be deprecated)

## Related

- Backend integration: `packages/backend/convex/app/images/`
- Template creation: `AGENTS.md`
- Convex docs: https://docs.convex.dev
