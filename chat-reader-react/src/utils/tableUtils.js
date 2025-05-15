export function parseTableRowData(dataString) {
  const entries = [];
  // RegExp to match key:"value" pairs, handling escaped quotes in value
  const pairRegex = /(\d+):"((?:\\.|[^"\\])*)"/g;
  let match;
  while ((match = pairRegex.exec(dataString)) !== null) {
    // Key is match[1], Value is match[2]. Replace escaped quotes in value.
    entries.push([parseInt(match[1], 10), match[2].replace(/\\"/g, '"')]);
  }
  // Sort by key to ensure correct order
  entries.sort((a, b) => a[0] - b[0]);
  // Return only the values (second element of each pair)
  return entries.map(entry => entry[1]);
} 