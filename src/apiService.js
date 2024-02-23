import axios from 'axios';

const baseURL = 'https://waldoback.onrender.com/api/'

export const fetchCordinates = async () => {
  try {
    const response = await axios.get(`${baseURL}/cordinates`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const startSession = async (startTime) => {
    try {
        const response = await axios.post(`${baseURL}/start`, { startTime });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};


export const endSession = async (sessionId, endTime) => { // Corrected function name
  try {
    const response = await axios.put(`${baseURL}/end/${sessionId}`, { endTime }); // Corrected route
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const saveUsernameAndDuration = async (username, duration) => {
  try {
    const response = await axios.post(`${baseURL}/save-username-duration`, { username, duration });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAllUserDurations = async () => {
  try {
    const response = await axios.get(`${baseURL}/all-usernames-durations`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};