const network = require('lib/network');


module.exports = () => {
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
};
