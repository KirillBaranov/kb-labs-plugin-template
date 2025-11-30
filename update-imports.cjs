#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple mapping for plugin-template
const PATH_MAPPINGS = {
  // Old DDD paths → new flat paths
  '../../../domain/entities/greeting': '../core/greeting',
  '../../domain/entities/greeting': '../core/greeting',
  '../domain/entities/greeting': './core/greeting',

  '../../../application/use-cases/create-greeting': '../core/create-greeting',
  '../../application/use-cases/create-greeting': '../core/create-greeting',
  '../application/use-cases/create-greeting': './core/create-greeting',

  '../../../infra/adapters/logger': '../utils/logger',
  '../../infra/adapters/logger': '../utils/logger',
  '../infra/adapters/logger': './utils/logger',

  '../../../shared/constants': '../utils/constants',
  '../../shared/constants': '../utils/constants',
  '../shared/constants': './utils/constants',

  // CLI paths
  './flags': './flags',
  './run': './run',
};

function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  content = content.replace(/(import|export)([^'"]*['"])([^'"]+)(['"])/g, (match, keyword, before, importPath, after) => {
    for (const [oldPath, newPath] of Object.entries(PATH_MAPPINGS)) {
      if (importPath === oldPath || importPath.startsWith(oldPath + '/')) {
        const replacement = importPath.replace(oldPath, newPath);
        if (replacement !== importPath) {
          console.log(`  ${path.basename(filePath)}: ${importPath} → ${replacement}`);
          updated = true;
          return `${keyword}${before}${replacement}${after}`;
        }
      }
    }
    return match;
  });

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return updated;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let totalUpdated = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      totalUpdated += processDirectory(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      if (updateImportsInFile(filePath)) {
        totalUpdated++;
      }
    }
  }

  return totalUpdated;
}

const srcNewDir = path.join(__dirname, 'packages/plugin-cli/src-new');

console.log('Updating imports in plugin-template...\n');
const updated = processDirectory(srcNewDir);
console.log(`\n✓ Updated ${updated} files.`);
