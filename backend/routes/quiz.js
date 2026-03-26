import express from 'express';
import { getBedrockResponse } from '../services/bedrockService.js';

const router = express.Router();

const QUIZ_SYSTEM_PROMPT = `You are a quiz generator for Indian school students. Return ONLY a valid JSON array. No markdown, no code blocks, no explanation. Just the raw JSON array starting with [ and ending with ].`;

// Languages that are themselves regional language subjects
const REGIONAL_LANGUAGE_SUBJECTS = [
  'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam', 'Bengali',
  'Marathi', 'Gujarati', 'Punjabi', 'Odia', 'Assamese', 'Urdu',
  'Sanskrit', 'Mizo', 'Manipuri', 'Konkani', 'Nepali',
  'Regional Language', 'Language I (Regional)', 'Language I'
];

/**
 * Determine the language questions should be asked in.
 * Rule:
 *   - If subject IS a regional language → always use that language
 *   - Otherwise → use the student's medium language (e.g. Tamil Medium → Tamil)
 *   - If medium is English → use English
 */
function resolveQuestionLanguage(subject, language, stateLanguage) {
  const subjectClean = (subject || '').trim();

  // Check if the subject itself is a regional language
  const isRegionalSubject = REGIONAL_LANGUAGE_SUBJECTS.some(
    lang => subjectClean.toLowerCase() === lang.toLowerCase()
  );

  if (isRegionalSubject) {
    // Use the subject name as the language (e.g. subject "Tamil" → questions in Tamil)
    // If subject is generic "Regional Language", fall back to stateLanguage
    if (subjectClean.toLowerCase().includes('regional') || subjectClean.toLowerCase().includes('language i')) {
      return stateLanguage || 'Tamil';
    }
    return subjectClean;
  }

  // For all other subjects, use the student's medium language
  return language || 'English';
}

/**
 * POST /api/quiz/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { subject, classNum, board, numQuestions, difficulty, language, stateLanguage, medium } = req.body;

    if (!subject || !numQuestions) {
      return res.status(400).json({ error: 'subject and numQuestions are required' });
    }

    const cls = classNum || '10';
    const brd = board || 'CBSE';
    const diff = difficulty || 'medium';
    const count = Math.min(parseInt(numQuestions), 20);

    const questionLang = resolveQuestionLanguage(subject, language, stateLanguage);
    const isNonEnglish = questionLang !== 'English';

    const langInstruction = isNonEnglish
      ? `MANDATORY LANGUAGE RULE — NO EXCEPTIONS:
- Write EVERY question in ${questionLang} script
- Write EVERY option in ${questionLang} script  
- Write EVERY explanation in ${questionLang} script
- Do NOT use English words anywhere
- Do NOT use Roman/Latin transliteration
- Use only authentic ${questionLang} script characters
- Example for Tamil: "எத்தனை..." NOT "Ethanai..." NOT "How many..."
- Example for Hindi: "कितने..." NOT "Kitne..." NOT "How many..."`
      : `Write all questions, options, and explanations in English.`;

    const prompt = `Generate ${count} ${diff} difficulty multiple-choice quiz questions for a Class ${cls} student studying ${subject} (${brd} board).

${langInstruction}

Curriculum requirements:
- Questions must test specific Class ${cls} ${subject} concepts
- Each question has exactly 4 options
- "correct" is the 0-based index (0, 1, 2, or 3) of the correct answer
- Explanation should be 1-2 sentences

Return ONLY this JSON array with no other text:
[{"id":1,"question":"...","options":["option1","option2","option3","option4"],"correct":0,"explanation":"..."}]`;

    const raw = await getBedrockResponse(prompt, {
      maxTokens: 1400,
      temperature: 0.4,
      systemPrompt: QUIZ_SYSTEM_PROMPT,
    });

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array found in AI response');

    const questions = JSON.parse(match[0]);
    const valid = questions.filter(q =>
      q.question &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      typeof q.correct === 'number' &&
      q.correct >= 0 && q.correct < 4
    );

    if (!valid.length) throw new Error('No valid questions generated');

    res.json({ success: true, questions: valid, language: questionLang });
  } catch (error) {
    console.error('❌ Quiz generation error:', error);
    res.status(500).json({ error: 'Quiz generation failed', message: error.message });
  }
});

export default router;
