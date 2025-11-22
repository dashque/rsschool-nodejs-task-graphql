import type { FieldNode, SelectionNode } from 'graphql/index.js';
import { MinimalUser } from '../types/types.js';

export const isFieldNode = (node: SelectionNode): node is FieldNode =>
  node.kind === 'Field' && Boolean(node.name?.value);

export const normalizePreloadedRelation = <K extends string>(
  pre: readonly (MinimalUser | Record<K, string>)[] | undefined,
  joinKey: K,
): MinimalUser[] | undefined => {
  if (!Array.isArray(pre)) return undefined;
  if (pre.length === 0) return [];

  const first = pre[0];

  if ('id' in first) {
    return pre as MinimalUser[];
  }

  if (joinKey in first) {
    const list = pre as readonly Record<K, string>[];
    return list.map((r) => ({ id: r[joinKey] }));
  }

  return [];
};
