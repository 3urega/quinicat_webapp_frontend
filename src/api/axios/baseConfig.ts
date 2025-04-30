import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const baseConfig = {
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}; 