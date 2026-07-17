import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import { ErrorBoundary } from './ErrorBoundary';
import './index.css';

// Lazy-load the visualizer so the landing page loads instantly
const App = lazy(() => import('./App'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
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
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>
);
