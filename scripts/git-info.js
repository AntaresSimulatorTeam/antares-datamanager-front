import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

try {
  const ref = process.env.GITHUB_REF || '';
  const branch = ref?.replace('refs/heads/', '');
  const commit = execSync('git rev-parse --short HEAD').toString().trim();
  const commitTime = new Date().toISOString();

  const content = `export const GIT_INFO = {
  branch: "${branch ?? ''}",
  commit: "${commit}",
  commitTime: "${commitTime}",
  gitRef: "${ref}",
};`;

  writeFileSync('src/gitInfo.ts', content);
  console.log('✅ Git info updated in src/gitInfo.ts');
} catch (error) {
  console.error('❌ Error getting Git info', error);
}
