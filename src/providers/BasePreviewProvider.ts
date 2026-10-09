import * as vscode from 'vscode';

export abstract class BasePreviewProvider implements vscode.CustomReadonlyEditorProvider {
  constructor(protected readonly context: vscode.ExtensionContext) {}

  public async openCustomDocument(
    uri: vscode.Uri,
    _openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken
  ): Promise<vscode.CustomDocument> {
    return { uri, dispose: () => {} };
  }

  public async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
      enableForms: true,
      localResourceRoots: [
        this.context.extensionUri,
        vscode.Uri.joinPath(document.uri, '..')
      ]
    };

    // Set initial HTML
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, document.uri);

    // Initial file load
    const loadContent = async () => {
      try {
        const fileData = await vscode.workspace.fs.readFile(document.uri);
        const fileName = document.uri.path.split('/').pop() || 'File';
        const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

        webviewPanel.webview.postMessage({
          type: 'LOAD_FILE',
          fileName,
          fileExt,
          buffer: Array.from(fileData),
          byteLength: fileData.byteLength,
          fileUri: webviewPanel.webview.asWebviewUri(document.uri).toString()
        });
      } catch (err: any) {
        webviewPanel.webview.postMessage({
          type: 'ERROR',
          message: `Failed to read file: ${err.message || String(err)}`
        });
      }
    };

    // Handle messages from Webview
    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'READY':
          await loadContent();
          break;
        case 'OPEN_EXTERNAL':
          vscode.env.openExternal(vscode.Uri.parse(message.url));
          break;
        case 'SHOW_MESSAGE':
          vscode.window.showInformationMessage(message.text);
          break;
        case 'SHOW_ERROR':
          vscode.window.showErrorMessage(message.text);
          break;
      }
    });

    // Watch for file changes on disk and reload
    const fileWatcher = vscode.workspace.createFileSystemWatcher(document.uri.fsPath);
    fileWatcher.onDidChange(() => loadContent());
    webviewPanel.onDidDispose(() => fileWatcher.dispose());
  }

  protected abstract getHtmlForWebview(webview: vscode.Webview, documentUri: vscode.Uri): string;

  /**
   * Helper to generate standard dark-themed HTML shell with styling
   */
  protected getBaseShell(title: string, bodyContent: string, scripts: string = '', styles: string = ''): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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

    ${styles}
  </style>
</head>
<body>
  <div id="loader" class="omni-loader">
    <div class="spinner"></div>
    <div style="font-size: 13px; color: var(--text-secondary);" id="loader-text">Opening ${title}...</div>
  </div>

  ${bodyContent}

  <script>
    const vscode = acquireVsCodeApi();
    window.addEventListener('DOMContentLoaded', () => {
      vscode.postMessage({ type: 'READY' });
    });
  </script>
  ${scripts}
</body>
</html>`;
  }
}
