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
    if (!existingFile || (file.includes('-dark') && !existingFile.includes('-dark'))) acc.set(baseId, file);

    return acc;
  }, new Map());

  // Sort the final icon list alphabetically by base ID.
  const sortedIconFiles = [...preferredIcons.values()].sort((a, b) => getBaseId(a).localeCompare(getBaseId(b)));

  // Generate the markdown table rows.
  const tableRows = sortedIconFiles.map((file) => {
    const baseId = getBaseId(file);
    return `| \`${baseId}\` | <img src="./icons/${file}" width="48"> |`;
  });

  const markdownTable = [
    '| Icon ID            |                         Icon                          |',
    '| :------------------ | :---------------------------------------------------: |',
    ...tableRows,
  ].join('\n');

  writeFileSync(OUTPUT_FILE, markdownTable);
  console.log(`Successfully generated ${OUTPUT_FILE}`);
} catch (error) {
  console.error('Error generating icon table:', error);
}
