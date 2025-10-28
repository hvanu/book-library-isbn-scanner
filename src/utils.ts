import type { BookData, SavedBook, ScanMode, BarcodeFormat, GoogleBooksResponse } from './types';

const STORAGE_KEY = 'savedBooks';

export function loadSavedBooks(): SavedBook[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading saved books:', error);
    return [];
  }
}

export function saveBooksToStorage(books: SavedBook[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw new Error('Failed to save book');
  }
}

export async function fetchBookData(isbn: string): Promise<BookData> {
  const cleanIsbn = isbn.replace(/\D/g, '');

  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`);
  const data: GoogleBooksResponse = await response.json();

  if (data.totalItems > 0 && data.items?.[0]) {
    return data.items[0].volumeInfo;
  } else {
    throw new Error('No book found with this ISBN');
  }
}

export function getFormats(mode: ScanMode): BarcodeFormat[] {
  switch (mode) {
    case 'isbn':
      return ['ean_13'];
    case 'all':
    default:
      return [
        'aztec',
        'code_128',
        'code_39',
        'code_93',
        'codabar',
        'data_matrix',
        'ean_13',
        'ean_8',
        'itf',
        'pdf417',
        'qr_code',
        'upc_a',
        'upc_e',
      ];
  }
}

export function isUrl(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://');
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  return date.toLocaleDateString();
}
