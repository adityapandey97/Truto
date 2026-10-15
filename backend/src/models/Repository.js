import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Repository name is required'],
      trim: true,
      maxlength: [100, 'Repository name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    url: {
      type: String,
      required: [true, 'Repository URL is required'],
      trim: true,
    },
    defaultBranch: {
      type: String,
      default: 'main',
      trim: true,
    },
    languages: [
      {
        name: { type: String, required: true },
        percentage: { type: Number, required: true },
        color: { type: String, default: '#6366F1' },
      },
    ],
    fileCount: {
      type: Number,
      default: 0,
    },
    indexStatus: {
      type: String,
      enum: ['queued', 'indexing', 'completed', 'failed'],
      default: 'completed',
      index: true,
    },
    lastIndexedAt: {
      type: Date,
      default: Date.now,
    },
    stats: {
      commits: { type: Number, default: 0 },
      branches: { type: Number, default: 1 },
      contributors: { type: Number, default: 1 },
      stars: { type: Number, default: 0 },
      linesOfCode: { type: String, default: '1,000' },
    },
    files: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        path: { type: String, required: true },
        type: { type: String, enum: ['file', 'directory'], default: 'file' },
        language: { type: String, default: 'plaintext' },
        size: { type: String, default: '1 KB' },
        content: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index guaranteeing repository name uniqueness per owner
repositorySchema.index({ ownerId: 1, name: 1 }, { unique: true });

export const Repository = mongoose.model('Repository', repositorySchema);
