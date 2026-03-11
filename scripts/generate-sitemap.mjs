import fs from 'fs';
import path from 'path';

const root = process.cwd();
const langs = ['en', 'it', 'fr', 'es'];
const baseUrl = 'https://doctoritaly24.it';
const today = new Date().toISOString().slice(0, 10);

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

for (const lang of langs) {
  const dir = path.join(root, lang);
  if (!fs.existsSync(dir)) continue;
  const pages = fs.readdirSync(dir).filter((f) => f.endsWith('.html')).sort();

  for (const slug of pages) {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/${lang}/${slug}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;

    for (const alt of langs) {
      xml += `    <xhtml:link rel="alternate" hreflang="${alt}" href="${baseUrl}/${alt}/${slug}" />\n`;
    }

    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/it/${slug}" />\n`;
    xml += '  </url>\n';
  }
}

xml += '</urlset>\n';
fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);
console.log('sitemap.xml generated');
