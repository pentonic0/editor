/**
 * emojiData.ts
 * Provides emoji autocomplete functionality.
 * Triggered when user types ":" followed by text.
 */

export interface EmojiEntry {
  emoji: string;
  name: string;
  keywords: string[];
}

// Curated emoji list for autocomplete
export const EMOJI_LIST: EmojiEntry[] = [
  { emoji: "😀", name: "grinning", keywords: ["smile", "happy", "face"] },
  { emoji: "😂", name: "joy", keywords: ["laugh", "funny", "lol"] },
  { emoji: "😍", name: "heart_eyes", keywords: ["love", "cute"] },
  { emoji: "🤔", name: "thinking", keywords: ["think", "hmm", "idea"] },
  { emoji: "👍", name: "thumbsup", keywords: ["yes", "agree", "good"] },
  { emoji: "👎", name: "thumbsdown", keywords: ["no", "bad", "disagree"] },
  { emoji: "❤️", name: "heart", keywords: ["love", "like", "red"] },
  { emoji: "🔥", name: "fire", keywords: ["hot", "flame", "lit"] },
  { emoji: "✨", name: "sparkles", keywords: ["magic", "star", "shiny"] },
  { emoji: "🎉", name: "tada", keywords: ["celebrate", "party", "confetti"] },
  { emoji: "🚀", name: "rocket", keywords: ["launch", "space", "fast"] },
  { emoji: "💡", name: "bulb", keywords: ["idea", "light", "tip"] },
  { emoji: "📝", name: "memo", keywords: ["note", "write", "doc"] },
  { emoji: "📌", name: "pushpin", keywords: ["pin", "mark", "save"] },
  { emoji: "⚠️", name: "warning", keywords: ["alert", "caution", "warn"] },
  { emoji: "✅", name: "white_check_mark", keywords: ["done", "check", "ok"] },
  { emoji: "❌", name: "x", keywords: ["no", "wrong", "cancel"] },
  { emoji: "🌟", name: "star2", keywords: ["star", "gold", "shiny"] },
  { emoji: "💪", name: "muscle", keywords: ["strong", "power", "flex"] },
  { emoji: "🎯", name: "dart", keywords: ["target", "goal", "aim"] },
  { emoji: "🧠", name: "brain", keywords: ["think", "smart", "mind"] },
  { emoji: "🌍", name: "earth_africa", keywords: ["world", "global", "earth"] },
  { emoji: "🎨", name: "art", keywords: ["design", "creative", "palette"] },
  { emoji: "💻", name: "computer", keywords: ["code", "laptop", "tech"] },
  { emoji: "📊", name: "bar_chart", keywords: ["chart", "graph", "data"] },
  { emoji: "🔗", name: "link", keywords: ["chain", "link", "url"] },
  { emoji: "📧", name: "email", keywords: ["mail", "message", "email"] },
  { emoji: "🔒", name: "lock", keywords: ["secure", "private", "lock"] },
  { emoji: "⭐", name: "star", keywords: ["star", "favorite", "rate"] },
  { emoji: "🏆", name: "trophy", keywords: ["win", "award", "gold"] },
  { emoji: "🌈", name: "rainbow", keywords: ["color", "pride", "hope"] },
  { emoji: "☀️", name: "sunny", keywords: ["sun", "bright", "day"] },
  { emoji: "🌙", name: "moon", keywords: ["night", "dark", "crescent"] },
  { emoji: "❄️", name: "snowflake", keywords: ["cold", "winter", "ice"] },
  { emoji: "🍎", name: "apple", keywords: ["fruit", "apple", "red"] },
  { emoji: "☕", name: "coffee", keywords: ["coffee", "drink", "morning"] },
  { emoji: "🎵", name: "musical_note", keywords: ["music", "note", "song"] },
  { emoji: "📚", name: "books", keywords: ["book", "read", "study"] },
  { emoji: "🔍", name: "mag", keywords: ["search", "find", "zoom"] },
  { emoji: "🛠️", name: "hammer_and_wrench", keywords: ["tool", "build", "fix"] },
];

/**
 * Search emojis by query string (matches name and keywords)
 * Returns top 8 matches for the autocomplete dropdown
 */
export function searchEmojis(query: string): EmojiEntry[] {
  if (!query || query.length < 1) return [];
  
  const q = query.toLowerCase();
  
  return EMOJI_LIST
    .filter(entry => 
      entry.name.includes(q) || 
      entry.keywords.some(k => k.includes(q))
    )
    .slice(0, 8);
}

/**
 * Detects if the current text ends with an emoji trigger pattern ":word"
 * Returns the query string (after ":") if found, null otherwise
 */
export function detectEmojiTrigger(text: string): string | null {
  const match = text.match(/:([a-z_]{1,20})$/);
  return match ? match[1] : null;
}
