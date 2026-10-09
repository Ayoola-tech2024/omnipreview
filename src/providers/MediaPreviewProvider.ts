import * as vscode from 'vscode';
import { BasePreviewProvider } from './BasePreviewProvider';

export class MediaPreviewProvider extends BasePreviewProvider {
  public static readonly viewType = 'omnipreview.mediaViewer';

  protected getHtmlForWebview(webview: vscode.Webview, documentUri: vscode.Uri): string {
    const fileName = documentUri.path.split('/').pop() || 'Media File';
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const isAudio = ['mp3', 'aac', 'wav', 'ogg', 'flac', 'm4a'].includes(ext);

    const styles = `
      .media-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
        position: relative;
      }

      .player-card {
        width: 100%;
        max-width: 960px;
        background: #18181b;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      video {
        width: 100%;
        max-height: 70vh;
        background: #000000;
        outline: none;
        display: block;
      }

      .audio-banner {
        padding: 48px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
      }

      .audio-icon-glow {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: rgba(99, 102, 241, 0.15);
        border: 1px solid rgba(99, 102, 241, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 30px rgba(99, 102, 241, 0.2);
      }

      .audio-bars {
        display: flex;
        align-items: flex-end;
        gap: 4px;
        height: 40px;
      }

      .audio-bar {
        width: 4px;
        background: #818cf8;
        border-radius: 2px;
        animation: pulseBar 1.2s ease-in-out infinite alternate;
      }

      @keyframes pulseBar {
        0% { height: 6px; opacity: 0.3; }
        100% { height: 36px; opacity: 1; }
      }

      .media-controls-custom {
        padding: 16px 20px;
        background: #18181b;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .progress-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .progress-bar {
        flex: 1;
        -webkit-appearance: none;
        height: 6px;
        border-radius: 3px;
        background: #27272a;
        outline: none;
        cursor: pointer;
      }

      .progress-bar::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #38bdf8;
        cursor: pointer;
        transition: transform 0.1s;
      }

      .progress-bar::-webkit-slider-thumb:hover {
        transform: scale(1.3);
      }

      .time-display {
        font-family: var(--font-mono);
        font-size: 12px;
        color: #a1a1aa;
        min-width: 90px;
        text-align: right;
      }

      .controls-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .btn-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .ctrl-btn {
        background: transparent;
        border: none;
        color: #e4e4e7;
        width: 36px;
        height: 36px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: background 0.15s;
      }

      .ctrl-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #38bdf8;
      }

      .ctrl-btn.active {
        color: #38bdf8;
        background: rgba(56, 189, 248, 0.15);
      }

      .play-main-btn {
        width: 44px;
        height: 44px;
        background: #38bdf8;
        color: #0f172a;
        border-radius: 50%;
        font-size: 18px;
      }

      .play-main-btn:hover {
        background: #7dd3fc;
        color: #0f172a;
        transform: scale(1.05);
      }

      .speed-select {
        background: #27272a;
        color: #e4e4e7;
        border: 1px solid #3f3f46;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        outline: none;
      }
    `;

    const bodyContent = `
      <div class="omni-toolbar">
        <div class="omni-toolbar-left">
          <span class="omni-badge">${ext}</span>
          <span class="omni-filename">${fileName}</span>
          <span id="file-size" style="color: var(--text-secondary); font-size: 11px;"></span>
        </div>
        <div class="omni-toolbar-right">
          <button class="omni-btn" id="btn-loop">🔁 Loop: Off</button>
          <button class="omni-btn" id="btn-pip">🪟 PiP</button>
        </div>
      </div>

      <div class="omni-content media-container">
        <div class="player-card">
          ${
            isAudio
              ? `
            <div class="audio-banner">
              <div class="audio-icon-glow">
                <span style="font-size: 32px;">🎵</span>
              </div>
              <div style="font-size: 16px; font-weight: 600; color: #f4f4f5;">${fileName}</div>
              <div class="audio-bars" id="audio-bars" style="display: none;">
                ${Array.from({ length: 16 })
                  .map(
                    (_, i) =>
                      `<div class="audio-bar" style="animation-delay: ${
                        (i * 0.1).toFixed(1)
                      }s"></div>`
                  )
                  .join('')}
              </div>
            </div>
            <audio id="media-element" preload="auto"></audio>
            `
              : `
            <video id="media-element" preload="auto" playsinline></video>
            `
          }

          <div class="media-controls-custom">
            <div class="progress-container">
              <input type="range" id="seek-bar" class="progress-bar" min="0" max="100" value="0" step="0.1">
              <span class="time-display" id="time-display">0:00 / 0:00</span>
            </div>

            <div class="controls-row">
              <div class="btn-group">
                <button class="ctrl-btn" id="btn-backward" title="Rewind 5s">⏪</button>
                <button class="ctrl-btn play-main-btn" id="btn-play" title="Play / Pause">▶</button>
                <button class="ctrl-btn" id="btn-forward" title="Forward 5s">⏩</button>
                <button class="ctrl-btn" id="btn-mute" title="Mute / Unmute">🔊</button>
                <input type="range" id="volume-bar" class="progress-bar" style="width: 80px;" min="0" max="1" step="0.05" value="1">
              </div>

              <div class="btn-group">
                <span style="font-size: 12px; color: #a1a1aa;">Speed:</span>
                <select id="speed-select" class="speed-select">
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1" selected>1.0x (Normal)</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2.0x</option>
                </select>
                ${
                  !isAudio
                    ? `<button class="ctrl-btn" id="btn-fullscreen" title="Fullscreen">⛶</button>`
                    : ''
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const scripts = `
      <script>
        const media = document.getElementById('media-element');
        const loader = document.getElementById('loader');
        const btnPlay = document.getElementById('btn-play');
        const seekBar = document.getElementById('seek-bar');
        const timeDisplay = document.getElementById('time-display');
        const volumeBar = document.getElementById('volume-bar');
        const btnMute = document.getElementById('btn-mute');
        const speedSelect = document.getElementById('speed-select');
        const btnLoop = document.getElementById('btn-loop');
        const btnPip = document.getElementById('btn-pip');
        const btnFullscreen = document.getElementById('btn-fullscreen');
        const btnFwd = document.getElementById('btn-forward');
        const btnBwd = document.getElementById('btn-backward');
        const fileSizeEl = document.getElementById('file-size');
        const audioBars = document.getElementById('audio-bars');

        let isLooping = false;

        window.addEventListener('message', (event) => {
          const msg = event.data;
          if (msg.type === 'LOAD_FILE') {
            loader.style.display = 'none';

            // Create Blob URL from raw buffer bytes
            const blob = new Blob([new Uint8Array(msg.buffer)]);
            const blobUrl = URL.createObjectURL(blob);
            media.src = blobUrl;

            // Format file size
            const bytes = msg.byteLength;
            const sizeStr = bytes > 1024 * 1024 
              ? (bytes / (1024 * 1024)).toFixed(2) + ' MB'
              : (bytes / 1024).toFixed(1) + ' KB';
            fileSizeEl.textContent = '• ' + sizeStr;

            media.play().then(() => {
              btnPlay.textContent = '⏸';
              if (audioBars) audioBars.style.display = 'flex';
            }).catch(() => {
              // Autoplay policy prevented immediate playback
              btnPlay.textContent = '▶';
            });
          }
        });

        // Controls binding
        btnPlay.addEventListener('click', () => {
          if (media.paused) {
            media.play();
            btnPlay.textContent = '⏸';
            if (audioBars) audioBars.style.display = 'flex';
          } else {
            media.pause();
            btnPlay.textContent = '▶';
            if (audioBars) audioBars.style.display = 'none';
          }
        });

        media.addEventListener('timeupdate', () => {
          if (!media.duration) return;
          const pct = (media.currentTime / media.duration) * 100;
          seekBar.value = pct;
          timeDisplay.textContent = formatTime(media.currentTime) + ' / ' + formatTime(media.duration);
        });

        seekBar.addEventListener('input', () => {
          if (!media.duration) return;
          media.currentTime = (seekBar.value / 100) * media.duration;
        });

        volumeBar.addEventListener('input', () => {
          media.volume = volumeBar.value;
          btnMute.textContent = media.volume === 0 ? '🔇' : (media.volume < 0.5 ? '🔉' : '🔊');
        });

        btnMute.addEventListener('click', () => {
          media.muted = !media.muted;
          btnMute.textContent = media.muted ? '🔇' : '🔊';
        });

        speedSelect.addEventListener('change', () => {
          media.playbackRate = parseFloat(speedSelect.value);
        });

        btnLoop.addEventListener('click', () => {
          isLooping = !isLooping;
          media.loop = isLooping;
          btnLoop.textContent = isLooping ? '🔁 Loop: On' : '🔁 Loop: Off';
          btnLoop.style.background = isLooping ? 'var(--accent)' : 'var(--bg-tertiary)';
        });

        btnFwd.addEventListener('click', () => { media.currentTime += 5; });
        btnBwd.addEventListener('click', () => { media.currentTime -= 5; });

        if (btnFullscreen) {
          btnFullscreen.addEventListener('click', () => {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              media.requestFullscreen();
            }
          });
        }

        if (btnPip) {
          btnPip.addEventListener('click', async () => {
            if (document.pictureInPictureElement) {
              await document.exitPictureInPicture();
            } else if (media.requestPictureInPicture) {
              await media.requestPictureInPicture();
            }
          });
        }

        media.addEventListener('ended', () => {
          btnPlay.textContent = '▶';
          if (audioBars) audioBars.style.display = 'none';
        });

        function formatTime(seconds) {
          const mins = Math.floor(seconds / 60);
          const secs = Math.floor(seconds % 60);
          return mins + ':' + (secs < 10 ? '0' : '') + secs;
        }
      </script>
    `;

    return this.getBaseShell(fileName, bodyContent, scripts, styles);
  }
}
