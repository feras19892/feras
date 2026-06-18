const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../..');

function clean() {
  const dirs = ['node_modules', 'dist', '.turbo'];
  
  dirs.forEach((dir) => {
    const fullPath = path.join(root, dir);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`Removed: ${dir}`);
    }
  });

  console.log('Clean complete!');
}

clean();
