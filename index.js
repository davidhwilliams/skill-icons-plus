import icons from './dist/icons.json';
const typedIcons = icons;
const iconNameList = [...new Set(Object.keys(typedIcons).map((i) => i.split('-')[0]))];
const shortNames = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    tailwind: 'tailwindcss',
    vue: 'vuejs',
    nuxt: 'nuxtjs',
    go: 'golang',
    cf: 'cloudflare',
    wasm: 'webassembly',
    postgres: 'postgresql',
    k8s: 'kubernetes',
    next: 'nextjs',
    mongo: 'mongodb',
    md: 'markdown',
    ps: 'photoshop',
    ai: 'illustrator',
    pr: 'premiere',
    ae: 'aftereffects',
    scss: 'sass',
    sc: 'scala',
    net: 'dotnet',
    gatsbyjs: 'gatsby',
    gql: 'graphql',
    vlang: 'v',
    amazonwebservices: 'aws',
    bots: 'discordbots',
    express: 'expressjs',
    googlecloud: 'gcp',
    mui: 'materialui',
    windi: 'windicss',
    unreal: 'unrealengine',
    nest: 'nestjs',
    ktorio: 'ktor',
    pwsh: 'powershell',
    au: 'audition',
    rollup: 'rollupjs',
    rxjs: 'reactivex',
    rxjava: 'reactivex',
    ghactions: 'githubactions',
    sklearn: 'scikitlearn',
};
const themedIcons = [
    ...Object.keys(typedIcons)
        .filter((i) => i.includes('-light') || i.includes('-dark'))
        .map((i) => i.split('-')[0]),
];
const ICONS_PER_LINE = 15;
const ONE_ICON = 48;
const SCALE = ONE_ICON / (300 - 44);
function generateSvg(iconNames, perLine) {
    // Filter out any undefined or null values that might result from parseShortNames
    const validIconNames = iconNames.filter((name) => name !== undefined && name !== null);
    const iconSvgList = validIconNames.map((i) => typedIcons[i]).filter(Boolean); // Ensure we only get valid SVG strings
    const length = Math.min(perLine * 300, iconNames.length * 300) - 44;
    const height = Math.ceil(iconSvgList.length / perLine) * 300 - 44;
    const scaledHeight = height * SCALE;
    const scaledWidth = length * SCALE;
    return `
  <svg width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${length} ${height}" xmlns="http://www.w3.org/2000/svg">
    ${iconSvgList
        .map((i, index) => `
        <g transform="translate(${(index % perLine) * 300}, ${Math.floor(index / perLine) * 300})">
          ${i}
        </g>
        `)
        .join(' ')}
  </svg>
  `;
}
function parseShortNames(names, theme = 'dark') {
    return names.map((name) => {
        if (iconNameList.includes(name))
            return name + (themedIcons.includes(name) ? `-${theme}` : '');
        else if (name in shortNames)
            return shortNames[name] + (themedIcons.includes(shortNames[name]) ? `-${theme}` : '');
        return undefined; // Explicitly return undefined if no match
    });
}
async function handleRequest(request) {
    const { pathname, searchParams } = new URL(request.url);
    const path = pathname.replace(/^\/|\/$/g, '');
    if (path === 'icons') {
        const iconParam = searchParams.get('i') ?? searchParams.get('icons');
        if (!iconParam)
            return new Response("You didn't specify any icons!", { status: 400 });
        const themeParam = searchParams.get('t') ?? searchParams.get('theme');
        const theme = 'dark';
        const perLineParam = searchParams.get('perline');
        const perLine = perLineParam ? parseInt(perLineParam, 10) : ICONS_PER_LINE;
        if (isNaN(perLine) || perLine < -1 || perLine > 50)
            return new Response('Icons per line must be a number between 1 and 50', { status: 400 });
        let iconShortNames = [];
        if (iconParam === 'all')
            iconShortNames = iconNameList;
        else
            iconShortNames = iconParam.split(',');
        const iconNames = parseShortNames(iconShortNames, theme);
        // Filter out undefined values and check if any valid icon names remain
        const filteredIconNames = iconNames.filter((name) => name !== undefined && name !== null);
        if (filteredIconNames.length === 0)
            return new Response("No valid icons found or you didn't format the icons param correctly!", {
                status: 400,
            });
        const svg = generateSvg(filteredIconNames, perLine);
        return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
    }
    else if (path === 'api/icons') {
        return new Response(JSON.stringify(iconNameList), {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        });
    }
    else if (path === 'api/svgs') {
        return new Response(JSON.stringify(typedIcons), {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        });
    }
    else {
        // This assumes a global `fetch` is available (e.g., in a Cloudflare Worker environment)
        return fetch(request);
    }
}
addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request).catch((err) => {
        // Ensure err is treated as an Error object or fallback to string conversion
        const errorMessage = err instanceof Error ? err.stack : String(err);
        return new Response(errorMessage, { status: 500 });
    }));
});
