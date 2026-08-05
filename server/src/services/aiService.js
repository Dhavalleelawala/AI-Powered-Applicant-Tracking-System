const config = require('../config');

function normalizeSkills(skills) {
  return [...new Set((skills || []).map((skill) => String(skill).trim().toLowerCase()).filter(Boolean))];
}

function clampScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(number)));
}

function estimateExperienceYears(text) {
  const matches = String(text || '').match(/\b(\d{1,2})\+?\s*(?:years?|yrs?)\b/gi) || [];
  return matches.reduce((maximum, match) => Math.max(maximum, Number.parseInt(match, 10) || 0), 0);
}

function normalizeAnalysis(analysis, requiredSkills, model) {
  const required = normalizeSkills(requiredSkills);
  const matched = normalizeSkills(analysis.skillsMatched).filter((skill) => required.includes(skill));
  const missing = required.filter((skill) => !matched.includes(skill));

  return {
    matchScore: clampScore(analysis.matchScore),
    skillsMatched: matched,
    skillsMissing: missing,
    experienceYearsEstimated: Math.max(0, Number(analysis.experienceYearsEstimated) || 0),
    summary: String(analysis.summary || '').slice(0, 2000),
    strengths: normalizeSkills(analysis.strengths),
    gaps: normalizeSkills(analysis.gaps),
    model,
    rawResponse: analysis.rawResponse,
  };
}

function heuristicAnalysis({ resumeText, requiredSkills }) {
  const text = String(resumeText || '').toLowerCase();
  const required = normalizeSkills(requiredSkills);
  const skillsMatched = required.filter((skill) => text.includes(skill));
  const skillsMissing = required.filter((skill) => !skillsMatched.includes(skill));
  const matchScore = required.length ? (skillsMatched.length / required.length) * 100 : 0;
  const experienceYearsEstimated = estimateExperienceYears(text);

  return normalizeAnalysis(
    {
      matchScore,
      skillsMatched,
      skillsMissing,
      experienceYearsEstimated,
      summary: skillsMatched.length
        ? `Resume matches ${skillsMatched.length} of ${required.length} required skills.`
        : 'No required skills were detected in the resume text.',
      strengths: skillsMatched,
      gaps: skillsMissing,
    },
    required,
    'heuristic-skill-overlap'
  );
}

function parseJsonResponse(content) {
  const text = String(content || '').replace(/^```json\s*|\s*```$/gim, '').trim();
  return JSON.parse(text);
}

function buildPrompt({ resumeText, jobDescription, requiredSkills }) {
  return `Analyze this candidate resume for the job below. Return only JSON with matchScore (0-100), skillsMatched (string[]), skillsMissing (string[]), experienceYearsEstimated (number), summary (string), strengths (string[]), and gaps (string[]).\n\nRequired skills: ${JSON.stringify(normalizeSkills(requiredSkills))}\n\nJob description:\n${jobDescription}\n\nResume:\n${resumeText}`;
}

async function analyzeWithOpenAI(input) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.ai.openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.ai.model,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: buildPrompt(input) }],
    }),
  });
  if (!response.ok) {
    throw new Error(`OpenAI analysis failed (${response.status})`);
  }
  const payload = await response.json();
  const analysis = parseJsonResponse(payload.choices?.[0]?.message?.content);
  return normalizeAnalysis({ ...analysis, rawResponse: payload }, input.requiredSkills, config.ai.model);
}

async function analyzeWithGemini(input) {
  const model = config.ai.model || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.ai.geminiApiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      generationConfig: { responseMimeType: 'application/json' },
      contents: [{ parts: [{ text: buildPrompt(input) }] }],
    }),
  });
  if (!response.ok) {
    throw new Error(`Gemini analysis failed (${response.status})`);
  }
  const payload = await response.json();
  const analysis = parseJsonResponse(payload.candidates?.[0]?.content?.parts?.[0]?.text);
  return normalizeAnalysis({ ...analysis, rawResponse: payload }, input.requiredSkills, model);
}

async function analyze(input) {
  if (config.ai.openaiApiKey) {
    return analyzeWithOpenAI(input);
  }
  if (config.ai.geminiApiKey) {
    return analyzeWithGemini(input);
  }
  return heuristicAnalysis(input);
}

module.exports = { analyze, clampScore };
