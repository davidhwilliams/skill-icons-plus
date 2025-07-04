import * as fs from 'node:fs';

const iconsDir = fs.readdirSync('./icons');
const icons: Record<string, string> = {};
for (const icon of iconsDir) {
  const name = icon.replace('.svg', '').toLowerCase();
  icons[name] = String(fs.readFileSync(`./icons/${icon}`));
}

if (!fs.existsSync('./dist')) fs.mkdirSync('./dist');

fs.writeFileSync('./dist/icons.json', JSON.stringify(icons));
