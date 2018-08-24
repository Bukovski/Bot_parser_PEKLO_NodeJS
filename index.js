const network = require('./lib/network');
const { user } = require('./lib/config');
const helpers = require('./lib/helpers');


const ammunition = !true; //запуск производства БП
const collectionResources = true; //запуск сбора с колонистов
const resourceCreate = true; //запуск сбора с шахт ресурсов
const shopAssassin = true; //покупка наемников
const spaceExpedition = !true; //экспедиции в космос
const start = true; //запуск выполнения парсера

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
        userContracts: userJson.contracts[0].contract, //производтство на заводах, нужен ID от них
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
      
      /****************************** Create ammunition ************************************/
      
      if (ammunition) { //сбор БП с колонии и космоса
        console.log('Сбор БП');
        //массив боеприпасов на земле и в космосе
        const ammo = {
          air_strike: jsonXML.userItems.air_strike[0],
          medicaments: jsonXML.userItems.medicaments[0],
          gravibomb: jsonXML.userItems.gravibomb[0],
          shields: jsonXML.userItems.shields[0]
        };
        
        const ammoSpace = {
          repair_drones: jsonXML.userItems.repair_drones[0],
          space_mines: jsonXML.userItems.space_mines[0],
          adaptive_shield: jsonXML.userItems.adaptive_shield[0],
          ecm: jsonXML.userItems.ecm[0]
        };
        
        //определеляем лимит ресурсов для производства БП
        const corditMax = jsonXML.userItems.cordite[0] >= corditLimit;
        const cristalMax = jsonXML.userItems.crystal[0] >= cristalLimit;
        
        if (!corditMax) { //если лимит достигнут
          delete (ammo.gravibomb); //все чему нужен кордит
          delete (ammo.shields);
        }
        
        jsonXML.userContracts.forEach(elem => {
          const contractsAll = elem.$;
          const findEngineering = buildType['space_engineering'];
          const findFactory = buildType['factory'];
          
          if (corditMax && findEngineering.length) { //если лимит кордита не достигнут
            network.collectContract(contractsAll.id); //сбор БП
            network.startContract(helpers.sortObjValue(ammoSpace)[0], findEngineering); //заказ БП
          }
          if (cristalMax && findFactory.length) { //если лимит кристалов не достигнут
            network.collectContract(contractsAll.id); //сбор БП
            network.startContract(helpers.sortObjValue(ammo)[0], findFactory); //заказ БП
          }
        })
      }
      
      /****************************** Create resource ************************************/
      
      if (resourceCreate) {
        console.log('Сбор ресурсов');
        
        const contractsCollect = {};
        
        jsonXML.userContracts.forEach(elem => {
          const contracts = elem.$;
          
          contractsCollect[contracts.building_id] = {
            id: contracts.id,
            zeroContract: contracts.production_timing_id //номер здания => таймер
          }
        });
        
        const plantMetal = buildType['plant_metal'];
        const checkContractsMetal = contractsCollect[plantMetal].zeroContract;
        
        if (checkContractsMetal === 0 || checkContractsMetal === null) {
          const sendContracts = contractsCollect[plantMetal].id;
          network.collectContract(sendContracts);
          
          const buildTypeMetal = buildType['plant_metal'];
          const buildLevelMetal = buildLevel[buildTypeMetal];
          
          if (!jsonXML.userItems.achievement_collection_tech_support[0]) {
            network.startResourcesTech('produce_metal_' + buildLevelMetal, buildTypeMetal);
          } else {
            network.startResources('produce_metal_' + buildLevelMetal, buildTypeMetal);
          }
        }
        
        const plantCrystal = buildType['plant_crystal'];
        const checkContractsCrystal = contractsCollect[plantCrystal].zeroContract;
        
        if (!checkContractsCrystal.length) {
          const sendContractsCrystal = contractsCollect[plantCrystal].id;
          network.collectContract(sendContractsCrystal);
          
          const buildTypeCrystal = buildType['plant_crystal'];
          const buildLevelCrystal = buildLevel[buildTypeCrystal];
          
          if (!jsonXML.userItems.achievement_collection_tech_support[0]) {
            network.startResourcesTech('produce_crystal_' + buildLevelCrystal, buildTypeCrystal);
          } else {
            network.startResources('produce_crystal_' + buildLevelCrystal, buildTypeCrystal);
          }
        }
        
        const plantFuel = buildType['plant_fuel'];
        const checkContractsFuel = contractsCollect[plantFuel].zeroContract;
        
        if (!checkContractsFuel.length) {
          const sendContractsFuel = contractsCollect[plantFuel].id;
          network.collectContract(sendContractsFuel);
          
          const buildTypeFuel = buildType['plant_fuel'];
          const buildLevelFuel = buildLevel[buildTypeFuel];
          network.startResources('produce_fuel_' + buildLevelFuel, buildTypeFuel);
        }
        
        const plantPlatform = buildType['space_mine_platform'];
        const checkContractsPlatform = contractsCollect[plantPlatform].zeroContract;
        
        if (plantPlatform) { //если платформы кордита существуют
          if (!checkContractsPlatform.length) {
            const sendContractsPlatform = contractsCollect[plantPlatform].id;
            network.collectContract(sendContractsPlatform);
            
            const buildTypePlatform = buildType['space_mine_platform'];
            const buildLevelPlatform = buildLevel[buildTypePlatform];
            network.startResources('produce_cordite_' + buildLevelPlatform, buildTypePlatform);
          }
          
          const plantPlatform2 = buildType['space_mine_platform_2'];
          const checkContractsPlatform2 = contractsCollect[plantPlatform2].zeroContract;
          
          if (!checkContractsPlatform2.length) {
            const sendContractsPlatform2 = contractsCollect[plantPlatform2].id;
            network.collectContract(sendContractsPlatform2);
            
            const buildTypePlatform2 = buildType['space_mine_platform_2'];
            const buildLevelPlatform2 = buildLevel[buildTypePlatform2];
            network.startResources('produce_cordite_second_' + buildLevelPlatform2, buildTypePlatform2);
          }
        }
      }
      
      /****************************** Space expedition ************************************/
      
      if (spaceExpedition) {
        console.log('Сбор с экспедиций');
        
        Object.keys(jsonXML.userItems).forEach(elem => {
          if (/star_(.*?)_activeted/.test(elem)) {
            network.executeAction(`${ elem.slice(0, -10)}_starter_quest`);
          }
        });
      }
      
      /****************************** Collection with colonists ************************************/
      
      if (collectionResources) {
        console.log('Сбор с колонистов');
        
        const objResource = {
          allCollect: [ 'colonist_female_1_1', 'colonist_female_1_2', 'colonist_female_1_3', 'colonist_female_1_4', 'colonist_female_1_5', 'colonist_female_2_1', 'colonist_female_2_2', 'colonist_female_2_3', 'colonist_female_2_4', 'colonist_female_2_5', 'colonist_female_3_1', 'colonist_female_3_2', 'colonist_female_3_3', 'colonist_female_3_4', 'colonist_female_3_5', 'colonist_male_1_1', 'colonist_male_1_2', 'colonist_male_1_3', 'colonist_male_1_4', 'colonist_male_1_5', 'colonist_male_2_1', 'colonist_male_2_2', 'colonist_male_2_3', 'colonist_male_2_4', 'colonist_male_2_5', 'colonist_male_3_1', 'colonist_male_3_2', 'colonist_male_3_3', 'colonist_male_3_4', 'colonist_male_3_5', 'citizen_luckycaptain_1', 'officer_1_1', 'officer_1_2', 'officer_1_3', 'officer_2_1', 'officer_2_2', 'officer_2_3', 'xenobiologist_1_1','xenobiologist_2_1', 'xenobiologist_3_1','xenobiologist_4_1', 'offer_tax_robo_1_1', 'offer_tax_robo_2_1', 'offer_tax_robo_3_1', 'robo_officer_1', 'robot_loader_1', 'citizen_robot_war_1', 'citizen_robot_war_2_1', 'scarlett_ney_citizen_1', 'eric_claymore_citizen_double_1', 'pig_1', 'scientist_1_1', 'scientist_2_1', 'scientist_3_1', 'scientist_4_1', 'tax_robo_2_1', 'tax_robo_2_2', 'trash_robo_1_1', 'trash_robo_1_2', 'trash_robo_1_3', 'trash_robo_2_1', 'trash_robo_2_2', 'trash_robo_2_3', 'trash_robo_3_1', 'trash_robo_3_2', 'trash_robo_3_3' ], //запросы для сбора с колонистов
          allGroupGift: ['group_gift_friday', 'group_gift_monday', 'group_gift_saturday', 'group_gift_sunday', 'group_gift_thursday', 'group_gift_tuesday', 'group_gift_wednesday'], //запросы сбора подарков с офф группы
          rjGift: ["space_scheme", "space_expendable", "credit", "space_recruits", "ground_expendable", "cordite", "merc_lite", "merc_lite_5", "merc_heavy", "merc_heavy_5"]
        };
        
        
        objResource.allCollect.forEach(elem => { //собрать ресурсы с колонистов
          if (!timeGather[`${ elem }_produce_timing`] && jsonXML.userItems[elem]) {
            network.executeAction(`${ elem }_producer`);
          }
        });
        
        objResource.allGroupGift.forEach((giftGroup, index) => {
          if (!timeGather[`${ giftGroup }_timer`]) {
            network.executeAction(`${ giftGroup }`); //подарок из группы ежедневный
            
            objResource.rjGift.forEach(giftRJ => {
              if (timeGather[`rj_play_gift_${ giftRJ }_timer`]) {
                network.executeAction(`rj_play_gift_${ giftRJ }`);
              }
            });
          }
          
          if (!timeGather['citizen_thief_1_produce_timing']) { //сбор с воровки если таймер вышел
            network.executeAction('citizen_thief_1_producer');
            network.executeAction('thief_thing_randomizer');
            network.executeAction(`thief_sharing_reward_${ ++index }`); //забираем подарок
            network.executeAction(`thief_sharing_reward_${ ++index }_sharing_quest`); //рассказал друзьям о подарке
          }
          
          if (!timeGather['space_pvp_daily_4_quest_timing']) { //космические бои, сбор и зщапуск квеста
            network.executeAction('space_pvp_daily_4_starter');
            network.executeAction('space_pvp_daily_4');
            network.executeAction('space_pvp_daily_reset');
          }
        });
        
        
        if (!timeGather['taxes_production_timing']) {
          console.log('Сбор кредитов с базы');
          
          network.executeAction('tax1_quest');
          network.executeAction('tax2_quest');
          network.executeAction('tax3_quest');
          network.executeAction('tax4_quest');
          network.executeAction('tax5_quest');
          network.executeAction('tax6_quest');
          network.executeAction('tax7_quest');
          network.executeAction('tax8_quest');
          network.executeAction('tax9_quest');
        }
      }
  
      /****************************** Shop Assassin ************************************/
  
      if (shopAssassin
        && buildType['mercenary_camp']
        && (!timeGather['mercenary_camp_global_timing']
          || !jsonXML.userItems['mercenary_camp_pack_1_purchased'])
      ) { //если таймер наемников отсутствует и ни один наемник не куплен
        console.log('Покупка наемников');
        
        network.executeAction('mercenary_camp_reset'); //обновление наемников для покупки
        
        network.executeAction('mercenary_camp_pack_1_item_7_buy');
        network.executeAction('mercenary_camp_pack_1_item_8_buy');
        
        network.executeAction('mercenary_camp_pack_3_item_7_buy');
        network.executeAction('mercenary_camp_pack_3_item_8_buy');
        
        network.executeAction('mercenary_camp_pack_5_item_9_buy');
        network.executeAction('mercenary_camp_pack_5_item_10_buy');
        
        network.executeAction('mercenary_camp_pack_6_item_7_buy');
        network.executeAction('mercenary_camp_pack_6_item_8_buy');
        
        network.executeAction('mercenary_camp_pack_7_item_7_buy');
        network.executeAction('mercenary_camp_pack_7_item_8_buy');
        
        network.executeAction('mercenary_camp_pack_9_item_10_buy');
        network.executeAction('mercenary_camp_pack_9_item_11_buy');
        
        network.executeAction('mercenary_camp_pack_12_item_7_buy');
        network.executeAction('mercenary_camp_pack_12_item_8_buy');
        
        network.executeAction('mercenary_camp_pack_14_item_9_buy');
        network.executeAction('mercenary_camp_pack_14_item_10_buy');
      }
  
      /****************************** Send map ************************************/
      
      if (sendMaps) {
        console.log('Послал чертежи');
        
        let sendMapsType;
    
        if (sendMaps.includes('request_key=interaction')) {
          sendMapsType = sendMaps.match(/interaction%3A(.*?)-in_/);
        } else {
          sendMapsType = sendMaps.match(/interaction%3A(.*?)$/);
        }
    
        const sendMapsIdUser = sendMaps.match(/app3558212_(.*?)[?]/);
    
        network.sendMap(sendMapsType[1], sendMapsIdUser[1], (response) => {
          if (response.includes('error')) {
            console.log('Чертеж не отправился');
          } else {
            console.log('Чертежи', response);
          }
        });
      }
    })
  });
}
