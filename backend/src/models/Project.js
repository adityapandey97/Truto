import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    projectType: {
      type: String,
      enum: ['monorepo', 'service', 'library', 'fullstack'],
      default: 'fullstack',
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index ensuring unique project names per owner
projectSchema.index({ ownerId: 1, name: 1 }, { unique: true });

export const Project = mongoose.model('Project', projectSchema);
