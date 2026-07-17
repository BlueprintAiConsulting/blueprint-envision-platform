/**
 * API Base URL Configuration
 *
 * In development: empty string — Vite's dev proxy forwards /api/* to localhost:3000
 * In production (GitHub Pages): the full Render backend URL
 *
 * Set via VITE_API_BASE_URL env var at build time (see .github/workflows/deploy.yml).
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
