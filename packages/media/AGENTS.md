# AGENTS.md — Image Generation Prompt Creation Guide

This document is a **metaprompt** for AI agents (Claude, GPT, etc.) to create XML-based prompt templates for image generation.

## Task

Generate provider-agnostic XML prompt templates that work across OpenAI gpt-image-1, Fal.ai, and OpenRouter.

## XML Template Structure

All templates must follow this exact structure:

```xml
<?xml version="1.0"?>
<prompt>
  <name>template-slug</name>
  <style_description>
    One or two sentences describing the visual style/aesthetic.
  </style_description>
  <technical_specifications>
    Technical rendering requirements (lighting, composition, details).
  </technical_specifications>
  <artistic_guidelines>
    Artistic direction, constraints, and what to avoid.
  </artistic_guidelines>
  <output_variations>
    <sticker>Transparent background variant description.</sticker>
    <scene>Full scene variant description.</scene>
    <wallpaper>Wide wallpaper variant description.</wallpaper>
  </output_variations>
  <transformation>
    {{subject}} — [transformation instructions]. Use <output_format/> as primary constraint.
  </transformation>
  <output_format type="{{output}}" />
</prompt>
```

## Required Variables

Every template must support these variables:
- `{{subject}}` — The user's input (e.g., "A cat wearing a wizard hat")
- `{{output}}` — Output type: "sticker", "scene", or "wallpaper"

You may add custom variables as needed (e.g., `{{mood}}`, `{{color_palette}}`).

## Example Template (Anime)

```xml
<?xml version="1.0"?>
<prompt>
  <name>anime</name>
  <style_description>
    Transform into vibrant anime/manga art with expressive faces, cel shading, clean line art, and bold color palettes.
  </style_description>
  <technical_specifications>
    Use sharp outlines, consistent lighting, and balanced composition. Preserve subject identity while stylizing.
  </technical_specifications>
  <artistic_guidelines>
    Emphasize dynamic poses, cinematic framing, and anime lighting. Avoid text artifacts and watermarks.
  </artistic_guidelines>
  <output_variations>
    <sticker>Transparent background, centered subject, clean silhouette with soft edges.</sticker>
    <scene>Cinematic background with depth and parallax-friendly composition.</scene>
    <wallpaper>Wide composition, negative space for icons, balanced color contrast.</wallpaper>
  </output_variations>
  <transformation>
    {{subject}} — render in anime style. Use the <output_format/> section as the primary delivery constraint.
  </transformation>
  <output_format type="{{output}}" />
</prompt>
```

## TypeScript Wrapper

For each template, create a TypeScript file:

```typescript
// src/prompts/[style-name].ts
import { PromptTemplate, compileXML } from './utils';

export type MyStyleVars = Record<'subject' | 'output', string>;

const xml = `<?xml version="1.0"?>
<prompt>
  <!-- Your XML template here -->
</prompt>`;

export const myStyleTemplate: PromptTemplate<MyStyleVars> = {
  id: 'my-style',
  title: 'My Style',
  vars: [
    { name: 'subject', required: true },
    { name: 'output', required: true },
  ],
  toXML: (vars) => compileXML(xml, vars, [
    { name: 'subject', required: true },
    { name: 'output', required: true },
  ]),
};
```

Then export from `src/prompts/index.ts`:

```typescript
export * from './my-style';
```

## Style Categories

Common style categories to consider:

### Illustration Styles
- Anime/manga
- Cartoon/comic
- Children's book
- Editorial illustration
- Technical diagram

### Art Movements
- Cyberpunk
- Steampunk
- Art Nouveau
- Bauhaus
- Impressionist
- Abstract

### Photography Styles
- Photorealistic
- Portrait
- Landscape
- Product photography
- Macro

### Digital Art
- Low poly
- Pixel art
- Voxel art
- Geometric
- Glitch art

## Guidelines for Creating Templates

### 1. Be Specific
Bad: "Make it look cool"
Good: "Use high-contrast lighting with rim lights, Dutch angle composition, and chromatic aberration effects"

### 2. Provider-Agnostic
Avoid provider-specific terms:
- ❌ "Use DALL-E style rendering"
- ✅ "Use photorealistic rendering with ray-traced global illumination"

### 3. Output Variations
Tailor each output type:
- **Sticker**: Centered, simple background, clear silhouette
- **Scene**: Environmental context, depth, storytelling
- **Wallpaper**: Wide format, negative space, icon-friendly

### 4. Constraints Are Helpful
Tell the model what NOT to do:
- "Avoid text artifacts and watermarks"
- "No blurred faces or distorted anatomy"
- "Exclude photographic grain"

### 5. Preserve Identity
When transforming existing subjects:
- "Preserve subject identity while stylizing"
- "Maintain recognizable features"
- "Keep original pose and expression"

## Template Testing Checklist

Before finalizing a template:

- [ ] Test with 3+ different subjects
- [ ] Test all 3 output types (sticker, scene, wallpaper)
- [ ] Test with all 3 providers (OpenAI, Fal, OpenRouter)
- [ ] Verify all variables are substituted correctly
- [ ] Check XML is well-formed (no unclosed tags)
- [ ] Ensure style is distinct from existing templates

## Where to Save Filters

**Long-form filter definitions** (with extensive artistic guidelines) should go in:
```
src/prompts/filters/[filter-name].xml
```

These are full XML documents that can be loaded and used directly without variables.

**Short template definitions** (with variables) should go in:
```
src/prompts/[template-name].ts
```

## Example Request Format

When a user asks "Create a cyberpunk prompt template", respond with:

1. **XML template** (with proper structure)
2. **TypeScript wrapper** (with type definitions)
3. **Usage example** (showing how to call it)
4. **Where to save** (file paths)

## Advanced: Custom Variables

You can extend beyond `subject` and `output`:

```xml
<transformation>
  {{subject}} in {{mood}} mood, rendered with {{color_palette}} color palette.
</transformation>
```

```typescript
export type CustomVars = Record<'subject' | 'output' | 'mood' | 'color_palette', string>;
```

## Common Mistakes to Avoid

1. **Missing required tags** — All 7 sections must be present
2. **Unclosed XML tags** — Validate XML syntax
3. **Hardcoded values** — Use variables for user input
4. **Provider coupling** — Don't reference specific models/APIs
5. **Vague descriptions** — Be specific about visual outcomes

## Resources

- OpenAI gpt-image-1 docs: https://platform.openai.com/docs/guides/images
- Fal.ai models: https://fal.ai/models
- OpenRouter docs: https://openrouter.ai/docs

## Questions?

If you're unsure about:
- Template structure → Follow the example above exactly
- Variable naming → Use descriptive camelCase names
- Style clarity → Be more specific rather than less
- Output variations → Think about use cases (UI, print, web)

---

**Remember:** The goal is to create **reusable, provider-agnostic prompts** that produce consistent results across all providers.
