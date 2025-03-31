import { defineField, defineType } from "sanity";

export const landingSchema = defineType({
  name: 'landing',
  title: 'Landing Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string'
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text'
    }),
    defineField({
      name: 'backgroundEffect',
      title: 'Background Effect',
      type: 'string',
      options: {
        list: [
          { title: 'Hearts', value: 'hearts' },
          { title: 'Petals', value: 'petals' },
          { title: 'Stars', value: 'stars' },
          { title: 'None', value: 'none' }
        ]
      }
    })
  ]
})


// import { defineField, defineType } from "sanity";

// Add custom audio type definition
// export const audioType = defineType({
//   name: 'audioMessage',
//   title: 'Audio Message',
//   type: 'object', // Changed from 'file' to 'object'
//   fields: [
//     defineField({
//       name: 'title',
//       title: 'Title',
//       type: 'string',
//       validation: (Rule) => Rule.required()
//     }),
//     defineField({
//       name: 'audioFile',
//       title: 'Audio File',
//       type: 'file',
//       options: {
//         storeOriginalFilename: true,
//         accept: 'audio/*'
//       },
//       validation: (Rule) => Rule.required()
//     }),
//     defineField({
//       name: 'caption',
//       title: 'Caption',
//       type: 'string'
//     }),
//     defineField({
//       name: 'description',
//       title: 'Description',
//       type: 'text'
//     }),
//     defineField({
//       name: 'duration',
//       title: 'Duration (seconds)',
//       type: 'number',
//       validation: (Rule) => Rule.min(0)
//     })
//   ],
//   preview: {
//     select: {
//       title: 'title',
//       subtitle: 'caption',
//       media: 'audioFile'
//     }
//   }
// });


export const birthdayCardSchema = defineType({
  name: "birthdayCard",
  title: "Birthday Card",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Card Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "messages",
      title: "Messages",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "text",
              title: "Message Text",
              type: "text",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "style",
              title: "Text Style",
              type: "object",
              fields: [
                {
                  name: "font",
                  title: "Font",
                  type: "string",
                  options: {
                    list: [
                      { title: 'Dancing Script', value: 'Dancing Script' },
                      { title: 'Lobster', value: 'Lobster' },
                      { title: 'Pacifico', value: 'Pacifico' },
                      { title: 'Arial', value: 'Arial' },
                      { title: 'Montserrat', value: 'Montserrat' },
                      { title: 'Playfair Display', value: 'Playfair Display' },
                    ]
                  },
                },
                {
                  name: "color",
                  title: "Color",
                  type: "string",
                  options: {
                    list: [
                      { title: 'Red', value: '#FF6F61' },
                      { title: 'Pink', value: '#FFB6C1' },
                      { title: 'Yellow', value: '#FFD700' },
                      { title: 'Lavender', value: '#E6E6FA' },
                      { title: 'Purple', value: '#9370DB' },
                      { title: 'Teal', value: '#20B2AA' },
                    ]
                  },
                },
                {
                  name: "size",
                  title: "Size",
                  type: "number",
                  options: {
                    range: {
                      min: 12,
                      max: 36,
                      step: 1,
                    }
                  }
                },
              ],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
          options: {
            hotspot: true, // Enable hotspot for better image cropping
          },
        },
      ],
    }),
    defineField({
      name: "background",
      title: "Background",
      type: "string",
      description: "URL for image or hex code for color",
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: 'block' }],
      description: "Main content of the card (optional)",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      readOnly: true,
    }),
  ],
});

// schemas/loveLetter.ts


// Define the letterResponse type
// schemas/loveLetter.ts


