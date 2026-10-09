import * as vscode from 'vscode';
import { PdfPreviewProvider } from './providers/PdfPreviewProvider';
import { MediaPreviewProvider } from './providers/MediaPreviewProvider';
import { DataPreviewProvider } from './providers/DataPreviewProvider';
import { DocxPreviewProvider } from './providers/DocxPreviewProvider';
import { XmlPreviewProvider } from './providers/XmlPreviewProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('🌌 OmniPreview is now active!');

  // Register Custom Editors
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      PdfPreviewProvider.viewType,
      new PdfPreviewProvider(context),
      {
        webviewOptions: { enableScripts: true, retainContextWhenHidden: true },
        supportsMultipleEditorsPerDocument: false
      }
    ),
    vscode.window.registerCustomEditorProvider(
      MediaPreviewProvider.viewType,
      new MediaPreviewProvider(context),
      {
        webviewOptions: { enableScripts: true, retainContextWhenHidden: true },
        supportsMultipleEditorsPerDocument: false
      }
    ),
    vscode.window.registerCustomEditorProvider(
      DataPreviewProvider.viewType,
      new DataPreviewProvider(context),
      {
        webviewOptions: { enableScripts: true, retainContextWhenHidden: true },
        supportsMultipleEditorsPerDocument: false
      }
    ),
    vscode.window.registerCustomEditorProvider(
      DocxPreviewProvider.viewType,
      new DocxPreviewProvider(context),
      {
        webviewOptions: { enableScripts: true, retainContextWhenHidden: true },
        supportsMultipleEditorsPerDocument: false
      }
    ),
    vscode.window.registerCustomEditorProvider(
      XmlPreviewProvider.viewType,
      new XmlPreviewProvider(context),
      {
        webviewOptions: { enableScripts: true, retainContextWhenHidden: true },
        supportsMultipleEditorsPerDocument: false
      }
    )
  );

  // Quick Open Command
  context.subscriptions.push(
    vscode.commands.registerCommand('omnipreview.openWithOmniPreview', async (uri?: vscode.Uri) => {
      const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
      if (!targetUri) {
        vscode.window.showWarningMessage('Please select a file to open with OmniPreview.');
        return;
      }
      vscode.commands.executeCommand('vscode.openWith', targetUri, 'omnipreview.pdfViewer');
    })
  );
}

export function deactivate() {
  console.log('OmniPreview deactivated.');
}
