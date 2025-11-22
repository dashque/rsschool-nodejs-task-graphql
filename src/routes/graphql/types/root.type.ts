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
        // Detect whether userSubscribedTo or subscribedToUser are requested
        const parsed: any = parseResolveInfo(info);
        let needsSubs = false;
        try {
          // parsed.fieldsByTypeName.RootQueryType.users.fieldsByTypeName.User
          const userSelections = parsed?.fieldsByTypeName?.RootQueryType?.users?.fieldsByTypeName?.User;
          needsSubs = Boolean(
            userSelections?.userSubscribedTo || userSelections?.subscribedToUser,
          );
        } catch {
          needsSubs = false;
        }

        const users = await prisma.user.findMany(
          needsSubs
            ? {
                include: {
                  userSubscribedTo: { include: { author: true } },
                  subscribedToUser: { include: { subscriber: true } },
                },
              }
            : undefined,
        );

        // Prime base user cache
        for (const u of users) {
          loaders.userLoader.clear(u.id).prime(u.id, u);
        }

        if (needsSubs) {
          for (const u of users) {
            const authors = (u as any).userSubscribedTo?.map((x: any) => x.author) ?? [];
            const subscribers = (u as any).subscribedToUser?.map((x: any) => x.subscriber) ?? [];
            loaders.userSubscribedToLoader.clear(u.id).prime(u.id, authors);
            loaders.userSubscribersLoader.clear(u.id).prime(u.id, subscribers);
          }
        }

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
