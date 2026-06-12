import { defineConfig } from 'vite';

export default defineConfig({
  preview: {
    // 터널(trycloudflare 등) 경유 접속의 Host 헤더 허용
    allowedHosts: true,
  },
});
