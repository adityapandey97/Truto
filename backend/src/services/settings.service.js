import { UserSettings } from '../models/UserSettings.js';

export class SettingsService {
  static async getSettings(userId) {
    let settings = await UserSettings.findOne({ ownerId: userId });
    if (!settings) {
      settings = await UserSettings.create({
        ownerId: userId,
        theme: 'dark',
        fontSize: 13,
        tabSize: 2,
        defaultLang: 'javascript',
        notifyOnComplete: true,
        sidebarCollapsed: false,
      });
    }
    return settings;
  }

  static async updateSettings(userId, updates) {
    let settings = await UserSettings.findOne({ ownerId: userId });
    if (!settings) {
      settings = new UserSettings({ ownerId: userId });
    }

    const allowed = ['theme', 'fontSize', 'tabSize', 'defaultLang', 'notifyOnComplete', 'sidebarCollapsed'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        settings[key] = updates[key];
      }
    }

    await settings.save();
    return settings;
  }
}
