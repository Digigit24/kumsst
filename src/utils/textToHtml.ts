/**
 * Text to HTML Conversion Utilities
 * Supports simple markdown-like syntax for non-technical users
 */

/**
 * Convert simple text with markdown-like syntax to HTML
 *
 * Supported syntax:
 * - **bold** → <strong>bold</strong>
 * - _italic_ → <em>italic</em>
 * - # Heading → <h1>Heading</h1>
 * - ## Sub Heading → <h2>Sub Heading</h2>
 * - ### Small Heading → <h3>Small Heading</h3>
 * - [center]text[/center] → <p style="text-align:center">text</p>
 * - [right]text[/right] → <p style="text-align:right">text</p>
 * - Empty line → New paragraph
 * - Single line break → <br>
 */
export function textToHtml(text: string): string {
  if (!text || text.trim() === '') return '';

  let html = text;

  // Escape HTML special characters first (except our syntax)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Process headings (must be at start of line)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Process alignment tags
  html = html.replace(/\[center\]([\s\S]*?)\[\/center\]/gi, '<p style="text-align:center">$1</p>');
  html = html.replace(/\[right\]([\s\S]*?)\[\/right\]/gi, '<p style="text-align:right">$1</p>');
  html = html.replace(/\[left\]([\s\S]*?)\[\/left\]/gi, '<p style="text-align:left">$1</p>');

  // Process bold (**text**)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Process italic (_text_)
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Process underline (__text__)
  html = html.replace(/__(.+?)__/g, '<u>$1</u>');

  // Split by double newlines (paragraphs)
  const paragraphs = html.split(/\n\n+/);

  html = paragraphs
    .map(para => {
      const trimmed = para.trim();
      if (!trimmed) return '';

      // Don't wrap if it's already a heading or has alignment
      if (trimmed.startsWith('<h1>') || trimmed.startsWith('<h2>') || trimmed.startsWith('<h3>') ||
          trimmed.startsWith('<p style=')) {
        // Convert single newlines to <br> within these blocks
        return trimmed.replace(/\n/g, '<br>');
      }

      // Wrap in paragraph and convert single newlines to <br>
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    })
    .filter(p => p)
    .join('\n');

  return html;
}

/**
 * Convert HTML back to simple text format
 * Best-effort conversion - complex HTML may lose some formatting
 */
export function htmlToText(html: string): string {
  if (!html || html.trim() === '') return '';

  let text = html;

  // Convert headings
  text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
  text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
  text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');

  // Convert alignment
  text = text.replace(/<p[^>]*style="[^"]*text-align:\s*center[^"]*"[^>]*>([\s\S]*?)<\/p>/gi, '[center]$1[/center]\n\n');
  text = text.replace(/<p[^>]*style="[^"]*text-align:\s*right[^"]*"[^>]*>([\s\S]*?)<\/p>/gi, '[right]$1[/right]\n\n');
  text = text.replace(/<div[^>]*style="[^"]*text-align:\s*center[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, '[center]$1[/center]\n\n');
  text = text.replace(/<div[^>]*style="[^"]*text-align:\s*right[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, '[right]$1[/right]\n\n');

  // Convert bold
  text = text.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  text = text.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');

  // Convert italic
  text = text.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '_$1_');
  text = text.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '_$1_');

  // Convert underline
  text = text.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '__$1__');

  // Convert line breaks
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Convert paragraphs (add double newline)
  text = text.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');
  text = text.replace(/<p[^>]*>/gi, '');
  text = text.replace(/<\/p>/gi, '\n\n');

  // Convert divs
  text = text.replace(/<\/div>\s*<div[^>]*>/gi, '\n\n');
  text = text.replace(/<div[^>]*>/gi, '');
  text = text.replace(/<\/div>/gi, '\n\n');

  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Clean up multiple newlines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Check if content appears to be HTML
 */
export function isHtmlContent(content: string): boolean {
  if (!content) return false;

  // Check for common HTML tags
  const htmlPattern = /<\/?(?:p|div|span|h[1-6]|strong|em|b|i|u|br|table|tr|td|th|ul|ol|li|a|img)[^>]*>/i;
  return htmlPattern.test(content);
}

/**
 * Get formatting help text for simple mode
 */
export function getFormattingHelp(): string {
  return `
Formatting Guide:
• **bold text** → bold
• _italic text_ → italic
• __underline__ → underline
• # Heading → Large heading
• ## Sub Heading → Medium heading
• ### Small Heading → Small heading
• [center]text[/center] → Center aligned
• [right]text[/right] → Right aligned
• Empty line → New paragraph
`.trim();
}
