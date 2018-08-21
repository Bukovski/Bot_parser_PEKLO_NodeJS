const request = require('request');
const worker = require('./fileWorker');
const helpers = require('./helpers');
const {save_file, read_file} = require('./config');



const network = {};


network.address = (data, callback) => request.post({
  url: 'http://game-r02vk.rjgplay.com',
  body: data,
  headers: {
    "Content-Length": data.length,
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/68.0.3440.106 Chrome/68.0.3440.106 Safari/537.36"
  }
}, (err, res, body) => {
  if (err) {
    return callback('Unable to find that address')
  } else if (!body) {
    return callback('Under to connect to rjgplay servers.');
  } else if (res.statusCode === 200) {
    return callback(null, body);
  }
});


network.auth = (obj, callback) => network.address(`<auth uid="${ obj.uid }" auth_key="${ obj.auth_key }"/>`, (err, data) => {
  if (err) return callback(err);
  
  try {
    data = data.match(/<sid>(.*)<\/sid>/)[1];
  } catch (e) {
    return callback('Couldn\'t get the value');
  }
  
  const dataUser = `uid="${ obj.uid }" auth_key="${ obj.auth_key }" sid="${ data }"`;
  
  return callback(null, dataUser);
});


network.infoGame = (user, callback) => {
  if (read_file) { //read file from .data/
    return worker.get(user, (err, res) => {
      if (err) return callback(err);
    
      callback(null, res)
    });
  }
  
  network.auth(user, (err, res) => {
    const items = '<get_game_info ' + res + '/>';
    
    network.address(items, (err, data) => {
      if (err) return callback('Error:', err);
      
      if (save_file) { //save file to .data/
        worker.set(user, data.toString(), (err) => { //save xml
          if (err) return callback(err);
        });
        
        return helpers.xml(data, (err, result) => { //save json (xml --> json)
          worker.set(user.uid + '.json', result, (err) => callback(err));
        });
      }
      
      callback(null, data);
    })
  });
};



module.exports = network;
