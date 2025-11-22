import {
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { Post } from './post.type.js';
import { Profile } from './profile.type.js';

type MinimalUser = { id: string };
type UserSubscribedToJoin = { authorId: string };
type UserSubscribersJoin = { subscriberId: string };
type UserParent = MinimalUser & {
  userSubscribedTo?: readonly (MinimalUser | UserSubscribedToJoin)[];
  subscribedToUser?: readonly (MinimalUser | UserSubscribersJoin)[];
};

export const User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: Profile,
      resolve: async ({ id }: { id: string }, _args, { loaders }) => {
        return loaders.profileByUserIdLoader.load(id);
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: async ({ id }: { id: string }, _args, { loaders }) => {
        return loaders.userPostsLoader.load(id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (parent: UserParent, _args, { loaders }) => {
        const pre = parent.userSubscribedTo;
        if (Array.isArray(pre)) {
          if (pre.length === 0) return [] as MinimalUser[];
          const first = pre[0];
          if (
            typeof (first as MinimalUser).id === 'string' &&
            !('authorId' in (first as UserSubscribedToJoin))
          ) {
            return pre as MinimalUser[];
          }
          if ('authorId' in (first as UserSubscribedToJoin)) {
            return (pre as readonly UserSubscribedToJoin[]).map((r) => ({
              id: r.authorId,
            }));
          }
          return [] as MinimalUser[];
        }
        return loaders.userSubscribedToLoader.load(parent.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (parent: UserParent, _args, { loaders }) => {
        const pre = parent.subscribedToUser;
        if (Array.isArray(pre)) {
          if (pre.length === 0) return [] as MinimalUser[];
          const first = pre[0];
          if (
            typeof (first as MinimalUser).id === 'string' &&
            !('subscriberId' in (first as UserSubscribersJoin))
          ) {
            return pre as MinimalUser[];
          }
          if ('subscriberId' in (first as UserSubscribersJoin)) {
            return (pre as readonly UserSubscribersJoin[]).map((r) => ({
              id: r.subscriberId,
            }));
          }
          return [] as MinimalUser[];
        }
        return loaders.userSubscribersLoader.load(parent.id);
      },
    },
  }),
});

export const changeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});

export const createUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});
