import api from './axios';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export const login = async (data: LoginDto) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const register = async (data: RegisterDto) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};
