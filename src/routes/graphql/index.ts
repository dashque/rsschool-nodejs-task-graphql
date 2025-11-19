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
import { User } from './types/user.type.js';
import { Post } from './types/post.type.js';
import { Profile } from './types/profile.type.js';
import { UUIDType } from './types/uuid.js';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      memberTypes: {
        type: new GraphQLNonNull(new GraphQLList(MemberType)),
        resolve: async (source, _, ctx) => ctx.prisma.memberType.findMany(),
      },
      memberType: {
        type: new GraphQLNonNull(MemberType),
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
        type: new GraphQLNonNull(User),
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
        type: new GraphQLNonNull(Post),
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
        type: new GraphQLNonNull(Profile),
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (source, { id }, ctx) =>
          ctx.prisma.profile.findUnique({ where: { id } }),
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
      });
    },
  });
};

export default plugin;
