import * as path from 'path';

export interface FileMetadata {
  extension: string;
  name: string;
  mimeType: string;
  category: 'pdf' | 'media' | 'data' | 'document' | 'xml' | 'unknown';
}

export class MimeHelper {
  public static getFileMetadata(filePath: string): FileMetadata {
    const ext = path.extname(filePath).toLowerCase();
    const name = path.basename(filePath);

    switch (ext) {
      case '.pdf':
        return { extension: ext, name, mimeType: 'application/pdf', category: 'pdf' };
      case '.mp4':
        return { extension: ext, name, mimeType: 'video/mp4', category: 'media' };
      case '.webm':
        return { extension: ext, name, mimeType: 'video/webm', category: 'media' };
      case '.mov':
        return { extension: ext, name, mimeType: 'video/quicktime', category: 'media' };
      case '.mkv':
        return { extension: ext, name, mimeType: 'video/x-matroska', category: 'media' };
      case '.mp3':
        return { extension: ext, name, mimeType: 'audio/mpeg', category: 'media' };
      case '.aac':
        return { extension: ext, name, mimeType: 'audio/aac', category: 'media' };
      case '.wav':
        return { extension: ext, name, mimeType: 'audio/wav', category: 'media' };
      case '.ogg':
        return { extension: ext, name, mimeType: 'audio/ogg', category: 'media' };
      case '.flac':
        return { extension: ext, name, mimeType: 'audio/flac', category: 'media' };
      case '.m4a':
        return { extension: ext, name, mimeType: 'audio/mp4', category: 'media' };
      case '.csv':
        return { extension: ext, name, mimeType: 'text/csv', category: 'data' };
      case '.tsv':
        return { extension: ext, name, mimeType: 'text/tab-separated-values', category: 'data' };
      case '.xlsx':
        return { extension: ext, name, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'data' };
      case '.xls':
        return { extension: ext, name, mimeType: 'application/vnd.ms-excel', category: 'data' };
      case '.docx':
        return { extension: ext, name, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'document' };
      case '.xml':
      case '.svg':
        return { extension: ext, name, mimeType: 'application/xml', category: 'xml' };
      default:
        return { extension: ext, name, mimeType: 'application/octet-stream', category: 'unknown' };
    }
  }
}
