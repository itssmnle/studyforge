import { copyFile } from 'node:fs/promises';
await copyFile(new URL('../src/data/scienceCurriculum.js', import.meta.url), new URL('../functions/curriculum.js', import.meta.url));
