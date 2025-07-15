import axios from 'axios';
import {API_BASE_URL_GAME_TRIKI} from '../../../../js/trikiHelper';

// Function to create a new Tic-Tac-Toe game
const createGame = async (idUsuario) => {
  try {
    const response = await axios.post(`${API_BASE_URL_GAME_TRIKI}/api/create-game`, {
      idUsuario,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error creating game' };
  }
};

export { createGame };