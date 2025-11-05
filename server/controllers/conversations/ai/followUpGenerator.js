function isDirectClosedQuestion(text) {
  const lowered = (text || '').toLowerCase().trim();
  if (!lowered) return false;
  // Simple signals of a direct, closed question
  const closedPrefixes = ['is ', 'are ', 'do ', 'did ', 'can ', 'could ', 'will ', 'would '];
  const isQuestion = lowered.endsWith('?') || /\b(yes|no)\b\??$/.test(lowered);
  return isQuestion && closedPrefixes.some(p => lowered.startsWith(p));
}

function containsPersonalDetail(text) {
  const lowered = (text || '').toLowerCase();
  return /(my|i am|i'm|i have|i like|i feel|i think|my name|from)/.test(lowered);
}

function isAmbiguous(text) {
  const lowered = (text || '').toLowerCase();
  return /(maybe|idk|not sure|whatever|you know|kinda|sort of|something)/.test(lowered) || lowered.length <= 8;
}

function buildFollowUp(userMessage) {
  const lowered = (userMessage || '').toLowerCase();
  if (containsPersonalDetail(lowered)) {
    return 'What about that matters most to you?';
  }
  if (/work|job|career/.test(lowered)) return 'What do you enjoy most about it?';
  if (/food|cook|eat|restaurant|recipe/.test(lowered)) return 'What’s your go-to dish?';
  if (/music|song|dj|band|concert/.test(lowered)) return 'What are you listening to lately?';
  if (/travel|trip|country|city/.test(lowered)) return 'Where would you love to go next?';
  if (/sport|game|team|match/.test(lowered)) return 'Who are you rooting for?';
  return 'Tell me a bit more?';
}

function maybeGenerateFollowUp(userMessage, aiText) {
  const msg = (userMessage || '').trim();
  if (!msg) return null;
  // Heuristics: skip if user asked a direct closed question or gave a command
  if (isDirectClosedQuestion(msg)) return null;
  if (/^(stop|wait|don’t|dont|no)/i.test(msg)) return null;

  // Encourage follow-up if message is short/ambiguous or includes personal detail
  const shouldAsk = containsPersonalDetail(msg) || isAmbiguous(msg) || /\?$/.test(msg) === false;
  if (!shouldAsk) return null;

  return buildFollowUp(msg);
}

module.exports = { maybeGenerateFollowUp };


