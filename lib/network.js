const request = require('request');
const worker = require('./fileWorker');
const helpers = require('./helpers');
const {save_file, read_file} = require('./config');



const network = {};

let dataUser = 'uid="0000000" auth_key="00cb111888ca8ee9eccc20432e762e72" sid="7df2f5423aed2d9958007dd175df4975"';

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
  
  dataUser = `uid="${ obj.uid }" auth_key="${ obj.auth_key }" sid="${ data }"`;
  
  return callback(null);
});


network.infoGame = (user, callback) => {
  if (read_file) { //read file from .data/
    return worker.get(user, (err, res) => {
      if (err) return callback(err);
    
      callback(null, res)
    });
  }
  
  network.auth(user, (err) => {
    if (err) return callback('Couldn\'t log in');
    
    const items = '<get_game_info ' + dataUser + '/>';
    
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


network.collectContract = (contractsId = null) => { //сбор боеприпасов с производства
  const xmlContract = `<collect_contract ${ dataUser }><id>${ contractsId }</id></collect_contract>`;

  return network.address(xmlContract, (err) => {
    if (err) return console.error(err);
  });
};


network.startContract = (type = null, buildingId = null) => { //запрос на производство беоприпасов
  const xmlStartContract = `<start_contract ${ dataUser }><type>produce_${ type }</type><building_id>${ buildingId }</building_id></start_contract>`;
  
  return network.address(xmlStartContract, (err) => {
    if (err) return console.error(err);
  });
};


network.startResourcesTech = (type = null, buildingId = null) => { //запрос на удвоеное производство беоприпасов при наличии технологии Слейв-Эри
  let timer = 1;
  const date = new Date();
  
  //если время сейчас 22 часа или больше то ставим сбор ресурсов на 12 часов
  if (date.getHours() >= '22' && date.getMinutes() >= '00') {
    timer = 4;
  }
  
  const xmlContractResources = `<start_contract ${ dataUser }><type>${ type }_${ timer }_tech</type><building_id>${ buildingId }</building_id></start_contract>`;
  
  return network.address(xmlContractResources, (err) => {
    if (err) return console.error(err);
  }); //$timer число в этом поле указывает время производства 1-10мин 2-1час 3-6часов 4-12часов
};


network.startResources = (type = null, buildingId = null) => { //запрос на производство ресурсов
  let timer = 1;
  const date = new Date();
  
  if (date.getHours() >= '22' && date.getMinutes() >= '00') { //если время сейчас 22 часа или больше то ставим сбор ресурсов на 12 часов
    timer = 4;
  }
  
  const xmlResource = `<start_contract ${ dataUser }><type>${ type }_${ timer }</type><building_id>${ buildingId }</building_id></start_contract>`;
  
  return network.address(xmlResource, (err) => {
    if (err) return console.error(err);
  }); //$timer число в этом поле указывает время производства 1-10мин 2-1час 3-6часов 4-12часов
};


network.executeAction = (type = null) => {
  const xmlAction = `<execute_action ${ dataUser }><type>${ type }_on_submit</type></execute_action>`;
  
  return network.address(xmlAction, (err) => {
    if (err) return console.error(err);
  });
};


network.sendMap = (type = null, userId = null, callback) => { //отправка чертежей по ссылке
  const xmlInteract = `<interact ${ dataUser }><uid>${ userId }</uid><type>${ type }</type></interact>`;
  
  return network.address(xmlInteract, (err, data) => {
    if (err) return console.error(err);
    
    callback(data);
  });
};


module.exports = network;
