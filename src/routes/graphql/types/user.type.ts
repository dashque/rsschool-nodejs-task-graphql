import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { Post } from './post.type.js';
import { Profile } from './profile.type.js';

export const User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: Profile,
      resolve: async (source, _, ctx) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: source.id },
          include: { profile: true },
        });

        return user?.profile || null;
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(Post)),
      resolve: async (source, _, ctx) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: source.id },
          include: { posts: true },
        });
        return user?.posts || [];
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (source, _, ctx) => {
        const subscriptions = await ctx.prisma.subscribersOnAuthors.findMany({
          where: { subscriberId: source.id },
          include: { author: true },
        });
        return subscriptions.map((sub) => sub.author);
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (source, _, ctx) => {
        const subscribers = await ctx.prisma.subscribersOnAuthors.findMany({
          where: { authorId: source.id },
          include: { subscriber: true },
        });
        return subscribers.map((sub) => sub.subscriber);
      },
    },
  }),
});

export const changeUserInput = new GraphQLObjectType({
  name: 'ChangeUserInput',
  fields: () => ({ name: { type: GraphQLString }, balance: { type: GraphQLFloat } }),
});

export const createUserInput = new GraphQLObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});
