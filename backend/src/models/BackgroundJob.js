import mongoose from 'mongoose';

const backgroundJobSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'Repository import',
        'File scanning',
        'Symbol extraction',
        'Embedding generation',
        'Index validation',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'in_progress', 'completed', 'failed'],
      default: 'queued',
      index: true,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    duration: {
      type: String,
      default: '0s',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
    events: [
      {
        step: { type: String, required: true },
        status: { type: String, required: true },
        time: { type: String, required: true },
      },
    ],
    logs: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

backgroundJobSchema.index({ ownerId: 1, createdAt: -1 });

export const BackgroundJob = mongoose.model('BackgroundJob', backgroundJobSchema);
