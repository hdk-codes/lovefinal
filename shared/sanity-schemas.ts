import { defineField, defineType } from "sanity";

// Album schema
export const albumSchema = defineType({
  name: "album",
  title: "Photo Album",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text"
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "items",
      title: "Gallery Items",
      type: "array",
      of: [{ type: "reference", to: [{ type: "galleryItem" }] }]
    }),
    defineField({
      name: "isPrivate",
      title: "Private Album",
      type: "boolean",
      initialValue: false
    }),
    defineField({
      name: "sharedWith",
      title: "Shared With",
      type: "array",
      of: [{ type: "string" }],
      hidden: ({ parent }) => !parent?.isPrivate
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [
        { 
          type: "string",
          options: {
            list: [
              { title: "Vacation", value: "vacation" },
              { title: "Date Night", value: "dateNight" },
              { title: "Anniversary", value: "anniversary" },
              { title: "First Meeting", value: "firstMeeting" },
              { title: "Holidays", value: "holidays" },
              { title: "Special Moments", value: "specialMoments" }
            ]
          }
        }
      ]
    }),
    defineField({
      name: "dateRange",
      title: "Date Range",
      type: "object",
      fields: [
        { name: "from", type: "date", title: "From" },
        { name: "to", type: "date", title: "To" }
      ]
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "geopoint"
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }]
    }),
    defineField({
      name: "theme",
      title: "Album Theme",
      type: "object",
      fields: [
        { 
          name: "color",
          title: "Theme Color",
          type: "string",
          options: {
            list: [
              { title: "Romantic Red", value: "#FF6B6B" },
              { title: "Passionate Pink", value: "#FF85A2" },
              { title: "Dreamy Lavender", value: "#C5A3FF" },
              { title: "Ocean Blue", value: "#45B3E0" },
              { title: "Forest Green", value: "#4CAF50" },
              { title: "Sunset Orange", value: "#FF9966" }
            ]
          }
        },
        { name: "font", title: "Font Family", type: "string" },
        { name: "layout", title: "Layout Style", type: "string" }
      ]
    })
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage"
    }
  }
});

// Gallery Item schema
export const galleryItemSchema = defineType({
  name: "galleryItem",
  title: "Gallery Item",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text"
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "datetime",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "media",
      title: "Media",
      type: "image",
      options: {
        hotspot: true
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: "mediaType",
      title: "Media Type",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" }
        ]
      },
      initialValue: "image"
    }),
    defineField({
      name: "isFavorite",
      title: "Favorite",
      type: "boolean",
      initialValue: false
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
      name: "location",
      title: "Location",
      type: "object",
      fields: [
        { name: "lat", type: "number", title: "Latitude" },
        { name: "lng", type: "number", title: "Longitude" }
      ]
    }),
    defineField({
      name: "loveNote",
      title: "Love Note",
      type: "text",
      description: "A special note attached to this memory"
    }),
    defineField({
      name: "views",
      title: "View Count",
      type: "number",
      initialValue: 0,
      readOnly: true
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Milestone", value: "milestone" },
          { title: "Everyday", value: "everyday" },
          { title: "Travel", value: "travel" },
          { title: "Surprise", value: "surprise" }
        ]
      }
    }),
    defineField({
      name: "isPrivate",
      title: "Private Item",
      type: "boolean",
      initialValue: false
    }),
    defineField({
      name: "sharedWith",
      title: "Shared With",
      type: "array",
      of: [{ type: "string" }],
      hidden: ({ parent }) => !parent?.isPrivate
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }]
    }),
    defineField({
      name: "album",
      title: "Album",
      type: "reference",
      to: [{ type: "album" }]
    }),
    defineField({
      name: "effects",
      title: "Visual Effects",
      type: "array",
      of: [
        { 
          type: "string",
          options: {
            list: [
              { title: "Heart Frame", value: "heartFrame" },
              { title: "Soft Glow", value: "softGlow" },
              { title: "Vintage Filter", value: "vintageFilter" },
              { title: "Polaroid Style", value: "polaroid" },
              { title: "Floating Hearts", value: "floatingHearts" }
            ]
          }
        }
      ]
    }),
    defineField({
      name: "annotations",
      title: "Annotations",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "text", type: "string", title: "Text" },
            { name: "positionX", type: "number", title: "X Position (%)" },
            { name: "positionY", type: "number", title: "Y Position (%)" },
            { name: "style", type: "string", title: "Style" }
          ]
        }
      ]
    })
  ],
  preview: {
    select: {
      title: "title",
      media: "media"
    }
  }
});

// Audio Message schema
export const snapSchema = defineType({
  name: "snap",
  title: "Snap",
  type: "document",
  fields: [
    defineField({
      name: "sender",
      title: "Sender",
      type: "reference",
      to: [{ type: "user" }],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "media",
      title: "Media",
      type: "image",
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "number",
      validation: (Rule) => Rule.min(1).max(10)
    }),
    defineField({
      name: "expiresAt",
      title: "Expires At",
      type: "datetime"
    }),
    defineField({
      name: "viewed",
      title: "Viewed",
      type: "boolean",
      initialValue: false
    })
  ]
});

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