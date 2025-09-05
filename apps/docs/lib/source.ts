import { docs as map } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource(map).toFumadocsSource(),
});

export const { getPage, getPages, pageTree, generateParams } = source;
