import { PromptTemplate, compileXML } from './utils';

export type AnimeVars = Record<'subject' | 'output', string>;

const xml = `<?xml version="1.0"?>
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
</prompt>`;

export const animeTemplate: PromptTemplate<AnimeVars> = {
  id: 'anime',
  title: 'Anime',
  vars: [
    { name: 'subject', required: true },
    { name: 'output', required: true },
  ],
  toXML: (vars) =>
    compileXML(xml, vars, [
      { name: 'subject', required: true },
      { name: 'output', required: true },
    ]),
};
