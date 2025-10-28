import Alpine from 'alpinejs';
import { scannerApp } from './components/scannerApp';
import './style.css';

(window as any).scannerApp = scannerApp;

Alpine.start();
