#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Building project for production...');

// Set environment variable
process.env.NODE_ENV = 'production';

// Wait for ESM modules to load
setTimeout(() => {
  // Run gulp build
  const gulp = spawn('npx', ['gulp', 'build'], {
    stdio: 'inherit',
    shell: true
  });

  gulp.on('close', (code) => {
    if (code === 0) {
      console.log('Build completed successfully!');
    } else {
      console.error(`Build failed with code ${code}`);
    }
  });
}, 2000); // Wait 2 seconds for ESM modules to load
