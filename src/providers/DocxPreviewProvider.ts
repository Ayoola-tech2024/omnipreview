import * as vscode from 'vscode';
import { BasePreviewProvider } from './BasePreviewProvider';

export class DocxPreviewProvider extends BasePreviewProvider {
  public static readonly viewType = 'omnipreview.docViewer';

  protected getHtmlForWebview(webview: vscode.Webview, documentUri: vscode.Uri): string {
    const fileName = documentUri.path.split('/').pop() || 'Document.docx';

    const docxPreviewUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'media', 'vendor', 'docx-preview.min.js')
    );

    const styles = `
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
    `;

    const bodyContent = `
      <div class="omni-toolbar">
        <div class="omni-toolbar-left">
          <span class="omni-badge">DOCX</span>
          <span class="omni-filename">${fileName}</span>
        </div>
        <div class="omni-toolbar-right">
          <button class="omni-btn" id="btn-print-doc">🖨️ Print</button>
        </div>
      </div>

      <div class="omni-content docx-container">
        <div id="docx-wrapper"></div>
      </div>
    `;

    const scripts = `
      <script src="${docxPreviewUri}"></script>
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
    `;

    return this.getBaseShell(fileName, bodyContent, scripts, styles);
  }
}
