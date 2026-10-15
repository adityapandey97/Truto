import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Repository } from '../models/Repository.js';
import { ApiError } from '../utils/ApiError.js';
import { assertOwnership } from '../middleware/authorize.js';

export class ConversationService {
  /**
   * Get all conversations owned by the user.
   * Auto-seeds a sample conversation if empty for new user onboarding.
   */
  static async getConversations(userId) {
    let convs = await Conversation.find({ ownerId: userId }).sort({ updatedAt: -1 });

    if (convs.length === 0) {
      // Find or create default repository
      let repo = await Repository.findOne({ ownerId: userId });
      if (!repo) {
        repo = await Repository.create({
          ownerId: userId,
          name: 'codepilot-core',
          url: 'https://github.com/truto/codepilot-core',
          languages: [{ name: 'JavaScript', percentage: 100, color: '#F7DF1E' }],
        });
      }

      const seedConv = await Conversation.create({
        ownerId: userId,
        repositoryId: repo._id,
        title: 'Explaining AST Indexing Engine',
      });

      await Message.create([
        {
          conversationId: seedConv._id,
          ownerId: userId,
          role: 'user',
          content: 'How does CodePilot parse and extract symbols from large multi-module repositories?',
          fileReferences: ['src/index.js'],
        },
        {
          conversationId: seedConv._id,
          ownerId: userId,
          role: 'assistant',
          content: `CodePilot AI indexes codebases using an asynchronous multi-stage AST parsing pipeline:

1. **Syntax Tree Generation**: Uses Tree-sitter parsers across JavaScript, TypeScript, Python, and Go.
2. **Symbol Symbolization**: Extracts classes, functions, variable declarations, and dependency import trees.
3. **Graph Ingestion**: Stores relationships in an in-memory symbol graph and computes vector embeddings for semantic chunking.

In Phase 4, this architecture connects to our dedicated Python FastAPI indexing microservice for high-throughput semantic search.`,
          fileReferences: ['src/index.js', 'package.json'],
        },
      ]);

      convs = [seedConv];
    }

    return convs;
  }

  static async getConversationById(userId, conversationId) {
    const conv = await Conversation.findById(conversationId);
    assertOwnership(conv, userId);

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    return {
      id: conv._id.toString(),
      _id: conv._id,
      title: conv.title,
      repositoryId: conv.repositoryId,
      ownerId: conv.ownerId,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messages: messages.map((m) => ({
        id: m._id.toString(),
        _id: m._id,
        role: m.role,
        content: m.content,
        fileReferences: m.fileReferences,
        createdAt: m.createdAt,
      })),
    };
  }

  static async createConversation(userId, { repositoryId, title }) {
    let repoId = repositoryId;
    if (!repoId) {
      const defaultRepo = await Repository.findOne({ ownerId: userId });
      if (defaultRepo) {
        repoId = defaultRepo._id;
      } else {
        const createdRepo = await Repository.create({
          ownerId: userId,
          name: 'codepilot-core',
          url: 'https://github.com/truto/codepilot-core',
        });
        repoId = createdRepo._id;
      }
    }

    const conversation = await Conversation.create({
      ownerId: userId,
      repositoryId: repoId,
      title: title || 'New Conversation',
    });

    return {
      id: conversation._id.toString(),
      _id: conversation._id,
      title: conversation.title,
      repositoryId: conversation.repositoryId,
      ownerId: conversation.ownerId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: [],
    };
  }

  static async renameConversation(userId, conversationId, title) {
    const conv = await Conversation.findById(conversationId);
    assertOwnership(conv, userId);

    conv.title = title;
    await conv.save();
    return conv;
  }

  static async deleteConversation(userId, conversationId) {
    const conv = await Conversation.findById(conversationId);
    assertOwnership(conv, userId);

    await Promise.all([
      Conversation.deleteOne({ _id: conversationId }),
      Message.deleteMany({ conversationId }),
    ]);

    return true;
  }

  static async sendMessage(userId, conversationId, content) {
    const conv = await Conversation.findById(conversationId);
    assertOwnership(conv, userId);

    // 1. Create user message
    const userMsg = await Message.create({
      conversationId: conv._id,
      ownerId: userId,
      role: 'user',
      content,
      fileReferences: [],
    });

    // 2. Synthesize assistant response (extensible for Phase 4 Python LLM / RAG service)
    const assistantReply = `### CodePilot Assistant Analysis

Analyzed context query: **"${content}"**

\`\`\`javascript
// Contextual symbol reference for query
export function handleCodebaseQuery(input) {
  // Evaluated against indexed AST graph
  return { query: "${content.replace(/"/g, '\\"')}", status: "resolved" };
}
\`\`\`

> **Backend Architecture Note**: This response was generated by CodePilot's Node.js backend. In Phase 4, this endpoint dispatches vector similarity queries to the Python RAG microservice.`;

    const assistantMsg = await Message.create({
      conversationId: conv._id,
      ownerId: userId,
      role: 'assistant',
      content: assistantReply,
      fileReferences: ['src/index.js'],
    });

    // Update conversation timestamp
    conv.updatedAt = new Date();
    await conv.save();

    return {
      userMessage: {
        id: userMsg._id.toString(),
        _id: userMsg._id,
        role: userMsg.role,
        content: userMsg.content,
        fileReferences: userMsg.fileReferences,
        createdAt: userMsg.createdAt,
      },
      assistantMessage: {
        id: assistantMsg._id.toString(),
        _id: assistantMsg._id,
        role: assistantMsg.role,
        content: assistantMsg.content,
        fileReferences: assistantMsg.fileReferences,
        createdAt: assistantMsg.createdAt,
      },
    };
  }
}
