import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
    const commit = execSync("git rev-parse --short HEAD").toString().trim();
    const buildTime = new Date().toISOString();

    const content = `export const GIT_INFO = {
  branch: "${branch}",
  commit: "${commit}",
  buildTime: "${buildTime}"
};`;

    writeFileSync("src/gitInfo.js", content);
    console.log("✅ Git info updated in src/gitInfo.js");
} catch (error) {
    console.error("❌ Error getting Git info", error);
}