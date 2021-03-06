const network = require('lib/network');
const { user } = require('lib/config');
const helpers = require('lib/helpers');
const ammunition = require('action/ammunition');
const resource = require('action/resource');
const expedition = require('action/expedition');
const colonist = require('action/colonist');
const assassin = require('action/assassin');
const sendMap = require('action/sendMap');
const information = require('exchanger/information');
const worker = require('lib/fileWorker');


const dataSettings = worker.getSettings(user);
let { ammunitionStart, collectionResources, resourceCreate,
  shopAssassin, spaceExpedition, corditLimit, cristalLimit } = dataSettings;


let sendMaps;
//sendMaps = "https://vk.com/app3558212_305079119?request_id=10007&request_key=in_login%3A305079119-interaction%3Aconstruction";



const init = () => {
  
  network.infoGame(user, (err, res) => {
    if (err) return console.error(err);
    
    network.update();
    network.auctionInfo();
    
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
      const timersAll = {};
      
      jsonXML.userTimer.forEach((elem, index) => {
        const timer = elem.$;
        const timeLeft = timer.finish_time - timer.start_time;
        
        timersAll[timeLeft + '-' + timer.id] = {
          type: timer.type,
          left: timeLeft,
          finish: timer.finish_time
        };
        return timeGather[timer.type] = ++index;
      });
      
      if (ammunitionStart) {
        console.log('Create ammunition');
  
        const ammunitionLimit = {corditLimit, cristalLimit};
        ammunition(jsonXML, buildType, ammunitionLimit);
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
  
      information.set(jsonXML, timersAll);
    })
  });
};


module.exports = init;
