// ── Central API configuration ─────────────────────────────────
// Using environment variable so URL changes between
// development (localhost) and production (Render)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default API_URL;