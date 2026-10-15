import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
    fontSize: {
      type: Number,
      default: 13,
    },
    tabSize: {
      type: Number,
      default: 2,
    },
    defaultLang: {
      type: String,
      default: 'javascript',
    },
    notifyOnComplete: {
      type: Boolean,
      default: true,
    },
    sidebarCollapsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const UserSettings = mongoose.model('UserSettings', userSettingsSchema);
