import mongoose from 'mongoose';

const codeReviewSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    author: {
      type: String,
      default: 'Developer',
    },
    filesChanged: {
      type: Number,
      default: 1,
    },
    additions: {
      type: Number,
      default: 0,
    },
    deletions: {
      type: Number,
      default: 0,
    },
    changes: [
      {
        filename: { type: String, required: true },
        oldCode: { type: String, default: '' },
        newCode: { type: String, default: '' },
      },
    ],
    comments: [
      {
        id: { type: String, required: true },
        author: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

codeReviewSchema.index({ ownerId: 1, createdAt: -1 });

export const CodeReview = mongoose.model('CodeReview', codeReviewSchema);
