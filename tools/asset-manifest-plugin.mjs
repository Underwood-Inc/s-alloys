import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

async function hashPublicDir(publicDir) {
  const manifest = {};

  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      const data = await readFile(full);
      const hash = createHash('sha256').update(data).digest('hex').slice(0, 12);
      const key = relative(publicDir, full).split(sep).join('/');
      manifest[key] = hash;
    }
  }

  await walk(publicDir);
  return manifest;
}

function isManifestRequest(url) {
  const path = url.split('?')[0] ?? '';
  return path.endsWith('/asset-manifest.json') || path === '/asset-manifest.json';
}

/** Build-time + dev-server content hashes for committed public/ assets. */
export function assetManifestPlugin() {
  let publicDir;
  let outDir;
  let devManifest = {};

  async function refreshDevManifest() {
    devManifest = await hashPublicDir(publicDir);
  }

  return {
    name: 'asset-manifest',
    configResolved(config) {
      publicDir = config.publicDir;
      outDir = config.build.outDir;
    },
    async configureServer(server) {
      await refreshDevManifest();
      server.middlewares.use((req, res, next) => {
        if (!isManifestRequest(req.url ?? '')) {
          next();
          return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(JSON.stringify(devManifest));
      });
    },
    async closeBundle() {
      const manifest = await hashPublicDir(publicDir);
      await writeFile(join(outDir, 'asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    },
  };
}
