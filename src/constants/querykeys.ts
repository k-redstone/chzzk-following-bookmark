export const queryKeys = {
  bookmark: {
    state: () => ['bookmarkState'] as const,
    liveStatusKey: ['liveStatus'],
    liveStatus: (hashId: string) => ['liveStatus', hashId] as const,
    followList: () => ['followList'] as const,
  },

  folderState: {
    map: () => ['folder-state', 'map'] as const,
  },
  setting: {
    state: () => ['settingState'] as const,
  },
}
