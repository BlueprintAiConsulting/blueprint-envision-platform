import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Landing';
import { ErrorBoundary } from './ErrorBoundary';
import './index.css';

// Support legacy hash-router links (e.g. /#/app -> /app)
if (window.location.hash.startsWith('#/')) {
  const hashPath = window.location.hash.slice(1);
  window.history.replaceState(null, '', hashPath);
}

// Lazy-load the visualizer so the landing page loads instantly
const App = lazy(() => import('./App'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/app"
            element={
              <Suspense fallback={null}>
                <App />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
