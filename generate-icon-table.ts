import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const ICONS_DIR = './icons';
const README_FILE = 'README.md';

const getBaseId = (file: string): string =>
  basename(file, '.svg')
    .toLowerCase()
    .replaceAll(/-dark|-light/g, '');

try {
  const svgFiles = readdirSync(ICONS_DIR).filter((file) => file.endsWith('.svg'));

  const preferredIcons = svgFiles.reduce((acc, file) => {
    const baseId = getBaseId(file);
    const existingFile = acc.get(baseId);

    if (!existingFile || (file.includes('-dark') && !existingFile.includes('-dark'))) {
      acc.set(baseId, file);
    }
    return acc;
  }, new Map<string, string>());

  const sortedIconFiles = Array.from(preferredIcons.values()).sort((a, b) => getBaseId(a).localeCompare(getBaseId(b)));

  const totalIcons = sortedIconFiles.length;
  const colSize = Math.ceil(totalIcons / 3);

  const col1 = sortedIconFiles.slice(0, colSize);
  const col2 = sortedIconFiles.slice(colSize, colSize * 2);
  const col3 = sortedIconFiles.slice(colSize * 2);

  const tableRows: string[] = [];
  const rowCount = Math.max(col1.length, col2.length, col3.length);

  for (let i = 0; i < rowCount; i++) {
    const f1 = col1[i];
    const f2 = col2[i];
    const f3 = col3[i];

    const cell = (f: string | undefined) => ({
      id: f ? '`' + getBaseId(f) + '`' : '',
      img: f ? `<img src="./icons/${f}" width="48" alt="${f}-icon">` : '',
    });

    const c1 = cell(f1);
    const c2 = cell(f2);
    const c3 = cell(f3);

    tableRows.push(`| ${c1.id} | ${c1.img} | ${c2.id} | ${c2.img} | ${c3.id} | ${c3.img} |`);
  }

  const markdownTable = [
    '| Name | Icon | Name | Icon | Name | Icon |',
    '| :-- | :--: | :-- | :--: | :-- | :--: |',
    ...tableRows,
  ].join('\n');

  const currentContent = readFileSync(README_FILE, 'utf8');
  const lines = currentContent.split(/\r?\n/);

  let startIndex = -1;
  let endIndex = -1;

  // Search backwards to find the last table header containing Name and Icon
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.includes('Name') && line.includes('Icon')) {
      startIndex = i;
      break;
    }
  }

  let updatedContent = '';

  if (startIndex === -1) {
    // Append to the bottom if no table is found at all
    updatedContent = currentContent.trim() + '\n\n' + markdownTable;
  } else {
    endIndex = startIndex + 1;

    // Iterate down to find the end of the markdown table
    while (endIndex < lines.length && lines[endIndex].trim().startsWith('|')) {
      endIndex++;
    }

    // Replace the old table lines with the new markdown table
    lines.splice(startIndex, endIndex - startIndex, markdownTable);
    updatedContent = lines.join('\n');
  }

  writeFileSync(README_FILE, updatedContent);
  console.log(`Successfully replaced the icon table in ${README_FILE}`);
} catch (error) {
  console.error('Error updating README:', error);
}
