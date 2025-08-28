import { GraphQLError } from 'graphql'
import jwt from 'jsonwebtoken'
import Book from './models/book.js'
import Author from './models/author.js'
import User from './models/user.js'
import { PubSub } from 'graphql-subscriptions'

const pubSub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => await Book.countDocuments(),
    authorCount: async () => await Author.countDocuments(),
    allBooks: async (root, args) => {
      let result = await Book.find({}).populate('author')

      if (args.author) {
        result = result.filter(b => b.author.name === args.author)
      }
      if (args.genre) {
        result = result.filter(b => b.genres.includes(args.genre))
      }

      return result
    },
    allAuthors: async () => Author.find({}),
    allGenres: async () => {
      const books = await Book.find({})
      const genres = books.flatMap(b => b.genres)

      return [...new Set(genres)]
    },
    me: (root, args, context) => {
      return context.currentUser
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      let author = await Author.findOne({ name: args.author })
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      if (!author) {
        author = new Author({ name: args.author })
        await author.save()
      }

      const book = new Book({ ...args, author: author.id })

      let savedBook
      try {
        savedBook = await book.save()
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error,
          },
        })
      }

      await savedBook.populate('author')
      pubSub.publish('BOOK_ADDED', { bookAdded: savedBook })

      return savedBook
    },
    addAuthor: async (root, args) => {
      const author = new Author({ ...args })

      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        })
      }

      return author
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      const author = await Author.findOne({ name: args.name })
      if (!author) {
        throw new GraphQLError('Changing birthyear failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
          },
        })
      }
      const updatedAuthor = await Author.findOneAndUpdate(
        { name: args.name },
        { born: args.setBornTo },
        { new: true, runValidators: true }
      )
      return updatedAuthor
    },
    createUser: async (root, args) => {
      const user = new User({ ...args })

      return user.save().catch(error => {
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error,
          },
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('Wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },
  Author: {
    bookCount: async root => {
      const booksByAuthor = await Book.find({ author: root.id })
      return booksByAuthor.length
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubSub.asyncIterableIterator('BOOK_ADDED'),
    },
  },
}

export default resolvers
