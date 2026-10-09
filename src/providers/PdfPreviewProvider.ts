import * as vscode from 'vscode';
import { BasePreviewProvider } from './BasePreviewProvider';

export class PdfPreviewProvider extends BasePreviewProvider {
  public static readonly viewType = 'omnipreview.pdfViewer';

  protected getHtmlForWebview(webview: vscode.Webview, documentUri: vscode.Uri): string {
    const fileName = documentUri.path.split('/').pop() || 'Document.pdf';

    const pdfJsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'media', 'vendor', 'pdfjs', 'pdf.min.js')
    );
    const pdfWorkerUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'media', 'vendor', 'pdfjs', 'pdf.worker.min.js')
    );

    const styles = `
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
    `;

    const bodyContent = `
      <div class="chrome-pdf-bar">
        <div class="chrome-bar-left">
          <button class="chrome-icon-btn" id="btn-toggle-sidebar" title="Toggle Thumbnails">📑</button>
          <span style="font-weight: 500; font-size: 13px; max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${fileName}</span>
        </div>

        <div class="chrome-bar-center">
          <button class="chrome-icon-btn" id="btn-prev" title="Previous Page">▲</button>
          <span>Page</span>
          <input type="number" id="page-num" class="page-input" value="1" min="1">
          <span id="page-count" style="color: #9aa0a6;">/ --</span>
          <button class="chrome-icon-btn" id="btn-next" title="Next Page">▼</button>
        </div>

        <div class="chrome-bar-right">
          <button class="chrome-icon-btn" id="btn-zoom-out" title="Zoom Out">➖</button>
          <span class="zoom-level-text" id="zoom-text">100%</span>
          <button class="chrome-icon-btn" id="btn-zoom-in" title="Zoom In">➕</button>
          <button class="chrome-icon-btn" id="btn-fit-width" title="Fit to Width">↔</button>
          <button class="chrome-icon-btn" id="btn-rotate" title="Rotate Clockwise">↻</button>
          <button class="chrome-icon-btn" id="btn-print" title="Print PDF">🖨️</button>
        </div>
      </div>

      <div class="pdf-app-container">
        <div class="pdf-sidebar" id="pdf-sidebar"></div>
        <div class="pdf-viewport" id="pdf-viewport"></div>
      </div>
    `;

    const scripts = `
      <script src="${pdfJsUri}"></script>
      <script>
        pdfjsLib.GlobalWorkerOptions.workerSrc = "${pdfWorkerUri}";

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
    `;

    return this.getBaseShell(fileName, bodyContent, scripts, styles);
  }
}
