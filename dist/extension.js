"use strict";var L=Object.create;var f=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var T=Object.getOwnPropertyNames;var B=Object.getPrototypeOf,S=Object.prototype.hasOwnProperty;var I=(n,e)=>{for(var t in e)f(n,t,{get:e[t],enumerable:!0})},E=(n,e,t,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of T(e))!S.call(n,a)&&a!==t&&f(n,a,{get:()=>e[a],enumerable:!(o=P(e,a))||o.enumerable});return n};var m=(n,e,t)=>(t=n!=null?L(B(n)):{},E(e||!n||!n.__esModule?f(t,"default",{value:n,enumerable:!0}):t,n)),D=n=>E(f({},"__esModule",{value:!0}),n);var A={};I(A,{activate:()=>R,deactivate:()=>N});module.exports=D(A);var c=m(require("vscode"));var h=m(require("vscode"));var d=m(require("vscode")),s=class{constructor(e){this.context=e}async openCustomDocument(e,t,o){return{uri:e,dispose:()=>{}}}async resolveCustomEditor(e,t,o){t.webview.options={enableScripts:!0,enableForms:!0,localResourceRoots:[this.context.extensionUri,d.Uri.joinPath(e.uri,"..")]},t.webview.html=this.getHtmlForWebview(t.webview,e.uri);let a=async()=>{try{let r=await d.workspace.fs.readFile(e.uri),l=e.uri.path.split("/").pop()||"File",p=l.split(".").pop()?.toLowerCase()||"";t.webview.postMessage({type:"LOAD_FILE",fileName:l,fileExt:p,buffer:Array.from(r),byteLength:r.byteLength,fileUri:t.webview.asWebviewUri(e.uri).toString()})}catch(r){t.webview.postMessage({type:"ERROR",message:`Failed to read file: ${r.message||String(r)}`})}};t.webview.onDidReceiveMessage(async r=>{switch(r.type){case"READY":await a();break;case"OPEN_EXTERNAL":d.env.openExternal(d.Uri.parse(r.url));break;case"SHOW_MESSAGE":d.window.showInformationMessage(r.text);break;case"SHOW_ERROR":d.window.showErrorMessage(r.text);break}});let i=d.workspace.createFileSystemWatcher(e.uri.fsPath);i.onDidChange(()=>a()),t.onDidDispose(()=>i.dispose())}getBaseShell(e,t,o="",a=""){return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${e}</title>
  <style>
    :root {
      --bg-primary: var(--vscode-editor-background, #1e1e1e);
      --bg-secondary: var(--vscode-sideBar-background, #252526);
      --bg-tertiary: var(--vscode-editorWidget-background, #2d2d2d);
      --text-primary: var(--vscode-editor-foreground, #cccccc);
      --text-secondary: var(--vscode-descriptionForeground, #858585);
      --accent: var(--vscode-button-background, #007acc);
      --accent-hover: var(--vscode-button-hoverBackground, #0062a3);
      --border: var(--vscode-editorWidget-border, #3c3c3c);
      --font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      --font-mono: var(--vscode-editor-font-family, "Fira Code", monospace);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-family);
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Top Action Bar */
    .omni-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      font-size: 13px;
      z-index: 100;
      flex-shrink: 0;
      gap: 12px;
    }

    .omni-toolbar-left, .omni-toolbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .omni-badge {
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 4px;
      background: rgba(0, 122, 204, 0.2);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      text-transform: uppercase;
      font-weight: 600;
    }

    .omni-filename {
      font-weight: 600;
      color: var(--text-primary);
      max-width: 280px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .omni-btn {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border);
      padding: 5px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .omni-btn:hover {
      background: var(--accent);
      color: #ffffff;
      border-color: var(--accent);
    }

    .omni-content {
      flex: 1;
      overflow: auto;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    /* Loading Spinner */
    .omni-loader {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      background: var(--bg-primary);
      z-index: 50;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    ${a}
  </style>
</head>
<body>
  <div id="loader" class="omni-loader">
    <div class="spinner"></div>
    <div style="font-size: 13px; color: var(--text-secondary);" id="loader-text">Opening ${e}...</div>
  </div>

  ${t}

  <script>
    const vscode = acquireVsCodeApi();
    window.addEventListener('DOMContentLoaded', () => {
      vscode.postMessage({ type: 'READY' });
    });
  </script>
  ${o}
</body>
</html>`}};var u=class extends s{static viewType="omnipreview.pdfViewer";getHtmlForWebview(e,t){let o=t.path.split("/").pop()||"Document.pdf",a=e.asWebviewUri(h.Uri.joinPath(this.context.extensionUri,"media","vendor","pdfjs","pdf.min.js")),i=e.asWebviewUri(h.Uri.joinPath(this.context.extensionUri,"media","vendor","pdfjs","pdf.worker.min.js")),r=`
      body {
        background: #323639; /* Chrome PDF viewer background */
      }

      .pdf-app-container {
        flex: 1;
        display: flex;
        overflow: hidden;
        position: relative;
      }

      /* Chrome-like PDF Toolbar */
      .chrome-pdf-bar {
        background: #202124;
        color: #e8eaed;
        padding: 6px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 13px;
        z-index: 100;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }

      .chrome-bar-left, .chrome-bar-center, .chrome-bar-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .page-input {
        width: 44px;
        background: #3c4043;
        border: 1px solid #5f6368;
        color: #ffffff;
        text-align: center;
        border-radius: 4px;
        padding: 3px 0;
        font-size: 12px;
        outline: none;
      }

      .page-input:focus {
        border-color: #8ab4f8;
      }

      .chrome-icon-btn {
        background: transparent;
        border: none;
        color: #e8eaed;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.15s;
      }

      .chrome-icon-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .zoom-level-text {
        font-family: var(--font-mono);
        font-size: 12px;
        min-width: 48px;
        text-align: center;
        color: #e8eaed;
      }

      /* Sidebar */
      .pdf-sidebar {
        width: 200px;
        background: #202124;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        overflow-y: auto;
        padding: 12px 8px;
        display: none;
        flex-direction: column;
        gap: 12px;
      }

      .thumb-card {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px;
        border-radius: 6px;
        border: 2px solid transparent;
        transition: all 0.15s;
      }

      .thumb-card:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .thumb-card.active {
        border-color: #8ab4f8;
        background: rgba(138, 180, 248, 0.1);
      }

      .thumb-card canvas {
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
        max-width: 100%;
        height: auto;
      }

      .thumb-label {
        font-size: 11px;
        color: #9aa0a6;
      }

      /* Main PDF Viewport */
      .pdf-viewport {
        flex: 1;
        overflow: auto;
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        position: relative;
      }

      .pdf-page-container {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        background: #ffffff;
        position: relative;
        transition: transform 0.1s ease;
      }

      .pdf-page-container canvas {
        display: block;
      }
    `,l=`
      <div class="chrome-pdf-bar">
        <div class="chrome-bar-left">
          <button class="chrome-icon-btn" id="btn-toggle-sidebar" title="Toggle Thumbnails">\u{1F4D1}</button>
          <span style="font-weight: 500; font-size: 13px; max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${o}</span>
        </div>

        <div class="chrome-bar-center">
          <button class="chrome-icon-btn" id="btn-prev" title="Previous Page">\u25B2</button>
          <span>Page</span>
          <input type="number" id="page-num" class="page-input" value="1" min="1">
          <span id="page-count" style="color: #9aa0a6;">/ --</span>
          <button class="chrome-icon-btn" id="btn-next" title="Next Page">\u25BC</button>
        </div>

        <div class="chrome-bar-right">
          <button class="chrome-icon-btn" id="btn-zoom-out" title="Zoom Out">\u2796</button>
          <span class="zoom-level-text" id="zoom-text">100%</span>
          <button class="chrome-icon-btn" id="btn-zoom-in" title="Zoom In">\u2795</button>
          <button class="chrome-icon-btn" id="btn-fit-width" title="Fit to Width">\u2194</button>
          <button class="chrome-icon-btn" id="btn-rotate" title="Rotate Clockwise">\u21BB</button>
          <button class="chrome-icon-btn" id="btn-print" title="Print PDF">\u{1F5A8}\uFE0F</button>
        </div>
      </div>

      <div class="pdf-app-container">
        <div class="pdf-sidebar" id="pdf-sidebar"></div>
        <div class="pdf-viewport" id="pdf-viewport"></div>
      </div>
    `,p=`
      <script src="${a}"></script>
      <script>
        pdfjsLib.GlobalWorkerOptions.workerSrc = "${i}";

        const loader = document.getElementById('loader');
        const viewport = document.getElementById('pdf-viewport');
        const sidebar = document.getElementById('pdf-sidebar');
        const pageNumInput = document.getElementById('page-num');
        const pageCountEl = document.getElementById('page-count');
        const zoomText = document.getElementById('zoom-text');
        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');
        const btnZoomIn = document.getElementById('btn-zoom-in');
        const btnZoomOut = document.getElementById('btn-zoom-out');
        const btnFitWidth = document.getElementById('btn-fit-width');
        const btnRotate = document.getElementById('btn-rotate');
        const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
        const btnPrint = document.getElementById('btn-print');

        let pdfDoc = null;
        let currentPage = 1;
        let currentScale = 1.25;
        let currentRotation = 0;
        let pageRendering = false;
        let pageCanvasMap = new Map();

        window.addEventListener('message', async (event) => {
          const msg = event.data;
          if (msg.type === 'LOAD_FILE') {
            try {
              const uint8 = new Uint8Array(msg.buffer);
              const loadingTask = pdfjsLib.getDocument({ data: uint8 });
              pdfDoc = await loadingTask.promise;

              loader.style.display = 'none';
              pageCountEl.textContent = '/ ' + pdfDoc.numPages;
              pageNumInput.max = pdfDoc.numPages;

              renderAllPages();
              renderThumbnails();
            } catch (err) {
              loader.innerHTML = '<div style="color: #f87171; padding: 20px;">Failed to render PDF: ' + err.message + '</div>';
            }
          }
        });

        async function renderAllPages() {
          viewport.innerHTML = '';
          pageCanvasMap.clear();

          for (let p = 1; p <= pdfDoc.numPages; p++) {
            const pageContainer = document.createElement('div');
            pageContainer.className = 'pdf-page-container';
            pageContainer.id = 'page-container-' + p;

            const canvas = document.createElement('canvas');
            pageContainer.appendChild(canvas);
            viewport.appendChild(pageContainer);

            pageCanvasMap.set(p, { container: pageContainer, canvas: canvas });
            await renderPage(p);
          }
          zoomText.textContent = Math.round(currentScale * 100) + '%';
        }

        async function renderPage(num) {
          const page = await pdfDoc.getPage(num);
          const { canvas, container } = pageCanvasMap.get(num);
          const ctx = canvas.getContext('2d');

          const viewportObj = page.getViewport({ scale: currentScale, rotation: currentRotation });
          
          // High-DPI screen support
          const dpr = window.devicePixelRatio || 1;
          canvas.width = viewportObj.width * dpr;
          canvas.height = viewportObj.height * dpr;
          canvas.style.width = viewportObj.width + 'px';
          canvas.style.height = viewportObj.height + 'px';

          ctx.scale(dpr, dpr);

          const renderContext = {
            canvasContext: ctx,
            viewport: viewportObj
          };

          await page.render(renderContext).promise;
        }

        async function renderThumbnails() {
          sidebar.innerHTML = '';
          for (let p = 1; p <= pdfDoc.numPages; p++) {
            const page = await pdfDoc.getPage(p);
            const thumbCard = document.createElement('div');
            thumbCard.className = 'thumb-card' + (p === 1 ? ' active' : '');
            thumbCard.id = 'thumb-' + p;

            const canvas = document.createElement('canvas');
            const vp = page.getViewport({ scale: 0.2, rotation: currentRotation });
            canvas.width = vp.width;
            canvas.height = vp.height;
            const ctx = canvas.getContext('2d');

            await page.render({ canvasContext: ctx, viewport: vp }).promise;

            const label = document.createElement('div');
            label.className = 'thumb-label';
            label.textContent = p;

            thumbCard.appendChild(canvas);
            thumbCard.appendChild(label);
            thumbCard.addEventListener('click', () => scrollToPage(p));
            sidebar.appendChild(thumbCard);
          }
        }

        function scrollToPage(num) {
          if (num < 1 || num > pdfDoc.numPages) return;
          currentPage = num;
          pageNumInput.value = num;

          const target = document.getElementById('page-container-' + num);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }

          document.querySelectorAll('.thumb-card').forEach(c => c.classList.remove('active'));
          const thumb = document.getElementById('thumb-' + num);
          if (thumb) thumb.classList.add('active');
        }

        // Viewport Scroll Listener to update active page input
        viewport.addEventListener('scroll', () => {
          let bestPage = 1;
          let minDistance = Infinity;

          for (let p = 1; p <= pdfDoc.numPages; p++) {
            const el = document.getElementById('page-container-' + p);
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            const dist = Math.abs(rect.top - 80);
            if (dist < minDistance) {
              minDistance = dist;
              bestPage = p;
            }
          }

          if (currentPage !== bestPage) {
            currentPage = bestPage;
            pageNumInput.value = bestPage;
            document.querySelectorAll('.thumb-card').forEach(c => c.classList.remove('active'));
            const thumb = document.getElementById('thumb-' + bestPage);
            if (thumb) thumb.classList.add('active');
          }
        });

        // Controls
        btnPrev.addEventListener('click', () => scrollToPage(currentPage - 1));
        btnNext.addEventListener('click', () => scrollToPage(currentPage + 1));
        pageNumInput.addEventListener('change', () => scrollToPage(parseInt(pageNumInput.value) || 1));

        btnZoomIn.addEventListener('click', async () => {
          currentScale = Math.min(currentScale + 0.25, 3.0);
          await renderAllPages();
        });

        btnZoomOut.addEventListener('click', async () => {
          currentScale = Math.max(currentScale - 0.25, 0.5);
          await renderAllPages();
        });

        btnFitWidth.addEventListener('click', async () => {
          if (!pdfDoc) return;
          const page = await pdfDoc.getPage(1);
          const vp = page.getViewport({ scale: 1 });
          const availableWidth = viewport.clientWidth - 64;
          currentScale = Math.max(availableWidth / vp.width, 0.5);
          await renderAllPages();
        });

        btnRotate.addEventListener('click', async () => {
          currentRotation = (currentRotation + 90) % 360;
          await renderAllPages();
          await renderThumbnails();
        });

        btnToggleSidebar.addEventListener('click', () => {
          const isShown = sidebar.style.display === 'flex';
          sidebar.style.display = isShown ? 'none' : 'flex';
        });

        btnPrint.addEventListener('click', () => {
          window.print();
        });
      </script>
    `;return this.getBaseShell(o,l,p,r)}};var b=class extends s{static viewType="omnipreview.mediaViewer";getHtmlForWebview(e,t){let o=t.path.split("/").pop()||"Media File",a=o.split(".").pop()?.toLowerCase()||"",i=["mp3","aac","wav","ogg","flac","m4a"].includes(a),r=`
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
    `,l=`
      <div class="omni-toolbar">
        <div class="omni-toolbar-left">
          <span class="omni-badge">${a}</span>
          <span class="omni-filename">${o}</span>
          <span id="file-size" style="color: var(--text-secondary); font-size: 11px;"></span>
        </div>
        <div class="omni-toolbar-right">
          <button class="omni-btn" id="btn-loop">\u{1F501} Loop: Off</button>
          <button class="omni-btn" id="btn-pip">\u{1FA9F} PiP</button>
        </div>
      </div>

      <div class="omni-content media-container">
        <div class="player-card">
          ${i?`
            <div class="audio-banner">
              <div class="audio-icon-glow">
                <span style="font-size: 32px;">\u{1F3B5}</span>
              </div>
              <div style="font-size: 16px; font-weight: 600; color: #f4f4f5;">${o}</div>
              <div class="audio-bars" id="audio-bars" style="display: none;">
                ${Array.from({length:16}).map((y,k)=>`<div class="audio-bar" style="animation-delay: ${(k*.1).toFixed(1)}s"></div>`).join("")}
              </div>
            </div>
            <audio id="media-element" preload="auto"></audio>
            `:`
            <video id="media-element" preload="auto" playsinline></video>
            `}

          <div class="media-controls-custom">
            <div class="progress-container">
              <input type="range" id="seek-bar" class="progress-bar" min="0" max="100" value="0" step="0.1">
              <span class="time-display" id="time-display">0:00 / 0:00</span>
            </div>

            <div class="controls-row">
              <div class="btn-group">
                <button class="ctrl-btn" id="btn-backward" title="Rewind 5s">\u23EA</button>
                <button class="ctrl-btn play-main-btn" id="btn-play" title="Play / Pause">\u25B6</button>
                <button class="ctrl-btn" id="btn-forward" title="Forward 5s">\u23E9</button>
                <button class="ctrl-btn" id="btn-mute" title="Mute / Unmute">\u{1F50A}</button>
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
                ${i?"":'<button class="ctrl-btn" id="btn-fullscreen" title="Fullscreen">\u26F6</button>'}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;return this.getBaseShell(o,l,`
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
            fileSizeEl.textContent = '\u2022 ' + sizeStr;

            media.play().then(() => {
              btnPlay.textContent = '\u23F8';
              if (audioBars) audioBars.style.display = 'flex';
            }).catch(() => {
              // Autoplay policy prevented immediate playback
              btnPlay.textContent = '\u25B6';
            });
          }
        });

        // Controls binding
        btnPlay.addEventListener('click', () => {
          if (media.paused) {
            media.play();
            btnPlay.textContent = '\u23F8';
            if (audioBars) audioBars.style.display = 'flex';
          } else {
            media.pause();
            btnPlay.textContent = '\u25B6';
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
          btnMute.textContent = media.volume === 0 ? '\u{1F507}' : (media.volume < 0.5 ? '\u{1F509}' : '\u{1F50A}');
        });

        btnMute.addEventListener('click', () => {
          media.muted = !media.muted;
          btnMute.textContent = media.muted ? '\u{1F507}' : '\u{1F50A}';
        });

        speedSelect.addEventListener('change', () => {
          media.playbackRate = parseFloat(speedSelect.value);
        });

        btnLoop.addEventListener('click', () => {
          isLooping = !isLooping;
          media.loop = isLooping;
          btnLoop.textContent = isLooping ? '\u{1F501} Loop: On' : '\u{1F501} Loop: Off';
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
          btnPlay.textContent = '\u25B6';
          if (audioBars) audioBars.style.display = 'none';
        });

        function formatTime(seconds) {
          const mins = Math.floor(seconds / 60);
          const secs = Math.floor(seconds % 60);
          return mins + ':' + (secs < 10 ? '0' : '') + secs;
        }
      </script>
    `,r)}};var w=m(require("vscode"));var g=class extends s{static viewType="omnipreview.dataViewer";getHtmlForWebview(e,t){let o=t.path.split("/").pop()||"Spreadsheet",a=o.split(".").pop()?.toLowerCase()||"",i=e.asWebviewUri(w.Uri.joinPath(this.context.extensionUri,"media","vendor","papaparse.min.js")),r=e.asWebviewUri(w.Uri.joinPath(this.context.extensionUri,"media","vendor","xlsx.full.min.js")),l=`
      .data-app-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: #18181b;
      }

      .data-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 16px;
        background: #27272a;
        border-bottom: 1px solid #3f3f46;
        gap: 12px;
      }

      .search-box {
        display: flex;
        align-items: center;
        background: #18181b;
        border: 1px solid #3f3f46;
        border-radius: 4px;
        padding: 4px 10px;
        gap: 8px;
        width: 260px;
      }

      .search-box input {
        background: transparent;
        border: none;
        color: #f4f4f5;
        font-size: 12px;
        outline: none;
        width: 100%;
      }

      .sheet-tabs {
        display: flex;
        align-items: center;
        gap: 4px;
        background: #27272a;
        padding: 4px 16px 0;
        border-bottom: 1px solid #3f3f46;
        overflow-x: auto;
      }

      .sheet-tab {
        padding: 6px 14px;
        font-size: 12px;
        color: #a1a1aa;
        background: #18181b;
        border: 1px solid #3f3f46;
        border-bottom: none;
        border-radius: 6px 6px 0 0;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s;
      }

      .sheet-tab.active {
        background: #09090b;
        color: #38bdf8;
        font-weight: 600;
        border-top: 2px solid #38bdf8;
      }

      .table-viewport {
        flex: 1;
        overflow: auto;
        position: relative;
        background: #09090b;
      }

      table {
        border-collapse: collapse;
        width: 100%;
        font-size: 12px;
        font-family: var(--font-mono);
      }

      th {
        position: sticky;
        top: 0;
        background: #18181b;
        color: #e4e4e7;
        padding: 8px 12px;
        border: 1px solid #27272a;
        text-align: left;
        font-weight: 600;
        cursor: pointer;
        user-select: none;
        z-index: 10;
        white-space: nowrap;
      }

      th:hover {
        background: #27272a;
        color: #38bdf8;
      }

      th .sort-icon {
        font-size: 10px;
        margin-left: 6px;
        opacity: 0.5;
      }

      td {
        padding: 6px 12px;
        border: 1px solid #27272a;
        color: #d4d4d8;
        white-space: nowrap;
      }

      tr:nth-child(even) {
        background: #111113;
      }

      tr:hover {
        background: rgba(56, 189, 248, 0.08);
      }

      .row-num-cell {
        color: #71717a;
        text-align: right;
        background: #18181b;
        position: sticky;
        left: 0;
        user-select: none;
        width: 40px;
        z-index: 5;
      }

      .stat-pill {
        font-size: 11px;
        color: #a1a1aa;
        background: #18181b;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #3f3f46;
      }
    `,p=`
      <div class="omni-toolbar">
        <div class="omni-toolbar-left">
          <span class="omni-badge">${a}</span>
          <span class="omni-filename">${o}</span>
          <span class="stat-pill" id="encoding-badge">Encoding: Auto</span>
        </div>
        <div class="omni-toolbar-right">
          <span class="stat-pill" id="rows-cols-stat">0 rows \xD7 0 cols</span>
          <button class="omni-btn" id="btn-export-csv">\u{1F4E5} Export CSV</button>
          <button class="omni-btn" id="btn-export-json">\u{1F4BE} Export JSON</button>
        </div>
      </div>

      <div class="data-app-container">
        <div class="data-toolbar">
          <div class="search-box">
            <span style="color: #71717a;">\u{1F50D}</span>
            <input type="text" id="search-input" placeholder="Search rows, columns or values...">
          </div>
          <div style="font-size: 11px; color: #71717a;" id="match-count"></div>
        </div>

        <div class="sheet-tabs" id="sheet-tabs" style="display: none;"></div>

        <div class="table-viewport" id="table-viewport">
          <table id="data-table"></table>
        </div>
      </div>
    `,y=`
      <script src="${i}"></script>
      <script src="${r}"></script>
      <script>
        const loader = document.getElementById('loader');
        const dataTable = document.getElementById('data-table');
        const searchInput = document.getElementById('search-input');
        const sheetTabs = document.getElementById('sheet-tabs');
        const rowsColsStat = document.getElementById('rows-cols-stat');
        const encodingBadge = document.getElementById('encoding-badge');
        const matchCount = document.getElementById('match-count');
        const btnExportCsv = document.getElementById('btn-export-csv');
        const btnExportJson = document.getElementById('btn-export-json');

        let rawWorkbook = null;
        let activeSheetName = '';
        let currentHeaders = [];
        let currentRows = [];
        let filteredRows = [];
        let sortCol = -1;
        let sortAsc = true;

        window.addEventListener('message', async (event) => {
          const msg = event.data;
          if (msg.type === 'LOAD_FILE') {
            const ext = msg.fileExt;
            const uint8 = new Uint8Array(msg.buffer);

            try {
              if (ext === 'xlsx' || ext === 'xls') {
                rawWorkbook = XLSX.read(uint8, { type: 'array' });
                setupWorkbookSheets();
              } else {
                // CSV or TSV
                const decoder = new TextDecoder('utf-8', { fatal: false });
                const text = decoder.decode(uint8);
                parseCsvText(text);
              }
              loader.style.display = 'none';
            } catch (err) {
              loader.innerHTML = '<div style="color: #f87171; padding: 20px;">Failed to parse data: ' + err.message + '</div>';
            }
          }
        });

        function setupWorkbookSheets() {
          sheetTabs.innerHTML = '';
          sheetTabs.style.display = 'flex';

          rawWorkbook.SheetNames.forEach((name, i) => {
            const tab = document.createElement('div');
            tab.className = 'sheet-tab' + (i === 0 ? ' active' : '');
            tab.textContent = name;
            tab.addEventListener('click', () => {
              document.querySelectorAll('.sheet-tab').forEach(t => t.classList.remove('active'));
              tab.classList.add('active');
              loadSheet(name);
            });
            sheetTabs.appendChild(tab);
          });

          loadSheet(rawWorkbook.SheetNames[0]);
        }

        function loadSheet(name) {
          activeSheetName = name;
          const worksheet = rawWorkbook.Sheets[name];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

          if (jsonData.length > 0) {
            currentHeaders = jsonData[0].map(String);
            currentRows = jsonData.slice(1);
          } else {
            currentHeaders = ['Empty Sheet'];
            currentRows = [];
          }
          filteredRows = [...currentRows];
          renderTable();
        }

        function parseCsvText(text) {
          const parsed = Papa.parse(text, { skipEmptyLines: true });
          if (parsed.data && parsed.data.length > 0) {
            currentHeaders = parsed.data[0].map(String);
            currentRows = parsed.data.slice(1);
          } else {
            currentHeaders = ['Empty CSV'];
            currentRows = [];
          }
          filteredRows = [...currentRows];
          renderTable();
        }

        function renderTable() {
          dataTable.innerHTML = '';
          rowsColsStat.textContent = filteredRows.length + ' rows \xD7 ' + currentHeaders.length + ' cols';

          // Header
          const thead = document.createElement('thead');
          const headerRow = document.createElement('tr');

          const numTh = document.createElement('th');
          numTh.className = 'row-num-cell';
          numTh.textContent = '#';
          headerRow.appendChild(numTh);

          currentHeaders.forEach((h, colIndex) => {
            const th = document.createElement('th');
            th.textContent = h;

            const sortIcon = document.createElement('span');
            sortIcon.className = 'sort-icon';
            sortIcon.textContent = sortCol === colIndex ? (sortAsc ? '\u25B2' : '\u25BC') : '\u2195';
            th.appendChild(sortIcon);

            th.addEventListener('click', () => {
              if (sortCol === colIndex) {
                sortAsc = !sortAsc;
              } else {
                sortCol = colIndex;
                sortAsc = true;
              }
              sortTable(colIndex);
            });
            headerRow.appendChild(th);
          });
          thead.appendChild(headerRow);
          dataTable.appendChild(thead);

          // Body (Render max 500 rows for instant performance)
          const tbody = document.createElement('tbody');
          const maxRender = Math.min(filteredRows.length, 500);

          for (let r = 0; r < maxRender; r++) {
            const rowData = filteredRows[r];
            const tr = document.createElement('tr');

            const numTd = document.createElement('td');
            numTd.className = 'row-num-cell';
            numTd.textContent = r + 1;
            tr.appendChild(numTd);

            for (let c = 0; c < currentHeaders.length; c++) {
              const td = document.createElement('td');
              const val = rowData[c] !== undefined ? String(rowData[c]) : '';
              td.textContent = val;
              tr.appendChild(td);
            }
            tbody.appendChild(tr);
          }
          dataTable.appendChild(tbody);
        }

        function sortTable(colIndex) {
          filteredRows.sort((a, b) => {
            const valA = a[colIndex] !== undefined ? a[colIndex] : '';
            const valB = b[colIndex] !== undefined ? b[colIndex] : '';
            const numA = parseFloat(valA);
            const numB = parseFloat(valB);

            if (!isNaN(numA) && !isNaN(numB)) {
              return sortAsc ? numA - numB : numB - numA;
            }
            return sortAsc 
              ? String(valA).localeCompare(String(valB))
              : String(valB).localeCompare(String(valA));
          });
          renderTable();
        }

        // Live Search / Filter
        searchInput.addEventListener('input', () => {
          const query = searchInput.value.toLowerCase().trim();
          if (!query) {
            filteredRows = [...currentRows];
            matchCount.textContent = '';
          } else {
            filteredRows = currentRows.filter(row => 
              row.some(cell => String(cell).toLowerCase().includes(query))
            );
            matchCount.textContent = filteredRows.length + ' matches';
          }
          renderTable();
        });

        // Exports
        btnExportCsv.addEventListener('click', () => {
          const csvStr = Papa.unparse({ fields: currentHeaders, data: currentRows });
          const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'export.csv';
          link.click();
        });

        btnExportJson.addEventListener('click', () => {
          const jsonArray = currentRows.map(row => {
            const obj = {};
            currentHeaders.forEach((h, i) => obj[h] = row[i]);
            return obj;
          });
          const blob = new Blob([JSON.stringify(jsonArray, null, 2)], { type: 'application/json' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'export.json';
          link.click();
        });
      </script>
    `;return this.getBaseShell(o,p,y,l)}};var C=m(require("vscode"));var v=class extends s{static viewType="omnipreview.docViewer";getHtmlForWebview(e,t){let o=t.path.split("/").pop()||"Document.docx",a=e.asWebviewUri(C.Uri.joinPath(this.context.extensionUri,"media","vendor","docx-preview.min.js")),i=`
      body {
        background: #2b2b2b;
      }

      .docx-container {
        flex: 1;
        overflow-y: auto;
        padding: 32px 16px;
        display: flex;
        justify-content: center;
      }

      #docx-wrapper {
        background: #ffffff;
        color: #000000;
        width: 100%;
        max-width: 850px;
        min-height: 1000px;
        padding: 48px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        border-radius: 4px;
      }

      /* Clean typography overrides for rendered docx */
      #docx-wrapper p {
        margin-bottom: 12px;
        line-height: 1.6;
      }

      #docx-wrapper table {
        border-collapse: collapse;
        width: 100%;
        margin: 16px 0;
      }

      #docx-wrapper table, #docx-wrapper th, #docx-wrapper td {
        border: 1px solid #d1d5db;
        padding: 8px 12px;
      }
    `,r=`
      <div class="omni-toolbar">
        <div class="omni-toolbar-left">
          <span class="omni-badge">DOCX</span>
          <span class="omni-filename">${o}</span>
        </div>
        <div class="omni-toolbar-right">
          <button class="omni-btn" id="btn-print-doc">\u{1F5A8}\uFE0F Print</button>
        </div>
      </div>

      <div class="omni-content docx-container">
        <div id="docx-wrapper"></div>
      </div>
    `,l=`
      <script src="${a}"></script>
      <script>
        const loader = document.getElementById('loader');
        const docxWrapper = document.getElementById('docx-wrapper');
        const btnPrintDoc = document.getElementById('btn-print-doc');

        window.addEventListener('message', async (event) => {
          const msg = event.data;
          if (msg.type === 'LOAD_FILE') {
            try {
              const uint8 = new Uint8Array(msg.buffer);
              await docx.renderAsync(uint8, docxWrapper, null, {
                className: 'docx-rendered',
                inWrapper: false,
                ignoreWidth: false,
                ignoreHeight: false
              });
              loader.style.display = 'none';
            } catch (err) {
              loader.innerHTML = '<div style="color: #f87171; padding: 20px;">Failed to render Word document: ' + err.message + '</div>';
            }
          }
        });

        btnPrintDoc.addEventListener('click', () => {
          window.print();
        });
      </script>
    `;return this.getBaseShell(o,r,l,i)}};var x=class extends s{static viewType="omnipreview.xmlViewer";getHtmlForWebview(e,t){let o=t.path.split("/").pop()||"File.xml",a=`
      .xml-container {
        flex: 1;
        overflow: auto;
        padding: 20px;
        font-family: var(--font-mono);
        font-size: 13px;
        line-height: 1.5;
        background: #1e1e1e;
      }

      .node-tag { color: #569cd6; }
      .node-attr-name { color: #9cdcfe; }
      .node-attr-val { color: #ce9178; }
      .node-text { color: #d4d4d4; }
      .node-comment { color: #6a9955; font-style: italic; }

      .tree-node {
        margin-left: 20px;
        position: relative;
      }

      .collapse-toggle {
        cursor: pointer;
        display: inline-block;
        width: 14px;
        text-align: center;
        user-select: none;
        color: #858585;
      }

      .collapse-toggle:hover { color: #ffffff; }
      .collapsed > .tree-children { display: none; }
      .collapsed > .collapse-toggle::after { content: ' ...'; color: #858585; }
    `,i=`
      <div class="omni-toolbar">
        <div class="omni-toolbar-left">
          <span class="omni-badge">XML</span>
          <span class="omni-filename">${o}</span>
        </div>
        <div class="omni-toolbar-right">
          <button class="omni-btn" id="btn-expand-all">\u2795 Expand All</button>
          <button class="omni-btn" id="btn-collapse-all">\u2796 Collapse All</button>
        </div>
      </div>

      <div class="omni-content xml-container" id="xml-tree-root"></div>
    `;return this.getBaseShell(o,i,`
      <script>
        const loader = document.getElementById('loader');
        const treeRoot = document.getElementById('xml-tree-root');
        const btnExpand = document.getElementById('btn-expand-all');
        const btnCollapse = document.getElementById('btn-collapse-all');

        window.addEventListener('message', (event) => {
          const msg = event.data;
          if (msg.type === 'LOAD_FILE') {
            try {
              const decoder = new TextDecoder('utf-8');
              const xmlText = decoder.decode(new Uint8Array(msg.buffer));
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

              const parserError = xmlDoc.querySelector('parsererror');
              if (parserError) {
                treeRoot.innerHTML = '<div style="color: #f87171;">XML Parsing Error: ' + parserError.textContent + '</div>';
              } else {
                treeRoot.innerHTML = '';
                Array.from(xmlDoc.childNodes).forEach(node => {
                  treeRoot.appendChild(renderNode(node));
                });
              }
              loader.style.display = 'none';
            } catch (err) {
              loader.innerHTML = '<div style="color: #f87171; padding: 20px;">' + err.message + '</div>';
            }
          }
        });

        function renderNode(node) {
          const el = document.createElement('div');
          el.className = 'tree-node';

          if (node.nodeType === Node.ELEMENT_NODE) {
            const hasChildren = node.childNodes.length > 0;
            const toggle = document.createElement('span');
            toggle.className = 'collapse-toggle';
            toggle.textContent = hasChildren ? '\u25BC' : ' ';
            el.appendChild(toggle);

            const openTag = document.createElement('span');
            openTag.className = 'node-tag';
            openTag.textContent = '<' + node.nodeName;
            el.appendChild(openTag);

            // Attributes
            Array.from(node.attributes || []).forEach(attr => {
              const attrSpan = document.createElement('span');
              attrSpan.innerHTML = ' <span class="node-attr-name">' + attr.name + '</span>=<span class="node-attr-val">"' + attr.value + '"</span>';
              el.appendChild(attrSpan);
            });

            if (!hasChildren) {
              const closeEmpty = document.createElement('span');
              closeEmpty.className = 'node-tag';
              closeEmpty.textContent = ' />';
              el.appendChild(closeEmpty);
              return el;
            }

            const closeOpenTag = document.createElement('span');
            closeOpenTag.className = 'node-tag';
            closeOpenTag.textContent = '>';
            el.appendChild(closeOpenTag);

            // Children
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-children';
            Array.from(node.childNodes).forEach(child => {
              childrenContainer.appendChild(renderNode(child));
            });
            el.appendChild(childrenContainer);

            // Closing tag
            const closeTag = document.createElement('div');
            closeTag.className = 'node-tag';
            closeTag.textContent = '</' + node.nodeName + '>';
            el.appendChild(closeTag);

            toggle.addEventListener('click', () => {
              el.classList.toggle('collapsed');
              toggle.textContent = el.classList.contains('collapsed') ? '\u25B6' : '\u25BC';
            });
          } else if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue.trim();
            if (text) {
              el.className = 'node-text';
              el.textContent = text;
            } else {
              return document.createDocumentFragment();
            }
          } else if (node.nodeType === Node.COMMENT_NODE) {
            el.className = 'node-comment';
            el.textContent = '<!-- ' + node.nodeValue + ' -->';
          }

          return el;
        }

        btnExpand.addEventListener('click', () => {
          document.querySelectorAll('.tree-node.collapsed').forEach(n => {
            n.classList.remove('collapsed');
            const t = n.querySelector('.collapse-toggle');
            if (t) t.textContent = '\u25BC';
          });
        });

        btnCollapse.addEventListener('click', () => {
          document.querySelectorAll('.tree-node').forEach(n => {
            if (n.querySelector('.tree-children')) {
              n.classList.add('collapsed');
              const t = n.querySelector('.collapse-toggle');
              if (t) t.textContent = '\u25B6';
            }
          });
        });
      </script>
    `,a)}};function R(n){console.log("\u{1F30C} OmniPreview is now active!"),n.subscriptions.push(c.window.registerCustomEditorProvider(u.viewType,new u(n),{webviewOptions:{enableScripts:!0,retainContextWhenHidden:!0},supportsMultipleEditorsPerDocument:!1}),c.window.registerCustomEditorProvider(b.viewType,new b(n),{webviewOptions:{enableScripts:!0,retainContextWhenHidden:!0},supportsMultipleEditorsPerDocument:!1}),c.window.registerCustomEditorProvider(g.viewType,new g(n),{webviewOptions:{enableScripts:!0,retainContextWhenHidden:!0},supportsMultipleEditorsPerDocument:!1}),c.window.registerCustomEditorProvider(v.viewType,new v(n),{webviewOptions:{enableScripts:!0,retainContextWhenHidden:!0},supportsMultipleEditorsPerDocument:!1}),c.window.registerCustomEditorProvider(x.viewType,new x(n),{webviewOptions:{enableScripts:!0,retainContextWhenHidden:!0},supportsMultipleEditorsPerDocument:!1})),n.subscriptions.push(c.commands.registerCommand("omnipreview.openWithOmniPreview",async e=>{let t=e||c.window.activeTextEditor?.document.uri;if(!t){c.window.showWarningMessage("Please select a file to open with OmniPreview.");return}c.commands.executeCommand("vscode.openWith",t,"omnipreview.pdfViewer")}))}function N(){console.log("OmniPreview deactivated.")}0&&(module.exports={activate,deactivate});
//# sourceMappingURL=extension.js.map
