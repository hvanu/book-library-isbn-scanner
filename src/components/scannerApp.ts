import type { BookData, SavedBook, ScanMode, View } from '../types';
import { loadSavedBooks, saveBooksToStorage, fetchBookData, getFormats, isUrl, formatDate } from '../utils';

interface ScannerAppData {
  isSupported: boolean;
  isScanning: boolean;
  mode: ScanMode;
  scanResult: string;
  errorMessage: string;
  stream: MediaStream | null;
  detector: BarcodeDetector | null;
  bookData: BookData | null;
  isLoadingBook: boolean;
  bookError: string | null;
  savedBooks: SavedBook[];
  currentView: View;
  $refs: {
    video: HTMLVideoElement;
  };
}

export function scannerApp(): ScannerAppData & Record<string, any> {
  return {
    isSupported: false,
    isScanning: false,
    mode: 'isbn' as ScanMode,
    scanResult: '',
    errorMessage: '',
    stream: null,
    detector: null,
    bookData: null,
    isLoadingBook: false,
    bookError: null,
    savedBooks: [],
    currentView: 'scanner' as View,
    $refs: {} as any,

    init() {
      this.isSupported = 'BarcodeDetector' in window;
      this.loadSavedBooks();
    },

    get isUrl(): boolean {
      return isUrl(this.scanResult);
    },

    getFormats() {
      return getFormats(this.mode);
    },

    async startScan() {
      if (!this.isSupported) return;

      this.scanResult = '';
      this.errorMessage = '';

      try {
        document.body.classList.add('fade-mode-change');
        setTimeout(() => {
          document.body.classList.remove('fade-mode-change');
        }, 300);

        this.detector = new BarcodeDetector({
          formats: this.getFormats(),
        });

        if (!this.stream) {
          this.stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          });
        }

        this.$refs.video.srcObject = this.stream;
        await this.$refs.video.play();

        this.isScanning = true;

        requestAnimationFrame(this.detectFrame.bind(this));
      } catch (e: any) {
        console.error(e);
        this.errorMessage = `Error starting camera: ${e.name}. Please grant permission.`;
        this.isScanning = false;
      }
    },

    async detectFrame() {
      if (!this.isScanning || !this.detector) return;

      try {
        const barcodes = await this.detector.detect(this.$refs.video);
        if (barcodes.length > 0) {
          this.scanResult = barcodes[0].rawValue;

          if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
          }

          this.stopScan();
        } else {
          requestAnimationFrame(this.detectFrame.bind(this));
        }
      } catch (e) {
        console.error('Detection failed:', e);
        requestAnimationFrame(this.detectFrame.bind(this));
      }
    },

    stopScan() {
      const overlay = document.querySelector('.scan-container');
      overlay?.classList.add('fade-out');

      setTimeout(() => {
        // Keep the stream active, just pause the video
        this.isScanning = false;
        if (this.$refs.video) {
          this.$refs.video.pause();
        }

        if (this.mode === 'isbn' && this.scanResult) {
          this.fetchBookData();
        }

        setTimeout(() => {
          overlay?.classList.remove('fade-out');
        }, 100);
      }, 300);
    },

    setMode(newMode: ScanMode) {
      if (this.isScanning) this.stopScan();

      const resultArea = document.querySelector('.result-area');
      resultArea?.classList.add('fade-mode-change');

      setTimeout(() => {
        this.mode = newMode;
        this.scanResult = '';
        this.errorMessage = '';

        setTimeout(() => {
          resultArea?.classList.remove('fade-mode-change');
        }, 50);
      }, 150);
    },

    copyToClipboard() {
      const button = document.querySelector('.action-button') as HTMLButtonElement;

      navigator.clipboard
        .writeText(this.scanResult)
        .then(() => {
          button.textContent = '✓ Copied!';
          button.classList.add('success');

          setTimeout(() => {
            button.textContent = 'Copy';
            button.classList.remove('success');
          }, 1500);
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
          this.errorMessage = 'Failed to copy to clipboard';
          setTimeout(() => {
            this.errorMessage = '';
          }, 2000);
        });
    },

    openUrl() {
      if (this.isUrl) {
        window.open(this.scanResult, '_blank', 'noopener,noreferrer');
      }
    },

    async fetchBookData() {
      this.bookData = null;
      this.bookError = null;
      this.isLoadingBook = true;

      try {
        this.bookData = await fetchBookData(this.scanResult);
      } catch (error: any) {
        console.error('Error fetching book data:', error);
        this.bookError = error.message || 'Failed to fetch book details';
      } finally {
        this.isLoadingBook = false;
      }
    },

    loadSavedBooks() {
      this.savedBooks = loadSavedBooks();
    },

    saveBook() {
      if (!this.bookData || !this.scanResult) return;

      const bookToSave: SavedBook = {
        isbn: this.scanResult,
        title: this.bookData.title,
        authors: this.bookData.authors,
        publisher: this.bookData.publisher,
        publishedDate: this.bookData.publishedDate,
        description: this.bookData.description,
        imageLinks: this.bookData.imageLinks,
        averageRating: this.bookData.averageRating,
        ratingsCount: this.bookData.ratingsCount,
        infoLink: this.bookData.infoLink,
        savedAt: new Date().toISOString(),
      };

      const existingIndex = this.savedBooks.findIndex((book) => book.isbn === this.scanResult);

      if (existingIndex !== -1) {
        // Remove/toggle the book if it's already saved
        this.savedBooks.splice(existingIndex, 1);
      } else {
        this.savedBooks.unshift(bookToSave);
      }

      try {
        saveBooksToStorage(this.savedBooks);
      } catch (error: any) {
        this.errorMessage = error.message || 'Failed to save book';
        setTimeout(() => {
          this.errorMessage = '';
        }, 2000);
      }
    },

    isBookSaved(): boolean {
      if (!this.scanResult) return false;
      return this.savedBooks.some((book) => book.isbn === this.scanResult);
    },

    removeBook(isbn: string) {
      const index = this.savedBooks.findIndex((book) => book.isbn === isbn);
      if (index !== -1) {
        this.savedBooks.splice(index, 1);
        saveBooksToStorage(this.savedBooks);
      }
    },

    confirmClearLibrary() {
      if (
        confirm(`Are you sure you want to remove all ${this.savedBooks.length} saved books? This cannot be undone.`)
      ) {
        this.savedBooks = [];
        saveBooksToStorage(this.savedBooks);
      }
    },

    viewBookDetails(book: SavedBook) {
      this.currentView = 'scanner';
      this.scanResult = book.isbn;
      this.bookData = book;
      this.mode = 'isbn';
    },

    formatDate(dateString: string | undefined): string {
      return formatDate(dateString);
    },
  };
}
