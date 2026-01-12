import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

try {
  let branch = process.env.BUILD_VERSION || '';

  if (!branch) {
    try {
      branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    } catch {
      console.warn('⚠️ Impossible de récupérer la branche via Git');
      branch = '';
    }
  }

  // Récupération du commit
  let commit = 'unknown';
  try {
    commit = execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    console.warn('⚠️ Impossible de récupérer le commit Git');
  }

  const commitTime = new Date().toISOString();

  const content = `export const GIT_INFO = {
      branch: "${branch}",
      commit: "${commit}",
      commitTime: "${commitTime}",
    };`;
  writeFileSync('src/gitInfo.ts', content);

  console.log('✅ Git info updated in src/gitInfo.ts');
} catch (error) {
  console.error('❌ Error generating Git info:', error);
}
