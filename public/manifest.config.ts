import { defineManifest } from '@crxjs/vite-plugin'

export default {
  manifest: defineManifest({
    manifest_version: 3,
    name: '치지직 팔로잉 북마크',
    version: '1.3.5',
    description:
      '팔로우하고 있는 치지직 스트리머들의 목록을 북마크로 관리할 수 있습니다.',
    content_scripts: [
      {
        matches: ['https://chzzk.naver.com/*'],
        js: ['src/content/main.tsx'],
        run_at: 'document_start',
      },
    ],

    background: {
      service_worker: 'src/background/index.ts',
      type: 'module',
    },

    web_accessible_resources: [
      {
        resources: ['page-bridge.esm.js'],
        matches: ['https://chzzk.naver.com/*'],
      },
    ],

    icons: {
      '48': 'public/icon-48.png',
      '96': 'public/icon-96.png',
      '128': 'public/icon-128.png',
    },

    permissions: ['tabs'],

    host_permissions: [
      'https://chzzk.naver.com/*',
      'https://api.chzzk.naver.com/*',
    ],

    action: {
      default_icon: {
        '16': 'public/icon-16.png',
        '32': 'public/icon-32.png',
      },
      default_popup: 'src/popup/index.html',
    },
  }),
}
