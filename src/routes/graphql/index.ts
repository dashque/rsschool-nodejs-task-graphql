import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  graphql,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';
import { MemberType } from './types/member.type.js';
import { User } from './types/user.type.js';
import { Post } from './types/post.type.js';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      memberTypes: {
        type: new GraphQLNonNull(new GraphQLList(MemberType)),
        resolve: async (source, _, ctx) => ctx.prisma.memberType.findMany(),
      },
      users: {
        type: new GraphQLNonNull(new GraphQLList(User)),
        resolve: async (source, _, ctx) => ctx.prisma.user.findMany(),
      },
      posts: {
        type: new GraphQLNonNull(new GraphQLList(Post)),
        resolve: async (source, _, ctx) => ctx.prisma.post.findMany(),
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
