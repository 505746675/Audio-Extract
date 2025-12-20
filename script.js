class DirectAudioExtractor {
    constructor() {
        this.selectedFile = null;
        this.isMP3 = true;
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
        this.formatToggle = document.getElementById('formatToggle');
        this.fileText = document.getElementById('fileText');
        this.statusMessage = document.getElementById('statusMessage');
        this.safariBadge = document.getElementById('safariBadge');
        this.recordingBadge = document.getElementById('recordingBadge');
        this.hiddenVideo = document.getElementById('hiddenVideo');

        this.progressDescription = document.getElementById('progressDescription');
        this.progressPercentage = document.getElementById('progressPercentage');

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
        this.filename.textContent = `${this.selectedFile.name} (${sizeMB}MB)`;
        this.filename.classList.add('show');
        this.extractBtn.disabled = false;
        this.fileWrapper.classList.add('active');
        this.fileText.textContent = '文件已选择';
        this.fileText.style.color = 'var(--primary)';

        if (this.forceRecordingMode) {
            this.extractBtn.querySelector('span').textContent = '录制MP3';
        } else {
            this.extractBtn.querySelector('span').textContent = '提取MP3';
        }
    }

    updateProgress(percent, description) {
        this.progressFill.style.width = `${percent}%`;
        if (description) {
            this.progressDescription.textContent = description;
        }
        this.progressPercentage.textContent = `${Math.round(percent)}%`;
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
        this.updateProgress(0, '读取文件...');
        this.showStatus('正在读取视频文件...', 'info');

        const arrayBuffer = await this.readFileAsArrayBuffer(this.selectedFile);
        this.updateProgress(20, '解码音频...');

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

        this.updateProgress(50, '正在编码...');
        this.showStatus(`成功解码 ${audioBuffer.duration.toFixed(1)}秒 音频`, 'success');

        let finalBlob;
        if (this.isMP3) {
            finalBlob = await this.encodeToMP3(audioBuffer);
        } else {
            finalBlob = await this.encodeToWAV(audioBuffer);
        }

        this.displayResult(finalBlob, audioBuffer);
    }

    async recordModeExtraction() {
        this.updateProgress(10, '准备录制...');
        this.showStatus('准备录制音频...', 'info');

        const video = this.hiddenVideo;
        video.src = URL.createObjectURL(this.selectedFile);

        await new Promise(resolve => {
            if (video.readyState >= 2) resolve();
            else video.addEventListener('loadeddata', resolve, { once: true });
        });

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const sourceNode = this.audioContext.createMediaElementSource(video);
        const destination = this.audioContext.createMediaStreamDestination();
        sourceNode.connect(destination);
        sourceNode.connect(this.audioContext.destination);

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

        const mediaRecorder = new MediaRecorder(destination.stream, {
            mimeType: mimeType,
            audioBitsPerSecond: 128000
        });
        const recordedChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };

        return new Promise((resolve, reject) => {
            mediaRecorder.onstop = async () => {
                try {
                    this.updateProgress(70, '正在转换格式...');
                    this.showStatus('正在转换录制的音频...', 'info');

                    const recordedBlob = new Blob(recordedChunks, { type: mimeType });
                    const arrayBuffer = await recordedBlob.arrayBuffer();
                    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

                    this.updateProgress(85, '正在编码MP3...');
                    this.showStatus('正在编码MP3...', 'info');

                    const mp3Blob = await this.encodeToMP3(audioBuffer);

                    this.updateProgress(100, '提取完成！');
                    this.showStatus(`成功提取 ${audioBuffer.duration.toFixed(1)}秒 音频！`, 'success');

                    this.displayResult(mp3Blob, audioBuffer);

                    sourceNode.disconnect();
                    this.audioContext.close();
                    video.pause();
                    video.src = '';
                    resolve();
                } catch (err) {
                    reject(new Error('转换失败: ' + err.message));
                }
            };

            mediaRecorder.onerror = (e) => {
                reject(new Error('录制失败: ' + e.error.message));
            };

            mediaRecorder.start();
            video.play();
            this.updateProgress(40, '正在录制音频...');
            this.showStatus('正在录制音频...', 'info');

            video.onended = () => {
                if (mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                }
            };

            setTimeout(() => {
                if (mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                }
            }, 600000);
        });
    }

    displayResult(finalBlob, audioBuffer) {
        const audioUrl = URL.createObjectURL(finalBlob);
        this.audioPlayer.src = audioUrl;
        this.downloadBtn.href = audioUrl;
        const ext = this.isMP3 ? 'mp3' : 'wav';
        this.downloadBtn.download = `extracted-audio.${ext}`;
        this.downloadBtn.textContent = `下载${ext.toUpperCase()}`;

        setTimeout(() => {
            this.progressContainer.classList.remove('show');
            this.resultContainer.classList.add('show');
            this.extractBtn.classList.remove('loading');
            this.extractBtn.disabled = false;
            this.resetBtn.style.display = 'flex';
        }, 500);
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    async encodeToMP3(audioBuffer) {
        if (typeof lamejs === 'undefined') {
            throw new Error('lamejs库未加载，无法编码MP3');
        }

        const mp3encoder = new lamejs.Mp3Encoder(2, audioBuffer.sampleRate, 128);
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

        for (let i = 0; i < left.length; i += sampleBlockSize) {
            const leftChunk = left.subarray(i, i + sampleBlockSize);
            const rightChunk = right.subarray(i, i + sampleBlockSize);
            const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }

            processedChunks++;
            const progress = 50 + (processedChunks / totalChunks) * 40;
            this.updateProgress(progress, "编码中 (MP3)...");
        }

        const end = mp3encoder.flush();
        if (end.length > 0) {
            mp3Data.push(end);
        }

        this.updateProgress(100, "编码完成");

        return new Blob(mp3Data, { type: 'audio/mp3' });
    }

    async encodeToWAV(audioBuffer) {
        this.updateProgress(100, "编码完成");
        const wavBuffer = this.audioBufferToWav(audioBuffer);
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
        this.extractBtn.querySelector('span').textContent = '提取MP3';
        this.hideStatus();

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DirectAudioExtractor();
});
