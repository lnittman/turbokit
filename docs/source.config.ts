import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { remarkInstall } from 'fumadocs-docgen';

export const { docs, meta } = defineDocs({
  docs: {
    dir: 'content/docs',
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkInstall],
  },
});