// Define the letterResponse type
export const letterResponseType = defineType({
  name: 'letterResponse',
  title: 'Letter Response',
  type: 'object',
  fields: [
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      options: {
        list: [
          { title: 'Me', value: 'me' },
          { title: 'Partner', value: 'partner' },
        ],
      },
      validation: (Rule) => Rule.required().error('Author is required'),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Love Quote', value: 'loveQuote' },
            { title: 'Memory', value: 'memory' },
            { title: 'Poetry', value: 'poetry' },
            { title: 'Song Lyrics', value: 'lyrics' },
          ],
          marks: {
            decorators: [
              { title: 'Heart', value: 'heart' },
              { title: 'Sparkle', value: 'sparkle' },
              { title: 'Kiss', value: 'kiss' },
              { title: 'Highlight', value: 'highlight' },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
        },
        {
          type: 'file', // Use 'file' for audioMessage to match your data
          title: 'Audio Message',
          options: {
            accept: 'audio/*', // Restrict to audio files
          },
        },
      ],
      validation: (Rule) => Rule.required().error('Content is required'),
    }),
    defineField({
      name: 'mood',
      title: 'Mood',
      type: 'string',
      options: {
        list: [
          { title: 'Romantic', value: 'romantic' },
          { title: 'Playful', value: 'playful' },
          { title: 'Nostalgic', value: 'nostalgic' },
          { title: 'Passionate', value: 'passionate' },
        ],
      },
    }),
    defineField({
      name: 'attachments',
      title: 'Attachments',
      type: 'array',
      of: [
        {
          type: 'file',
          title: 'File',
        },
        {
          type: 'image',
          title: 'Image',
        },
        {
          type: 'object',
          name: 'songLink',
          title: 'Song Link',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'reactions',
      title: 'Reactions',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'reaction',
          title: 'Reaction',
          fields: [
            defineField({
              name: 'emoji',
              title: 'Emoji',
              type: 'string',
            }),
            defineField({
              name: 'timestamp',
              title: 'Timestamp',
              type: 'datetime',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
      },
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      author: 'author',
      content: 'content.0.children.0.text',
      createdAt: 'createdAt',
    },
    prepare({ author, content, createdAt }) {
      return {
        title: `${author}: ${content?.slice(0, 20) || 'New response'}...`,
        subtitle: createdAt ? new Date(createdAt).toLocaleDateString() : 'No date',
      };
    },
  },
});

// Define the loveLetter schema
export const loveLetterSchema = defineType({
  name: 'loveLetter',
  title: 'Love Letter',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Love Quote', value: 'loveQuote' },
            { title: 'Memory', value: 'memory' },
            { title: 'Poetry', value: 'poetry' },
            { title: 'Song Lyrics', value: 'lyrics' }
          ],
          marks: {
            decorators: [
              { title: 'Heart', value: 'heart' },
              { title: 'Sparkle', value: 'sparkle' },
              { title: 'Kiss', value: 'kiss' },
              { title: 'Highlight', value: 'highlight' }
            ]
          }
        },
        { type: 'image', options: { hotspot: true } }
      ]
    }),
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'object',
      fields: [
        defineField({
          name: 'primaryColor',
          title: 'Primary Color',
          type: 'string',
        }),
        defineField({
          name: 'fontFamily',
          title: 'Font Family',
          type: 'string',
        }),
        defineField({
          name: 'animation',
          title: 'Animation',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'effects',
      title: 'Special Effects',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Floating Hearts', value: 'hearts' },
          { title: 'Sparkles', value: 'sparkles' },
          { title: 'Glowing Text', value: 'glow' }
        ]
      }
    }),
    defineField({
      name: 'letters',
      title: 'Letters Exchange',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'author',
            type: 'string',
            options: { list: ['me', 'partner'] }
          },
          {
            name: 'content',
            type: 'array',
            of: [
              {
                type: 'block',
                styles: [
                  { title: 'Normal', value: 'normal' },
                  { title: 'Love Quote', value: 'loveQuote' },
                  { title: 'Memory', value: 'memory' }
                ]
              },
              { type: 'image' },
              { type: 'reference', to: [{ type: 'audioMessage' }] }
            ]
          },
          {
            name: 'mood',
            type: 'string',
            options: {
              list: [
                'romantic',
                'playful',
                'nostalgic',
                'passionate'
              ]
            }
          },
          {
            name: 'reactions',
            type: 'array',
            of: [{
              type: 'object',
              fields: [
                { name: 'emoji', type: 'string' },
                { name: 'timestamp', type: 'datetime' }
              ]
            }]
          },
          { name: 'createdAt', type: 'datetime' }
        ]
      }]
    }),
    defineField({
      name: 'audioMessages',
      title: 'Audio Messages',
      type: 'array',
      of: [{
        type: 'audioMessage',
        title: 'Audio Message',
        options: {
          accept: 'audio/*',
        },
      }],
      description: 'Audio messages attached to this love letter',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{
        type: 'image',
        options: { hotspot: true },
        fields: [
          defineField({
            name: 'filters',
            title: 'Filters',
            type: 'object',
            fields: [
              defineField({
                name: 'brightness',
                title: 'Brightness',
                type: 'number',
                validation: (Rule) => Rule.min(0).max(100),
              }),
              defineField({
                name: 'contrast',
                title: 'Contrast',
                type: 'number',
                validation: (Rule) => Rule.min(0).max(100),
              }),
              defineField({
                name: 'saturation',
                title: 'Saturation',
                type: 'number',
                validation: (Rule) => Rule.min(0).max(100),
              }),
            ],
          }),
        ],
      }],
      description: 'Images attached to this love letter',
    }),
    defineField({
      name: 'animations',
      title: 'Animations',
      type: 'object',
      fields: [
        defineField({
          name: 'openingEffect',
          title: 'Opening Effect',
          type: 'string',
          options: {
            list: [
              { title: 'Fold', value: 'fold' },
              { title: 'Fade', value: 'fade' },
              { title: 'Butterfly', value: 'butterfly' },
              { title: 'Hearts', value: 'hearts' },
            ],
          },
        }),
        defineField({
          name: 'backgroundEffect',
          title: 'Background Effect',
          type: 'string',
          options: {
            list: [
              { title: 'Particles', value: 'particles' },
              { title: 'Petals', value: 'petals' },
              { title: 'Stars', value: 'stars' },
              { title: 'None', value: 'none' },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'privacy',
      title: 'Privacy Settings',
      type: 'object',
      fields: [
        defineField({
          name: 'isPrivate',
          title: 'Private Letter',
          type: 'boolean',
          description: 'Only visible to sender and recipient',
        }),
        defineField({
          name: 'password',
          title: 'Access Password',
          type: 'string',
          hidden: ({ parent }) => !parent?.isPrivate,
        }),
      ],
    }),
    defineField({
      name: 'scheduling',
      title: 'Letter Scheduling',
      type: 'object',
      fields: [
        defineField({
          name: 'deliveryDate',
          title: 'Scheduled Delivery',
          type: 'datetime',
          options: {
            dateFormat: 'YYYY-MM-DD',
            timeFormat: 'HH:mm',
            timeStep: 15,
          },
        }),
        defineField({
          name: 'reminder',
          title: 'Send Reminder',
          type: 'boolean',
        }),
      ],
    }),
    defineField({
      name: 'sharedMemories',
      title: 'Shared Memories',
      type: 'array',
      of: [{
        type: 'object',
        name: 'memory',
        title: 'Memory',
        fields: [
          defineField({
            name: 'date',
            title: 'Date',
            type: 'date',
          }),
          defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
          }),
          defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
          }),
          defineField({
            name: 'location',
            title: 'Location',
            type: 'geopoint',
          }),
          defineField({
            name: 'images',
            title: 'Images',
            type: 'array',
            of: [{ type: 'image' }],
          }),
        ],
      }],
    }),
    defineField({
      name: 'createdAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    })
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'mainImage'
    }
  }
})

