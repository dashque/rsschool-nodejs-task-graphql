import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';
import { MemberType, MemberTypeId } from './member.type.js';
import { User } from './user.type.js';
import { UUIDType } from './uuid.js';
import { Post } from './post.type.js';
import { Profile } from './profile.type.js';

export const Root = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
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
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (_, __, { prisma, loaders }, info) => {
        // Prefer direct AST inspection for reliability in tests
        const node = info.fieldNodes?.[0];
        const selections = (node && node.selectionSet && node.selectionSet.selections) || [];
        const names = new Set(
          selections
            .filter((s: any) => s.kind === 'Field' && s.name && s.name.value)
            .map((s: any) => s.name.value),
        );
        const wantsUserSubscribedTo = names.has('userSubscribedTo');
        const wantsSubscribedToUser = names.has('subscribedToUser');

        const include: any = {};
        if (wantsUserSubscribedTo) include.userSubscribedTo = true;
        if (wantsSubscribedToUser) include.subscribedToUser = true;

        const users = await prisma.user.findMany({
          include: Object.keys(include).length ? include : undefined,
        });

        for (const u of users) {
          loaders.userLoader.clear(u.id).prime(u.id, u);
        }

        // Do not prime relation loaders here; field resolvers will reuse the preloaded arrays
        return users;
      },
    },
    user: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }, { prisma }) => prisma.user.findUnique({ where: { id } }),
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
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
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
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
