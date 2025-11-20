import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { changeUserInput, createUserInput, User } from './user.type.js';
import { changeProfileInput, createProfileInput, Profile } from './profile.type.js';
import { changePostInput, createPostInput, Post } from './post.type.js';
import { UUIDType } from './uuid.js';

export const Mutation = new GraphQLObjectType({
  name: 'Mutations',
  fields: {
    createUser: {
      type: User,
      args: {
        dto: { type: new GraphQLNonNull(createUserInput) },
      },
      resolve: async (_, { dto }, { prisma }) => prisma.user.create({ data: dto }),
    },
    createProfile: {
      type: Profile,
      args: {
        dto: { type: new GraphQLNonNull(createProfileInput) },
      },
      resolve: async (_, { dto }, { prisma }) => prisma.profile.create({ data: dto }),
    },
    createPost: {
      type: Post,
      args: {
        dto: { type: new GraphQLNonNull(createPostInput) },
      },
      resolve: async (_, { dto }, { prisma }) => prisma.post.create({ data: dto }),
    },
    changePost: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(changePostInput) },
      },
      resolve: async (_, { id, dto }, { prisma }) =>
        prisma.post.update({ where: { id }, data: dto }),
    },
    changeProfile: {
      type: Profile,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(changeProfileInput) },
      },
      resolve: async (_, { id, dto }, { prisma }) =>
        prisma.profile.update({ where: { id }, data: dto }),
    },
    changeUser: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(changeUserInput) },
      },
      resolve: async (_, { id, dto }, { prisma }) =>
        prisma.user.update({ where: { id }, data: dto }),
    },
    deleteUser: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }, { prisma }) => {
        await prisma.user.delete({ where: { id } });
        return 'User deleted successfully';
      },
    },
    deletePost: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }, { prisma }) => {
        await prisma.post.delete({ where: { id } });
        return 'Post deleted successfully';
      },
    },
    deleteProfile: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }, { prisma }) => {
        await prisma.profile.delete({ where: { id } });
        return 'Profile deleted successfully';
      },
    },
    subscribeTo: {
      type: GraphQLString,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { userId, authorId }, { prisma }) => {
        await prisma.subscribersOnAuthors.create({
          data: { subscriberId: userId, authorId },
        });
        return 'Subscribed successfully';
      },
    },
    unsubscribeFrom: {
      type: GraphQLString,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { userId, authorId }, { prisma }) => {
        await prisma.subscribersOnAuthors.delete({
          where: { subscriberId_authorId: { subscriberId: userId, authorId } },
        });
        return 'Unsubscribed successfully';
      },
    },
  },
});
