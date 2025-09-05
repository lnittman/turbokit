import { remarkInstall } from 'fumadocs-docgen';
import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import { z } from 'zod';

// Extend frontmatter schema for TurboKit-specific fields
const extendedFrontmatterSchema = frontmatterSchema.extend({
  category: z.enum(['convex', 'ai', 'components', 'guides', 'reference']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  featured: z.boolean().optional(),
});

export const docs = defineDocs({
  docs: {
    schema: extendedFrontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkInstall],
  },
});