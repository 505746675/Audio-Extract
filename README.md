# Audio Extract Pro - 专业音频提取工具

![Version](https://img.shields.io/badge/Version-3.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Browser](https://img.shields.io/badge/Browser-Compatible-brightgreen) ![FFmpeg](https://img.shields.io/badge/FFmpeg.wasm-powered-orange)

一个基于 **FFmpeg.wasm** 的专业级在线音频提取工具，支持从视频文件中提取音频并转换为多种高质量格式（MP3、AAC、WAV、FLAC），提供精确的音频剪辑功能和波形可视化。

## ✨ 主要特性

### 🎬 视频支持
- **广泛格式支持** - 支持所有主流视频格式（MP4、MOV、AVI、MKV、WebM等）
- **拖放上传** - 支持拖放或点击上传视频文件
- **大文件处理** - 支持高达2GB的视频文件
- **实时预览** - 文件上传后立即显示详细信息

### 🎵 音频提取与转换
- **多格式输出** - MP3、AAC、WAV、FLAC四种专业格式
- **高质量编码** - 支持最高320kbps的MP3编码
- **无损选项** - FLAC和WAV提供无损音频质量
- **智能编码** - 基于FFmpeg的专业音频处理引擎

### ✂️ 音频剪辑功能
- **波形可视化** - 实时显示音频波形，直观选择剪辑段落
- **精确剪辑** - 支持时分秒精确到毫秒的时间选择
- **交互式选择** - 鼠标拖拽或触摸选择音频区间
- **实时预览** - 可播放选中段落进行预览
- **时间输入** - 支持手动输入精确时间点

### 🎨 用户体验
- **现代界面** - 简约风格设计，毛玻璃效果
- **响应式布局** - 完美适配PC、平板、手机
- **实时进度** - 详细的处理进度显示
- **错误处理** - 友好的错误提示和恢复机制
- **一键重置** - 快速清除所有状态

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 构建版本
```bash
npm run build
cd dist
python -m http.server 8000
进入：http://127.0.0.1:8000/测试功能
```

### 正式部署
将dist目录下的文件复制到服务器即可
```

## 📂 项目结构

```
audio_extract/
├── index.html              # 主页面
├── style.css              # 样式文件（包含响应式设计）
├── script.js              # 核心功能脚本
├── package.json           # 项目配置和依赖
├── vite.config.js         # Vite构建配置
└── README.md              # 项目说明文档
```

## 🛠️ 技术栈

### 核心库
- **@ffmpeg/ffmpeg** - FFmpeg的WebAssembly版本
- **@ffmpeg/util** - FFmpeg工具函数库
- **Vite** - 现代化构建工具

## 🎯 使用指南

### 1. 上传视频
- **点击上传**：点击上传区域选择视频文件
- **拖放上传**：直接将视频拖到上传区域

### 2. 选择输出格式
点击格式选择器选择输出格式：
- **MP3** - 兼容性最好，支持质量选择
- **AAC** - 高质量，较好的压缩率
- **WAV** - 无损格式，保持原始质量
- **FLAC** - 无损压缩，文件较小

### 3. 选择音频质量（MP3/AAC）
点击质量选择器选择比特率：
- **超高质量** - 320kbps，最佳音质
- **高质量** - 192kbps，优秀音质
- **中质量** - 128kbps，平衡选择
- **低质量** - 64kbps，文件最小

> **注意**：WAV和FLAC为无损格式，质量选择对其无效

### 4. 音频剪辑（可选）
- **自动加载**：上传后自动显示波形和剪辑界面
- **选择区间**：在波形图上拖拽选择剪辑段落
- **手动输入**：直接输入开始和结束时间（格式：时:分:秒）
- **播放预览**：点击"播放选中段"试听效果
- **重置选择**：点击"重置选择"清除剪辑区间

### 5. 提取音频
- **一键提取**：点击"提取[格式]"按钮开始处理
- **进度监控**：实时查看处理进度和状态
- **自动下载**：处理完成后自动提供下载链接

### 6. 特殊功能
- **波形可视化**：直观显示音频内容，便于精确剪辑
- **边界调整**：拖拽波形图边界调整剪辑区间
- **触摸支持**：移动端完美支持触摸操作
- **实时反馈**：所有操作都有视觉反馈

## 🎨 界面设计特点

### 现代化设计
- **毛玻璃效果** - 背景模糊和透明效果
- **流畅动画** - 所有状态切换都有平滑过渡
- **色彩系统** - 专业的色彩搭配和状态指示

### 响应式布局
- **移动端优化** - 触摸友好的交互设计
- **PC端增强** - 大屏幕布局优化
- **平板适配** - 中等屏幕完美展示
- **高分辨率** - 支持Retina显示屏

### 交互体验
- **视觉反馈** - 每个操作都有明确反馈
- **状态指示** - 彩色状态消息提示
- **错误处理** - 友好的错误提示和解决方案
- **性能优化** - 流畅的60fps动画

## 🔧 技术实现

### 核心类：`AudioExtractor`
```javascript
class AudioExtractor {
    constructor() {
        this.selectedFile = null;        // 选中的视频文件
        this.audioFormat = 'mp3';        // 输出格式
        this.audioQuality = 'medium';    // 音频质量
        this.ffmpeg = null;              // FFmpeg实例
        
        // 剪辑相关属性
        this.audioBuffer = null;         // 音频数据
        this.waveformData = null;        // 波形数据
        this.selectionStart = 0;         // 剪辑开始时间
        this.selectionEnd = 0;           // 剪辑结束时间
        this.isSelecting = false;        // 选择状态
    }
    
    // 格式和质量选择
    selectFormat(format, hint)          // 选择输出格式
    selectQuality(quality, hint)        // 选择音频质量
    
    // 波形相关
    loadAudioForWaveform()              // 加载音频用于波形显示
    generateWaveformData()              // 生成波形数据
    drawWaveform()                      // 绘制波形图
    
    // 剪辑操作
    handleWaveformMouseDown(e)          // 处理鼠标按下
    handleWaveformMouseMove(e)          // 处理鼠标移动
    handleWaveformMouseUp(e)            // 处理鼠标释放
    playSelection()                     // 播放选中段
    
    // FFmpeg处理
    async initFFmpeg()                  // 初始化FFmpeg
    async extractAudioWithFFmpeg(file)  // 使用FFmpeg提取音频
    async extractAudio()                // 主提取流程
    
    // 资源管理
    cleanupResources()                  // 清理所有资源
    reset()                             // 重置状态
}
```

### FFmpeg处理流程
1. **初始化** - 加载FFmpeg核心文件（32MB）
2. **文件读取** - 读取视频文件为Uint8Array
3. **参数配置** - 根据选择设置编码参数
4. **音频提取** - 执行FFmpeg命令提取音频
5. **剪辑处理** - 如果有选择区间，应用时间限制
6. **格式转换** - 转换为指定格式和质量
7. **结果输出** - 生成Blob并提供下载

### 波形生成算法
```javascript
generateWaveformData() {
    const rawData = this.audioBuffer.getChannelData(0);
    const samples = 200; // 波形采样点数
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData = [];
    
    // 分块平均
    for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
    }
    
    // 归一化
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    this.waveformData = filteredData.map(n => n * multiplier);
}
```

## 📊 性能优化

### 内存管理
- **流式处理** - 大文件分块处理避免内存溢出
- **及时清理** - 处理完成后立即释放资源
- **Blob释放** - 下载后自动释放URL资源
- **音频上下文** - 使用后立即关闭AudioContext

### 处理优化
- **进度反馈** - 实时更新处理进度
- **错误恢复** - 友好的错误提示和恢复机制
- **超时控制** - 长时间处理自动终止
- **CDN加速** - 使用官方CDN加载FFmpeg核心

### 用户体验优化
- **触摸优化** - 移动端触摸区域增大到44px
- **边界检测** - 移动端使用更大阈值便于操作
- **视觉反馈** - 所有操作都有即时反馈
- **离线处理** - 所有处理在浏览器本地完成

## 🔒 隐私与安全

- **纯前端处理**：所有处理在浏览器中完成
- **无服务器上传**：文件不上传，完全本地处理
- **数据保护**：页面关闭后数据自动清除
- **内存管理**：及时释放音频资源和Blob URL

## 🌐 浏览器兼容性

| 浏览器 | MP3 | AAC | WAV | FLAC | 剪辑功能 | 波形显示 |
|--------|-----|-----|-----|------|----------|----------|
| Chrome | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Safari | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

> **注意**：所有功能都需要现代浏览器支持WebAssembly。

## ⚙️ 配置选项

### MP3编码参数
```javascript
const bitrate = this.getBitrate(); // 64, 128, 192, 320
const ffmpegArgs = [
    '-i', inputName,      // 输入文件
    '-vn',                // 去除视频
    '-ar', '44100',       // 采样率
    '-b:a', `${bitrate}k`,// 比特率
    outputName            // 输出文件
];
```

### AAC编码参数
```javascript
ffmpegArgs = [
    '-i', inputName,
    '-vn',
    '-c:a', 'aac',        // AAC编码器
    '-b:a', '192k',       // 固定192kbps
    outputName
];
```

### WAV编码参数（无损）
```javascript
ffmpegArgs = [
    '-i', inputName,
    '-vn',
    '-ar', '44100',       // 采样率
    outputName            // 输出文件
];
```

### FLAC编码参数（无损压缩）
```javascript
ffmpegArgs = [
    '-i', inputName,
    '-vn',
    '-c:a', 'flac',       // FLAC编码器
    outputName
];
```

## 🐛 常见问题

### Q: 为什么需要下载FFmpeg核心文件？
**A**: FFmpeg.wasm是一个32MB的WebAssembly模块，需要下载到本地才能运行。首次使用时会自动从CDN加载。

### Q: 不同格式有什么区别？
**A**: 
- **MP3**: 兼容性最好，支持质量选择，适合大多数场景
- **AAC**: 高质量，较好的压缩率，适合移动设备
- **WAV**: 无损格式，文件较大，音质最好
- **FLAC**: 无损压缩，文件适中，音质与WAV相同

### Q: 不同质量设置有什么区别？
**A**: 
- **超高质量 (320kbps)**: 音质最佳，适合音乐制作
- **高质量 (192kbps)**: 优秀音质，适合日常使用
- **中质量 (128kbps)**: 平衡选择，适合语音和播客
- **低质量 (64kbps)**: 文件最小，适合语音内容

### Q: 剪辑功能如何使用？
**A**: 
1. 上传视频后会自动显示波形图
2. 在波形图上拖拽选择区间，或手动输入时间
3. 点击"播放选中段"预览效果
4. 提取时会自动应用剪辑区间

### Q: 处理时间受什么影响？
**A**: 视频长度、文件大小、选择的格式都会影响处理时间。WAV最快，MP3取决于视频长度和选择的质量。

### Q: 为什么波形加载失败还能提取？
**A**: 波形显示是可选功能，用于精确剪辑。即使波形加载失败，仍然可以提取完整音频或使用时间输入进行剪辑。

## 📝 版本对比

### v3.0.0 (当前版本) - Pro版
- ✅ **FFmpeg.wasm引擎** - 专业级音频处理
- ✅ **4种输出格式** - MP3、AAC、WAV、FLAC
- ✅ **波形可视化** - 实时音频波形显示
- ✅ **精确剪辑** - 支持毫秒级时间选择
- ✅ **交互式选择** - 拖拽选择剪辑区间
- ✅ **实时预览** - 可播放选中段落
- ✅ **大文件支持** - 支持高达2GB的视频文件

### v2.0.0 - 上一代版本
- ✅ **多格式支持** - MP3、WAV格式
- ✅ **质量选择** - MP3支持三档比特率
- ✅ **Safari优化** - MOV文件特殊处理
- ✅ **拖放上传** - 基础上传功能
- ✅ **响应式设计** - 移动端适配

### v1.0.0 - 初始版本
- ✅ 基础视频上传
- ✅ MP3音频提取
- ✅ 简单进度显示

## 🔮 未来计划

- [ ] **批量处理** - 同时处理多个视频文件
- [ ] **音频编辑** - 音量调整、淡入淡出效果
- [ ] **音频合并** - 多个音频文件合并
- [ ] **音频分割** - 按时间或大小分割
- [ ] **格式转换** - 已有音频文件格式转换
- [ ] **PWA支持** - 离线使用和桌面应用
- [ ] **云存储集成** - 支持从云端直接处理
- [ ] **音频可视化** - 频谱分析和实时可视化

## 📜 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢以下开源项目：
- [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) - WebAssembly版本的FFmpeg
- [Vite](https://vitejs.dev/) - 现代化构建工具
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - 音频处理API

---

**注意**：本工具完全在浏览器端运行，所有文件处理均在本地完成，不会上传到任何服务器，请放心使用隐私敏感文件。首次使用需要下载FFmpeg核心文件（约32MB）。
