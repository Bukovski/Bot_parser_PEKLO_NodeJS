module.exports = (jsonXML) => {
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
};