export const audioMessageSchema = defineType({
  name: "audioMessage",
  title: "Audio Message",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "audioFile",
      title: "Audio File",
      type: "file",
      options: {
        accept: "audio/*"
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string"
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text"
    }),
    defineField({
      name: "mood",
      title: "Mood",
      type: "string",
      options: {
        list: [
          { title: "Romantic", value: "romantic" },
          { title: "Happy", value: "happy" },
          { title: "Reflective", value: "reflective" },
          { title: "Playful", value: "playful" },
          { title: "Missing You", value: "missingYou" }
        ]
      }
    }),
    defineField({
      name: "duration",
      title: "Duration (seconds)",
      type: "number"
    }),
    defineField({
      name: "isPrivate",
      title: "Private Message",
      type: "boolean",
      initialValue: false
    }),
    defineField({
      name: "backgroundMusic",
      title: "Background Music",
      type: "file",
      options: {
        accept: "audio/*"
      }
    }),
    defineField({
      name: "visualizer",
      title: "Audio Visualizer Style",
      type: "string",
      options: {
        list: [
          { title: "Wave", value: "wave" },
          { title: "Bars", value: "bars" },
          { title: "Circle", value: "circle" },
          { title: "Heart", value: "heart" },
          { title: "None", value: "none" }
        ]
      },
      initialValue: "wave"
    }),
    defineField({
      name: "scheduledFor",
      title: "Scheduled Delivery",
      type: "datetime",
      description: "When this audio message should be delivered"
    }),
    defineField({
      name: "transcript",
      title: "Transcript",
      type: "text",
      description: "Text transcript of the audio message"
    }),
    defineField({
      name: "reactions",
      title: "Reactions",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "emoji", type: "string", title: "Emoji" },
            { name: "count", type: "number", title: "Count", initialValue: 1 }
          ]
        }
      ]
    }),
    defineField({
      name: "background",
      title: "Message Background",
      type: "object",
      fields: [
        { name: "color", type: "string", title: "Color" },
        { name: "imageUrl", type: "url", title: "Image URL" },
        { name: "style", type: "string", title: "Style" }
      ]
    })
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description"
    }
  }
});