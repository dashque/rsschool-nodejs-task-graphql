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
      resolve: async (parent, _, ctx) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: parent.id },
          include: { profile: true },
        });

        return user?.profile || null;
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(Post)),
      resolve: async (parent, _, ctx) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: parent.id },
          include: { posts: true },
        });
        return user?.posts || [];
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(User)),
      resolve: async (parent, _, ctx) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: parent.id },
          include: { userSubscribedTo: true },
        });

        return user?.userSubscribedTo || [];
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(User)),
      resolve: async (parent, _, ctx) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: parent.id },
          include: { subscribedToUser: true },
        });

        return user?.subscribedToUser || [];
      },
    },
  }),
});
