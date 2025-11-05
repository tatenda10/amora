function detectTone(text) {
  const t = (text || '').toLowerCase();
  if (!t) return 'neutral';
  if (/(sad|down|depressed|upset|lonely|tired|exhausted|anxious|stressed)/.test(t)) return 'low';
  if (/(angry|mad|furious|pissed|annoyed|frustrated)/.test(t)) return 'frustrated';
  if (/(happy|excited|pumped|stoked|great|awesome|amazing)/.test(t)) return 'positive';
  return 'neutral';
}

function lightlyAttune(aiText, tone) {
  const trimmed = (aiText || '').trim();
  if (!trimmed) return '';
  switch (tone) {
    case 'low':
      return `I hear you. ${trimmed}`;
    case 'frustrated':
      return `I get why that’s frustrating. ${trimmed}`;
    case 'positive':
      return `Love the energy. ${trimmed}`;
    default:
      return trimmed;
  }
}

function applyEmotionalAttunement(userMessage, aiText) {
  const tone = detectTone(userMessage);
  return lightlyAttune(aiText, tone);
}

module.exports = { applyEmotionalAttunement };


