import { defineConfig } from 'vite'

export default defineConfig({
  base: "",
  plugins: [],
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    // 确保 Worker 正确打包
    worker: {
      format: 'es'
    }
  },
  server: {
    port: 3000,
    open: true,
    // 移除安全头以解决开发模式兼容性问题
    // headers: {
    //   'Cross-Origin-Opener-Policy': 'same-origin',
    //   'Cross-Origin-Embedder-Policy': 'require-corp'
    // }
  },
  // 配置优化选项，排除 FFmpeg 相关依赖以避免 Worker 问题
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  // 明确处理 Worker
  worker: {
    format: 'es',
    plugins: []
  }
})