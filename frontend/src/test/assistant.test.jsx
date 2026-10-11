import { describe, it, expect } from 'vitest';
import { assistantService } from '../services/assistantService.js';
import { deterministicPromptResponses } from '../data/conversations.js';

describe('Assistant Service & Deterministic AI Logic', () => {
  it('creates and retrieves a new conversation', async () => {
    const newConv = await assistantService.createConversation(
      'repo-codepilot-core',
      'Architecture Test'
    );
    expect(newConv.id).toBeDefined();
    expect(newConv.title).toBe('Architecture Test');

    const conv = await assistantService.getConversationById(newConv.id);
    expect(conv.id).toBe(newConv.id);
  });

  it('generates deterministic response for known architectural prompt', async () => {
    const conv = await assistantService.createConversation(
      'repo-codepilot-core',
      'Prompt Verification'
    );
    const prompt = 'Explain how authentication works.';
    const result = await assistantService.sendMessage(conv.id, prompt);

    expect(result.userMessage.content).toBe(prompt);
    expect(result.assistantMessage.content).toContain('Authentication Flow');
    expect(result.assistantMessage.role).toBe('assistant');
  });

  it('generates labeled demo fallback for unrecognized prompts', async () => {
    const conv = await assistantService.createConversation(
      'repo-codepilot-core',
      'Fallback Check'
    );
    const customPrompt = 'How does the custom cache layer serialize items?';
    const result = await assistantService.sendMessage(conv.id, customPrompt);

    expect(result.assistantMessage.content).toContain('Simulated Response (Demo Mode)');
  });
});
