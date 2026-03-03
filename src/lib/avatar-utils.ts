/**
 * Avatar utilities - Generate consistent colors from names
 */

// Beautiful color palette for avatars
const AVATAR_COLORS = [
  { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300' },
  { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300' },
  { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', text: 'text-fuchsia-700 dark:text-fuchsia-300' },
  { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300' },
  { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300' },
  { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300' },
  { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300' },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  { bg: 'bg-lime-100 dark:bg-lime-900/30', text: 'text-lime-700 dark:text-lime-300' },
  { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
];

/**
 * Generate a consistent hash from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get consistent avatar colors based on name
 * Same name always returns same color
 */
export function getAvatarColors(name: string): { bg: string; text: string } {
  if (!name) return AVATAR_COLORS[0];
  const index = hashString(name.toLowerCase()) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Get initials from a name (max 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get avatar class string for use with cn()
 */
export function getAvatarClassName(name: string): string {
  const colors = getAvatarColors(name);
  return `${colors.bg} ${colors.text}`;
}

/**
 * Generate HSL color from name (for CSS style)
 */
export function getAvatarHSL(name: string): { background: string; color: string } {
  if (!name) return { background: 'hsl(0, 0%, 90%)', color: 'hsl(0, 0%, 30%)' };

  const hash = hashString(name.toLowerCase());
  const hue = hash % 360;

  return {
    background: `hsl(${hue}, 70%, 90%)`,
    color: `hsl(${hue}, 70%, 30%)`,
  };
}

export default getAvatarColors;
