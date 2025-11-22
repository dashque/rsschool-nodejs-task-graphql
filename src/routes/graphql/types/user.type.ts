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
import { normalizePreloadedRelation } from '../utils/utils.js';
import { UserParent } from './types.js';

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
        const normalized = normalizePreloadedRelation(
          parent.userSubscribedTo,
          'authorId',
        );
        if (normalized) return normalized;
        return loaders.userSubscribedToLoader.load(parent.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (parent: UserParent, _args, { loaders }) => {
        const normalized = normalizePreloadedRelation(
          parent.subscribedToUser,
          'subscriberId',
        );
        if (normalized) return normalized;
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
