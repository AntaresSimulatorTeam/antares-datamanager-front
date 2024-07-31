#!/usr/bin/env node

import { execSync } from 'child_process';
// Récupérer le paramètre passé en ligne de commande
const commitMsg = process.argv[2];
console.log('🚀 QCA :  ~ commitMsg:', commitMsg);

const CONSOLE_RED_COLOR = '\x1b[31m%s\x1b[0m';

const regex = /^(feat|fix|refactor|perf|style|test|docs|chore|ci|build|revert|release)!?(\(.*\)!?)?:.*/;

if (!regex.test(commitMsg)) {
  console.error(
    CONSOLE_RED_COLOR,
    'The commit message must respect the convention: <type>[optional scope]: <description>',
  );
  console.error(CONSOLE_RED_COLOR, 'https://www.conventionalcommits.org/en/v1.0.0/');
  console.error(`The commit message => ${commitMsg}`);
  process.exit(1);
}
process.exit(0);
