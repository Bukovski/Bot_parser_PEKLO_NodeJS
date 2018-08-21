const network = require('./lib/network');
const worker = require('./lib/fileWorker');
const { user } = require('./lib/config');
const helpers = require('./lib/helpers');


network.infoGame(user, (err, res) => {
  if (err) return console.error(err);
  
  helpers.xml(res, (err, json) => {
    if (err) return console.error(err);
    
    const userJson = helpers.parseJsonToObject(json).response.init_game[0].user[0];
    
    const jsonXML = {
      userItems: userJson.items,
      userTimer: userJson.timings[0].timer,
      userLastEnter: userJson.last_enter[0].$.time,
      userContracts: userJson.contracts[0].contract, //производтство на заводах, нужен ID от них
      userBuildings: userJson.buildings[0].building
    };
    //console.log(jsonXML)
  
    const build = {};
    
    jsonXML.userBuildings.forEach(elem => {
      const buildingsAll = elem.$;
      
      build[buildingsAll.id] = {
        type: buildingsAll.type, //создаем асоц массив [10]=>'factory', [160]=>'space_engineering'
        level: buildingsAll.level //массив с уровнем зданий которые подставляем в производство ресурсов
      }
    });
    
    
    
    
    
    
    
    
    
    
    
  })

});






