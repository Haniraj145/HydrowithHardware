import axios from "axios";

const API = "http://localhost:5000/api/v1/auth";

// LOGIN
export const login = (data: {
  email: string;
  password: string;
}) => {
  return axios.post(`${API}/login`, data);
};

// REGISTER
export const signup = (data: {
  fullName: string;
  email: string;
  password: string;
}) => {
  return axios.post(`${API}/register`, data);
};

// FORGOT PASSWORD
export const forgotPassword = (email: string) => {
  return axios.post(`${API}/forgot-password`, {
    email,
  });
};

// RESET PASSWORD
export const resetPassword = (
  token: string,
  password: string
) => {
  return axios.post(`${API}/reset-password`, {
    token,
    password,
  });
};

// RESEND VERIFICATION EMAIL
export const resendVerification = (email: string) => {
  return axios.post(`${API}/resend-verification`, { email });
};