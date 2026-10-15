import { CodeReview } from '../models/CodeReview.js';
import { Repository } from '../models/Repository.js';
import { ApiError } from '../utils/ApiError.js';
import { assertOwnership } from '../middleware/authorize.js';

const DEFAULT_REVIEW = {
  title: 'Refactor AST Parser Pipeline to Asynchronous Streams',
  description: 'Replaces synchronous file tokenization with stream-based chunks to reduce Node memory pressure by 45%.',
  status: 'pending',
  author: 'Aditya Pandey',
  filesChanged: 3,
  additions: 142,
  deletions: 58,
  changes: [
    {
      filename: 'src/parser/astStream.js',
      oldCode: 'const buffer = fs.readFileSync(filePath);\nconst tree = parser.parse(buffer);',
      newCode: 'const stream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 });\nconst tree = await parser.parseAsync(stream);',
    },
  ],
  comments: [
    {
      id: 'c-1',
      author: 'CodePilot AI Auditor',
      text: 'Verified memory profile: peak heap allocation reduced from 280MB to 110MB under heavy load.',
      createdAt: new Date(),
    },
  ],
};

export class ReviewService {
  /**
   * Get all code reviews for a user.
   * Auto-seeds a sample review if none exist.
   */
  static async getReviews(userId) {
    let reviews = await CodeReview.find({ ownerId: userId }).sort({ createdAt: -1 });

    if (reviews.length === 0) {
      let repo = await Repository.findOne({ ownerId: userId });
      if (!repo) {
        repo = await Repository.create({
          ownerId: userId,
          name: 'codepilot-core',
          url: 'https://github.com/truto/codepilot-core',
        });
      }

      const seedReview = await CodeReview.create({
        ...DEFAULT_REVIEW,
        ownerId: userId,
        repositoryId: repo._id,
      });

      reviews = [seedReview];
    }

    return reviews;
  }

  static async getReviewById(userId, reviewId) {
    const review = await CodeReview.findById(reviewId);
    assertOwnership(review, userId);
    return review;
  }

  static async updateReviewStatus(userId, reviewId, status) {
    const review = await CodeReview.findById(reviewId);
    assertOwnership(review, userId);

    review.status = status;
    await review.save();
    return review;
  }

  static async addComment(userId, reviewId, author, text) {
    const review = await CodeReview.findById(reviewId);
    assertOwnership(review, userId);

    const comment = {
      id: `c-${Date.now()}`,
      author: author || 'Developer',
      text,
      createdAt: new Date(),
    };

    review.comments.push(comment);
    await review.save();
    return review;
  }
}
