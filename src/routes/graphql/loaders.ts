import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

export const createLoaders = (prisma: PrismaClient) => ({
  userLoader: new DataLoader(async (ids: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { id: { in: [...ids] } },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));
    return ids.map((id) => userMap.get(id) || null);
  }),

  postLoader: new DataLoader(async (ids: readonly string[]) => {
    const posts = await prisma.post.findMany({
      where: { id: { in: [...ids] } },
    });

    const postMap = new Map(posts.map((post) => [post.id, post]));
    return ids.map((id) => postMap.get(id) || null);
  }),

  profileLoader: new DataLoader(async (ids: readonly string[]) => {
    const profiles = await prisma.profile.findMany({
      where: { id: { in: [...ids] } },
    });

    const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
    return ids.map((id) => profileMap.get(id) || null);
  }),

  // Load Profile by userId (used by User.profile resolver)
  profileByUserIdLoader: new DataLoader(async (userIds: readonly string[]) => {
    const profiles = await prisma.profile.findMany({
      where: { userId: { in: [...userIds] } },
    });
    const map = new Map(profiles.map((p) => [p.userId, p]));
    return userIds.map((uid) => map.get(uid) || null);
  }),

  memberTypeLoader: new DataLoader(async (ids: readonly string[]) => {
    const memberTypes = await prisma.memberType.findMany({
      where: { id: { in: [...ids] } },
    });

    const memberTypeMap = new Map(
      memberTypes.map((memberType) => [memberType.id, memberType]),
    );
    return ids.map((id) => memberTypeMap.get(id) || null);
  }),

  userPostsLoader: new DataLoader(async (userIds: readonly string[]) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: [...userIds] } },
    });

    return userIds.map((userId) => posts.filter((post) => post.authorId === userId));
  }),

  userSubscribedToLoader: new DataLoader(async (userIds: readonly string[]) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: { subscriberId: { in: [...userIds] } },
      include: { author: true },
    });

    return userIds.map((userId) =>
      subscriptions.filter((sub) => sub.subscriberId === userId).map((sub) => sub.author),
    );
  }),

  userSubscribersLoader: new DataLoader(async (userIds: readonly string[]) => {
    const subscribers = await prisma.subscribersOnAuthors.findMany({
      where: { authorId: { in: [...userIds] } },
      include: { subscriber: true },
    });

    return userIds.map((userId) =>
      subscribers.filter((sub) => sub.authorId === userId).map((sub) => sub.subscriber),
    );
  }),
});

export type Loaders = ReturnType<typeof createLoaders>;
