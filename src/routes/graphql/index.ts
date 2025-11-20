import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  graphql,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { MemberType, MemberTypeId } from './types/member.type.js';
import { changeUserInput, createUserInput, User } from './types/user.type.js';
import { changePostInput, createPostInput, Post } from './types/post.type.js';
import { changeProfileInput, createProfileInput, Profile } from './types/profile.type.js';
import { UUIDType } from './types/uuid.js';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      memberTypes: {
        type: new GraphQLNonNull(new GraphQLList(MemberType)),
        resolve: async (source, _, { prisma }) => prisma.memberType.findMany(),
      },
      memberType: {
        type: MemberType,
        args: {
          id: { type: new GraphQLNonNull(MemberTypeId) },
        },
        resolve: async (source, { id }, { prisma }) =>
          prisma.memberType.findUnique({ where: { id } }),
      },
      users: {
        type: new GraphQLNonNull(new GraphQLList(User)),
        resolve: async (source, _, { prisma }) => prisma.user.findMany(),
      },
      user: {
        type: User,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (source, { id }, { prisma }) =>
          prisma.user.findUnique({ where: { id } }),
      },
      posts: {
        type: new GraphQLNonNull(new GraphQLList(Post)),
        resolve: async (source, _, { prisma }) => prisma.post.findMany(),
      },
      post: {
        type: Post,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (source, { id }, { prisma }) =>
          prisma.post.findUnique({ where: { id } }),
      },
      profiles: {
        type: new GraphQLNonNull(new GraphQLList(Profile)),
        resolve: async (source, _, { prisma }) => prisma.profile.findMany(),
      },
      profile: {
        type: Profile,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (source, { id }, { prisma }) =>
          prisma.profile.findUnique({ where: { id } }),
      },
    },
  }),
  mutation: new GraphQLObjectType({
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
        resolve: async (_, { userId, authorId }, { prisma }) =>
          prisma.subscribersOnAuthors.create({
            data: { subscriberId: userId, authorId },
          }),
      },
      unsubscribeFrom: {
        type: GraphQLString,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { userId, authorId }, { prisma }) =>
          prisma.subscribersOnAuthors.delete({
            where: { subscriberId_authorId: { subscriberId: userId, authorId } },
          }),
      },
    },
  }),
});

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      return graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: { prisma },
        // validationRules: [depthLimit(5)],
      });
    },
  });
};

export default plugin;
