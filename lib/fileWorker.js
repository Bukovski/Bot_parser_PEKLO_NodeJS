const fs = require('fs');
const path = require('path');
const helpers = require('lib/helpers');


const worker = {};


worker.baseDir = path.join(__dirname, '/../.data/');

worker.savePath = (name) => {
  name = (typeof name === 'object') ? name.uid : name;
  const extension = (path.extname(name) === '.json') ? '' : '.xml';
  
  return path.join(worker.baseDir, name) + extension;
};


worker.create = (name, data, callback) => {
  fs.appendFile(worker.savePath(name), data, (err) => { //записываем файл
    if (err) return callback('Error writing to new file');
  });
};


worker.set = (name, data, callback) => {
  fs.open(worker.savePath(name), 'r+', (err, fileDescriptor) => {
    if (err && err.code === 'ENOENT') {
      return worker.create(name, data, (err) => {
        if (err) return callback(err);
      });
    }
    
    if (err || !fileDescriptor) return callback('Could not open file for updating, if may not exist yet');
    
    fs.ftruncate(fileDescriptor, (err) => { //completely clean file
      if (err) return callback('Error truncating file');
      
      fs.writeFile(fileDescriptor, data, (err) => {
        if (err) return callback('Error writing file');
        
        fs.close(fileDescriptor, (err) => {
          if (err) return callback('Error closing existing file');
        });
      });
    });
  });
};


worker.get = (name, callback) => {
  fs.readFile(worker.savePath(name), 'utf8', (err, data) => {
    if (err) return callback('Error reading file');
  
    callback(null, data);
  });
};


worker.getSettings = (name) => {
  let fileSettings;
  const sittingsName = `settings-${ name.uid }.json`;
  
  try {
    fileSettings = fs.readFileSync(worker.savePath(sittingsName), 'utf8');
  } catch (e) {
    const dataSettings = {
      "ammunitionStart": true,
      "collectionResources": true,
      "resourceCreate": true,
      "shopAssassin": true,
      "spaceExpedition": true,
      "corditLimit": 0,
      "cristalLimit": 0
    };
  
    fs.appendFileSync(worker.savePath(sittingsName), JSON.stringify(dataSettings, null, 2));
    
    return dataSettings;
  }
  
  return helpers.parseJsonToObject(fileSettings);
};


module.exports = worker;
