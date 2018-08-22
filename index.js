const network = require('./lib/network');
const worker = require('./lib/fileWorker');
const { user } = require('./lib/config');
const helpers = require('./lib/helpers');


const ammunition = true; //запуск производства БП
const collectionResources = true; //запуск сбора с колонистов
const resourceCreate = true; //запуск сбора с шахт ресурсов
const shopAssassin = true; //покупка наемников
const spaceExpedition = true; //экспедиции в космос
const start = true; //запуск выполнения парсера

const corditLimit = 3000; //предел расхода кордита на БП
const cristalLimit = 0; //предел кристалов на БП


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
        type: buildingsAll.type, //[10]=>'factory', [160]=>'space_engineering'
        level: buildingsAll.level //уровень зданий которые подставляем в производство ресурсов
      }
    });
    // console.log(build);
  
    const timeGather = helpers.sortBy.arr(jsonXML.userTimer.map(elem => {
      return elem.$.type
    }));
  
    /****************************** Create ammunition ************************************/
  
    if (ammunition) { //сбор БП с колонии и космоса
      console.log('Сбор БП');
      //массив боеприпасов на земле и в космосе
      const ammo = {
        air_strike: jsonXML.userItems[0].air_strike[0],
        medicaments: jsonXML.userItems[0].medicaments[0],
        gravibomb: jsonXML.userItems[0].gravibomb[0],
        shields: jsonXML.userItems[0].shields[0]
      };

      const ammoSpace = {
        repair_drones: jsonXML.userItems[0].repair_drones[0],
        space_mines: jsonXML.userItems[0].space_mines[0],
        adaptive_shield: jsonXML.userItems[0].adaptive_shield[0],
        ecm: jsonXML.userItems[0].ecm[0]
      };
      
      //определеляем лимит ресурсов для производства БП
      const corditMax = jsonXML.userItems[0].cordite[0] >= corditLimit;
      const cristalMax = jsonXML.userItems[0].crystal[0] >= cristalLimit;
    
      if (!corditMax) { //если лимит достигнут
        delete (ammo.gravibomb); //все чему нужен кордит
        delete (ammo.shields);
      }
      
      jsonXML.userContracts.forEach(elem => {
        const contractsAll = elem.$;
        const findEngineering = helpers.filterBy.objAttach(build, 'type', 'space_engineering')[0];
        const findFactory = helpers.filterBy.objAttach(build, 'type', 'factory')[0];
  
        if (corditMax && findEngineering.length) { //если лимит кордита не достигнут
          network.collectContract(contractsAll.id); //сбор БП
          network.startContract(helpers.sortBy.objValue(ammoSpace)[0], findEngineering); //заказ БП
        }
        if (cristalMax && findFactory.length) { //если лимит кристалов не достигнут
          network.collectContract(contractsAll.id); //сбор БП
          network.startContract(helpers.sortBy.objValue(ammo)[0], findFactory); //заказ БП
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
  
      const plantMetal = helpers.filterBy.objAttach(build, 'type', 'plant_metal')[0];
      const checkContractsMetal = helpers.filterBy.objAttach(contractsCollect, 'zeroContract', plantMetal);
      
      if (checkContractsMetal === 0 || checkContractsMetal === null) {
        const sendContracts = helpers.filterBy.objAttach(contractsCollect, 'id', plantMetal);
        network.collectContract(sendContracts);
        
        const buildTypeMetal = helpers.filterBy.objAttach(build, 'type', 'plant_metal')[0];
        const buildLevelMetal = build[buildTypeMetal].level;
        
        if (!jsonXML.userItems[0].achievement_collection_tech_support[0]) {
          network.startResourcesTech('produce_metal_' + buildLevelMetal, buildTypeMetal);
        } else {
          network.startResources('produce_metal_' + buildLevelMetal, buildTypeMetal);
        }
      }
  
      const plantCrystal = helpers.filterBy.objAttach(build, 'type', 'plant_crystal')[0];
      const checkContractsCrystal = helpers.filterBy.objAttach(contractsCollect, 'zeroContract', plantCrystal);
  
      if (!checkContractsCrystal.length) {
        const sendContractsCrystal = helpers.filterBy.objAttach(contractsCollect, 'id', plantCrystal);
        network.collectContract(sendContractsCrystal);
        
        const buildTypeCrystal = helpers.filterBy.objAttach(build, 'type', 'plant_crystal')[0];
        const buildLevelCrystal = build[buildTypeCrystal].level;
        
        if (!jsonXML.userItems[0].achievement_collection_tech_support[0]) {
          network.startResourcesTech('produce_crystal_' + buildLevelCrystal, buildTypeCrystal);
        } else {
          network.startResources('produce_crystal_' + buildLevelCrystal, buildTypeCrystal);
        }
      }
  
      const plantFuel = helpers.filterBy.objAttach(build, 'type', 'plant_fuel')[0];
      const checkContractsFuel = helpers.filterBy.objAttach(contractsCollect, 'zeroContract', plantFuel);
  
      if (!checkContractsFuel.length) {
        const sendContractsFuel = helpers.filterBy.objAttach(contractsCollect, 'id', plantFuel);
        network.collectContract(sendContractsFuel);
  
        const buildTypeFuel = helpers.filterBy.objAttach(build, 'type', 'plant_fuel')[0];
        const buildLevelFuel = build[buildTypeFuel].level;
        network.startResources('produce_fuel_' + buildLevelFuel, buildTypeFuel);
      }
  
      const plantPlatform = helpers.filterBy.objAttach(build, 'type', 'space_mine_platform')[0];
      const checkContractsPlatform = helpers.filterBy.objAttach(contractsCollect, 'zeroContract', plantPlatform);
      
      if(plantPlatform) { //если платформы кордита существуют
        if (!checkContractsPlatform.length) {
          const sendContractsPlatform = helpers.filterBy.objAttach(contractsCollect, 'id', plantPlatform);
          network.collectContract(sendContractsPlatform);
  
          const buildTypePlatform = helpers.filterBy.objAttach(build, 'type', 'space_mine_platform')[0];
          const buildLevelPlatform = build[buildTypePlatform].level;
          network.startResources('produce_cordite_' + buildLevelPlatform, buildTypePlatform);
        }
  
        const plantPlatform2 = helpers.filterBy.objAttach(build, 'type', 'space_mine_platform_2')[0];
        const checkContractsPlatform2 = helpers.filterBy.objAttach(contractsCollect, 'zeroContract', plantPlatform2);
        
        if (!checkContractsPlatform2.length) {
          const sendContractsPlatform2 = helpers.filterBy.objAttach(contractsCollect, 'id', plantPlatform);
          network.collectContract(sendContractsPlatform2);
          
          const buildTypePlatform2 = helpers.filterBy.objAttach(build, 'type', 'space_mine_platform_2')[0];
          const buildLevelPlatform2 = build[buildTypePlatform2].level;
          network.startResources('produce_cordite_second_' + buildLevelPlatform2, buildTypePlatform2);
        }
      }
    }
  
    /****************************** Space expedition ************************************/
    
    if (spaceExpedition) {
      console.log('Сбор с экспедиций');
      
      jsonXML.userItems.forEach(elem => {
        
        /*if (elem.match('~star_(.*?)_activeted~ims')) { //если найдена не активированная экспедиция
          executeAction($dataUser, substr($vall, 0, -10) . '_starter_quest');
          
          "event_arena_0315_starter_quest": [
            "1"
          ]
        }*/
      });
    }
    
    
    
    
    
    
    
    
    
    
    
    
  })

});






