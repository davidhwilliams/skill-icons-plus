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

  // --- Split output into three columns ---

  // 1. Calculate chunk size to distribute icons across three columns.
  const totalIcons = sortedIconFiles.length;
  const colSize = Math.ceil(totalIcons / 3);

  const col1 = sortedIconFiles.slice(0, colSize);
  const col2 = sortedIconFiles.slice(colSize, colSize * 2);
  const col3 = sortedIconFiles.slice(colSize * 2);

  // 2. Build the markdown rows, combining all three lists side-by-side.
  const tableRows = [];
  const rowCount = Math.max(col1.length, col2.length, col3.length);

  for (let i = 0; i < rowCount; i++) {
    const f1 = col1[i];
    const f2 = col2[i];
    const f3 = col3[i];

    const cell = (f: string | undefined) => ({
      id: f ? `\`${getBaseId(f)}\`` : '',
      img: f ? `<img src="./icons/${f}" width="48">` : '',
    });

    const c1 = cell(f1),
      c2 = cell(f2),
      c3 = cell(f3);
    tableRows.push(`| ${c1.id} | ${c1.img} | ${c2.id} | ${c2.img} | ${c3.id} | ${c3.img} |`);
  }

  // 3. Assemble the final markdown table with a 6-column header.
  const markdownTable = [
    '| Name | Icon | Name | Icon | Name | Icon |',
    '| :-- | :--: | :-- | :--: | :-- | :--: |',
    ...tableRows,
  ].join('\n');

  writeFileSync(OUTPUT_FILE, markdownTable);
  console.log(`Successfully generated ${OUTPUT_FILE}`);
} catch (error) {
  console.error('Error generating icon table:', error);
}
