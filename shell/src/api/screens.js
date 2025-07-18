// src/api/screens.js
export const fetchScreens = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/auth/me/screens', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};
