/**
 * Smart AI Response Formatter
 * Converts raw AI API responses into human-readable text
 * instead of showing ugly JSON.stringify output
 */

/**
 * Extracts a readable text string from any AI response object.
 * Tries common response field patterns before falling back to
 * a clean, human-readable summary.
 */
export function formatAIResponse(data: any, maxLength?: number): string {
  if (!data) return 'No data available';
  if (typeof data === 'string') return maxLength ? data.slice(0, maxLength) : data;
  if (typeof data === 'number' || typeof data === 'boolean') return String(data);

  // Try common text fields first (most AI responses use these)
  const textFields = [
    'content', 'message', 'text', 'body', 'description', 'summary',
    'post', 'subject', 'title', 'suggestion', 'recommendation',
    'response', 'reply', 'answer', 'result', 'output',
    'optimizedMessage', 'generatedContent', 'analysis',
    'resolution', 'classification', 'category', 'sentiment',
    'riskLevel', 'predictedLTV', 'name', 'headline',
    'explanation', 'insight', 'feedback', 'note', 'detail',
    'action', 'instruction', 'reason', 'status'
  ];

  for (const field of textFields) {
    if (data[field] && typeof data[field] === 'string') {
      return maxLength ? data[field].slice(0, maxLength) : data[field];
    }
  }

  // Try nested data object
  if (data.data && typeof data.data === 'object') {
    return formatAIResponse(data.data, maxLength);
  }

  // Build a readable summary from key-value pairs
  return objectToReadableText(data, maxLength);
}

/**
 * Converts an object to clean, readable text lines
 */
function objectToReadableText(obj: any, maxLength?: number): string {
  if (Array.isArray(obj)) {
    const items = obj.slice(0, 5).map((item, i) => {
      if (typeof item === 'string') return `• ${item}`;
      if (typeof item === 'object' && item) {
        const label = item.title || item.name || item.message || item.content || item.label || `Item ${i + 1}`;
        const desc = item.description || item.detail || item.summary || '';
        return desc ? `• ${label}: ${desc}` : `• ${label}`;
      }
      return `• ${String(item)}`;
    });
    if (obj.length > 5) items.push(`... and ${obj.length - 5} more`);
    const result = items.join('\n');
    return maxLength ? result.slice(0, maxLength) : result;
  }

  // Filter out internal/meta fields and format remaining as readable text
  const skipFields = ['id', '_id', '__v', 'createdAt', 'updatedAt', 'timestamp', 'version', 'success', 'ok'];
  const entries = Object.entries(obj)
    .filter(([key, val]) => !skipFields.includes(key) && val !== null && val !== undefined && val !== '')
    .slice(0, 8);

  if (entries.length === 0) return 'Processing complete';

  const lines = entries.map(([key, val]) => {
    const label = formatFieldName(key);
    if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val)) {
        if (val.length === 0) return null;
        const items = val.slice(0, 3).map(v => typeof v === 'string' ? v : (v?.title || v?.name || v?.message || formatAIResponse(v))).join(', ');
        return `${label}: ${items}${val.length > 3 ? ` (+${val.length - 3} more)` : ''}`;
      }
      return `${label}: ${formatAIResponse(val)}`;
    }
    if (typeof val === 'boolean') return `${label}: ${val ? 'Yes' : 'No'}`;
    if (typeof val === 'number') return `${label}: ${formatNumber(val)}`;
    return `${label}: ${val}`;
  }).filter(Boolean);

  const result = lines.join(' | ');
  return maxLength ? result.slice(0, maxLength) : result;
}

/**
 * Converts camelCase/snake_case field names to readable labels
 */
function formatFieldName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
    .trim();
}

/**
 * Formats numbers nicely (adds commas, handles percentages/currency)
 */
function formatNumber(num: number): string {
  if (num >= 0 && num <= 1 && num !== 0 && num !== 1) {
    return `${Math.round(num * 100)}%`;
  }
  if (num >= 1000) {
    return num.toLocaleString('en-IN');
  }
  return String(Math.round(num * 100) / 100);
}

/**
 * Extracts a specific field from AI response with smart fallback
 */
export function extractAIField(data: any, ...fields: string[]): string {
  if (!data) return '';
  for (const field of fields) {
    if (data[field] && typeof data[field] === 'string') return data[field];
    if (data[field] && typeof data[field] === 'number') return formatNumber(data[field]);
  }
  return formatAIResponse(data);
}

/**
 * Formats AI response data for display in cards/panels
 * Returns structured object with title, body, and metadata
 */
export function formatAICardData(data: any): {
  title: string;
  body: string;
  metadata: { label: string; value: string }[];
  tags: string[];
} {
  if (!data || typeof data === 'string') {
    return { title: '', body: data || '', metadata: [], tags: [] };
  }

  const title = data.title || data.name || data.headline || data.subject || '';
  const body = data.content || data.body || data.description || data.message || data.summary || data.text || '';

  const metadata: { label: string; value: string }[] = [];
  const metaFields = ['confidence', 'score', 'priority', 'category', 'sentiment', 'status', 'riskLevel', 'platform', 'type'];
  for (const field of metaFields) {
    if (data[field] !== undefined && data[field] !== null) {
      metadata.push({
        label: formatFieldName(field),
        value: typeof data[field] === 'number' ? formatNumber(data[field]) : String(data[field])
      });
    }
  }

  const tags: string[] = [];
  if (data.hashtags) tags.push(...(Array.isArray(data.hashtags) ? data.hashtags : [data.hashtags]));
  if (data.tags) tags.push(...(Array.isArray(data.tags) ? data.tags : [data.tags]));
  if (data.keywords) tags.push(...(Array.isArray(data.keywords) ? data.keywords : [data.keywords]));

  return { title, body: body || formatAIResponse(data), metadata, tags };
}

/**
 * Smart formatter for analytics/table data
 * Converts raw query results into a table-friendly format
 */
export function formatAnalyticsResults(data: any): {
  type: 'table' | 'list' | 'summary';
  headers?: string[];
  rows?: string[][];
  items?: string[];
  summary?: { label: string; value: string }[];
} {
  if (!data) return { type: 'summary', summary: [{ label: 'Status', value: 'No results' }] };

  // Array of objects → table
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    const headers = Object.keys(data[0]).filter(k => !['_id', '__v'].includes(k));
    const rows = data.slice(0, 50).map(item =>
      headers.map(h => {
        const val = item[h];
        if (val === null || val === undefined) return '-';
        if (typeof val === 'object') return formatAIResponse(val);
        if (typeof val === 'number') return formatNumber(val);
        return String(val);
      })
    );
    return { type: 'table', headers: headers.map(formatFieldName), rows };
  }

  // Array of primitives → list
  if (Array.isArray(data)) {
    return { type: 'list', items: data.map(item => String(item)) };
  }

  // Single object → summary
  if (typeof data === 'object') {
    const summary = Object.entries(data)
      .filter(([k, v]) => !['_id', '__v'].includes(k) && v !== null && v !== undefined)
      .slice(0, 15)
      .map(([k, v]) => ({
        label: formatFieldName(k),
        value: typeof v === 'object' ? formatAIResponse(v) : typeof v === 'number' ? formatNumber(v as number) : String(v)
      }));
    return { type: 'summary', summary };
  }

  return { type: 'summary', summary: [{ label: 'Result', value: String(data) }] };
}
