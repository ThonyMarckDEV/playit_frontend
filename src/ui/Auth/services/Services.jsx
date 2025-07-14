import axios from 'axios';
import API_BASE_URL from '../../../js/urlHelper';

const loginWithGoogle = async (idToken) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/login`, {
      id_token: idToken,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error en el login' };
  }
};

export { loginWithGoogle };