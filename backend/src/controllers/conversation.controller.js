import { ConversationService } from '../services/conversation.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class ConversationController {
  static getConversations = asyncHandler(async (req, res) => {
    const convs = await ConversationService.getConversations(req.user.id);
    return ApiResponse.success(res, convs, 200, 'Conversations retrieved successfully');
  });

  static getConversationById = asyncHandler(async (req, res) => {
    const conv = await ConversationService.getConversationById(req.user.id, req.params.id);
    return ApiResponse.success(res, conv);
  });

  static createConversation = asyncHandler(async (req, res) => {
    const conv = await ConversationService.createConversation(req.user.id, req.body);
    return ApiResponse.created(res, conv, 'Conversation created successfully');
  });

  static renameConversation = asyncHandler(async (req, res) => {
    const conv = await ConversationService.renameConversation(req.user.id, req.params.id, req.body.title);
    return ApiResponse.success(res, conv, 200, 'Conversation renamed successfully');
  });

  static deleteConversation = asyncHandler(async (req, res) => {
    await ConversationService.deleteConversation(req.user.id, req.params.id);
    return ApiResponse.success(res, { id: req.params.id }, 200, 'Conversation deleted successfully');
  });

  static sendMessage = asyncHandler(async (req, res) => {
    const result = await ConversationService.sendMessage(req.user.id, req.params.id, req.body.content);
    return ApiResponse.success(res, result, 201, 'Message processed successfully');
  });
}
