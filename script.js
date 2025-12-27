class AudioExtractor {
    constructor() {
        this.selectedFile = null;
        this.audioFormat = 'mp3'; // mp3, wav, aac, flac
        this.audioQuality = 'medium'; // ultra-low, high, medium, low
        this.ffmpeg = null;
        
        // 剪辑相关属性
        this.audioBuffer = null;
        this.waveformData = null;
        this.selectionStart = 0;
        this.selectionEnd = 0;
        this.isSelecting = false;
        this.audioContext = null;
        
        this.initElements();
        this.initEventListeners();
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
        this.progressDescription = document.getElementById('progressDescription');
        this.progressPercentage = document.getElementById('progressPercentage');
        // 移除旧的选择器引用，使用弹窗版本
        this.qualitySelector = document.querySelector('.quality-selector');
        this.modeIndicator = document.getElementById('modeIndicator');
        this.modeText = document.getElementById('modeText');
        this.isExtracted = false;
        
        // 剪辑相关元素
        this.clipSelector = document.getElementById('clipSelector');
        this.startTimeInput = document.getElementById('startTime');
        this.endTimeInput = document.getElementById('endTime');
        this.waveformContainer = document.getElementById('waveformContainer');
        this.waveformCanvas = document.getElementById('waveformCanvas');
        this.playSelectionBtn = document.getElementById('playSelectionBtn');
        this.resetSelectionBtn = document.getElementById('resetSelectionBtn');
        
        // 音频加载进度条元素
        this.audioLoadingProgress = document.getElementById('audioLoadingProgress');
        this.audioProgressFill = document.getElementById('audioProgressFill');
        this.audioProgressDescription = document.getElementById('audioProgressDescription');
        this.audioProgressPercentage = document.getElementById('audioProgressPercentage');
        
        this.waveformCtx = null;
        this.isPlayingSelection = false; // 跟踪播放状态
    }

    initEventListeners() {
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.fileWrapper.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.fileWrapper.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.fileWrapper.addEventListener('drop', (e) => this.handleDrop(e));
        this.extractBtn.addEventListener('click', () => this.extractAudio());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // 剪辑相关事件
        this.startTimeInput.addEventListener('input', () => this.validateTimeInputs());
        this.endTimeInput.addEventListener('input', () => this.validateTimeInputs());
        this.startTimeInput.addEventListener('blur', () => this.formatTimeInput(this.startTimeInput));
        this.endTimeInput.addEventListener('blur', () => this.formatTimeInput(this.endTimeInput));
        
        // 波形相关事件 - 支持鼠标和触摸
        this.waveformCanvas.addEventListener('mousedown', (e) => this.handleWaveformMouseDown(e));
        this.waveformCanvas.addEventListener('mousemove', (e) => this.handleWaveformMouseMove(e));
        this.waveformCanvas.addEventListener('mouseup', (e) => this.handleWaveformMouseUp(e));
        this.waveformCanvas.addEventListener('mouseleave', (e) => this.handleWaveformMouseUp(e));
        
        // 触摸事件支持（移动端）
        this.waveformCanvas.addEventListener('touchstart', (e) => this.handleWaveformTouchStart(e));
        this.waveformCanvas.addEventListener('touchmove', (e) => this.handleWaveformTouchMove(e));
        this.waveformCanvas.addEventListener('touchend', (e) => this.handleWaveformTouchEnd(e));
        this.waveformCanvas.addEventListener('touchcancel', (e) => this.handleWaveformTouchEnd(e));
        
        this.playSelectionBtn.addEventListener('click', () => this.playSelection());
        this.resetSelectionBtn.addEventListener('click', () => this.resetSelection());
        
        // 初始化弹窗
        this.initModals();
    }

    // 弹窗相关方法
    initModals() {
        // 格式弹窗元素
        this.formatModal = document.getElementById('formatModal');
        this.formatSelectBtn = document.getElementById('formatSelectBtn');
        this.formatDisplay = document.getElementById('formatDisplay');
        this.formatHint = document.getElementById('formatHint');
        this.cancelFormatBtn = document.getElementById('cancelFormatBtn');
        this.formatModalList = document.getElementById('formatModalList');

        // 质量弹窗元素
        this.qualityModal = document.getElementById('qualityModal');
        this.qualitySelectBtn = document.getElementById('qualitySelectBtn');
        this.qualityDisplay = document.getElementById('qualityDisplay');
        this.qualityHint = document.getElementById('qualityHint');
        this.cancelQualityBtn = document.getElementById('cancelQualityBtn');
        this.qualityModalList = document.getElementById('qualityModalList');

        // 绑定事件
        this.formatSelectBtn.addEventListener('click', () => this.showFormatModal());
        this.cancelFormatBtn.addEventListener('click', () => this.hideFormatModal());
        this.formatModal.addEventListener('click', (e) => {
            if (e.target === this.formatModal) this.hideFormatModal();
        });

        this.qualitySelectBtn.addEventListener('click', () => this.showQualityModal());
        this.cancelQualityBtn.addEventListener('click', () => this.hideQualityModal());
        this.qualityModal.addEventListener('click', (e) => {
            if (e.target === this.qualityModal) this.hideQualityModal();
        });

        // 格式列表项点击
        this.formatModalList.addEventListener('click', (e) => {
            const item = e.target.closest('.modal-item');
            if (item) {
                const format = item.dataset.format;
                const hint = item.dataset.hint;
                this.selectFormat(format, hint);
                this.hideFormatModal();
            }
        });

        // 质量列表项点击
        this.qualityModalList.addEventListener('click', (e) => {
            const item = e.target.closest('.modal-item');
            if (item) {
                const quality = item.dataset.quality;
                const hint = item.dataset.hint;
                this.selectQuality(quality, hint);
                this.hideQualityModal();
            }
        });
    }

    showFormatModal() {
        this.formatModal.classList.add('show');
        this.updateFormatModalSelection();
    }

    hideFormatModal() {
        this.formatModal.classList.remove('show');
    }

    showQualityModal() {
        this.qualityModal.classList.add('show');
        this.updateQualityModalSelection();
    }

    hideQualityModal() {
        this.qualityModal.classList.remove('show');
    }

    updateFormatModalSelection() {
        const items = this.formatModalList.querySelectorAll('.modal-item');
        items.forEach(item => {
            if (item.dataset.format === this.audioFormat) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    updateQualityModalSelection() {
        const items = this.qualityModalList.querySelectorAll('.modal-item');
        items.forEach(item => {
            if (item.dataset.quality === this.audioQuality) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    selectFormat(format, hint) {
        this.audioFormat = format;
        this.formatDisplay.textContent = format.toUpperCase();
        
        // 更新提示文本（在按钮外部）
        if (this.formatHint) {
            this.formatHint.textContent = hint;
        }
        
        this.updateQualitySelector();
        this.updateExtractButtonText();
        
        if (this.isExtracted) {
            this.resetExtractState();
            this.showStatus('输出格式已更改，请重新提取音频', 'info');
        }
    }

    selectQuality(quality, hint) {
        this.audioQuality = quality;
        
        // 根据quality值显示对应的文本
        let qualityText = '';
        switch(quality) {
            case 'ultra-low':
                qualityText = '超高质量 (320kbps)';
                break;
            case 'high':
                qualityText = '高质量 (192kbps)';
                break;
            case 'medium':
                qualityText = '中质量 (128kbps)';
                break;
            case 'low':
                qualityText = '低质量 (64kbps)';
                break;
        }
        
        this.qualityDisplay.textContent = qualityText;
        
        // 更新提示文本（在按钮外部）
        if (this.qualityHint) {
            this.qualityHint.textContent = hint || '适合大多数用途';
        }
        
        if (this.isExtracted) {
            this.resetExtractState();
            this.showStatus('音频质量已更改，请重新提取音频', 'info');
        }
    }

    updateQualitySelector() {
        // 检查当前格式是否为无损格式
        if (this.audioFormat === 'wav' || this.audioFormat === 'flac') {
            // 禁用质量选择按钮
            if (this.qualitySelectBtn) {
                this.qualitySelectBtn.disabled = true;
                this.qualitySelectBtn.style.opacity = '0.5';
                this.qualitySelectBtn.style.cursor = 'not-allowed';
            }
            
            // 更新质量显示
            if (this.qualityDisplay) {
                this.qualityDisplay.textContent = '无损质量';
            }
            
            // 更新提示文本（在按钮外部）
            if (this.qualityHint) {
                this.qualityHint.textContent = '无损格式固定';
            }
            
            this.showStatus(`${this.audioFormat.toUpperCase()}为无损格式，质量选择对其无效`, 'warning');
        } else {
            // 启用质量选择按钮
            if (this.qualitySelectBtn) {
                this.qualitySelectBtn.disabled = false;
                this.qualitySelectBtn.style.opacity = '1';
                this.qualitySelectBtn.style.cursor = 'pointer';
            }
            
            // 恢复正常的质量显示
            this.updateQualityDisplay();
            
            // 更新提示文本（在按钮外部）
            if (this.qualityHint) {
                this.qualityHint.textContent = '适合大多数用途';
            }
            
            this.hideStatus();
        }
    }

    updateQualityDisplay() {
        if (!this.qualityDisplay) return;
        
        let qualityText = '';
        switch(this.audioQuality) {
            case 'ultra-low':
                qualityText = '超高质量 (320kbps)';
                break;
            case 'high':
                qualityText = '高质量 (192kbps)';
                break;
            case 'medium':
                qualityText = '中质量 (128kbps)';
                break;
            case 'low':
                qualityText = '低质量 (64kbps)';
                break;
        }
        
        this.qualityDisplay.textContent = qualityText;
    }

    updateExtractButtonText() {
        const formatText = this.audioFormat.toUpperCase();
        this.extractBtn.querySelector('span').textContent = `提取${formatText}`;
    }

    showStatus(message, type = 'info') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message show ${type}`;
    }

    hideStatus() {
        this.statusMessage.classList.remove('show');
    }

    showModeIndicator() {
        this.modeText.textContent = 'FFmpeg.wasm 主模式';
        this.modeIndicator.classList.add('show');
    }

    hideModeIndicator() {
        this.modeIndicator.classList.remove('show');
    }

    handleDragOver(e) {
        e.preventDefault();
        this.fileWrapper.style.borderColor = 'var(--primary)';
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.fileWrapper.style.borderColor = this.fileWrapper.classList.contains('active') ? 'var(--primary)' : '#d1d1d6';
    }

    handleFileSelect(e) {
        if (e.target.files && e.target.files[0]) {
            this.selectedFile = e.target.files[0];
            
            // 显示文件名
            this.filename.textContent = `已选择: ${this.selectedFile.name}`;
            this.filename.classList.add('show');
            
            // 更新文件选择区域状态
            this.fileWrapper.classList.add('active');
            this.fileText.textContent = '文件已选择';
            this.fileText.style.color = 'var(--primary)';
            
            // 立即显示"正在加载音频数据..."
            this.showStatus('正在加载音频数据...', 'info');
            this.waveformCanvas.style.display = 'none';
            
            // 稍微延迟后执行验证和加载
            setTimeout(() => {
                this.validateAndShowFile();
            }, 100);
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

    validateAndShowFile() {
        // 隐藏音频加载进度条（只保留文字提示）
        this.audioLoadingProgress.style.display = 'none';
        this.waveformCanvas.style.display = 'none';
        
        // 加载音频用于波形显示和剪辑
        this.loadAudioForWaveform();
        
        if (this.isExtracted) {
            this.resetExtractState();
        }
    }

    async loadAudioForWaveform() {
        try {
            // 隐藏音频加载进度条（只保留文字提示）
            this.audioLoadingProgress.style.display = 'none';
            this.waveformCanvas.style.display = 'none'; // 暂时隐藏波形画布
            this.waveformCanvas.classList.add('loading');
            
            // 创建音频上下文
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // 读取文件
            const arrayBuffer = await this.selectedFile.arrayBuffer();
            
            // 解码音频数据
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // 生成波形数据
            this.generateWaveformData();
            
            // 显示波形容器
            this.waveformContainer.style.display = 'flex';
            this.clipSelector.style.display = 'flex';
            
            // 设置默认全选整个音频
            const duration = this.audioBuffer.duration;
            this.selectionStart = 0;
            this.selectionEnd = duration;
            this.startTimeInput.value = '00:00:00';
            this.endTimeInput.value = this.formatTime(duration);
            
            // 显示波形画布并移除加载状态
            this.waveformCanvas.style.display = 'block';
            this.waveformCanvas.classList.remove('loading');
            this.waveformCanvas.classList.add('loaded');
            
            // 绘制波形
            this.drawWaveform();
            
            // 更新提取按钮文本
            this.updateExtractButtonText();
            
            // 启用提取按钮
            this.extractBtn.disabled = false;
            
            // 显示成功状态
            this.showStatus('音频加载完成，已默认全选整个音频', 'success');
            
        } catch (error) {
            console.error('加载音频失败:', error);
            
            // 显示错误状态
            this.showStatus('音频加载失败，但仍然可以提取完整音频', 'warning');
            
            // 即使波形加载失败，也要启用提取按钮（用于基本提取功能）
            this.extractBtn.disabled = false;
            
            // 隐藏剪辑相关UI
            this.waveformContainer.style.display = 'none';
            this.clipSelector.style.display = 'none';
        }
    }

    generateWaveformData() {
        const rawData = this.audioBuffer.getChannelData(0); // 获取左声道
        const samples = 200; // 波形采样点数
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];
        
        for (let i = 0; i < samples; i++) {
            let blockStart = blockSize * i;
            let sum = 0;
            let count = 0;
            
            for (let j = 0; j < blockSize; j++) {
                sum += Math.abs(rawData[blockStart + j]);
                count++;
            }
            
            filteredData.push(sum / count);
        }
        
        // 归一化
        const multiplier = Math.pow(Math.max(...filteredData), -1);
        this.waveformData = filteredData.map(n => n * multiplier);
    }

    drawWaveform() {
        if (!this.waveformData || !this.waveformCanvas) return;
        
        const canvas = this.waveformCanvas;
        const ctx = canvas.getContext('2d');
        this.waveformCtx = ctx;
        
        // 设置canvas尺寸
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        const width = rect.width;
        const height = rect.height;
        const centerY = height / 2;
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制波形背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制波形
        const barWidth = width / this.waveformData.length;
        ctx.fillStyle = 'rgba(0, 122, 255, 0.6)';
        
        this.waveformData.forEach((value, index) => {
            const barHeight = value * height * 0.8;
            const x = index * barWidth;
            const y = centerY - barHeight / 2;
            
            ctx.fillRect(x, y, barWidth - 1, barHeight);
        });
        
        // 绘制选择区域
        if (this.selectionStart > 0 || this.selectionEnd > 0) {
            const startX = (this.selectionStart / this.audioBuffer.duration) * width;
            const endX = (this.selectionEnd / this.audioBuffer.duration) * width;
            
            // 半透明覆盖层
            ctx.fillStyle = 'rgba(0, 122, 255, 0.2)';
            ctx.fillRect(startX, 0, endX - startX, height);
            
            // 检查是否正在调整边界（鼠标悬停或拖拽）
            const isAdjusting = this.isSelecting === 'start' || this.isSelecting === 'end';
            
            // 绘制选择边界线 - 更粗更明显
            // 左边界（开始时间）
            ctx.strokeStyle = isAdjusting && this.isSelecting === 'start' ? '#ff6b6b' : '#007aff';
            ctx.lineWidth = 4; // 更粗的线
            ctx.beginPath();
            ctx.moveTo(startX, 0);
            ctx.lineTo(startX, height);
            ctx.stroke();
            
            // 右边界（结束时间）
            ctx.strokeStyle = isAdjusting && this.isSelecting === 'end' ? '#ff6b6b' : '#007aff';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(endX, 0);
            ctx.lineTo(endX, height);
            ctx.stroke();
            
            // 添加边界手柄圆点
            const handleRadius = 6;
            ctx.fillStyle = isAdjusting && this.isSelecting === 'start' ? '#ff6b6b' : '#007aff';
            ctx.beginPath();
            ctx.arc(startX, height / 2, handleRadius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = isAdjusting && this.isSelecting === 'end' ? '#ff6b6b' : '#007aff';
            ctx.beginPath();
            ctx.arc(endX, height / 2, handleRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // 添加边界高亮光晕效果
            if (isAdjusting) {
                ctx.shadowColor = this.isSelecting === 'start' ? '#ff6b6b' : '#007aff';
                ctx.shadowBlur = 10;
                ctx.lineWidth = 6;
                
                if (this.isSelecting === 'start') {
                    ctx.strokeStyle = '#ff6b6b';
                    ctx.beginPath();
                    ctx.moveTo(startX, 0);
                    ctx.lineTo(startX, height);
                    ctx.stroke();
                } else {
                    ctx.strokeStyle = '#007aff';
                    ctx.beginPath();
                    ctx.moveTo(endX, 0);
                    ctx.lineTo(endX, height);
                    ctx.stroke();
                }
                
                // 重置阴影
                ctx.shadowBlur = 0;
            }
            
            // 显示选择按钮
            this.playSelectionBtn.style.display = 'block';
            this.resetSelectionBtn.style.display = 'block';
        } else {
            this.playSelectionBtn.style.display = 'none';
            this.resetSelectionBtn.style.display = 'none';
        }
    }

    handleWaveformMouseDown(e) {
        if (!this.audioBuffer) return;
        
        const rect = this.waveformCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = (x / rect.width) * this.audioBuffer.duration;
        
        // 检查是否点击在边界附近（用于调整边界）
        const startX = (this.selectionStart / this.audioBuffer.duration) * rect.width;
        const endX = (this.selectionEnd / this.audioBuffer.duration) * rect.width;
        const threshold = 12; // 边界检测阈值（像素）- 增加到12让更容易点击
        
        if (Math.abs(x - startX) < threshold) {
            // 点击在开始边界附近，调整开始时间
            this.isSelecting = 'start';
            this.waveformCanvas.classList.add('dragging');
        } else if (Math.abs(x - endX) < threshold) {
            // 点击在结束边界附近，调整结束时间
            this.isSelecting = 'end';
            this.waveformCanvas.classList.add('dragging');
        } else if (time >= this.selectionStart && time <= this.selectionEnd) {
            // 点击在选择区域内，开始新的选择
            this.isSelecting = 'new';
            this.selectionStart = time;
            this.selectionEnd = time;
            this.waveformCanvas.classList.add('dragging');
        } else {
            // 点击在选择区域外，开始新的选择
            this.isSelecting = 'new';
            this.selectionStart = time;
            this.selectionEnd = time;
            this.waveformCanvas.classList.add('dragging');
        }
        
        this.updateTimeInputs();
        this.drawWaveform();
    }

    handleWaveformMouseMove(e) {
        const rect = this.waveformCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        if (!this.isSelecting && this.audioBuffer) {
            // 鼠标悬停检测 - 改变光标样式
            const startX = (this.selectionStart / this.audioBuffer.duration) * rect.width;
            const endX = (this.selectionEnd / this.audioBuffer.duration) * rect.width;
            const threshold = 12; // 与mousedown一致
            
            if (Math.abs(x - startX) < threshold || Math.abs(x - endX) < threshold) {
                this.waveformCanvas.style.cursor = 'ew-resize';
                // 触发重绘以显示悬停效果
                this.drawWaveformWithHover(x, rect.width);
            } else {
                // 检查是否在选择区域内
                const time = (x / rect.width) * this.audioBuffer.duration;
                if (time >= this.selectionStart && time <= this.selectionEnd) {
                    this.waveformCanvas.style.cursor = 'move';
                } else {
                    this.waveformCanvas.style.cursor = 'crosshair';
                }
            }
            return;
        }
        
        if (!this.isSelecting || !this.audioBuffer) return;
        
        const time = Math.max(0, Math.min(this.audioBuffer.duration, (x / rect.width) * this.audioBuffer.duration));
        
        if (this.isSelecting === 'start') {
            // 调整开始时间（不能超过结束时间）
            this.selectionStart = Math.min(time, this.selectionEnd - 0.1);
        } else if (this.isSelecting === 'end') {
            // 调整结束时间（不能小于开始时间）
            this.selectionEnd = Math.max(time, this.selectionStart + 0.1);
        } else if (this.isSelecting === 'new') {
            // 新的选择
            if (time < this.selectionStart) {
                this.selectionEnd = this.selectionStart;
                this.selectionStart = time;
            } else {
                this.selectionEnd = time;
            }
        }
        
        this.updateTimeInputs();
        this.drawWaveform();
    }

    handleWaveformMouseUp(e) {
        if (!this.isSelecting) return;
        
        // 移除拖拽样式
        this.waveformCanvas.classList.remove('dragging');
        
        // 如果是新选择且范围太小，重置选择
        if (this.isSelecting === 'new' && Math.abs(this.selectionEnd - this.selectionStart) < 0.1) {
            this.selectionStart = 0;
            this.selectionEnd = this.audioBuffer ? this.audioBuffer.duration : 0;
        }
        
        this.isSelecting = false;
        this.updateTimeInputs();
        this.drawWaveform();
    }

    // 触摸事件处理 - 移动端支持
    handleWaveformTouchStart(e) {
        e.preventDefault(); // 防止页面滚动
        
        if (!this.audioBuffer) return;
        
        // 检测是否为移动设备，调整阈值
        const isMobile = this.isMobileDevice();
        const threshold = isMobile ? 20 : 15; // 移动端使用更大的阈值
        
        // 获取触摸位置
        const touch = e.touches[0];
        const rect = this.waveformCanvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const time = (x / rect.width) * this.audioBuffer.duration;
        
        // 检查是否触摸在边界附近（用于调整边界）
        const startX = (this.selectionStart / this.audioBuffer.duration) * rect.width;
        const endX = (this.selectionEnd / this.audioBuffer.duration) * rect.width;
        
        // 显示触摸反馈（移动端）
        if (isMobile) {
            this.showTouchFeedback(touch.clientX, touch.clientY);
        }
        
        if (Math.abs(x - startX) < threshold) {
            // 触摸在开始边界附近，调整开始时间
            this.isSelecting = 'start';
            this.waveformCanvas.classList.add('dragging');
            if (isMobile) this.showStatus('拖动调整开始时间', 'info');
        } else if (Math.abs(x - endX) < threshold) {
            // 触摸在结束边界附近，调整结束时间
            this.isSelecting = 'end';
            this.waveformCanvas.classList.add('dragging');
            if (isMobile) this.showStatus('拖动调整结束时间', 'info');
        } else if (time >= this.selectionStart && time <= this.selectionEnd) {
            // 触摸在选择区域内，开始新的选择
            this.isSelecting = 'new';
            this.selectionStart = time;
            this.selectionEnd = time;
            this.waveformCanvas.classList.add('dragging');
            if (isMobile) this.showStatus('拖动创建新选择', 'info');
        } else {
            // 触摸在选择区域外，开始新的选择
            this.isSelecting = 'new';
            this.selectionStart = time;
            this.selectionEnd = time;
            this.waveformCanvas.classList.add('dragging');
            if (isMobile) this.showStatus('拖动创建新选择', 'info');
        }
        
        this.updateTimeInputs();
        this.drawWaveform();
    }

    handleWaveformTouchMove(e) {
        e.preventDefault(); // 防止页面滚动
        
        if (!this.isSelecting || !this.audioBuffer) return;
        
        const touch = e.touches[0];
        const rect = this.waveformCanvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const time = Math.max(0, Math.min(this.audioBuffer.duration, (x / rect.width) * this.audioBuffer.duration));
        
        if (this.isSelecting === 'start') {
            // 调整开始时间（不能超过结束时间）
            this.selectionStart = Math.min(time, this.selectionEnd - 0.1);
        } else if (this.isSelecting === 'end') {
            // 调整结束时间（不能小于开始时间）
            this.selectionEnd = Math.max(time, this.selectionStart + 0.1);
        } else if (this.isSelecting === 'new') {
            // 新的选择
            if (time < this.selectionStart) {
                this.selectionEnd = this.selectionStart;
                this.selectionStart = time;
            } else {
                this.selectionEnd = time;
            }
        }
        
        this.updateTimeInputs();
        this.drawWaveform();
    }

    handleWaveformTouchEnd(e) {
        e.preventDefault(); // 防止页面滚动
        
        if (!this.isSelecting) return;
        
        // 移除拖拽样式
        this.waveformCanvas.classList.remove('dragging');
        
        // 如果是新选择且范围太小，重置选择
        if (this.isSelecting === 'new' && Math.abs(this.selectionEnd - this.selectionStart) < 0.1) {
            this.selectionStart = 0;
            this.selectionEnd = this.audioBuffer ? this.audioBuffer.duration : 0;
        }
        
        this.isSelecting = false;
        this.updateTimeInputs();
        this.drawWaveform();
    }

    // 辅助方法：绘制带悬停效果的波形
    drawWaveformWithHover(mouseX, canvasWidth) {
        if (!this.waveformData || !this.waveformCanvas || !this.audioBuffer) return;
        
        const startX = (this.selectionStart / this.audioBuffer.duration) * canvasWidth;
        const endX = (this.selectionEnd / this.audioBuffer.duration) * canvasWidth;
        const threshold = 12;
        
        // 确定悬停状态
        let hoverType = null;
        if (Math.abs(mouseX - startX) < threshold) {
            hoverType = 'start';
        } else if (Math.abs(mouseX - endX) < threshold) {
            hoverType = 'end';
        }
        
        // 临时设置悬停状态用于绘制
        const originalSelecting = this.isSelecting;
        if (hoverType) {
            this.isSelecting = hoverType;
        }
        
        this.drawWaveform();
        
        // 恢复原始状态
        this.isSelecting = originalSelecting;
    }

    // 检测是否为移动设备
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (window.innerWidth <= 768) ||
               (window.matchMedia && window.matchMedia('(hover: none)').matches);
    }

    // 显示触摸反馈
    showTouchFeedback(x, y) {
        // 创建触摸反馈元素
        if (!this.touchFeedbackElement) {
            this.touchFeedbackElement = document.createElement('div');
            this.touchFeedbackElement.className = 'touch-feedback';
            document.body.appendChild(this.touchFeedbackElement);
        }
        
        const feedback = this.touchFeedbackElement;
        feedback.style.left = (x - 20) + 'px';
        feedback.style.top = (y - 20) + 'px';
        feedback.classList.add('active');
        
        // 移除动画类
        setTimeout(() => {
            feedback.classList.remove('active');
        }, 600);
    }

    updateTimeInputs() {
        this.startTimeInput.value = this.formatTime(this.selectionStart);
        this.endTimeInput.value = this.formatTime(this.selectionEnd);
    }

    validateTimeInputs() {
        const startTime = this.parseTime(this.startTimeInput.value);
        const endTime = this.parseTime(this.endTimeInput.value);
        
        let hasError = false;
        
        if (isNaN(startTime) || startTime < 0) {
            this.startTimeInput.classList.add('error');
            hasError = true;
        } else {
            this.startTimeInput.classList.remove('error');
        }
        
        if (isNaN(endTime) || endTime < 0) {
            this.endTimeInput.classList.add('error');
            hasError = true;
        } else {
            this.endTimeInput.classList.remove('error');
        }
        
        if (!hasError && this.audioBuffer) {
            if (endTime <= startTime) {
                this.endTimeInput.classList.add('error');
                hasError = true;
            }
            
            if (startTime > this.audioBuffer.duration || endTime > this.audioBuffer.duration) {
                this.startTimeInput.classList.add('error');
                this.endTimeInput.classList.add('error');
                hasError = true;
            }
        }
        
        if (!hasError) {
            this.selectionStart = startTime;
            this.selectionEnd = endTime;
            this.drawWaveform();
        }
    }

    formatTimeInput(input) {
        const value = input.value.trim();
        if (!value) return;
        
        const time = this.parseTime(value);
        if (!isNaN(time)) {
            input.value = this.formatTime(time);
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '00:00:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    parseTime(timeString) {
        if (!timeString) return NaN;
        
        const parts = timeString.split(':').map(part => parseFloat(part));
        
        if (parts.length === 3) {
            // HH:MM:SS
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            // MM:SS
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 1) {
            // SS
            return parts[0];
        }
        
        return NaN;
    }

    playSelection() {
        if (!this.audioBuffer || this.selectionStart >= this.selectionEnd) return;
        
        // 如果正在播放，则暂停
        if (this.isPlayingSelection) {
            this.stopPlayback();
            this.isPlayingSelection = false;
            this.playSelectionBtn.textContent = '播放选中段';
            this.showStatus('已暂停播放', 'info');
            setTimeout(() => this.hideStatus(), 1000);
            return;
        }
        
        // 停止当前正在播放的音频
        this.stopPlayback();
        
        // 创建临时音频源来播放选中段
        const source = this.audioContext.createBufferSource();
        source.buffer = this.audioBuffer;
        
        // 创建增益节点控制音量
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 1.0;
        
        // 连接节点
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 保存当前播放源，以便可以停止
        this.currentPlaybackSource = source;
        
        // 播放选中段
        source.start(0, this.selectionStart, this.selectionEnd - this.selectionStart);
        
        // 更新状态和按钮文字
        this.isPlayingSelection = true;
        this.playSelectionBtn.textContent = '暂停播放';
        this.showStatus(`正在播放选中段 (${this.formatTime(this.selectionStart)} - ${this.formatTime(this.selectionEnd)})`, 'info');
        
        // 播放结束后清理
        source.onended = () => {
            if (this.currentPlaybackSource === source) {
                this.currentPlaybackSource = null;
                this.isPlayingSelection = false;
                this.playSelectionBtn.textContent = '播放选中段';
            }
            this.showStatus('播放完成', 'success');
            setTimeout(() => this.hideStatus(), 2000);
        };
    }

    stopPlayback() {
        // 停止当前正在播放的音频
        if (this.currentPlaybackSource) {
            try {
                this.currentPlaybackSource.stop();
                this.currentPlaybackSource = null;
                this.isPlayingSelection = false;
                this.playSelectionBtn.textContent = '播放选中段';
                this.showStatus('已停止播放', 'info');
                setTimeout(() => this.hideStatus(), 1000);
            } catch (e) {
                console.warn('停止播放失败:', e);
            }
        }
    }

    resetSelection() {
        // 先停止播放
        this.stopPlayback();
        
        this.selectionStart = 0;
        this.selectionEnd = 0;
        this.startTimeInput.value = '00:00:00';
        if (this.audioBuffer) {
            this.endTimeInput.value = this.formatTime(this.audioBuffer.duration);
        } else {
            this.endTimeInput.value = '00:00:00';
        }
        this.drawWaveform();
        this.showStatus('已重置选择的时间段', 'info');
    }

    resetExtractState() {
        this.isExtracted = false;
        this.extractBtn.disabled = false;
        this.downloadBtn.classList.add('disabled');
        this.downloadBtn.href = '#';
        this.downloadBtn.textContent = '下载音频';
        this.resultContainer.classList.remove('show');
    }

    updateProgress(percent, description) {
        this.progressFill.style.width = `${percent}%`;
        if (description) {
            this.progressDescription.textContent = description;
        }
        this.progressPercentage.textContent = `${Math.round(percent)}%`;
    }

    // 初始化FFmpeg（带详细进度）
    async initFFmpeg() {
        if (this.ffmpeg) return this.ffmpeg;
        
        try {
            this.showStatus('正在加载FFmpeg核心文件（约32MB）...', 'info');
            this.updateProgress(5, '准备加载FFmpeg...');
            
            // 动态导入FFmpeg库
            this.updateProgress(10, '正在导入FFmpeg库...');
            const { FFmpeg } = await import('@ffmpeg/ffmpeg');
            const { toBlobURL } = await import('@ffmpeg/util');
            
            this.updateProgress(15, '创建FFmpeg实例...');
            this.ffmpeg = new FFmpeg();

            // 监听进度
            this.ffmpeg.on('progress', (progress) => {
                const percent = Math.round(progress.progress * 100);
                this.updateProgress(percent, `FFmpeg处理中: ${percent}%`);
            });

            // 监听日志
            this.ffmpeg.on('log', ({ message }) => {
                console.log('FFmpeg log:', message);
            });

            // 使用官方CDN源 - 修复版本和路径
            const CDN_SOURCES = [
                'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
            ];
            
            this.updateProgress(20, '正在从CDN下载FFmpeg核心文件...');
            
            // 尝试加载CDN文件
            let coreUrl, wasmUrl;
            
            // 直接使用ESM路径
            coreUrl = `${CDN_SOURCES[0]}/ffmpeg-core.js`;
            wasmUrl = `${CDN_SOURCES[0]}/ffmpeg-core.wasm`;
            
            console.log(`尝试加载FFmpeg核心文件: ${coreUrl}`);
            this.updateProgress(25, `正在从 ${coreUrl} 加载核心文件...`);
            
            // 预检查URL是否可访问
            try {
                const testResponse = await fetch(coreUrl, { method: 'HEAD' });
                if (!testResponse.ok) {
                    throw new Error(`HTTP ${testResponse.status}`);
                }
                console.log(`CDN源 ${CDN_SOURCES[0]} 可访问`);
            } catch (e) {
                console.error(`CDN源 ${CDN_SOURCES[0]} 不可用:`, e);
                throw new Error(`CDN文件无法访问: ${e.message}. 请检查网络连接或CDN地址是否正确`);
            }
            
            this.updateProgress(25, `正在从 ${coreUrl} 加载核心文件...`);
            
            this.updateProgress(30, '正在加载核心JS文件...');
            let coreURL;
            try {
                console.log(`正在加载: ${coreUrl}`);
                coreURL = await toBlobURL(coreUrl, "text/javascript");
                console.log('核心JS文件加载成功');
            } catch (e) {
                console.error('核心JS加载失败:', e);
                throw new Error(`无法从CDN加载 ffmpeg-core.js: ${e.message}. 请检查网络连接或尝试刷新页面`);
            }
            
            this.updateProgress(50, '正在加载WASM文件...');
            let wasmURL;
            try {
                console.log(`正在加载: ${wasmUrl}`);
                wasmURL = await toBlobURL(wasmUrl, "application/wasm");
                console.log('WASM文件加载成功');
            } catch (e) {
                console.error('WASM加载失败:', e);
                throw new Error(`无法从CDN加载 ffmpeg-core.wasm: ${e.message}. 请检查网络连接或尝试刷新页面`);
            }
            
            this.updateProgress(70, '正在初始化FFmpeg引擎...');
            
            await this.ffmpeg.load({
                coreURL: coreURL,
                wasmURL: wasmURL
            });
            
            this.updateProgress(100, 'FFmpeg加载完成！');
            this.showStatus('FFmpeg加载成功', 'success');
            
            return this.ffmpeg;
        } catch (error) {
            console.error('FFmpeg初始化失败:', error);
            this.updateProgress(100, 'FFmpeg加载失败');
            
            let errorMsg = 'FFmpeg核心文件加载失败。';
            if (error.message.includes('404')) {
                errorMsg += ' CDN文件未找到，请检查网络连接或CDN地址是否正确。';
            } else if (error.message.includes('network')) {
                errorMsg += ' 网络连接问题，请检查网络连接后重试。';
            } else {
                errorMsg += ' ' + error.message;
            }
            
            throw new Error(errorMsg);
        }
    }

    // 使用FFmpeg提取音频（支持剪辑）
    async extractAudioWithFFmpeg(file) {
        try {
            this.updateProgress(10, '准备FFmpeg处理...');
            
            // 初始化FFmpeg
            await this.initFFmpeg();
            
            this.updateProgress(20, '读取文件...');
            
            // 读取输入文件
            const inputExt = file.name.split('.').pop() || 'mp4';
            const inputName = `input.${inputExt}`;
            const inputData = new Uint8Array(await file.arrayBuffer());
            
            await this.ffmpeg.writeFile(inputName, inputData);
            
            this.updateProgress(40, '提取音频...');
            
            // 根据选择的格式设置输出参数
            let outputName = 'output';
            let ffmpegArgs = [];
            
            // 检查是否有剪辑选择
            const hasSelection = this.selectionStart > 0 || this.selectionEnd > 0;
            const startTime = this.selectionStart;
            const duration = this.selectionEnd - this.selectionStart;
            
            // 基础参数
            const baseArgs = ['-i', inputName, '-vn'];
            
            // 如果有剪辑选择，添加时间参数
            if (hasSelection) {
                baseArgs.push('-ss', startTime.toString());
                if (duration > 0) {
                    baseArgs.push('-t', duration.toString());
                }
            }
            
            // 根据格式添加特定参数
            switch (this.audioFormat) {
                case 'mp3':
                    outputName += '.mp3';
                    const bitrate = this.getBitrate();
                    ffmpegArgs = [...baseArgs, '-ar', '44100', '-b:a', `${bitrate}k`, outputName];
                    break;
                case 'aac':
                    outputName += '.aac';
                    ffmpegArgs = [...baseArgs, '-c:a', 'aac', '-b:a', '192k', outputName];
                    break;
                case 'wav':
                    outputName += '.wav';
                    ffmpegArgs = [...baseArgs, '-ar', '44100', outputName];
                    break;
                case 'flac':
                    outputName += '.flac';
                    ffmpegArgs = [...baseArgs, '-c:a', 'flac', outputName];
                    break;
                default:
                    outputName += '.mp3';
                    ffmpegArgs = [...baseArgs, '-ar', '44100', '-b:a', '128k', outputName];
            }
            
            // 执行转换
            await this.ffmpeg.exec(ffmpegArgs);
            
            this.updateProgress(80, '读取输出文件...');
            
            // 读取输出文件
            const outputData = await this.ffmpeg.readFile(outputName);
            const outputBlob = new Blob([outputData], { 
                type: this.getContentType(this.audioFormat) 
            });
            
            this.updateProgress(100, '处理完成');
            
            return outputBlob;
            
        } catch (error) {
            console.error('FFmpeg转换失败:', error);
            throw new Error(`FFmpeg转换失败: ${error.message}`);
        }
    }

    // 获取内容类型
    getContentType(format) {
        const types = {
            'mp3': 'audio/mpeg',
            'aac': 'audio/aac',
            'wav': 'audio/wav',
            'flac': 'audio/flac'
        };
        return types[format] || 'audio/mpeg';
    }

    // 获取比特率
    getBitrate() {
        switch (this.audioQuality) {
            case 'ultra-low': return 320;
            case 'high': return 192;
            case 'medium': return 128;
            case 'low': return 64;
            default: return 128;
        }
    }

    // 清理FFmpeg资源
    cleanupFFmpeg() {
        if (this.ffmpeg) {
            try {
                this.ffmpeg.terminate();
                this.ffmpeg = null;
                console.log('FFmpeg已终止');
            } catch (e) {
                console.warn('终止FFmpeg失败:', e);
            }
        }
    }

    // 统一的资源清理方法
    cleanupResources() {
        console.log('开始清理资源...');
        
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

        // 清理FFmpeg
        this.cleanupFFmpeg();
        
        // 清理音频上下文
        if (this.audioContext) {
            try {
                this.audioContext.close();
                this.audioContext = null;
                console.log('音频上下文已关闭');
            } catch (e) {
                console.warn('关闭音频上下文失败:', e);
            }
        }
        
        console.log('资源清理完成');
    }

    // 主提取方法
    async extractAudio() {
        if (!this.selectedFile) return;

        this.extractBtn.classList.add('loading');
        this.extractBtn.disabled = true;
        this.downloadBtn.classList.add('disabled');
        this.downloadBtn.href = '#';
        this.downloadBtn.textContent = '下载音频';
        this.resultContainer.classList.remove('show');
        this.progressContainer.classList.add('show');
        this.isExtracted = false;

        try {
            const hasSelection = this.selectionStart > 0 || this.selectionEnd > 0;
            const actionText = hasSelection ? '剪辑' : '提取';
            this.showStatus(`正在使用FFmpeg.wasm${actionText}音频...`, 'info');
            
            const finalBlob = await this.extractAudioWithFFmpeg(this.selectedFile);
            
            // 获取音频时长用于显示（可选）
            let audioBuffer = null;
            try {
                const arrayBuffer = await finalBlob.arrayBuffer();
                const tempContext = new (window.AudioContext || window.webkitAudioContext)();
                audioBuffer = await tempContext.decodeAudioData(arrayBuffer);
                tempContext.close();
            } catch (e) {
                console.log('无法获取音频时长:', e);
            }
            
            this.displayResult(finalBlob, audioBuffer);
            
        } catch (error) {
            console.error('提取失败:', error);
            this.showStatus(`提取失败: ${error.message}`, 'error');
            this.updateProgress(100, '提取失败');
            this.progressFill.style.background = 'var(--danger)';
            this.extractBtn.classList.remove('loading');
            this.extractBtn.disabled = false;
            this.downloadBtn.classList.add('disabled');

            this.cleanupResources();

            setTimeout(() => {
                this.progressContainer.classList.remove('show');
                this.progressFill.style.background = 'var(--primary)';
                this.progressFill.style.width = '0%';
            }, 3000);
        }
    }

    displayResult(finalBlob, audioBuffer) {
        const audioUrl = URL.createObjectURL(finalBlob);
        this.audioPlayer.src = audioUrl;
        
        let ext = this.audioFormat;
        
        // 根据格式和质量生成文件名后缀
        let qualitySuffix = '';
        if (this.audioFormat === 'mp3') {
            switch(this.audioQuality) {
                case 'ultra-low': qualitySuffix = '_ultra-low'; break;
                case 'low': qualitySuffix = '_low'; break;
                case 'medium': qualitySuffix = '_medium'; break;
                case 'high': qualitySuffix = '_high'; break;
            }
        } else if (this.audioFormat === 'aac') {
            qualitySuffix = '_high';
        }
        
        // 如果有剪辑，添加剪辑标识
        const hasSelection = this.selectionStart > 0 || this.selectionEnd > 0;
        const clipSuffix = hasSelection ? '_clip' : '';
        
        // 生成更友好的文件名
        const baseName = this.selectedFile.name.replace(/\.[^/.]+$/, "");
        this.downloadBtn.download = `${baseName}_audio${qualitySuffix}${clipSuffix}.${ext}`;
        this.downloadBtn.textContent = `下载${this.audioFormat.toUpperCase()} (${(finalBlob.size / (1024 * 1024)).toFixed(1)}MB)`;
        this.downloadBtn.href = audioUrl;
        this.downloadBtn.classList.remove('disabled');

        // 显示成功信息
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (!isMobile) {
            let durationText = '';
            if (audioBuffer) {
                durationText = `，时长: ${audioBuffer.duration.toFixed(1)}秒`;
            }
            
            let actionText = '提取';
            if (hasSelection) {
                actionText = '剪辑';
                durationText += ` (选中: ${this.formatTime(this.selectionStart)} - ${this.formatTime(this.selectionEnd)})`;
            }
            
            this.showStatus(`音频${actionText}成功！文件大小 ${(finalBlob.size / (1024 * 1024)).toFixed(1)}MB${durationText}`, 'success');
        }

        // 设置提取完成状态
        this.isExtracted = true;
        this.extractBtn.disabled = true;
        this.extractBtn.classList.remove('loading');

        setTimeout(() => {
            this.progressContainer.classList.remove('show');
            this.resultContainer.classList.add('show');
        }, 500);
    }

    reset() {
        // 先停止任何正在播放的音频
        this.stopPlayback();
        
        this.fileInput.value = '';
        this.selectedFile = null;
        this.filename.classList.remove('show');
        this.extractBtn.disabled = true;
        this.extractBtn.classList.remove('loading');
        this.downloadBtn.classList.add('disabled');
        this.downloadBtn.href = '#';
        this.downloadBtn.textContent = '下载音频';
        this.fileWrapper.classList.remove('active');
        this.fileText.textContent = '点击选择视频文件';
        this.fileText.style.color = 'var(--text-secondary)';
        this.resultContainer.classList.remove('show');
        this.progressFill.style.width = '0%';
        this.progressFill.style.background = 'var(--primary)';
        this.progressDescription.textContent = '准备中...';
        this.progressPercentage.textContent = '0%';
        this.isExtracted = false;
        
        // 重置选择器到默认值（使用弹窗版本）
        this.selectFormat('mp3', '兼容性最好');
        this.selectQuality('medium', '适合大多数用途');
        
        // 重置弹窗按钮显示
        if (this.formatDisplay) {
            this.formatDisplay.textContent = 'MP3';
        }
        if (this.qualityDisplay) {
            this.qualityDisplay.textContent = '中质量 (128kbps)';
        }
        
        // 确保质量选择按钮可用
        if (this.qualitySelectBtn) {
            this.qualitySelectBtn.disabled = false;
            this.qualitySelectBtn.style.opacity = '1';
            this.qualitySelectBtn.style.cursor = 'pointer';
        }
        
        // 重置剪辑相关状态
        this.selectionStart = 0;
        this.selectionEnd = 0;
        this.audioBuffer = null;
        this.waveformData = null;
        this.isSelecting = false;
        
        // 隐藏剪辑相关UI
        if (this.clipSelector) this.clipSelector.style.display = 'none';
        if (this.waveformContainer) this.waveformContainer.style.display = 'none';
        if (this.startTimeInput) this.startTimeInput.value = '00:00:00';
        if (this.endTimeInput) this.endTimeInput.value = '00:00:00';
        
        // 移除拖拽样式
        if (this.waveformCanvas) {
            this.waveformCanvas.classList.remove('dragging');
            this.waveformCanvas.style.cursor = 'crosshair';
        }
        
        // 隐藏音频加载进度条
        if (this.audioLoadingProgress) {
            this.audioLoadingProgress.style.display = 'none';
            this.audioProgressFill.style.width = '0%';
        }
        
        this.hideStatus();
        this.hideModeIndicator();

        // 统一清理资源
        this.cleanupResources();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AudioExtractor();
});
