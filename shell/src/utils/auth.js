// src/utils/auth.js
import { jwtDecode } from 'jwt-decode';


export const getDecodedToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};
