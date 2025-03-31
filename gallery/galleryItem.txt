import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'galleryItem',
  title: 'Gallery Item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'A memorable name for this cosmic moment.',
      validation: (Rule) => Rule.required().min(1).max(100),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A brief story or caption for this memory.',
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Keywords to categorize this memory (e.g., "date-night", "adventure").',
      options: {
        layout: 'tags',
      },
      validation: (Rule) => Rule.unique().max(10),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      description: 'When this memory was captured.',
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'file',
      description: 'Upload an image or video to cherish.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the media for accessibility.',
          validation: (Rule) => Rule.max(200),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      description: 'Specify if this is an image or video.',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      description: 'Optional thumbnail for videos or faster loading.',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'isFavorite',
      title: 'Favorite',
      type: 'boolean',
      description: 'Mark this as a favorite memory.',
      initialValue: false,
    }),
    defineField({
      name: 'reactions',
      title: 'Reactions',
      type: 'array',
      of: [
        defineField({
          type: 'object',
          name: 'reaction',
          fields: [
            defineField({ name: 'emoji', title: 'Emoji', type: 'string', validation: (Rule) => Rule.required().max(10) }),
            defineField({ name: 'count', title: 'Count', type: 'number', initialValue: 0, validation: (Rule) => Rule.min(0) }),
          ],
          preview: {
            select: { emoji: 'emoji', count: 'count' },
            prepare: ({ emoji, count }) => ({ title: `${emoji} (${count})` }),
          },
        }),
      ],
      description: 'User reactions like ❤️ or 😂.',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'geopoint',
      description: 'Where this memory took place (lat, lng).',
    }),
    defineField({
      name: 'loveNote',
      title: 'Love Note',
      type: 'text',
      description: 'A special message tied to this memory.',
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'views',
      title: 'View Count',
      type: 'number',
      description: 'Number of times this has been viewed.',
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Group this memory by type.',
      options: {
        list: [
          { title: 'Milestone', value: 'milestone' },
          { title: 'Everyday', value: 'everyday' },
          { title: 'Travel', value: 'travel' },
          { title: 'Surprise', value: 'surprise' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'sharedWith',
      title: 'Shared With',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Email addresses or user IDs who can view this.',
      options: {
        layout: 'tags',
      },
      validation: (Rule) => Rule.unique().max(50),
    }),
    defineField({
      name: 'isPrivate',
      title: 'Private',
      type: 'boolean',
      description: 'Hide this from public view.',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'thumbnail',
      subtitle: 'date',
    },
    prepare({ title, media, subtitle }) {
      return {
        title,
        media: media || undefined,
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString() : 'No date',
      };
    },
  },
});