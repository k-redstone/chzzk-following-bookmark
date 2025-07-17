export const queryKeys = {
  bookmark: {
    state: () => ['bookmarkState'] as const,
    liveStatus: (hashId: string) => ['liveStatus', hashId] as const,
  },
}
