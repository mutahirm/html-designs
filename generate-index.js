const fs = require('fs');
const path = require('path');

const mockupsDir = path.join(__dirname, 'mockups');
const outputFile = path.join(__dirname, 'mockups-list.json');

function getPageTitle(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Regex looking for content inside <title> tags
    const match = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    
    // Return the title if it exists and isn't just whitespace
    if (match && match[1] && match[1].trim().length > 0) {
      return match[1].trim();
    }
    return null;
  } catch (err) {
    return null;
  }
}

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      const stats = fs.statSync(filePath);
      const relativePath = path.relative(__dirname, filePath);
      
      // 1. Try to get title from HTML
      // 2. Fallback to filename (clean up hyphens/underscores and extension)
      const extractedTitle = getPageTitle(filePath);
      const cleanFileName = file.replace('.html', '').replace(/[-_]/g, ' ');
      
      const displayName = extractedTitle || cleanFileName;

      fileList.push({
        name: displayName,
        path: relativePath,
        date: stats.mtime
      });
    }
  });
  return fileList;
}

const mockups = getFiles(mockupsDir);
// Sort by newest first
mockups.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(outputFile, JSON.stringify(mockups, null, 2));
console.log(`Indexed ${mockups.length} designs.`);
