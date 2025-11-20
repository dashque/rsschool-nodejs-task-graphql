import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql/index.js';
import { UUIDType } from './uuid.js';
import { MemberType } from './member.type.js';

export const Profile = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: {
      type: new GraphQLNonNull(MemberType),
      resolve: async (parent, _, ctx) => {
        const profile = await ctx.prisma.profile.findUnique({
          where: { id: parent.id },
          include: { memberType: true },
        });

        return profile?.memberType;
      },
    },
  }),
});
