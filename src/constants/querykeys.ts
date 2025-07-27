export const queryKeys = {
  bookmark: {
    state: () => ['bookmarkState'] as const,
    liveStatusKey: ['liveStatus'],
    liveStatus: (hashId: string) => ['liveStatus', hashId] as const,
    followList: () => ['followList'] as const,
  },

  setting: {
    state: () => ['settingState'] as const,
  },
}
