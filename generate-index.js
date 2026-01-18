const fs = require('fs');
const path = require('path');

const mockupsDir = path.join(__dirname, 'mockups');
const outputFile = path.join(__dirname, 'mockups-list.json');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      // Create a URL path relative to the root
      const relativePath = path.relative(__dirname, filePath);
      fileList.push({
        name: file.replace('.html', ''),
        path: relativePath,
        date: fs.statSync(filePath).mtime
      });
    }
  });
  return fileList;
}

const mockups = getFiles(mockupsDir);
// Sort by newest first
mockups.sort((a, b) => b.date - a.date);

fs.writeFileSync(outputFile, JSON.stringify(mockups, null, 2));
console.log('Mockup list updated!');
