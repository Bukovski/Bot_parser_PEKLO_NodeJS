const network = require('lib/network');


const corditLimit = 3000; //предел расхода кордита на БП
const cristalLimit = 0; //предел кристалов на БП

const sortObjValue = (obj) => Object.keys(obj).sort((a, b) => obj[a] - obj[b]);


module.exports = (jsonXML, buildType) => {
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
      network.startContract(sortObjValue(ammoSpace)[0], findEngineering); //заказ БП
    }
    if (cristalMax && findFactory.length) { //если лимит кристалов не достигнут
      network.collectContract(contractsAll.id); //сбор БП
      network.startContract(sortObjValue(ammo)[0], findFactory); //заказ БП
    }
  })
};
