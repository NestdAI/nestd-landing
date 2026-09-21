import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
const output = path.join(root, 'dist');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output);
for (const name of ['index.html','about.html','pricing.html','privacy.html','features.html','admin.html','landing.css','content.css','navigation.css','product-motion.css','support.css','styles.css','pages.css','landing.js','product-motion.js','script.js','contact.js','i18n.js','logo.png','favicon.ico','apple-touch-icon.png','robots.txt','sitemap.xml','images','en','app','listing','verified','verify-error','.well-known']) {
 fs.cpSync(path.join(root,name),path.join(output,name),{recursive:true});
}
console.log('Packaged public site into dist.');
