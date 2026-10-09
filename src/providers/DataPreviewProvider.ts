import * as vscode from 'vscode';
import { BasePreviewProvider } from './BasePreviewProvider';
import { EncodingDetector } from '../utils/encoding';

export class DataPreviewProvider extends BasePreviewProvider {
  public static readonly viewType = 'omnipreview.dataViewer';

  protected getHtmlForWebview(webview: vscode.Webview, documentUri: vscode.Uri): string {
    const fileName = documentUri.path.split('/').pop() || 'Spreadsheet';
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    const papaParseUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'media', 'vendor', 'papaparse.min.js')
    );
    const xlsxUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'media', 'vendor', 'xlsx.full.min.js')
    );

    const styles = `
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
    `;

    const bodyContent = `
      <div class="omni-toolbar">
        <div class="omni-toolbar-left">
          <span class="omni-badge">${ext}</span>
          <span class="omni-filename">${fileName}</span>
          <span class="stat-pill" id="encoding-badge">Encoding: Auto</span>
        </div>
        <div class="omni-toolbar-right">
          <span class="stat-pill" id="rows-cols-stat">0 rows × 0 cols</span>
          <button class="omni-btn" id="btn-export-csv">📥 Export CSV</button>
          <button class="omni-btn" id="btn-export-json">💾 Export JSON</button>
        </div>
      </div>

      <div class="data-app-container">
        <div class="data-toolbar">
          <div class="search-box">
            <span style="color: #71717a;">🔍</span>
            <input type="text" id="search-input" placeholder="Search rows, columns or values...">
          </div>
          <div style="font-size: 11px; color: #71717a;" id="match-count"></div>
        </div>

        <div class="sheet-tabs" id="sheet-tabs" style="display: none;"></div>

        <div class="table-viewport" id="table-viewport">
          <table id="data-table"></table>
        </div>
      </div>
    `;

    const scripts = `
      <script src="${papaParseUri}"></script>
      <script src="${xlsxUri}"></script>
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
          rowsColsStat.textContent = filteredRows.length + ' rows × ' + currentHeaders.length + ' cols';

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
            sortIcon.textContent = sortCol === colIndex ? (sortAsc ? '▲' : '▼') : '↕';
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
    `;

    return this.getBaseShell(fileName, bodyContent, scripts, styles);
  }
}
