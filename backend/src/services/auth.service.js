import { User } from '../models/User.js';
import { UserSettings } from '../models/UserSettings.js';
import { ApiError } from '../utils/ApiError.js';
import { generateAccessToken } from '../utils/token.js';

export class AuthService {
  static async registerUser({ name, email, password }) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw ApiError.conflict('An account with this email address already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'developer',
      workspace: 'Personal Workspace',
    });

    // Create corresponding default UserSettings record
    await UserSettings.create({
      ownerId: user._id,
      theme: 'dark',
      fontSize: 13,
      tabSize: 2,
      defaultLang: 'javascript',
    });

    const token = generateAccessToken({ id: user._id, role: user.role });
    return { user, token };
  }

  static async loginUser({ email, password }) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const token = generateAccessToken({ id: user._id, role: user.role });
    return { user, token };
  }

  static async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User record not found');
    }
    return user;
  }

  static async updateProfile(userId, updates) {
    const allowed = ['name', 'workspace', 'avatarUrl'];
    const filteredUpdates = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw ApiError.notFound('User record not found');
    }
    return user;
  }
}
