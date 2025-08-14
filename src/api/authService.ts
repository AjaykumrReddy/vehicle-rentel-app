import api from './axios';

export interface SendOTPResponse {
  message: string;
  success: boolean;
}

export interface VerifyOTPResponse {
  message: string;
  success: boolean;
  token?: string;
}

export async function sendOTP(phoneNumber: string): Promise<SendOTPResponse> {
  const response = await api.post('/users/send-otp', {
    phone_number: phoneNumber,
  });
  return response.data;
}

export async function verifyOTP(phoneNumber: string, otp: string): Promise<VerifyOTPResponse> {
  const response = await api.post('/users/verify-otp', {
    phone_number: phoneNumber,
    otp_code: otp,
  });
  return response.data;
}

export async function getUserVehicles(): Promise<any[]> {
  const response = await api.get('/users/vehicles');
  return response.data;
}