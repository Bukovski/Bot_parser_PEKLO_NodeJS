const network = require('lib/network');


const objResource = {
  allCollect: [ 'colonist_female_1_1', 'colonist_female_1_2', 'colonist_female_1_3', 'colonist_female_1_4', 'colonist_female_1_5', 'colonist_female_2_1', 'colonist_female_2_2', 'colonist_female_2_3', 'colonist_female_2_4', 'colonist_female_2_5', 'colonist_female_3_1', 'colonist_female_3_2', 'colonist_female_3_3', 'colonist_female_3_4', 'colonist_female_3_5', 'colonist_male_1_1', 'colonist_male_1_2', 'colonist_male_1_3', 'colonist_male_1_4', 'colonist_male_1_5', 'colonist_male_2_1', 'colonist_male_2_2', 'colonist_male_2_3', 'colonist_male_2_4', 'colonist_male_2_5', 'colonist_male_3_1', 'colonist_male_3_2', 'colonist_male_3_3', 'colonist_male_3_4', 'colonist_male_3_5', 'citizen_luckycaptain_1', 'officer_1_1', 'officer_1_2', 'officer_1_3', 'officer_2_1', 'officer_2_2', 'officer_2_3', 'xenobiologist_1_1','xenobiologist_2_1', 'xenobiologist_3_1','xenobiologist_4_1', 'offer_tax_robo_1_1', 'offer_tax_robo_2_1', 'offer_tax_robo_3_1', 'robo_officer_1', 'robot_loader_1', 'citizen_robot_war_1', 'citizen_robot_war_2_1', 'scarlett_ney_citizen_1', 'eric_claymore_citizen_double_1', 'pig_1', 'scientist_1_1', 'scientist_2_1', 'scientist_3_1', 'scientist_4_1', 'tax_robo_2_1', 'tax_robo_2_2', 'trash_robo_1_1', 'trash_robo_1_2', 'trash_robo_1_3', 'trash_robo_2_1', 'trash_robo_2_2', 'trash_robo_2_3', 'trash_robo_3_1', 'trash_robo_3_2', 'trash_robo_3_3' ], //запросы для сбора с колонистов
  allGroupGift: ['group_gift_friday', 'group_gift_monday', 'group_gift_saturday', 'group_gift_sunday', 'group_gift_thursday', 'group_gift_tuesday', 'group_gift_wednesday'], //запросы сбора подарков с офф группы
  rjGift: ["space_scheme", "space_expendable", "credit", "space_recruits", "ground_expendable", "cordite", "merc_lite", "merc_lite_5", "merc_heavy", "merc_heavy_5"]
};


module.exports = (jsonXML, timeGather) => {
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
};
