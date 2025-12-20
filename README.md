# Audio Extract - 视频转音频工具

![Audio Extract](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Browser](https://img.shields.io/badge/Browser-Compatible-brightgreen)

一个现代化的在线视频转音频工具，支持从视频文件中直接提取音频并转换为MP3格式。

## ✨ 主要特性

### 🎬 视频支持
- **广泛格式支持** - 支持常见的视频格式（MP4、MOV、AVI、MKV等）
- **拖放上传** - 支持拖放或点击上传视频文件
- **实时预览** - 文件上传后立即显示信息

### 🎵 音频提取
- **高质量提取** - 保持原始音频质量
- **智能编码** - 自动选择最佳提取方式
- **MP3编码** - 使用lame.js进行高效MP3编码
- **实时进度** - 显示详细的处理进度

### 🌐 浏览器优化
- **跨浏览器兼容** - Chrome、Firefox、Safari、Edge等
- **Safari特殊处理** - 针对Safari浏览器的MOV文件优化
- **移动端适配** - 完美适配手机和平板设备
- **离线处理** - 所有处理在浏览器本地完成

## 🚀 快速开始

1. 由于项目仅包含HTML、CSS和JavaScript文件，无需编译，直接打开index.html

## 📂 项目结构

```
audio-extract/
├── index.html          # 主页面
├── style.css          # 样式文件
├── script.js          # 核心功能脚本
├── LICENSE            # MIT许可证文件
└── README.md          # 项目说明
```

## 🛠️ 技术栈

### 核心库
- **lame.js** - MP3音频编码
- **Web Audio API** - 音频处理和解码
- **MediaRecorder API** - 音频录制（Safari备用方案）

### 浏览器API
- **File API** - 文件读取
- **Drag & Drop API** - 拖放功能
- **Blob API** - 文件下载
- **Canvas API** - 音频可视化（预留）

## 🎯 使用指南

### 1. 上传视频
- **点击上传**：点击"点击选择视频文件"区域
- **拖放上传**：直接将视频文件拖到上传区域
- **文件限制**：建议视频文件不超过500MB

### 2. 提取音频
- **一键提取**：点击"提取MP3"按钮
- **处理过程**：
  1. 读取视频文件
  2. 解码音频流
  3. 编码为MP3格式
  4. 生成下载链接

### 3. 特殊模式
- **Safari + MOV**：自动启用录制模式
- **进度提示**：显示详细处理状态
- **错误处理**：友好的错误提示

### 4. 下载音频
- **在线试听**：使用内置播放器预览
- **下载MP3**：点击"下载MP3"保存文件
- **文件命名**：自动命名为`extracted-audio.mp3`

## 🎨 设计特点

### 界面设计
- **iOS风格** - 采用Apple设计语言
- **毛玻璃效果** - 背景模糊和透明效果
- **响应式布局** - 完美适配各种屏幕尺寸
- **动画过渡** - 流畅的状态切换动画

### 用户体验
- **视觉反馈** - 上传、处理、完成各阶段明确
- **进度显示** - 实时显示处理进度和描述
- **状态提示** - 彩色状态消息提示
- **一键重置** - 快速清除所有状态

## 🔧 技术实现

### 核心类：`DirectAudioExtractor`
```javascript
class DirectAudioExtractor {
    constructor() {
        // 初始化音频上下文
        // 检测浏览器类型
        // 初始化UI元素
    }
    
    // 主要方法
    async extractAudio()         // 主提取流程
    async directModeExtraction() // 直接提取模式
    async recordModeExtraction() // 录制提取模式（Safari备用）
    async encodeToMP3()         // MP3编码
    async encodeToWAV()         // WAV编码（预留）
}
```

### 处理流程
1. **文件检测** - 检测文件类型和浏览器
2. **模式选择** - 根据条件选择直接或录制模式
3. **音频解码** - 从视频中提取音频数据
4. **格式编码** - 编码为MP3格式
5. **结果展示** - 提供播放和下载

## 📱 浏览器兼容性

| 浏览器 | 支持状态 | 备注 |
|--------|----------|------|
| Chrome | ✅ 完全支持 | 推荐使用最新版本 |
| Firefox | ✅ 完全支持 | 推荐使用最新版本 |
| Safari | ⚠️ 有条件支持 | MOV文件使用录制模式 |
| Edge | ✅ 完全支持 | Chromium内核版本 |
| iOS Safari | ⚠️ 有条件支持 | 支持大多数视频格式 |

### Safari特殊说明
- **MOV文件**：Safari中MOV文件无法直接解码，使用录制模式
- **录制模式**：播放视频并录制音频输出
- **用户确认**：录制前需要用户确认（会发出声音）

## ⚙️ 配置选项

### 音频质量设置
```javascript
// MP3编码参数
const mp3encoder = new lamejs.Mp3Encoder(
    2,                    // 声道数（立体声）
    audioBuffer.sampleRate, // 采样率（保持原始）
    128                   // 比特率（kbps）
);
```

### 录制模式配置
```javascript
const mediaRecorder = new MediaRecorder(destination.stream, {
    mimeType: 'audio/webm',    // 录制格式
    audioBitsPerSecond: 128000 // 音频比特率
});
```

## 🔒 隐私与安全

- **纯前端处理**：所有处理在浏览器中完成
- **无服务器上传**：文件不上传，完全本地处理
- **数据保护**：页面关闭后数据自动清除
- **内存管理**：及时释放音频资源和Blob URL

## 📊 性能优化

### 内存优化
- **流式处理**：大文件分块处理避免内存溢出
- **及时清理**：处理完成后清理AudioContext
- **Blob释放**：下载后及时释放Blob URL

### 处理优化
- **进度反馈**：实时更新处理进度
- **错误恢复**：友好的错误提示和恢复
- **超时控制**：长时间处理自动终止

## 🐛 常见问题

### Q: 处理时间太长？
**A**: 处理时间与视频长度和大小成正比，长视频需要更长时间。

### Q: 文件大小有限制吗？
**A**: 建议单个视频文件不超过500MB，过大的文件可能导致内存不足。

### Q: 支持的视频格式？
**A**: 支持大多数现代视频格式：MP4、MOV、AVI、MKV、WebM等。

### Q: 提取的音频质量如何？
**A**: 保持原始音频质量，MP3编码使用128kbps比特率。

### Q: Safari中为什么需要确认？
**A**: Safari的MOV文件需要使用录制模式，会播放视频声音，需要用户确认。

## 📝 更新日志

### v1.0.0 (当前版本)
- ✅ 基础视频上传功能
- ✅ 音频提取和MP3编码
- ✅ Safari特殊处理
- ✅ 拖放文件支持
- ✅ 实时进度显示
- ✅ 音频播放预览
- ✅ 一键下载功能
- ✅ 响应式移动端适配

## 🔮 未来计划

- [ ] 支持更多音频格式（WAV、AAC、OGG）
- [ ] 音频质量选择（高/中/低比特率）
- [ ] 批量处理多个视频文件
- [ ] 音频剪辑功能（选择时间段）
- [ ] 音频效果（音量调整、淡入淡出）
- [ ] 音频可视化波形显示
- [ ] PWA离线支持
- [ ] 云存储集成

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢以下开源项目的支持：
- [lame.js](https://github.com/zhuker/lamejs) - JavaScript MP3编码器
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - 音频处理API

---

**注意**：本工具完全在浏览器端运行，所有文件处理均在本地完成，不会上传到任何服务器，请放心使用隐私敏感文件。
