// Trophy Trail — a GTA VI platinum guide (Node 22, standard library only).
//
// The app itself is the plain static files in app/: app/index.html opens the
// checklist, the roadmap and the missables page, and app/data/trophies.json
// holds the 55 official trophies with a guide in our own words for each one.
// Nothing in app/ is built or fetched over the network.
//
// This file hands the entry in. It copies app/ and screenshots/ from beside
// this file into the output directory and writes dossier.json there, the
// summary the judge reads: the screenshots, the first load's files and bytes,
// and the source, as produced by the vendored make.fun library. Leave
// vendor/makefun-frontend.ts exactly as it is — the scorer requires
// dossier.json to be byte for byte what its own copy of that library writes.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice: both runs must write identical bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The directory this file lives in; the app and the screenshots sit beside it.
const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps the scorer applies to this bounty: at most 4 screenshots, each at
// most 256 KiB; app/ at most 993 files and directories and 48 MiB; the
// dossier text at most 163840 bytes. buildDossier refuses an entry that
// breaks any of them, so a successful run here is also a gate check.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
