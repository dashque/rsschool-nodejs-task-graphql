export type UsersInclude = Partial<Record<'userSubscribedTo' | 'subscribedToUser', true>>;
export type MinimalUser = { id: string };
type UserSubscribedToJoin = { authorId: string };
type UserSubscribersJoin = { subscriberId: string };
export type UserParent = MinimalUser & {
  userSubscribedTo?: readonly (MinimalUser | UserSubscribedToJoin)[];
  subscribedToUser?: readonly (MinimalUser | UserSubscribersJoin)[];
};
