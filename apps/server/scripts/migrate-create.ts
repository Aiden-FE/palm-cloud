import { join } from 'path';
import { Logger } from '@nestjs/common';
import { createFolder, createFileSync } from '@compass-aiden/helpers/dist/node.cjs';
import { getMigrateMainTemplate } from './templates';

/**
 * @example
 * // pnpm migrate:create <migration_name>
 */

async function main() {
  Logger.log(process.argv[2]);
  if (!process.argv[2] || !/^[a-z]+(_[a-z]+)*$/.test(process.argv[2])) {
    Logger.error('迁移名称错误,名称应该由小写字母组成,多个单词采用 _ 连接', 'Migration');
    process.exit(1);
  }

  const targetPath = join(__dirname, '..', 'migrations', `${Date.now()}_${process.argv[2]}`);

  await createFolder(targetPath);

  createFileSync(
    join(targetPath, 'main.ts'),
    getMigrateMainTemplate({ dirname: targetPath, migrateName: process.argv[2] }),
  );
  createFileSync(join(targetPath, 'main.sql'), '');
  createFileSync(join(targetPath, 'rollback.sql'), '');
}

main().then(() => {
  Logger.log('Migration created successfully', 'Migration');
  process.exit(0);
});
