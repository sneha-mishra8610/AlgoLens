import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const executeCode = async (code, array) => {
  const response = await axios.post(`${API_URL}/execute/`, {
    code,
    array
  });
  return response.data;
};

export const getExamples = async () => {
  const response = await axios.get(`${API_URL}/examples/`);
  return response.data;
};