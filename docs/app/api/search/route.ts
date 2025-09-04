import { createFromSource } from 'fumadocs-core/search/server';
import { getPages, pageTree } from '@/lib/source';
import { source } from '@/lib/source';

// Keep search fully static; Fumadocs handles SSG nicely
export const revalidate = false;

export const { GET } = createFromSource(source);

