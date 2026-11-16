import { cp, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Source is the runnable MV3 build. Package the extension and its trial references.
const manifest = JSON.parse(await readFile(resolve('extension/manifest.json'), 'utf8'));
if (manifest.manifest_version !== 3 || !manifest.background?.service_worker) throw new Error('Expected a runnable Manifest V3 extension');
await mkdir(resolve('.scratch/build'), { recursive: true });
const output = await mkdtemp(resolve('.scratch/build/video-backlog-tracker-'));
await cp(resolve('extension'), resolve(output, 'extension'), { recursive: true });
await cp(resolve('docs/installation.md'), resolve(output, 'INSTALLATION.md'));
await cp(resolve('docs/first-slice-reference.md'), resolve(output, 'first-slice-reference.md'));
await cp(resolve('docs/library-organization-guide.md'), resolve(output, 'library-organization-guide.md'));
await cp(resolve('docs/development.md'), resolve(output, 'development.md'));
await cp(resolve('docs/validation'), resolve(output, 'validation'), { recursive: true });
await writeFile(resolve(output, 'README.txt'), 'Video Backlog Tracker test build\n\nIn desktop Chrome, open chrome://extensions, enable Developer mode, choose Load unpacked, and select the extension folder beside this file. See INSTALLATION.md for the short save/find/open/Undo trial and library-organization-guide.md for watch lists, browsing, selection, arranging and recovery.\n');
console.log(output);
