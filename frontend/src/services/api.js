import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true, timeout: 15000 });
export const errorMessage = error => error.response?.data?.error || (error.code === 'ECONNABORTED' ? 'La respuesta está tardando. Vuelve a intentar.' : 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.');
