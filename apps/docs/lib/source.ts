import { docs as collection } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource(collection.docs as any, collection.meta as any),
});

export const getPage = source.getPage as any;
export const getPages = source.getPages as any;
export const pageTree = source.pageTree as any;
export const generateParams = source.generateParams as any;
