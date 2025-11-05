function safeParse(jsonLike, fallback = null) {
  try {
    if (!jsonLike || typeof jsonLike !== 'string') return fallback;
    return JSON.parse(jsonLike);
  } catch (_) {
    return fallback;
  }
}

function buildIdentityPrompt(companionRow, userMessage = '') {
  const name = companionRow.companion_name || companionRow.name || 'Your Companion';
  const personality = companionRow.companion_personality || companionRow.personality || '';
  const traits = safeParse(companionRow.companion_traits || companionRow.traits, []);
  const backstory = companionRow.companion_backstory || companionRow.backstory || '';
  const age = companionRow.companion_age || companionRow.age || '';
  const country = companionRow.companion_country || companionRow.country || '';

  const traitsList = Array.isArray(traits) && traits.length ? `Traits: ${traits.join(', ')}` : '';
  const meta = [age ? `Age: ${age}` : '', country ? `Country: ${country}` : ''].filter(Boolean).join(' | ');

  const identityQuestionHints = [
    'who are you',
    'what are you',
    'tell me about yourself',
    'introduce yourself',
    'what do you do',
    'where are you from',
    'tell me more about you',
    'what can you tell me about yourself'
  ].join(', ');

  const instructions = [
    `You are ${name}.`,
    personality ? `Personality: ${personality}` : '',
    traitsList,
    backstory ? `Backstory: ${backstory}` : '',
    meta,
    userMessage ? `The user asked: "${userMessage}"` : '',
    'Identity-intent questions include: ' + identityQuestionHints + '.',
    'If the user asks an identity-intent question, answer with a concise self-introduction (1–2 sentences) about who you are.',
    'Describe yourself only. Do NOT mention what you are looking for, partner preferences, or calls to action.',
    'Stay in character and keep it natural.'
  ].filter(Boolean).join('\n');

  return instructions;
}

module.exports = { buildIdentityPrompt };


