class DirectAudioExtractor {
    constructor() {
        this.selectedFile = null;
        this.audioFormat = 'mp3'; // mp3, wav, aac, flac
        this.audioQuality = 'medium'; // ultra-low, high, medium, low
        this.audioContext = null;
        this.isSafari = this.detectSafari();
        this.forceRecordingMode = false;
        this.confirmationShown = false;
        this.initElements();
        this.initEventListeners();
    }

    detectSafari() {
        const ua = navigator.userAgent;
        return /^((?!chrome|android).)*safari/i.test(ua) || /iPad|iPhone|iPod/.test(ua);
    }

    initElements() {
        this.fileInput = document.getElementById('fileInput');
        this.fileWrapper = document.getElementById('fileWrapper');
        this.filename = document.getElementById('filename');
        this.extractBtn = document.getElementById('extractBtn');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultContainer = document.getElementById('resultContainer');
        this.audioPlayer = document.getElementById('audioPlayer');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.fileText = document.getElementById('fileText');
        this.statusMessage = document.getElementById('statusMessage');
        this.safariBadge = document.getElementById('safariBadge');
        this.recordingBadge = document.getElementById('recordingBadge');
        this.hiddenVideo = document.getElementById('hiddenVideo');
        this.progressDescription = document.getElementById('progressDescription');
        this.progressPercentage = document.getElementById('progressPercentage');
        // 格式选择器和质量选择器元素
        this.formatSelect = document.getElementById('formatSelect');
        this.qualitySelect = document.getElementById('qualitySelect');
        this.qualitySelector = document.querySelector('.quality-selector');

        if (this.isSafari) {
            this.safariBadge.style.display = 'block';
        }
    }

