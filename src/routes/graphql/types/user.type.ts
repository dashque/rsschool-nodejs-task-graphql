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

export const User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: Profile,
      resolve: async ({ id }, _, { loaders }) => {
        return loaders.profileByUserIdLoader.load(id);
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: async ({ id }, _, { loaders }) => {
        return loaders.userPostsLoader.load(id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (parent, _, { loaders }) => {
        // Reuse preloaded relation from Root.users include if available
        const pre = (parent as any).userSubscribedTo;
        if (Array.isArray(pre)) {
          if (pre.length === 0) return pre;
          const first = pre[0] as any;
          // If already Users
          if (typeof first?.id === 'string' && !('authorId' in first)) {
            return pre;
          }
          // If join rows (SubscribersOnAuthors), map to minimal User stubs
          if (typeof first?.authorId === 'string') {
            return pre.map((r: any) => ({ id: r.authorId }));
          }
          return pre;
        }
        return loaders.userSubscribedToLoader.load((parent as any).id);
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (parent, _, { loaders }) => {
        const pre = (parent as any).subscribedToUser;
        if (Array.isArray(pre)) {
          if (pre.length === 0) return pre;
          const first = pre[0] as any;
          if (typeof first?.id === 'string' && !('subscriberId' in first)) {
            return pre;
          }
          if (typeof first?.subscriberId === 'string') {
            return pre.map((r: any) => ({ id: r.subscriberId }));
          }
          return pre;
        }
        return loaders.userSubscribersLoader.load((parent as any).id);
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
