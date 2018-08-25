const network = require('lib/network');


module.exports = (jsonXML, buildType, buildLevel) => {
  const contractsCollect = {};
  
  jsonXML.userContracts.forEach(elem => {
    const contracts = elem.$;
    
    contractsCollect[contracts.building_id] = {
      id: contracts.id,
      zeroContract: contracts['production_timing_id']
    }
  });
  

  const plantMetal = buildType['plant_metal'];
  const checkContractsMetal = contractsCollect[plantMetal];
  
  if (checkContractsMetal === undefined || checkContractsMetal.zeroContract === '0') {
    const sendContracts = contractsCollect[plantMetal].id;
    network.collectContract(sendContracts);
    
    const buildTypeMetal = buildType['plant_metal'];
    const buildLevelMetal = buildLevel[buildTypeMetal];
    
    if (!jsonXML.userItems['achievement_collection_tech_support'][0]) {
      network.startResourcesTech('produce_metal_' + buildLevelMetal, buildTypeMetal);
    } else {
      network.startResources('produce_metal_' + buildLevelMetal, buildTypeMetal);
    }
  }
  
  
  const plantCrystal = buildType['plant_crystal'];
  const checkContractsCrystal = contractsCollect[plantCrystal];
  
  if (checkContractsCrystal === undefined || checkContractsCrystal.zeroContract === '0') {
    const sendContractsCrystal = contractsCollect[plantCrystal].id;
    network.collectContract(sendContractsCrystal);
    
    const buildTypeCrystal = buildType['plant_crystal'];
    const buildLevelCrystal = buildLevel[buildTypeCrystal];
    
    if (!jsonXML.userItems['achievement_collection_tech_support'][0]) {
      network.startResourcesTech('produce_crystal_' + buildLevelCrystal, buildTypeCrystal);
    } else {
      network.startResources('produce_crystal_' + buildLevelCrystal, buildTypeCrystal);
    }
  }
  
  
  const plantFuel = buildType['plant_fuel'];
  const checkContractsFuel = contractsCollect[plantFuel];
  
  if (checkContractsFuel === undefined || checkContractsFuel.zeroContract === '0') {
    const sendContractsFuel = contractsCollect[plantFuel].id;
    network.collectContract(sendContractsFuel);
    
    const buildTypeFuel = buildType['plant_fuel'];
    const buildLevelFuel = buildLevel[buildTypeFuel];
    network.startResources('produce_fuel_' + buildLevelFuel, buildTypeFuel);
  }
  
  
  const plantPlatform = buildType['space_mine_platform'];
  const checkContractsPlatform = contractsCollect[plantPlatform];
  
  if (plantPlatform !== undefined) {
    if (checkContractsPlatform === undefined || checkContractsPlatform.zeroContract === '0') {
      const sendContractsPlatform = contractsCollect[plantPlatform].id;
      network.collectContract(sendContractsPlatform);
      
      const buildTypePlatform = buildType['space_mine_platform'];
      const buildLevelPlatform = buildLevel[buildTypePlatform];
      network.startResources('produce_cordite_' + buildLevelPlatform, buildTypePlatform);
    }
    
    
    const plantPlatform2 = buildType['space_mine_platform_2'];
    const checkContractsPlatform2 = contractsCollect[plantPlatform2];
    
    if (checkContractsPlatform2 === undefined || checkContractsPlatform2.zeroContract === '0') {
      const sendContractsPlatform2 = contractsCollect[plantPlatform2].id;
      network.collectContract(sendContractsPlatform2);
      
      const buildTypePlatform2 = buildType['space_mine_platform_2'];
      const buildLevelPlatform2 = buildLevel[buildTypePlatform2];
      network.startResources('produce_cordite_second_' + buildLevelPlatform2, buildTypePlatform2);
    }
  }
};
