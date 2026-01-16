// Authentication API service
import axiosInstance from "@/API/Configs/App.config";
import { LoginRequest, LoginResponse, User } from "@/Types/Auth.types";

export const AuthService = {
  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      credentials
    );
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
    }
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    await axiosInstance.post("/auth/logout");
    localStorage.removeItem("auth_token");
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get<User>("/auth/me");
    return response.data;
  },

  // Forgot password
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(
      "/auth/forgot-password",
      {
        email,
      }
    );
    return response.data;
  },

  // Reset password
  async resetPassword(
    token: string,
    password: string
  ): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(
      "/auth/reset-password",
      {
        token,
        password,
      }
    );
    return response.data;
  },
};

export default AuthService;
