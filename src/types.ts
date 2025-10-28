export interface BookData {
  title: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  imageLinks?: {
    thumbnail?: string;
  };
  averageRating?: number;
  ratingsCount?: number;
  infoLink?: string;
}

export interface SavedBook extends BookData {
  isbn: string;
  savedAt: string;
}

export type ScanMode = 'all' | 'isbn';
export type View = 'scanner' | 'library';

export type BarcodeFormat =
  | 'aztec'
  | 'code_128'
  | 'code_39'
  | 'code_93'
  | 'codabar'
  | 'data_matrix'
  | 'ean_13'
  | 'ean_8'
  | 'itf'
  | 'pdf417'
  | 'qr_code'
  | 'upc_a'
  | 'upc_e';

export interface GoogleBooksResponse {
  totalItems: number;
  items?: Array<{
    volumeInfo: BookData;
  }>;
}
