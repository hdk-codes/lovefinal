import { defineField, defineType } from 'sanity'

export const userSchema = defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    defineField({
      name: 'username',
      title: 'Username',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    }),
    defineField({
      name: 'password',
      title: 'Password',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'fullName',
      title: 'Full Name',
      type: 'string'
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: {
        hotspot: true,
      }
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          {title: 'User', value: 'user'},
          {title: 'Admin', value: 'admin'}
        ]
      },
      initialValue: 'user'
    }),
    defineField({
      name: 'authToken',
      title: 'Auth Token',
      type: 'string'
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime'
    }),
    defineField({
      name: 'lastLogin',
      title: 'Last Login',
      type: 'datetime'
    })
  ],
  preview: {
    select: {
      title: 'username',
      subtitle: 'email'
    }
  }
})
