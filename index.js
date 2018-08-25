const network = require('lib/network');
const { user } = require('lib/config');
const helpers = require('lib/helpers');
const ammunition = require('action/ammunition');
const resource = require('action/resource');
const expedition = require('action/expedition');
const colonist = require('action/colonist');
const assassin = require('action/assassin');
const sendMap = require('action/sendMap');
const information = require('interface/information');


const ammunitionStart = !true; //запуск производства БП
const collectionResources = true; //запуск сбора с колонистов
const resourceCreate = true; //запуск сбора с шахт ресурсов
const shopAssassin = true; //покупка наемников
const spaceExpedition = !true; //экспедиции в космос
const start = true; //запуск выполнения парсера

//ammunition.js
const objLimit = {
  corditLimit: 3000, //предел расхода кордита на БП
  cristalLimit: 0 //предел кристалов на БП
};

let sendMaps;
//sendMaps = "https://vk.com/app3558212_305079119?request_id=10007&request_key=in_login%3A305079119-interaction%3Aconstruction";

if (start) {
  network.infoGame(user, (err, res) => {
    if (err) return console.error(err);
    
    helpers.xml(res, (err, json) => {
      if (err) return console.error(err);
      
      try {
        var userJson = helpers.parseJsonToObject(json).response.init_game[0].user[0];
      } catch (e) {
        return console.error('The data came blank');
      }
      
      const jsonXML = {
        userItems: userJson.items[0],
        userTimer: userJson.timings[0].timer,
        userLastEnter: userJson.last_enter[0].$.time,
        userContracts: userJson.contracts[0].contract,
        userBuildings: userJson.buildings[0].building
      };
      
      const buildType = {};
      const buildLevel = {};
      
      jsonXML.userBuildings.forEach(elem => {
        const buildingsAll = elem.$;
        
        buildType[buildingsAll.type] = buildingsAll.id;
        buildLevel[buildingsAll.id] = buildingsAll.level;
      });
      
      const timeGather = {};
      
      jsonXML.userTimer.forEach((elem, index) => {
        return timeGather[elem.$.type] = ++index;
      });
      
      if (ammunitionStart) {
        console.log('Create ammunition');
        
        ammunition(jsonXML, buildType, objLimit);
      }
      
      if (resourceCreate) {
        console.log('Create resource');
  
        resource(jsonXML, buildType, buildLevel);
      }
      
      if (spaceExpedition) {
        console.log('Space expedition');
  
        expedition(jsonXML);
      }
      
      if (collectionResources) {
        console.log('Collection with colonists');
  
        colonist(jsonXML, timeGather);
      }
  
      if (shopAssassin && buildType['mercenary_camp'] && (!timeGather['mercenary_camp_global_timing'] || !jsonXML.userItems['mercenary_camp_pack_1_purchased'])) { //if timer Assassin is missing and no one buy
        console.log('Shop Assassin');
  
        assassin();
      }
  
      if (sendMaps) {
        console.log('Send map');
  
        sendMap(sendMaps);
      }
  
      information(jsonXML);
    })
  });
}
