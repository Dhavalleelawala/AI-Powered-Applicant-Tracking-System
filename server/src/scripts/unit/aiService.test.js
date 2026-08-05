const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ats_unit';
process.env.OPENAI_API_KEY = '';
process.env.GEMINI_API_KEY = '';

const aiService = require('../../services/aiService');

describe('aiService.clampScore', () => {
  it('clamps out-of-range values', () => {
    assert.equal(aiService.clampScore(-10), 0);
    assert.equal(aiService.clampScore(150), 100);
    assert.equal(aiService.clampScore(72.4), 72);
  });

  it('treats non-numeric input as zero', () => {
    assert.equal(aiService.clampScore('bad'), 0);
    assert.equal(aiService.clampScore(undefined), 0);
  });
});

describe('aiService.analyze heuristic fallback', () => {
  it('scores skill overlap without an LLM key', async () => {
    const result = await aiService.analyze({
      resumeText: 'Backend engineer with 4 years using nodejs, express, and mongodb in production.',
      jobDescription: 'Build Node APIs with MongoDB.',
      requiredSkills: ['nodejs', 'mongodb', 'graphql'],
    });

    assert.equal(result.model, 'heuristic-skill-overlap');
    assert.ok(result.matchScore >= 60 && result.matchScore <= 70);
    assert.deepEqual(result.skillsMatched.sort(), ['mongodb', 'nodejs']);
    assert.deepEqual(result.skillsMissing, ['graphql']);
    assert.ok(result.summary.includes('2 of 3'));
  });
});
