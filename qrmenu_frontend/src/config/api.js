// Configuration API
// En production, utiliser REACT_APP_API_URL depuis les variables d'environnement
// Create React App utilise process.env.REACT_APP_*
export const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
export { default as i18n } from './i18n';