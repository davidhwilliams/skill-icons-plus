import { readdirSync, writeFileSync } from 'fs';
import { basename } from 'path';

const ICONS_DIR = './icons';
const OUTPUT_FILE = 'ICONS.md';

// Normalizes a filename to a base ID. e.g., 'my-icon-dark.svg' -> 'my-icon'
const getBaseId = (file: string) =>
  basename(file, '.svg')
    .toLowerCase()
    .replace(/-dark|-light/g, '');

try {
  const svgFiles = readdirSync(ICONS_DIR).filter((file) => file.endsWith('.svg'));

  // Use reduce to create a map of baseId -> preferred filename, prioritizing dark versions.
  const preferredIcons = svgFiles.reduce((acc, file) => {
    const baseId = getBaseId(file);
    const existingFile = acc.get(baseId);

    // Keep the dark theme version if available, otherwise keep the existing one.
    if (!existingFile || (file.includes('-dark') && !existingFile.includes('-dark'))) {
      acc.set(baseId, file);
    }
    return acc;
  }, new Map());

  // Sort the final icon list alphabetically by base ID.
  const sortedIconFiles = [...preferredIcons.values()].sort((a, b) => getBaseId(a).localeCompare(getBaseId(b)));

  // --- Split output into two columns ---

  // 1. Filter icons into two groups based on their starting letter.
  const aToMFiles = sortedIconFiles.filter((file) => getBaseId(file) <= 'm');
  const nToZFiles = sortedIconFiles.filter((file) => getBaseId(file) > 'm');

  // 2. Build the markdown rows, combining both lists side-by-side.
  const tableRows = [];
  const rowCount = Math.max(aToMFiles.length, nToZFiles.length);

  for (let i = 0; i < rowCount; i++) {
    const fileA = aToMFiles[i];
    const fileN = nToZFiles[i];

    // Prepare cell content, using empty strings for blank cells.
    const idA = fileA ? `\`${getBaseId(fileA)}\`` : '';
    const iconA = fileA ? `<img src="./icons/${fileA}" width="48">` : '';
    const idN = fileN ? `\`${getBaseId(fileN)}\`` : '';
    const iconN = fileN ? `<img src="./icons/${fileN}" width="48">` : '';

    tableRows.push(`| ${idA} | ${iconA} | ${idN} | ${iconN} |`);
  }

  // 3. Assemble the final markdown table with a 4-column header.
  const markdownTable = ['| A-L |    | M-Z |    |', '| :-- | :--: | :-- | :--: |', ...tableRows].join('\n');

  writeFileSync(OUTPUT_FILE, markdownTable);
  console.log(`Successfully generated ${OUTPUT_FILE}`);
} catch (error) {
  console.error('Error generating icon table:', error);
}
