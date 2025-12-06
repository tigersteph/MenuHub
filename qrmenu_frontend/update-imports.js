const fs = require('fs');
const path = require('path');

// Mapping des anciens chemins vers les nouveaux
const importMappings = {
  "from '../apis'": "from '../services'",
  "from '../containers/": "from '../forms/",
  "from '../components/": "from '../components/business/",
  "from '../img/": "from '../assets/images/",
  "from '../config'": "from '../config/index'",
  "from '../router/App'": "from '../App'",
  "from './router/App'": "from './App'",
  "from './PrivateRoute'": "from './utils/PrivateRoute'",
  "from '../router/PrivateRoute'": "from '../utils/PrivateRoute'"
};

// Fonction pour mettre à jour les imports dans un fichier
function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Appliquer les mappings
    for (const [oldPath, newPath] of Object.entries(importMappings)) {
      if (content.includes(oldPath)) {
        content = content.replace(new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Fonction pour parcourir récursivement les dossiers
function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      updateImportsInFile(filePath);
    }
  });
}

// Démarrer la mise à jour
console.log('Starting import updates...');
walkDirectory('./src');
console.log('Import updates completed!');
