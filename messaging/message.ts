import { defineField, defineType } from "sanity";

// Define your schema types
const user = defineType({
  name: "user",
  title: "User",
  type: "document",
  fields: [
    defineField({
      name: "username",
      title: "Username",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "avatar",
      title: "Avatar",
      type: "image",
    }),
  ],
});

const media = defineType({
  name: "media",
  title: "Media",
  type: "document",
  fields: [
    defineField({
      name: "file",
      title: "File",
      type: "file",
    }),
    defineField({
      name: "uploadedBy",
      title: "Uploaded By",
      type: "reference",
      to: [{ type: "user" }],
    }),
    defineField({
      name: "timestamp",
      title: "Timestamp",
      type: "datetime",
    }),
  ],
});

// Export all schema types as an array
export default [user, media];