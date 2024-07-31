#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
const CONSOLE_ORANGE_COLOR = '\x1b[33m%s\x1b[0m';
const CONSOLE_RED_COLOR = '\x1b[31m%s\x1b[0m';

// Check if branch matches naming convention
const localBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
const regex = /^master|(feature|fix|test)\\.*/;

if (!regex.test(localBranch)) {
  console.error(CONSOLE_RED_COLOR, 'The branche name must respect the convention: <type>:<description or ticket>');
  console.error(`Branch name => ${localBranch}`);
  process.exit(1);
}

// Get all modified files except deleted files
const fileList = execSync('git diff --name-only --cached --diff-filter=d').toString().trim().split('\n');

// If all files are deleted, exit
if (fileList.length === 0 || (fileList.length === 1 && fileList[0] === '')) {
  process.exit(0);
}

const license = `/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */`;

let licenceAdded = 0;

// Check if the file has the license, if not add it
fileList.forEach((file) => {
  const extension = path.extname(file).slice(1);
  if (['ts', 'tsx'].includes(extension)) {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('License, v. 2.0')) {
      const newContent = `${license}\n\n${content}`;
      fs.writeFileSync(file, newContent, 'utf8');
      licenceAdded++;
    }
  }
  // Prettify all selected files
  execSync(`./node_modules/.bin/prettier ${file} --ignore-unknown --write`);

  execSync(`git add ${file}`);
});

if (licenceAdded > 0) {
  console.log(CONSOLE_ORANGE_COLOR, `${licenceAdded} license(s) added.`);
}

// run test only on related changed file
execSync(`npm run test -- related ${fileList} --run`);

process.exit(0);
