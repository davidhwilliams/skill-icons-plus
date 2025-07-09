import { readdirSync, writeFileSync } from 'fs';
import { basename } from 'path';

const iconsDir = './icons';
const outputFile = 'ICONS.md';

function generateIconTable(): void {
  let markdownTable = `| Icon ID | Icon |\n| :----------------: | :---------------------------------------------------: |\n`;

  try {
    const allSvgFiles = readdirSync(iconsDir).filter((file) => file.endsWith('.svg'));

    // Map to store the chosen icon file for each base icon ID - normalizedID => fileName
    const selectedIcons = new Map<string, string>();

    for (const file of allSvgFiles) {
      const iconName = basename(file);
      const lowerCaseIconName = iconName.toLowerCase();

      // Normalize the icon ID by removing common suffixes and extension
      const baseIconId = lowerCaseIconName.replace('.svg', '').replace('-dark', '').replace('-light', '');

      const isCurrentFileDark = lowerCaseIconName.includes('-dark.svg');

      // If this base ID is not in the map, add it otherwise check for dark preference
      if (!selectedIcons.has(baseIconId)) {
        selectedIcons.set(baseIconId, iconName);
      } else {
        const currentlyStoredFileName = selectedIcons.get(baseIconId)!;
        const lowerCaseStoredFileName = currentlyStoredFileName.toLowerCase();
        const isStoredFileDark = lowerCaseStoredFileName.includes('-dark.svg');
        if (isCurrentFileDark && !isStoredFileDark) selectedIcons.set(baseIconId, iconName);
      }
    }

    // Get the final list of chosen file names and sort them by their normalized ID
    const finalIconFiles = Array.from(selectedIcons.values()).sort((a, b) => {
      const idA = basename(a, '.svg').toLowerCase().replace('-dark', '').replace('-light', '');
      const idB = basename(b, '.svg').toLowerCase().replace('-dark', '').replace('-light', '');
      return idA.localeCompare(idB);
    });

    for (const file of finalIconFiles) {
      const iconName = basename(file);
      // The ID for the table column should also be normalized
      let displayIconId = iconName.replace('.svg', '').toLowerCase().replace('-dark', '').replace('-light', '');

      markdownTable += `| \`${displayIconId}\` | <img src="./icons/${iconName}" width="48"> |\n`;
    }

    writeFileSync(outputFile, markdownTable);
    console.log(`Successfully generated ${outputFile}`);
  } catch (error) {
    console.error(`Error generating icon table:`, error);
  }
}

generateIconTable();
