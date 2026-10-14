// Pravi ../depo-3d.js iz depo-3d.src.mjs (three.js, samo dijelovi koji se koriste), umanjen, kao obična skripta (IIFE),
// i upisuje njegov SRI (sha384) u ../depo.js (SRI3D), da depo.js učita baš ovaj fajl.
// Pokretanje: npm install (jednom) → node napravi-3d.mjs
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const out = new URL('../depo-3d.js', import.meta.url).pathname;
const main = new URL('../depo.js', import.meta.url).pathname;
await build({ entryPoints: [new URL('depo-3d.src.mjs', import.meta.url).pathname], bundle: true, minify: true, format: 'iife', target: ['es2018'], outfile: out, legalComments: 'none' });
const head = '/* Jahorina Ski Depo · 3D ormarić · three.js r170 (MIT, (c) 2010-2024 three.js authors) · izvor: depo/3d/depo-3d.src.mjs */\n';
const body = head + readFileSync(out, 'utf8');
writeFileSync(out, body);
const sri = 'sha384-' + createHash('sha384').update(body).digest('base64');
const js = readFileSync(main, 'utf8');
const next = js.replace(/var SRI3D = '[^']*';/, `var SRI3D = '${sri}';`);
if (next === js && !js.includes(sri)) throw new Error('SRI3D nije pronađen u depo.js');
writeFileSync(main, next);
console.log('depo-3d.js', (Buffer.byteLength(body) / 1024).toFixed(0) + ' KB', sri);
