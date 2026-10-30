import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteDir = path.resolve(__dirname, '..');
const localesDir = path.join(siteDir, 'locales');
const templatePath = path.join(__dirname, 'template.html');

const templateHtml = fs.readFileSync(templatePath, 'utf8');

const languages = ['en', 'de', 'pl', 'es', 'fr', 'ja'];

const locales = {};
for (const lang of languages) {
  const filePath = path.join(localesDir, `${lang}.json`);
  locales[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

console.log('🌐 Building BugAgent AI Multi-Language Static Site...');

for (const lang of languages) {
  const data = locales[lang];
  const isRoot = lang === 'en';
  const outDir = isRoot ? siteDir : path.join(siteDir, lang);
  fs.mkdirSync(outDir, { recursive: true });
  const outFilePath = path.join(outDir, 'index.html');

  const assetsPath = isRoot ? 'assets/' : '../assets/';
  const homePath = isRoot ? './' : '../';
  const canonicalUrl = isRoot
    ? 'https://bugagentai.com/'
    : `https://bugagentai.com/${lang}/`;

  // Build Language Dropdown Menu Items
  const langMenuItems = languages.map(l => {
    const lData = locales[l];
    const isActive = l === lang;
    let targetUrl;
    if (isRoot) {
      targetUrl = l === 'en' ? './' : `./${l}/`;
    } else {
      targetUrl = l === 'en' ? '../' : `../${l}/`;
    }
    return `            <a href="${targetUrl}" class="lang-option ${isActive ? 'active' : ''}" data-lang="${l}"><span>${lData.lang_flag}</span> <span>${lData.lang_name}</span></a>`;
  }).join('\n');

  // Smart Auto-detection redirect for root English page
  const rootRedirectScript = isRoot ? `
  <script>
    (function() {
      try {
        var pref = localStorage.getItem('bugagent_lang_pref');
        var visited = sessionStorage.getItem('bugagent_lang_detected');
        if (!visited) {
          sessionStorage.setItem('bugagent_lang_detected', 'true');
          var target = pref;
          if (!target) {
            var nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
            if (nav.indexOf('de') === 0) target = 'de';
            else if (nav.indexOf('pl') === 0) target = 'pl';
            else if (nav.indexOf('es') === 0) target = 'es';
            else if (nav.indexOf('fr') === 0) target = 'fr';
            else if (nav.indexOf('ja') === 0) target = 'ja';
          }
          if (target && target !== 'en') {
            window.location.replace('./' + target + '/');
          }
        }
      } catch(e) {}
    })();
  </script>` : '';

  let compiled = templateHtml;

  // System placeholders
  compiled = compiled.replace(/\{\{lang_code\}\}/g, lang);
  compiled = compiled.replace(/\{\{canonical_url\}\}/g, canonicalUrl);
  compiled = compiled.replace(/\{\{assets_path\}\}/g, assetsPath);
  compiled = compiled.replace(/\{\{home_path\}\}/g, homePath);
  compiled = compiled.replace(/\{\{current_lang_flag\}\}/g, data.lang_flag);
  compiled = compiled.replace(/\{\{current_lang_code_upper\}\}/g, lang.toUpperCase());
  compiled = compiled.replace(/\{\{lang_menu_items\}\}/g, langMenuItems);
  compiled = compiled.replace(/\{\{root_redirect_script\}\}/g, rootRedirectScript);

  // Content placeholders from JSON
  for (const [key, value] of Object.entries(data)) {
    const reg = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    compiled = compiled.replace(reg, value);
  }

  // Check if any unresolved placeholders remain
  const unparsed = compiled.match(/\{\{[a-zA-Z0-9_]+\}\}/g);
  if (unparsed) {
    console.warn(`   ⚠️ Warning in [${lang}]: Unresolved template keys:`, unparsed);
  }

  fs.writeFileSync(outFilePath, compiled, 'utf8');
  console.log(`   ✔ Generated: ${path.relative(siteDir, outFilePath)} (${(compiled.length / 1024).toFixed(1)} KB)`);
}

console.log('\n🎉 Multi-language site build completed successfully!');
