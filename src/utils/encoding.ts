import * as chardet from 'chardet';

export interface DecodedResult {
  text: string;
  encoding: string;
  hasBom: boolean;
}

export class EncodingDetector {
  /**
   * Decode raw buffer into string with strict-to-lossy multi-tier fallback
   */
  public static decodeBuffer(buffer: Buffer): DecodedResult {
    // 1. Check UTF-8 / UTF-16 BOM
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      return {
        text: buffer.subarray(3).toString('utf-8'),
        encoding: 'utf-8-bom',
        hasBom: true
      };
    }
    if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
      return {
        text: buffer.subarray(2).toString('utf16le'),
        encoding: 'utf-16le',
        hasBom: true
      };
    }
    if (buffer.length >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
      return {
        text: buffer.subarray(2).toString('utf16be'),
        encoding: 'utf-16be',
        hasBom: true
      };
    }

    // 2. Try standard UTF-8 decoding
    try {
      const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
      const text = utf8Decoder.decode(buffer);
      return { text, encoding: 'utf-8', hasBom: false };
    } catch {
      // 3. Detect encoding with chardet
      const detected = chardet.detect(buffer);
      const encoding = (detected || 'windows-1252').toLowerCase();

      try {
        const customDecoder = new TextDecoder(encoding, { fatal: false });
        const text = customDecoder.decode(buffer);
        return { text, encoding, hasBom: false };
      } catch {
        // 4. Absolute fallback: UTF-8 with replacement chars
        return {
          text: buffer.toString('utf-8'),
          encoding: 'utf-8 (lossy)',
          hasBom: false
        };
      }
    }
  }

  /**
   * Sniff delimiter for tabular data (comma, semicolon, tab, pipe)
   */
  public static sniffDelimiter(sampleText: string): string {
    const lines = sampleText.split(/\r?\n/).slice(0, 10).filter(l => l.trim().length > 0);
    if (lines.length === 0) return ',';

    const candidates = [',', ';', '\t', '|'];
    let bestDelimiter = ',';
    let maxConsistency = -1;

    for (const delimiter of candidates) {
      const counts = lines.map(line => line.split(delimiter).length);
      const allEqual = counts.every(c => c === counts[0] && c > 1);
      if (allEqual && counts[0] > maxConsistency) {
        maxConsistency = counts[0];
        bestDelimiter = delimiter;
      }
    }

    return bestDelimiter;
  }
}
