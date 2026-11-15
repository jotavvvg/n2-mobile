import { Platform } from 'react-native';

export const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:3000/api'
    : 'http://10.0.2.2:3000/api'; // No Expo Go em aparelho físico, troque pelo IPv4 local da máquina.

export async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.erro || 'Erro de comunicação com o servidor');
  }

  return data;
}
