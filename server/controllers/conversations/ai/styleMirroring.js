function clampEmojiCount(count) {
  if (count <= 0) return 0;
  if (count > 2) return 2;
  return count;
}

function detectEmojiDensity(text) {
  if (!text) return 0;
  const matches = text.match(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu);
  return matches ? matches.length : 0;
}

function mirrorLength(userText, aiText) {
  const targetLen = Math.max(8, Math.min(userText.length * 1.1, 240));
  if (aiText.length <= targetLen) return aiText;
  // Trim at sentence boundary if possible
  const sentenceCut = aiText.slice(0, targetLen).lastIndexOf('. ');
  if (sentenceCut > 0 && sentenceCut > targetLen * 0.5) {
    return aiText.slice(0, sentenceCut + 1);
  }
  return aiText.slice(0, Math.floor(targetLen)).trim();
}

function mirrorPunctuation(userText, aiText) {
  const manyExcl = (userText.match(/!/g) || []).length >= 2;
  const manyQ = (userText.match(/\?/g) || []).length >= 2;
  let out = aiText;
  if (manyExcl) out = out.replace(/!+/g, '!');
  if (manyQ) out = out.replace(/\?+/g, '?');
  return out;
}

function addMirroredEmojis(userText, aiText) {
  const userEmojis = clampEmojiCount(detectEmojiDensity(userText));
  if (userEmojis <= 0) return aiText;
  // Add up to userEmojis at end, but max 2 total
  const toAdd = clampEmojiCount(userEmojis);
  const sample = ['🙂','😊','😄','😉'];
  let appended = aiText;
  for (let i = 0; i < toAdd; i++) {
    appended += (i === 0 ? ' ' : '') + sample[i % sample.length];
  }
  return appended.trim();
}

function applyStyleMirroring(userMessage, aiText) {
  if (!userMessage || !aiText) return aiText || '';
  let out = aiText.trim();
  out = mirrorLength(userMessage, out);
  out = mirrorPunctuation(userMessage, out);
  out = addMirroredEmojis(userMessage, out);
  return out;
}

module.exports = { applyStyleMirroring };


