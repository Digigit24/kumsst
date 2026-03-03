import type { User, LoginResponse as FullLoginResponse } from "./auth.types";

export interface LoginRequest {
  username: string;
  password: string;
}

export type AuthUser = User;

export type LoginResponse = FullLoginResponse;

export interface AuthResponse {
  detail: string;
}

export interface PasswordChangeRequest {
  new_password1: string;
  new_password2: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  new_password1: string;
  new_password2: string;
  uid: string;
  token: string;
}
