import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

// Keep search fully static; Fumadocs handles SSG nicely
export const revalidate = false;

export const { GET } = createFromSource(source);
