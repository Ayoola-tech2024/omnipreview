import * as vscode from 'vscode';
import { BasePreviewProvider } from './BasePreviewProvider';

export class XmlPreviewProvider extends BasePreviewProvider {
  public static readonly viewType = 'omnipreview.xmlViewer';

  protected getHtmlForWebview(webview: vscode.Webview, documentUri: vscode.Uri): string {
    const fileName = documentUri.path.split('/').pop() || 'File.xml';

    const styles = `
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
    `;

    const bodyContent = `
      <div class="omni-toolbar">
        <div class="omni-toolbar-left">
          <span class="omni-badge">XML</span>
          <span class="omni-filename">${fileName}</span>
        </div>
        <div class="omni-toolbar-right">
          <button class="omni-btn" id="btn-expand-all">➕ Expand All</button>
          <button class="omni-btn" id="btn-collapse-all">➖ Collapse All</button>
        </div>
      </div>

      <div class="omni-content xml-container" id="xml-tree-root"></div>
    `;

    const scripts = `
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
            toggle.textContent = hasChildren ? '▼' : ' ';
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
              toggle.textContent = el.classList.contains('collapsed') ? '▶' : '▼';
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
            if (t) t.textContent = '▼';
          });
        });

        btnCollapse.addEventListener('click', () => {
          document.querySelectorAll('.tree-node').forEach(n => {
            if (n.querySelector('.tree-children')) {
              n.classList.add('collapsed');
              const t = n.querySelector('.collapse-toggle');
              if (t) t.textContent = '▶';
            }
          });
        });
      </script>
    `;

    return this.getBaseShell(fileName, bodyContent, scripts, styles);
  }
}
