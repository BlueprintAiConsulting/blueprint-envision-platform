import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import App from './App';
import { ErrorBoundary } from './ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<App />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
