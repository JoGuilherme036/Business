import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/bodoni-moda/index.css';
import '@fontsource-variable/bodoni-moda/wght-italic.css';
import '@fontsource-variable/manrope/index.css';
import './styles/index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
