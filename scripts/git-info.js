import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

try {
  let branch = '';
  try {
    branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  } catch (e) {
    console.warn('⚠️ Could not get branch from git');
  }

  // Priority to CI environment variables
  const ciBranch = process.env.BRANCH_NAME || 
                   process.env.CI_COMMIT_REF_NAME || 
                   process.env.CI_COMMIT_BRANCH || 
                   process.env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME;

  if (ciBranch) {
    branch = ciBranch;
  } else if (!branch || branch === 'HEAD' || /^[a-f0-9]{40}$/.test(branch)) {
    // If still HEAD or hash, and no CI var, try to get it from git show-ref or similar if needed
    // But for now, we follow the user's lead on environment variables.
  }

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
