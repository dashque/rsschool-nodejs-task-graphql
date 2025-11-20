import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  graphql,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';
import { MemberType, MemberTypeId } from './types/member.type.js';
import { changeUserInput, createUserInput, User } from './types/user.type.js';
import { createPostInput, Post } from './types/post.type.js';
import { changeProfileInput, createProfileInput, Profile } from './types/profile.type.js';
import { UUIDType } from './types/uuid.js';

let changePostInput;
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      memberTypes: {
        type: new GraphQLNonNull(new GraphQLList(MemberType)),
        resolve: async (source, _, ctx) => ctx.prisma.memberType.findMany(),
      },
      memberType: {
        type: MemberType,
        args: {
          id: { type: new GraphQLNonNull(MemberTypeId) },
        },
        resolve: async (source, { id }, ctx) =>
          ctx.prisma.memberType.findUnique({ where: { id } }),
      },
      users: {
        type: new GraphQLNonNull(new GraphQLList(User)),
        resolve: async (source, _, ctx) => ctx.prisma.user.findMany(),
      },
      user: {
        type: User,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (source, { id }, ctx) =>
          ctx.prisma.user.findUnique({ where: { id } }),
      },

      posts: {
        type: new GraphQLNonNull(new GraphQLList(Post)),
        resolve: async (source, _, ctx) => ctx.prisma.post.findMany(),
      },
      post: {
        type: Post,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (source, { id }, ctx) =>
          ctx.prisma.post.findUnique({ where: { id } }),
      },
      profiles: {
        type: new GraphQLNonNull(new GraphQLList(Profile)),
        resolve: async (source, _, ctx) => ctx.prisma.profile.findMany(),
      },
      profile: {
        type: Profile,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (source, { id }, ctx) =>
          ctx.prisma.profile.findUnique({ where: { id } }),
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutations',
    fields: () => ({
      createUser: {
        type: User,
        args: {
          dto: { type: new GraphQLNonNull(createUserInput) },
        },
        resolve: async (_, { dto }, ctx) => ctx.prisma.user.create({ data: dto }),
      },
      createProfile: {
        type: Profile,
        args: {
          dto: { type: new GraphQLNonNull(createProfileInput) },
        },
        resolve: async (_, { dto }, ctx) => ctx.prisma.profile.create({ data: dto }),
      },
      createPost: {
        type: Post,
        args: {
          dto: { type: new GraphQLNonNull(createPostInput) },
        },
        resolve: async (_, { dto }, ctx) => ctx.prisma.post.create({ data: dto }),
      },
      changePost: {
        type: Post,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(changePostInput) },
        },
        resolve: async (_, { id, dto }, ctx) =>
          ctx.prisma.post.update({ where: { id }, data: dto }),
      },
      changeProfile: {
        type: Profile,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(changeProfileInput) },
        },
        resolve: async (_, { id, dto }, ctx) =>
          ctx.prisma.profile.update({ where: id, data: dto }),
      },
      changeUser: {
        type: User,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(changeUserInput) },
        },
        resolve: async (_, { id, dto }, ctx) =>
          ctx.prisma.user.update({ where: id, data: dto }),
      },
      deleteUser: {},
      deletePost: {},
      deleteProfile: {},
      subscribeTo: {},
      unsubscribeFrom: {},
    }),
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
