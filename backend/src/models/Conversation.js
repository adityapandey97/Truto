import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
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
      required: [true, 'Conversation title is required'],
      default: 'New Conversation',
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast user conversations listing ordered by most recent update
conversationSchema.index({ ownerId: 1, updatedAt: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
