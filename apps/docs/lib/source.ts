import { docs as collection } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource(collection.docs as any, collection.meta as any),
});

export const { getPage, getPages, pageTree, generateParams } = source;
