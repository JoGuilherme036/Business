import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/syne/index.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource-variable/manrope/index.css';
import './styles/index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
