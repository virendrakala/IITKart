export const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.trim();
  return /^[0-9]{10}$/.test(cleanPhone);
};

// Issue #89: Validate Email - must be a valid email format
export const isValidEmail = (email: string): boolean => {
  const cleanEmail = email.trim();
  // Valid email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Check for emojis
  const hasEmoji = /\p{Emoji}/u.test(cleanEmail);
  return emailRegex.test(cleanEmail) && !hasEmoji;
};

// Issue #89: Validate Name - must contain at least one alphanumeric character
export const isValidName = (name: string): boolean => {
  const cleanName = name.trim();
  // Must not be empty
  if (cleanName.length === 0) return false;
  // Must contain at least one alphanumeric character
  if (!/[a-zA-Z0-9]/.test(cleanName)) return false;
  return true;
};

// Issue #86: Validate text fields - must contain at least one alphanumeric character
export const isValidTextInput = (text: string): boolean => {
  const cleanText = text.trim();
  // Must not be empty
  if (cleanText.length === 0) return false;
  // Must contain at least one alphanumeric character
  if (!/[a-zA-Z0-9]/.test(cleanText)) return false;
  return true;
};

// Issue #80: Validate numeric fields - ensures proper number parsing
export const parseNumericInput = (value: string | number): number => {
  let num = Number(value);
  if (isNaN(num) || num < 0) num = 0;
  return num;
};