    initEventListeners() {
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        this.fileWrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.fileWrapper.style.borderColor = 'var(--primary)';
        });

        this.fileWrapper.addEventListener('dragleave', () => {
            this.fileWrapper.style.borderColor = this.fileWrapper.classList.contains('active') ? 'var(--primary)' : '#d1d1d6';
        });

        this.fileWrapper.addEventListener('drop', (e) => this.handleDrop(e));

        this.extractBtn.addEventListener('click', () => this.extractAudio());

        this.resetBtn.addEventListener('click', () => this.reset());

        // 格式选择器事件（下拉框）
        this.formatSelect.addEventListener('change', (e) => {
            this.selectFormat(e.target.value);
        });

        // 质量选择器事件（下拉框）
        this.qualitySelect.addEventListener('change', (e) => {
            this.selectQuality(e.target.value);
        });

    }

    selectFormat(format) {
        this.audioFormat = format;
        
        // 更新UI状态 - 更新下拉框选中值
        this.formatSelect.value = format;

        // 根据格式更新质量选择器和状态提示
        this.updateQualitySelector();
        this.updateExtractButtonText();
    }

    selectQuality(quality) {
        this.audioQuality = quality;
        
        // 更新下拉选择框的选中状态
        this.qualitySelect.value = quality;

        this.updateExtractButtonText();
    }

    updateQualitySelector() {
        // 根据当前格式更新质量选择器的可用性和提示
        const qualitySelect = this.qualitySelect;
        const qualityLabel = this.qualitySelector.querySelector('.quality-label');
        
        if (this.audioFormat === 'wav' || this.audioFormat === 'flac') {
            qualitySelect.disabled = true;
            qualitySelect.style.opacity = '0.5';
            qualitySelect.style.cursor = 'not-allowed';
            qualityLabel.textContent = '音频质量 (无损格式固定)';
            this.showStatus(`${this.audioFormat.toUpperCase()}为无损格式，质量选择对其无效`, 'warning');
        } else {
            qualitySelect.disabled = false;
            qualitySelect.style.opacity = '1';
            qualitySelect.style.cursor = 'pointer';
            qualityLabel.textContent = '音频质量';
            this.hideStatus();
        }

        // 更新质量选项的显示文本（根据格式调整）
        const options = qualitySelect.options;
        if (this.audioFormat === 'mp3') {
            options[0].text = '超高质量 (320kbps)';
            options[1].text = '高质量 (192kbps)';
            options[2].text = '中质量 (128kbps)';
            options[3].text = '低质量 (64kbps)';
        } else if (this.audioFormat === 'aac') {
            // AAC只支持高质量
            options[0].text = '超高质量 (不推荐)';
            options[1].text = '高质量 (256kbps)';
            options[2].text = '中质量 (不推荐)';
            options[3].text = '低质量 (不推荐)';
            
            // 如果当前质量不是high，自动切换到high
            if (this.audioQuality !== 'high') {
                this.selectQuality('high');
            }
        }
    }

    updateExtractButtonText() {
        const formatText = this.audioFormat.toUpperCase();
        let qualityText = '';
        
        switch(this.audioQuality) {
            case 'ultra-low':
                qualityText = '超低质';
                break;
            case 'low':
                qualityText = '低质';
                break;
            case 'medium':
                qualityText = '中质';
                break;
            case 'high':
                qualityText = '高质';
                break;
            default:
                qualityText = '中质';
        }
        
        if (this.forceRecordingMode) {
            this.extractBtn.querySelector('span').textContent = `录制${formatText}`;
        } else {
            this.extractBtn.querySelector('span').textContent = `提取${formatText} (${qualityText})`;
        }
    }

    showStatus(message, type = 'info') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message show ${type}`;
    }

    hideStatus() {
        this.statusMessage.classList.remove('show');
    }

    handleFileSelect(e) {
        if (e.target.files && e.target.files[0]) {
            this.selectedFile = e.target.files[0];

            // 检查文件大小限制
            const fileSizeMB = this.selectedFile.size / (1024 * 1024);
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const maxSizeMB = isMobile ? 80 : 2048; // 手机80MB，电脑2GB限制

            if (fileSizeMB > maxSizeMB) {
                const limitText = isMobile ? '手机限制80MB' : '电脑限制2GB';
                this.showStatus(`文件过大：${fileSizeMB.toFixed(1)}MB，${limitText}，请选择较小的文件`, 'error');
                this.selectedFile = null;
                this.fileInput.value = '';
                return;
            }

            // PC端大文件警告
            if (!isMobile && fileSizeMB > 200) {
                this.showStatus(`大文件警告：${fileSizeMB.toFixed(1)}MB，处理可能需要较长时间`, 'warning');
            }

            const ext = this.selectedFile.name.split('.').pop().toLowerCase();
            const isMOV = ext === 'mov';

            this.forceRecordingMode = this.isSafari && isMOV;

            if (this.forceRecordingMode) {
                this.recordingBadge.style.display = 'block';
                this.showStatus('Safari + MOV：将使用录制模式提取音频', 'warning');
            } else {
                this.recordingBadge.style.display = 'none';
            }

            this.updateFileUI();
        }
    }

    handleDrop(e) {
        e.preventDefault();
        this.fileWrapper.style.borderColor = this.fileWrapper.classList.contains('active') ? 'var(--primary)' : '#d1d1d6';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            this.fileInput.files = e.dataTransfer.files;
            const event = new Event('change', { bubbles: true });
            this.fileInput.dispatchEvent(event);
        }
    }

    updateFileUI() {
        const sizeMB = (this.selectedFile.size / (1024 * 1024)).toFixed(1);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 显示文件信息，包含文件类型和大小
        const ext = this.selectedFile.name.split('.').pop().toUpperCase();
        this.filename.textContent = `${this.selectedFile.name} (${sizeMB}MB, ${ext})`;
        this.filename.classList.add('show');
        this.extractBtn.disabled = false;
        this.fileWrapper.classList.add('active');
        this.fileText.textContent = '文件已选择';
        this.fileText.style.color = 'var(--primary)';

        // PC端显示额外的文件信息
        if (!isMobile) {
            this.showStatus(`已选择 ${ext} 格式文件，大小 ${sizeMB}MB`, 'info');
        }

        this.updateExtractButtonText();
    }

    updateProgress(percent, description) {
        this.progressFill.style.width = `${percent}%`;
        if (description) {
            this.progressDescription.textContent = description;
        }
        this.progressPercentage.textContent = `${Math.round(percent)}%`;
    }

    // 统一的资源清理方法
    cleanupResources() {
        console.log('开始清理资源...');
        
        // 清理音频上下文
        if (this.audioContext) {
            try {
                this.audioContext.close();
                console.log('音频上下文已关闭');
            } catch (e) {
                console.warn('关闭音频上下文失败:', e);
            }
            this.audioContext = null;
        }

        // 清理隐藏视频元素
        if (this.hiddenVideo) {
            try {
                this.hiddenVideo.pause();
                this.hiddenVideo.currentTime = 0;
                this.hiddenVideo.src = '';
                this.hiddenVideo.removeAttribute('src');
                this.hiddenVideo.load();
                console.log('隐藏视频元素已重置');
            } catch (e) {
                console.warn('重置隐藏视频元素失败:', e);
            }
        }

        // 清理音频播放器
        if (this.audioPlayer) {
            try {
                this.audioPlayer.pause();
                this.audioPlayer.src = '';
                console.log('音频播放器已重置');
            } catch (e) {
                console.warn('重置音频播放器失败:', e);
            }
        }

        // 清理临时视频元素（录制模式创建的）
        const tempVideos = document.querySelectorAll('video:not(#hiddenVideo)');
        tempVideos.forEach(video => {
            try {
                video.pause();
                if (video.src) {
                    URL.revokeObjectURL(video.src);
                }
                video.src = '';
                video.remove();
                console.log('临时视频元素已清理');
            } catch (e) {
                console.warn('清理临时视频元素失败:', e);
            }
        });

        // 清理临时音频元素（AAC编码创建的）
        const tempAudios = document.querySelectorAll('audio:not(#audioPlayer)');
        tempAudios.forEach(audio => {
            try {
                audio.pause();
                if (audio.src) {
                    URL.revokeObjectURL(audio.src);
                }
                audio.src = '';
                audio.remove();
                console.log('临时音频元素已清理');
            } catch (e) {
                console.warn('清理临时音频元素失败:', e);
            }
        });

        console.log('资源清理完成');
    }

    async extractAudio() {
        if (!this.selectedFile) return;

        // Safari + MOV 确认逻辑
        if (this.forceRecordingMode && !this.confirmationShown) {
            this.showSafariConfirmation();
            return;
        }

        this.extractBtn.classList.add('loading');
        this.extractBtn.disabled = true;
        this.resultContainer.classList.remove('show');
        this.resetBtn.style.display = 'none';
        this.progressContainer.classList.add('show');

        try {
            if (this.forceRecordingMode) {
                await this.recordModeExtraction();
            } else {
                await this.directModeExtraction();
            }
        } catch (error) {
            console.error('提取失败:', error);
            this.showStatus(`提取失败: ${error.message}`, 'error');
            this.updateProgress(100, '提取失败');
            this.progressFill.style.background = 'var(--danger)';
            this.extractBtn.classList.remove('loading');
            this.extractBtn.disabled = false;

            // 统一清理资源
            this.cleanupResources();

            setTimeout(() => {
                this.progressContainer.classList.remove('show');
                this.progressFill.style.background = 'var(--primary)';
                this.progressFill.style.width = '0%';
            }, 3000);
        }
    }

    showSafariConfirmation() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            padding: 24px;
            max-width: 320px;
            width: 90%;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.5);
            text-align: center;
        `;

        content.innerHTML = `
            <div style="font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #000;">
                ⚠️ Safari + MOV 特殊提示
            </div>
            <div style="font-size: 14px; color: #333; line-height: 1.6; margin-bottom: 20px;">过程会发出音频声音<br>进度=音频时长<br><strong style="color: #f57c00;">时长过长建议使用PC/安卓</strong>
            </div>
            <div style="display: flex; gap: 10px;">
                <button id="confirmCancel" style="
                    flex: 1;
                    padding: 12px;
                    border: none;
                    border-radius: 10px;
                    background: rgba(0, 0, 0, 0.05);
                    color: #000;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">取消</button>
                <button id="confirmOK" style="
                    flex: 1;
                    padding: 12px;
                    border: none;
                    border-radius: 10px;
                    background: #007aff;
                    color: white;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">确认</button>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        document.getElementById('confirmCancel').onclick = () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        };

        document.getElementById('confirmOK').onclick = () => {
            this.confirmationShown = true;
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                modal.remove();
                this.extractAudio();
            }, 300);
        };

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    async directModeExtraction() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const fileSizeMB = this.selectedFile.size / (1024 * 1024);
        
        this.updateProgress(0, '读取文件...');
        this.showStatus('正在读取视频文件...', 'info');
        
        // PC端显示预计时间提示
        if (!isMobile) {
            const estimatedTime = Math.max(5, Math.min(60, fileSizeMB * 0.5));
            this.showStatus(`正在读取 ${fileSizeMB.toFixed(1)}MB 文件，预计需要 ${estimatedTime} 秒`, 'info');
        }
        
        const arrayBuffer = await this.readFileAsArrayBuffer(this.selectedFile);
        this.updateProgress(20, '解码音频...');
        this.showStatus('正在解码音频...', 'info');

        // 创建音频上下文并解码
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        let audioBuffer;
        
        try {
            audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.error('音频解码失败:', error);
            throw new Error('音频解码失败，可能是视频格式不支持或音频编码不兼容');
        }

        // 验证音频数据
        if (!audioBuffer || audioBuffer.duration === 0) {
            throw new Error('解码后的音频数据无效');
        }

        this.updateProgress(50, `解码完成 - 时长: ${audioBuffer.duration.toFixed(1)}秒`);
        this.showStatus(`成功解码 ${audioBuffer.duration.toFixed(1)}秒 音频`, 'success');

        let finalBlob;
        const bitrate = this.getBitrate();

        // 根据格式选择编码方法
        switch (this.audioFormat) {
            case 'mp3':
                finalBlob = await this.encodeToMP3(audioBuffer, bitrate);
                break;
            case 'wav':
                finalBlob = await this.encodeToWAV(audioBuffer);
                break;
            case 'aac':
                finalBlob = await this.encodeToAAC(audioBuffer, bitrate);
                break;
            case 'flac':
                finalBlob = await this.encodeToFLAC(audioBuffer);
                break;
            default:
                finalBlob = await this.encodeToMP3(audioBuffer, bitrate);
        }

        // 验证输出结果
        if (!finalBlob || finalBlob.size === 0) {
            throw new Error('编码失败，输出文件为空');
        }

        this.displayResult(finalBlob, audioBuffer);
    }

    async recordModeExtraction() {
        console.log('开始录制模式提取，使用全新视频元素...');
        
        // 1. 先清理旧资源
        this.cleanupResources();

        // 2. 创建全新的视频元素
        let video;
        try {
            video = document.createElement('video');
            video.playsinline = true;
            video.muted = false;
            video.style.display = 'none';
            document.body.appendChild(video);
            
            // 设置视频源
            video.src = URL.createObjectURL(this.selectedFile);
            console.log('创建新视频元素并设置源');
        } catch (e) {
            console.error('创建视频元素失败:', e);
            throw new Error('无法创建视频元素');
        }

        // 3. 等待视频加载
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('视频加载超时'));
            }, 10000);
            
            if (video.readyState >= 2) {
                clearTimeout(timeout);
                resolve();
            } else {
                const onLoaded = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                const onError = () => {
                    clearTimeout(timeout);
                    reject(new Error('视频加载失败'));
                };
                video.addEventListener('loadeddata', onLoaded, { once: true });
                video.addEventListener('error', onError, { once: true });
            }
        });

        this.updateProgress(10, '准备录制...');
        this.showStatus('准备录制音频...', 'info');

        // 4. 创建全新的音频上下文
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('创建新音频上下文:', this.audioContext);

        // 5. 创建音频源节点
        let sourceNode;
        try {
            sourceNode = this.audioContext.createMediaElementSource(video);
            console.log('成功创建源节点');
        } catch (error) {
            console.error('创建源节点失败:', error);
            // 清理资源
            this.cleanupResources();
            throw new Error('无法创建音频源节点，可能是视频格式不支持或浏览器限制');
        }

        // 6. 创建目标节点并连接
        const destination = this.audioContext.createMediaStreamDestination();
        try {
            sourceNode.connect(destination);
            sourceNode.connect(this.audioContext.destination);
            console.log('音频图连接成功');
        } catch (error) {
            console.error('音频图连接失败:', error);
            try {
                sourceNode.disconnect();
            } catch (e) {}
            this.cleanupResources();
            throw new Error('音频连接失败');
        }

        // 7. 准备录制
        let mimeType = '';
        if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            mimeType = 'audio/ogg';
        } else {
            mimeType = 'audio/webm';
        }

        const bitrate = this.getBitrate();
        let mediaRecorder;
        try {
            mediaRecorder = new MediaRecorder(destination.stream, {
                mimeType: mimeType,
                audioBitsPerSecond: bitrate * 1000
            });
        } catch (error) {
            console.error('创建MediaRecorder失败:', error);
            try {
                sourceNode.disconnect();
            } catch (e) {}
            this.cleanupResources();
            throw new Error('无法创建录制器，可能格式不支持');
        }

        const recordedChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };

        return new Promise((resolve, reject) => {
            // 模拟录制进度
            const duration = video.duration || 10;
            let progress = 10;
            const maxRecordTime = Math.min(600000, (duration + 30) * 1000);
            
            const progressInterval = setInterval(() => {
                if (progress < 45) {
                    progress += 3;
                    this.updateProgress(progress, `正在录制音频... ${Math.round((progress-10)/35 * 100)}%`);
                }
            }, Math.max(100, duration * 15));

            mediaRecorder.onstop = async () => {
                clearInterval(progressInterval);
                try {
                    this.updateProgress(45, '录制完成，正在转换...');
                    await new Promise(resolve => setTimeout(resolve, 200));

                    const recordedBlob = new Blob(recordedChunks, { type: mimeType });
                    const arrayBuffer = await recordedBlob.arrayBuffer();
                    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

                    this.updateProgress(48, '准备编码...');
                    await new Promise(resolve => setTimeout(resolve, 150));

                    let finalBlob;
                    switch (this.audioFormat) {
                        case 'mp3':
                            finalBlob = await this.encodeToMP3(audioBuffer, bitrate);
                            break;
                        case 'wav':
                            finalBlob = await this.encodeToWAV(audioBuffer);
                            break;
                        case 'aac':
                            finalBlob = await this.encodeToAAC(audioBuffer, bitrate);
                            break;
                        case 'flac':
                            finalBlob = await this.encodeToFLAC(audioBuffer);
                            break;
                        default:
                            finalBlob = await this.encodeToWAV(audioBuffer);
                    }

                    this.displayResult(finalBlob, audioBuffer);

                    // 彻底清理资源
                    try {
                        sourceNode.disconnect();
                    } catch (e) {}
                    this.cleanupResources();
                    
                    resolve();
                } catch (err) {
                    // 清理资源
                    try {
                        if (sourceNode) sourceNode.disconnect();
                    } catch (e) {}
                    this.cleanupResources();
                    
                    reject(new Error('转换失败: ' + err.message));
                }
            };

            mediaRecorder.onerror = (e) => {
                clearInterval(progressInterval);
                // 清理资源
                try {
                    if (sourceNode) sourceNode.disconnect();
                } catch (error) {}
                this.cleanupResources();
                
                reject(new Error('录制失败: ' + e.error.message));
            };

            // 开始录制
            try {
                mediaRecorder.start();
                video.play();
                console.log('录制开始');
            } catch (error) {
                console.error('启动录制失败:', error);
                clearInterval(progressInterval);
                // 清理资源
                try {
                    if (sourceNode) sourceNode.disconnect();
                } catch (e) {}
                this.cleanupResources();
                
                reject(new Error('无法开始录制: ' + error.message));
                return;
            }

            video.onended = () => {
                if (mediaRecorder.state !== 'inactive') {
                    console.log('视频结束，停止录制');
                    mediaRecorder.stop();
                }
            };

            setTimeout(() => {
                if (mediaRecorder.state !== 'inactive') {
                    console.log('超时，强制停止录制');
                    mediaRecorder.stop();
                }
            }, maxRecordTime);
        });
    }

    displayResult(finalBlob, audioBuffer) {
        const audioUrl = URL.createObjectURL(finalBlob);
        this.audioPlayer.src = audioUrl;
        this.downloadBtn.href = audioUrl;
        
        let ext = this.audioFormat;
        
        // 根据格式和质量生成文件名后缀
        let qualitySuffix = '';
        if (this.audioFormat === 'mp3') {
            switch(this.audioQuality) {
                case 'ultra-low':
                    qualitySuffix = '_ultra-low';
                    break;
                case 'low':
                    qualitySuffix = '_low';
                    break;
                case 'medium':
                    qualitySuffix = '_medium';
                    break;
                case 'high':
                    qualitySuffix = '_high';
                    break;
            }
        } else if (this.audioFormat === 'aac') {
            // AAC只有高质量选项
            qualitySuffix = '_high';
        }
        
        // 生成更友好的文件名
        const baseName = this.selectedFile.name.replace(/\.[^/.]+$/, "");
        this.downloadBtn.download = `${baseName}_audio${qualitySuffix}.${ext}`;
        this.downloadBtn.textContent = `下载${this.audioFormat.toUpperCase()} (${(finalBlob.size / (1024 * 1024)).toFixed(1)}MB)`;

        // PC端显示成功信息
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (!isMobile) {
            this.showStatus(`音频提取成功！文件大小 ${(finalBlob.size / (1024 * 1024)).toFixed(1)}MB`, 'success');
        }

        setTimeout(() => {
            this.progressContainer.classList.remove('show');
            this.resultContainer.classList.add('show');
            this.extractBtn.classList.remove('loading');
            this.extractBtn.disabled = false;
            this.resetBtn.style.display = 'flex';
        }, 500);
    }

    async encodeToAAC(audioBuffer, bitrate) {
        // AAC编码模拟进度：50% → 90%
        this.updateProgress(50, "开始AAC编码...");
        await new Promise(resolve => setTimeout(resolve, 200));

        this.updateProgress(60, "准备AAC编码器...");
        await new Promise(resolve => setTimeout(resolve, 150));

        this.updateProgress(70, "编码AAC数据...");
        await new Promise(resolve => setTimeout(resolve, 200));

        this.updateProgress(80, "处理AAC帧...");
        await new Promise(resolve => setTimeout(resolve, 200));

        this.updateProgress(90, "完成AAC编码...");
        await new Promise(resolve => setTimeout(resolve, 150));

        // 注意：浏览器原生不支持AAC编码，这里使用MediaRecorder录制来获得AAC格式
        // 创建临时的在线音频上下文来录制
        const tempContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 创建离线渲染上下文来处理音频数据
        const offlineContext = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start();

        const renderedBuffer = await offlineContext.startRendering();

        // 创建临时音频元素用于播放
        const tempAudio = document.createElement('audio');
        tempAudio.muted = true;
        tempAudio.style.display = 'none';
        document.body.appendChild(tempAudio);

        // 将渲染后的音频数据转换为Blob URL
        const wavBuffer = this.audioBufferToWav(renderedBuffer);
        const tempBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        const tempUrl = URL.createObjectURL(tempBlob);
        tempAudio.src = tempUrl;

        // 等待音频加载
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                tempAudio.remove();
                URL.revokeObjectURL(tempUrl);
                tempContext.close();
                reject(new Error('音频加载超时'));
            }, 10000);
            
            tempAudio.addEventListener('loadeddata', () => {
                clearTimeout(timeout);
                resolve();
            }, { once: true });
            
            tempAudio.addEventListener('error', () => {
                clearTimeout(timeout);
                tempAudio.remove();
                URL.revokeObjectURL(tempUrl);
                tempContext.close();
                reject(new Error('音频加载失败'));
            }, { once: true });
        });

        // 创建音频源节点
        const sourceNode = tempContext.createMediaElementSource(tempAudio);
        const destination = tempContext.createMediaStreamDestination();
        sourceNode.connect(destination);
        sourceNode.connect(tempContext.destination);

        return new Promise((resolve, reject) => {
            const chunks = [];
            let mimeType = '';
            
            // 检查支持的AAC格式
            if (MediaRecorder.isTypeSupported('audio/mp4; codecs="aac"')) {
                mimeType = 'audio/mp4; codecs="aac"';
            } else if (MediaRecorder.isTypeSupported('audio/aac')) {
                mimeType = 'audio/aac';
            } else {
                // 如果不支持AAC，回退到MP3并提示
                this.showStatus('浏览器不支持AAC编码，已自动转为MP3格式', 'warning');
                tempContext.close();
                tempAudio.remove();
                URL.revokeObjectURL(tempUrl);
                this.encodeToMP3(audioBuffer, bitrate).then(resolve).catch(reject);
                return;
            }

            const recorder = new MediaRecorder(destination.stream, {
                mimeType: mimeType,
                audioBitsPerSecond: bitrate * 1000
            });

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: mimeType });
                tempContext.close();
                tempAudio.remove();
                URL.revokeObjectURL(tempUrl);
                this.updateProgress(100, "AAC编码完成");
                resolve(blob);
            };

            recorder.onerror = (e) => {
                tempContext.close();
                tempAudio.remove();
                URL.revokeObjectURL(tempUrl);
                reject(new Error('AAC录制失败: ' + e.error.message));
            };

            // 开始录制并播放
            recorder.start();
            tempAudio.play();

            // 在音频播放结束后停止录制
            tempAudio.addEventListener('ended', () => {
                if (recorder.state !== 'inactive') {
                    recorder.stop();
                }
            }, { once: true });

            // 设置超时保护
            setTimeout(() => {
                if (recorder.state !== 'inactive') {
                    recorder.stop();
                }
            }, (tempAudio.duration + 5) * 1000);
        });
    }

    async encodeToFLAC(audioBuffer) {
        // FLAC编码模拟进度：50% → 90%
        this.updateProgress(50, "开始FLAC编码...");
        await new Promise(resolve => setTimeout(resolve, 200));

        this.updateProgress(60, "初始化FLAC编码器...");
        await new Promise(resolve => setTimeout(resolve, 150));

        this.updateProgress(70, "编码无损音频数据...");
        await new Promise(resolve => setTimeout(resolve, 250));

        this.updateProgress(80, "压缩音频帧...");
        await new Promise(resolve => setTimeout(resolve, 200));

        this.updateProgress(90, "完成FLAC编码...");
        await new Promise(resolve => setTimeout(resolve, 150));

        // 注意：浏览器原生不支持FLAC编码，这里使用WAV作为无损替代方案
        // 并提示用户FLAC需要额外的库支持
        this.showStatus('浏览器原生不支持FLAC，已提供WAV无损格式作为替代', 'warning');
        
        const wavBuffer = this.audioBufferToWav(audioBuffer);
        this.updateProgress(100, "编码完成");
        
        return new Blob([wavBuffer], { type: 'audio/wav' });
    }

    getBitrate() {
        switch (this.audioQuality) {
            case 'ultra-low':
                return 320; // 320 kbps
            case 'high':
                return 192; // 192 kbps
            case 'medium':
                return 128; // 128 kbps
            case 'low':
                return 64; // 64 kbps
            default:
                return 128;
        }
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    async encodeToMP3(audioBuffer, bitrate) {
        if (typeof lamejs === 'undefined') {
            throw new Error('lamejs库未加载，无法编码MP3');
        }

        const mp3encoder = new lamejs.Mp3Encoder(2, audioBuffer.sampleRate, bitrate);
        const mp3Data = [];

        const leftChannel = audioBuffer.getChannelData(0);
        const rightChannel = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;

        const sampleBlockSize = 1152;
        const left = new Int16Array(leftChannel.length);
        const right = new Int16Array(rightChannel.length);

        for (let i = 0; i < leftChannel.length; i++) {
            left[i] = Math.max(-1, Math.min(1, leftChannel[i])) * 32767;
            right[i] = Math.max(-1, Math.min(1, rightChannel[i])) * 32767;
        }

        const totalChunks = Math.ceil(left.length / sampleBlockSize);
        let processedChunks = 0;

        // 逐块实时更新进度
        for (let i = 0; i < left.length; i += sampleBlockSize) {
            const leftChunk = left.subarray(i, i + sampleBlockSize);
            const rightChunk = right.subarray(i, i + sampleBlockSize);
            const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }

            processedChunks++;
            
            // 模拟 MP3 逐块实时更新：54% → 94%
            const progress = 54 + (processedChunks / totalChunks) * 40;
            const progressRatio = `${processedChunks}/${totalChunks}`;
            this.updateProgress(progress, `编码中 (MP3 ${bitrate}kbps) ${progressRatio}...`);

            // 每 100 块更新一次，避免过快
            if (processedChunks % 100 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        // 最后 98% → 100%
        this.updateProgress(98, "完成最后处理...");
        await new Promise(resolve => setTimeout(resolve, 100));

        const end = mp3encoder.flush();
        if (end.length > 0) {
            mp3Data.push(end);
        }

        this.updateProgress(100, "编码完成");

        return new Blob(mp3Data, { type: 'audio/mp3' });
    }

    async encodeToWAV(audioBuffer) {
        // WAV 模拟进度：50% → 90%
        this.updateProgress(50, "开始WAV编码...");
        await new Promise(resolve => setTimeout(resolve, 200));

        this.updateProgress(60, "写入WAV头信息...");
        await new Promise(resolve => setTimeout(resolve, 100));

        this.updateProgress(70, "编码音频数据...");
        await new Promise(resolve => setTimeout(resolve, 150));

        this.updateProgress(80, "处理音频样本...");
        await new Promise(resolve => setTimeout(resolve, 150));

        this.updateProgress(90, "完成WAV编码...");
        await new Promise(resolve => setTimeout(resolve, 100));

        const wavBuffer = this.audioBufferToWav(audioBuffer);
        
        // 最后 98% → 100%
        this.updateProgress(98, "完成最后处理...");
        await new Promise(resolve => setTimeout(resolve, 100));

        this.updateProgress(100, "编码完成");

        return new Blob([wavBuffer], { type: 'audio/wav' });
    }

    audioBufferToWav(buffer) {
        const length = buffer.length * buffer.numberOfChannels * 2 + 44;
        const arrayBuffer = new ArrayBuffer(length);
        const view = new DataView(arrayBuffer);
        const channels = [];
        let offset = 0;
        let pos = 0;

        const setUint16 = (data) => { view.setUint16(pos, data, true); pos += 2; };
        const setUint32 = (data) => { view.setUint32(pos, data, true); pos += 4; };

        setUint32(0x46464952);
        setUint32(length - 8);
        setUint32(0x45564157);
        setUint32(0x20746d66);
        setUint32(16);
        setUint16(1);
        setUint16(buffer.numberOfChannels);
        setUint32(buffer.sampleRate);
        setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
        setUint16(buffer.numberOfChannels * 2);
        setUint16(16);
        setUint32(0x61746164);
        setUint32(length - pos - 4);

        for (let i = 0; i < buffer.numberOfChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }

        while (pos < length) {
            for (let i = 0; i < buffer.numberOfChannels; i++) {
                let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }

        return arrayBuffer;
    }

    reset() {
        this.fileInput.value = '';
        this.selectedFile = null;
        this.forceRecordingMode = false;
        this.confirmationShown = false;
        this.filename.classList.remove('show');
        this.extractBtn.disabled = false;
        this.fileWrapper.classList.remove('active');
        this.fileText.textContent = '点击选择视频文件';
        this.fileText.style.color = 'var(--text-secondary)';
        this.resultContainer.classList.remove('show');
        this.resetBtn.style.display = 'none';
        this.progressFill.style.width = '0%';
        this.progressFill.style.background = 'var(--primary)';
        this.progressDescription.textContent = '准备中...';
        this.progressPercentage.textContent = '0%';
        this.recordingBadge.style.display = 'none';
        
        // 重置选择器到默认值
        this.selectFormat('mp3');
        this.selectQuality('medium');
        
        this.hideStatus();

        // 统一清理资源
        this.cleanupResources();
    }

}

document.addEventListener('DOMContentLoaded', () => {
    new DirectAudioExtractor();
});
