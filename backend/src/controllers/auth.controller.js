import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  static register = asyncHandler(async (req, res) => {
    const { user, token } = await AuthService.registerUser(req.body);
    res.cookie('token', token, COOKIE_OPTIONS);
    return ApiResponse.created(res, { user, token }, 'User successfully registered');
  });

  static login = asyncHandler(async (req, res) => {
    const { user, token } = await AuthService.loginUser(req.body);
    res.cookie('token', token, COOKIE_OPTIONS);
    return ApiResponse.success(res, { user, token }, 200, 'User successfully authenticated');
  });

  static logout = asyncHandler(async (req, res) => {
    res.clearCookie('token', COOKIE_OPTIONS);
    return ApiResponse.success(res, null, 200, 'Logged out successfully');
  });

  static getMe = asyncHandler(async (req, res) => {
    const user = await AuthService.getMe(req.user.id);
    return ApiResponse.success(res, user);
  });

  static updateProfile = asyncHandler(async (req, res) => {
    const user = await AuthService.updateProfile(req.user.id, req.body);
    return ApiResponse.success(res, user, 200, 'Profile updated successfully');
  });
}
