#!/usr/bin/env node

const wiredep = require('wiredep').stream;
const { src, dest } = require('gulp');
const path = require('path');

console.log('Injecting Bower dependencies...');

// Inject into HTML
src(['app/*.html'], { base: 'app' })
  .pipe(wiredep({
    ignorePath: /^(\.\.\/)*\.\./
  }))
  .pipe(dest('app'))
  .on('end', () => console.log('HTML injected successfully'));

// Inject into SCSS
src(['app/styles/*.scss'], { base: 'app' })
  .pipe(wiredep({
    ignorePath: /^(\.\.\/)*\.\./
  }))
  .pipe(dest('app'))
  .on('end', () => console.log('SCSS injected successfully'));
