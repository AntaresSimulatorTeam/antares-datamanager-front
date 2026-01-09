import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';

try {
  const head = readFileSync('.git/HEAD', 'utf8').trim(); // HEAD peut contenir : "ref: refs/heads/develop"
  //const branch = head.startsWith('ref:') ? head.replace('ref: refs/heads/', '') : head;
  //const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  const branch = process.env.BUILD_VERSION;
  const commit = execSync('git rev-parse --short HEAD').toString().trim();
  const commitTime = new Date().toISOString();

  const content = `export const GIT_INFO = {
  branch: "${branch ?? ''}",
  commit: "${commit}",
  commitTime: "${commitTime}",
};`;

  writeFileSync('src/gitInfo.ts', content);
  console.log('✅ Git info updated in src/gitInfo.ts');
} catch (error) {
  console.error('❌ Error getting Git info', error);
}
