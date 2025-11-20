import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { MemberType, MemberTypeId } from './member.type.js';
import { User } from './user.type.js';
import { UUIDType } from './uuid.js';
import { Post } from './post.type.js';
import { Profile } from './profile.type.js';

export const Root = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(MemberType)),
      resolve: async (_, __, { prisma }) => prisma.memberType.findMany(),
    },
    memberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeId) },
      },
      resolve: async (_, { id }, { prisma }) =>
        prisma.memberType.findUnique({ where: { id } }),
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(User)),
      resolve: async (_, __, { prisma }) => prisma.user.findMany(),
    },
    user: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }, { prisma }) => prisma.user.findUnique({ where: { id } }),
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(Post)),
      resolve: async (_, __, { prisma }) => prisma.post.findMany(),
    },
    post: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }, { prisma }) => prisma.post.findUnique({ where: { id } }),
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(Profile)),
      resolve: async (_, __, { prisma }) => prisma.profile.findMany(),
    },
    profile: {
      type: Profile,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }, { prisma }) =>
        prisma.profile.findUnique({ where: { id } }),
    },
  },
});
