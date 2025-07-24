import { defineManifest } from '@crxjs/vite-plugin'

export default {
  manifest: defineManifest({
    manifest_version: 3,
    name: '치지직 팔로잉 폴더',
    version: '1.0.0',
    description:
      '팔로우하고 있는 치지직 스트리머들의 목록을 폴더로 만들어 관리할 수 있습니다.',
    content_scripts: [
      {
        matches: ['https://chzzk.naver.com/*'],
        js: ['src/content/main.tsx'],
      },
    ],

    background: {
      service_worker: 'src/background/index.ts',
      type: 'module',
    },

    host_permissions: [
      'https://chzzk.naver.com/*',
      'https://api.chzzk.naver.com/*',
    ],

    action: {
      default_popup: 'src/popup/index.html',
    },
    permissions: ['storage'],
  }),
}
