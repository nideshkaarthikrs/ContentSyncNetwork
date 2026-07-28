// One-off remediation for tunes whose audio file no longer exists on disk --
// see the 2026-07-28 incident where `tune_uploads` was added as a named
// Docker volume (docker-compose.yml) to stop future uploads being wiped on
// container recreation. That fix only protects files written *after* the
// volume existed; anything uploaded before it lived in the old container's
// discarded writable layer and is unrecoverable. This script flags those
// rows via the existing (previously unused) Tune.status column so the app
// can stop presenting them as playable.
//
// Usage (run inside the tune-service container so paths/DB match):
//   npx ts-node scripts/mark-orphaned-tunes.ts              # dry run (default)
//   npx ts-node scripts/mark-orphaned-tunes.ts --apply       # actually update rows

import { existsSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

function toDisplayId(seq: number): string {
  return 'TUN' + (1000 + seq).toString();
}

async function main() {
  const apply = process.argv.includes('--apply');
  const uploadsRoot = join(__dirname, '..', 'uploads');
  const prisma = new PrismaClient();

  try {
    const tunes = await prisma.tune.findMany({ orderBy: { sequenceNumber: 'asc' } });
    const orphaned = tunes.filter((tune) => {
      const filename = tune.audioUrl.replace(/^\/uploads\//, '');
      return !existsSync(join(uploadsRoot, filename));
    });

    if (orphaned.length === 0) {
      console.log('No orphaned tunes found.');
      return;
    }

    console.log(`Found ${orphaned.length} orphaned tune(s):`);
    for (const tune of orphaned) {
      console.log(
        `  ${toDisplayId(tune.sequenceNumber)}  title="${tune.title}"  ownerId=${tune.ownerId}  audioUrl=${tune.audioUrl}  status=${tune.status}`
      );
    }

    if (!apply) {
      console.log('\nDry run only -- rerun with --apply to set status="UNAVAILABLE" on these rows.');
      return;
    }

    for (const tune of orphaned) {
      await prisma.tune.update({ where: { id: tune.id }, data: { status: 'UNAVAILABLE' } });
    }
    console.log(`\nMarked ${orphaned.length} tune(s) as UNAVAILABLE.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
