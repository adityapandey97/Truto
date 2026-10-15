import { SettingsService } from '../services/settings.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class SettingsController {
  static getSettings = asyncHandler(async (req, res) => {
    const settings = await SettingsService.getSettings(req.user.id);
    return ApiResponse.success(res, settings, 200, 'Settings retrieved successfully');
  });

  static updateSettings = asyncHandler(async (req, res) => {
    const settings = await SettingsService.updateSettings(req.user.id, req.body);
    return ApiResponse.success(res, settings, 200, 'Settings updated successfully');
  });
}
