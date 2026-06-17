import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

let sessionExpiredHandler = null;

export const setSessionExpiredHandler = (handler) => {
  sessionExpiredHandler = handler;
};

export const handleSessionExpired = async () => {
  await AsyncStorage.removeItem('jwt_token');
  await AsyncStorage.removeItem('user_email');
  await AsyncStorage.removeItem('user_id');
  sessionExpiredHandler?.();
};

const parseApiResponse = async (response, endpoint) => {
  const responseText = await response.text();

  if (!responseText) {
    return {};
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    const isHtmlResponse = responseText.trim().startsWith('<');

    if (isHtmlResponse) {
      throw new Error(
        `L'API a renvoye une page HTML au lieu du JSON (${response.status}). Verifiez la route ${endpoint}.`
      );
    }

    throw new Error(`Reponse API invalide (${response.status}).`);
  }
};

export const apiCall = async (endpoint, options = {}) => {
  try {
    const token = await AsyncStorage.getItem('jwt_token');

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      await handleSessionExpired();
      throw new Error('Session expiree. Veuillez vous reconnecter.');
    }

    const data = await parseApiResponse(response, endpoint);

    if (!response.ok) {
      throw new Error(data.message || data.error || `Erreur API (${response.status})`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.message };
  }
};

export { API_URL };
