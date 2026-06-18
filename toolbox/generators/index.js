#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const [,, type, name] = process.argv;

if (!type || !name) {
  console.log('Usage: node toolbox/generators/index.js <type> <name>');
  console.log('Types: component, composable, module');
  process.exit(1);
}

const webSrc = path.join(__dirname, '../../apps/web/src');

function generateComponent() {
  const dir = path.join(webSrc, 'shared/ui', name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${name}.vue`),
    `<script setup lang="ts">\n</script>\n\n<template>\n  <div>${name}</div>\n</template>\n`
  );
  console.log(`Component created: ${dir}`);
}

function generateComposable() {
  const dir = path.join(webSrc, 'shared/composables');
  fs.writeFileSync(
    path.join(dir, `use${name}.ts`),
    `export function use${name}() {\n  // TODO: implement\n}\n`
  );
  console.log(`Composable created: ${dir}/use${name}.ts`);
}

if (type === 'component') generateComponent();
else if (type === 'composable') generateComposable();
else console.log(`Unknown type: ${type}`);
