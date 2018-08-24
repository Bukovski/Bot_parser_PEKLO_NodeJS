const network = require('lib/network');
const { user } = require('lib/config');
const helpers = require('lib/helpers');
const ammunition = require('action/ammunition');
const resource = require('action/resource');
const expedition = require('action/expedition');
const colonist = require('action/colonist');
const assassin = require('action/assassin');
const sendMap = require('action/sendMap');


const ammunitionStart = !true; //запуск производства БП
const collectionResources = true; //запуск сбора с колонистов
const resourceCreate = true; //запуск сбора с шахт ресурсов
const shopAssassin = true; //покупка наемников
const spaceExpedition = !true; //экспедиции в космос
const start = true; //запуск выполнения парсера

//ammunition.js
const corditLimit = 3000; //предел расхода кордита на БП
const cristalLimit = 0; //предел кристалов на БП

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
        
        ammunition(jsonXML, buildType);
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
      
      //общие данные
      console.log(
        'Кредиты ' + jsonXML.userItems['credit'][0],
        'Жетоны ' + jsonXML.userItems['jetton'][0],
        'Медали ' + jsonXML.userItems['contest_medal'][0],
        'Рейтинг ' + jsonXML.userItems['rating'][0],
        'Инфопланшет ' + jsonXML.userItems['event_grind_token'][0],
        'Уровень ' + jsonXML.userItems['level_up'][0],
        'Опыт ' + jsonXML.userItems['experience'][0]
      );
      //ресурсы
      console.log(
        'Металл ' + jsonXML.userItems['metal'][0],
        'Кристалы ' + jsonXML.userItems['crystal'][0],
        'Кордит ' + jsonXML.userItems['cordite'][0],
        'Топливо ' + jsonXML.userItems['fuel'][0]
      );
      //Рекруты
      console.log(
        'Космопехота ' + jsonXML.userItems['recruit_praetorian'][0],
        'Культ машин ' + jsonXML.userItems['recruit_knights'][0],
        'Высшие ' + jsonXML.userItems['recruit_superior'][0],
        'Космические пилоты ' + jsonXML.userItems['recruit_space'][0]
      );
      //Боеприпасы колония
      console.log(
        'Авиаудар ' + jsonXML.userItems['air_strike'][0],
        'Медикаменты ' + jsonXML.userItems['medicaments'][0],
        'Гравибомба ' + jsonXML.userItems['gravibomb'][0],
        'Энергетический щит ' + jsonXML.userItems['shields'][0],
        'Боевые дроиды ' + jsonXML.userItems['droids'][0],
        'Орбитальный удар ' + jsonXML.userItems['orbital_hit'][0],
        'Боевые стимуляторы ' + jsonXML.userItems['stimulators'][0],
        'Мина "Циклоп" ' + jsonXML.userItems['cyclops_mine'][0],
        'Орбитальная бомбардировка ' + jsonXML.userItems['orbital_bombardment'][0]
      );
      //Боеприпасы космос
      console.log(
        'Минное заграждение ' + jsonXML.userItems['space_mines'][0],
        'Ремонтный дрон ' + jsonXML.userItems['repair_drones'][0],
        'Адаптивное покрытие ' + jsonXML.userItems['adaptive_shield'][0],
        'Радарная ловушка ' + jsonXML.userItems['ecm'][0]
      );
      //PvP
      console.log(
        'pvp_stage ' + jsonXML.userItems['pvp_stage'][0],
        'event_stage ' + jsonXML.userItems['event_stage'][0],
        'league_stage ' + jsonXML.userItems['league_stage'][0],
        'space_event_stage ' + jsonXML.userItems['space_event_stage'][0],
        'space_league_stage ' + jsonXML.userItems['space_league_stage'][0]
      )
    })
  });
}
