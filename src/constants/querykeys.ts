export const queryKeys = {
  bookmark: {
    state: () => ['bookmarkState'] as const,
    liveStatus: (hashId: string) => ['liveStatus', hashId] as const,
    followList: () => ['followList'] as const,
  },

  setting: {
    state: () => ['settingState'] as const,
  },
}
