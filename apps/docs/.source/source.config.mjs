// source.config.ts
import { remarkInstall } from "fumadocs-docgen";
import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema
} from "fumadocs-mdx/config";
import { z } from "zod";
var extendedFrontmatterSchema = frontmatterSchema.extend({
  category: z.enum(["convex", "ai", "components", "guides", "reference"]).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  featured: z.boolean().optional()
});
var docs = defineDocs({
  docs: {
    schema: extendedFrontmatterSchema
  },
  meta: {
    schema: metaSchema
  }
});
var source_config_default = defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkInstall]
  }
});
export {
  source_config_default as default,
  docs
};
