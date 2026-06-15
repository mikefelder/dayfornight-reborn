import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const artists2015 = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/2015/artists' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    image: z.string(),
    externalUrl: z.string().optional(),
    categories: z.array(z.string()).default([]),
    publishedDate: z.string(),
    prevArtist: z
      .object({
        slug: z.string(),
        name: z.string(),
      })
      .optional(),
    nextArtist: z
      .object({
        slug: z.string(),
        name: z.string(),
      })
      .optional(),
  }),
});

export const collections = {
  'artists2015': artists2015,
};
