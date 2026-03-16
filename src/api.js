// src/api.js
const apiUrl = import.meta.env.VITE_API_URL;

export async function fetchContracts() {
  const response = await fetch(`${apiUrl}/contracts`);
  return response.json();
}