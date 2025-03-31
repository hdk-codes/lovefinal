import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'album',
  title: 'Album',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'A concise name for this collection of memories (1–100 characters).',
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .max(100)
          .custom((value) => {
            if (!value) return 'Title is required';
            return value.trim().length > 0 ? true : 'Title cannot be only whitespace';
          }),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A brief overview of this album (max 500 characters). Optional.',
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        defineField({
          name: 'galleryItemRef',
          type: 'reference',
          to: [{ type: 'galleryItem' }],
          options: {
            filter: '!isPrivate || $identity in sharedWith',
          },
        }),
      ],
      description: 'Gallery items included in this album. Must include at least one unique item.',
      validation: (Rule) => Rule.unique().min(1),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: 'An optional cover image to represent the album visually.',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'isPrivate',
      title: 'Private',
      type: 'boolean',
      description: 'Restrict this album to specific viewers listed in "Shared With".',
      initialValue: false,
    }),
    defineField({
      name: 'sharedWith',
      title: 'Shared With',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'Email addresses or user IDs who can view this album if private (max 50 unique entries).',
      options: {
        layout: 'tags',
      },
      validation: (Rule) =>
        Rule.unique()
          .max(50)
          .custom((items) =>
            items.every((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item))
              ? true
              : 'All entries must be valid email addresses',
          ),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      itemsCount: 'items.length', // This resolves to a number or undefined
    },
    prepare({ title, media, itemsCount }: { title?: string; media?: any; itemsCount?: number }) {
      const count = itemsCount ?? 0; // Explicitly handle undefined with fallback
      return {
        title: title || 'Untitled Album',
        media,
        subtitle: `${count} item${count === 1 ? '' : 's'}`, // Simplified ternary for type safety
      };
    },
  },
});