const readline = require('readline');
const events = require('events');
const os = require('os');
const v8 = require('v8');
const moment = require('moment');
const { getInfo, getTimer } = require('exchanger/information');
const worker = require('lib/fileWorker');
const { user } = require('lib/config');


class _events extends events {};
const e = new _events();

const terminal = {};

const _interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ''
});


e.on('help', () => {
  terminal.responders.help();
});

e.on('exit', () => {
  terminal.responders.exit();
});

e.on('stats', () => {
  terminal.responders.stats();
});

e.on('info', () => {
  terminal.responders.listInfo();
});

e.on('timers', () => {
  terminal.responders.listTimers();
});

e.on('settings list', () => {
  terminal.responders.settingsList();
});

e.on('settings change', (str) => {
  terminal.responders.settingsChange(str);
});


terminal.responders = {};


terminal.responders.help = () => {
  const commands = { //helper list object
    'exit' : 'Kill the terminal (and the rest of the application)',
    'help' : 'Show this help page',
    'stats' : 'Get statistics on the underlying operating system and resource utilization',
    'workers list' : 'Show a list of all the workers in the data base',
    'worker info --{field}:{value}' : 'Show details of a specified worker'
  };
  
  //beautiful design
  terminal.horizontalLine();
  terminal.centered('TERMINAL MANUAL'); //the label will be at the center when output
  terminal.horizontalLine();
  terminal.verticalSpace(2);
  
  // Show each command, followed by its explanation, in white and yellow respectively
  for (let key in commands) {
    if (commands.hasOwnProperty(key)) {
      const value = commands[key];
      let line = '      \x1b[33m ' + key + '      \x1b[0m'; //to change the color word
      const padding = 60 - line.length; //padding to the right of the words
      
      for (let i = 0; i < padding; i++) {
        line += ' ';
      }
      
      line += value;
      console.log(line);
      terminal.verticalSpace();
    }
  }
  terminal.verticalSpace(1);
  
  terminal.horizontalLine(); //End with another horizontal line
};

terminal.verticalSpace = (lines) => {
  lines = (typeof(lines) === 'number' && lines > 0) ? lines : 1;
  
  for (let i = 0; i < lines; i++) {
    console.log('');
  }
};

terminal.horizontalLine = () => {
  const width = process.stdout.columns; // Get the available screen size
  let line = ''; // Put in enough dashes to go across the screen
  
  for (let i = 0; i < width; i++) {
    line += '-';
  }
  
  console.log(line);
};

terminal.centered = (str) => { //put the text on center
  str = (typeof(str) === 'string' && str.trim().length) ? str.trim() : '';
  
  const width = process.stdout.columns; // Get the available screen size
  
  // Calculate the left padding there should be
  const leftPadding = Math.floor((width - str.length) / 2);
  let line = ''; // Put in left padded spaces before the string itself
  
  for (let i = 0; i < leftPadding; i++) {
    line += ' ';
  }
  
  line += str;
  console.log(line);
};

terminal.responders.exit = () => {
  process.exit(0); //complete the stream and exit the terminal
};


terminal.responders.stats = () => { //data on the status of the computer
  const stats = {
    'Load Average' : os.loadavg().join(' '),
    'CPU Count' : os.cpus().length,
    'Free Memory' : os.freemem(),
    'Current Malloced Memory' : v8.getHeapStatistics().malloced_memory,
    'Peak Malloced Memory' : v8.getHeapStatistics().peak_malloced_memory,
    'Allocated Heap Used (%)' : Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
    'Available Heap Allocated (%)' : Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
    'Uptime' : os.uptime()+' Seconds'
  };
  
  // Create a header for the stats
  terminal.horizontalLine();
  terminal.centered('SYSTEM STATISTICS');
  terminal.horizontalLine();
  terminal.verticalSpace(2);
  
  // Log out each stat
  for (let key in stats) {
    if (stats.hasOwnProperty(key)) {
      const value = stats[key];
      let line = '      \x1b[33m '+key+'      \x1b[0m';
      const padding = 60 - line.length;
      
      for (let i = 0; i < padding; i++) {
        line += ' ';
      }
      
      line += value;
      console.log(line);
      terminal.verticalSpace();
    }
  }
  
  terminal.verticalSpace();
  terminal.horizontalLine();
};

terminal.responders.listInfo = () => {
  const res = getInfo();

    terminal.horizontalLine();
    terminal.centered('LIST INFORMATION');
    terminal.horizontalLine();
    terminal.verticalSpace(2);
    terminal.horizontalLine();
    
    for (let obj in res) {
      if (res.hasOwnProperty(obj)) {
        const value = res[obj]; //{ id: 7, name: 'Иванов', age: 27, salary: 500 }
        let allLine = '';
        
        for (let key in value) {
          if (value.hasOwnProperty(key)) {
            
            const firstUpper = key[0].toUpperCase() + key.slice(1);
            let line = ' \x1b[33m '+ firstUpper +':\x1b[0m ' + value[key];
            const padding = 37 - line.length;
            
            for (let j = 0; j < padding; j++) {
              line += ' ';
            }
            allLine += line;
          }
        }
        
        console.log(allLine);
        terminal.horizontalLine();
      }
    }
};


terminal.responders.listTimers = () => {
  moment.locale('ru');
  
  const timeConversion = (millisec) => {
    const seconds = (millisec / 1).toFixed(1);
    const  minutes = (millisec / (1 * 60)).toFixed(1);
    const  hours = (millisec / (1 * 60 * 60)).toFixed(1);
    const  days = (millisec / (1 * 60 * 60 * 24)).toFixed(1);
    
    if (seconds < 60) {
      return seconds + " сек.";
    } else if (minutes < 60) {
      return minutes + " мин.";
    } else if (hours < 24) {
      return hours + " ч.";
    }
    return days + " дней"
  };
  
  const splitObj = (str) => str.split('-')[0];
  const sortObj = (obj) => Object.keys(obj).sort((a, b) => {
    return splitObj(a) - splitObj(b);
  });
  
  
  
  const res = getTimer();
  const sortingArr = sortObj(res);
  
  terminal.horizontalLine();
  terminal.centered('TIMERS INFO');
  terminal.horizontalLine();
  terminal.verticalSpace(2);
  terminal.horizontalLine();
  
  sortingArr.forEach(keyObj => {
    if (res.hasOwnProperty(keyObj)) {
      const value = res[keyObj];
      var allLine = '';
      
      const firstUpper = value.type.toUpperCase() + value.type.slice(1);
      let lineMinutes = `      \x1b[0m ${ timeConversion(+value.left) }`;
      const paddingMinutes = 20 - lineMinutes.length;
      
      for (let j = 0; j < paddingMinutes; j++) {
        lineMinutes += ' ';
      }
      allLine += lineMinutes;
  
      let lineDate = ` ${moment(value.finish * 1000).format('l LTS')} `;
      const paddingDate = 20 - lineDate.length;
  
      for (let j = 0; j < paddingDate; j++) {
        lineDate += ' ';
      }
      allLine += lineDate + ` \x1b[33m :  ${ firstUpper }\x1b[0m`;
    }
    
    console.log(allLine);
    
  });
  
  terminal.horizontalLine();
};


terminal.responders.settingsList = () => { //capture data entered by the user in the console
  const dataSettings = worker.getSettings(user);
  
  terminal.horizontalLine();
  terminal.centered('SETTINGS INFO');
  terminal.horizontalLine();
  terminal.verticalSpace(2);
  terminal.horizontalLine();
  
  for (let obj in dataSettings) {
    if (dataSettings.hasOwnProperty(obj)) {
      const value = dataSettings[obj]; //{ id: 7, name: 'Иванов', age: 27, salary: 500 }
      let allLine = '';
  
      const firstUpper = obj[0].toUpperCase() + obj.slice(1);
      let line = '     \x1b[33m ' + firstUpper;
      const padding = 35 - line.length;

      for (let j = 0; j < padding; j++) {
        line += ' ';
      }
      allLine += line + ':\x1b[0m   ' + dataSettings[obj];

      console.log(allLine);
      terminal.horizontalLine();
      
    }
  }
  
  terminal.horizontalLine();
};


terminal.responders.settingsChange = () => {
  
  const settingsTranslate = {
    "ammunitionStart": { name: "Запуск производства БП", type: 'boolean' },
    "collectionResources": { name: "Запуск сбора с колонистов", type: 'boolean' },
    "resourceCreate": { name: "Запуск сбора с шахт ресурсов", type: 'boolean' },
    "shopAssassin": { name: "Покупка наемников", type: 'boolean' },
    "spaceExpedition": { name: "Экспедиции в космос", type: 'boolean' },
    "corditLimit": { name: "Предел расхода кордита на БП", type: 'number' },
    "cristalLimit": { name: "Предел расхода кристалов на БП", type: 'number' }
  };
  
  const checkType = (newData, oldData, type) => {
    if (type === 'number') {
      return (typeof +newData === type && !isNaN(newData) && isFinite(newData) && newData.trim().length < 7) ? +newData : oldData;
    } else if (type === 'boolean') {
      return (typeof newData === 'string' && /^[+-]?$/.test(newData.trim())) ?
        (newData.trim() === '+')
        : oldData;
    }
    return oldData;
  };
  
  const dataSettings = worker.getSettings(user);
  const newObj = {};
  
  let objKey = Object.keys(dataSettings);
  let counter = 0;
  
  const recursiveReadLine = function () {
    if (objKey[counter] === undefined) return worker.set(`settings-${ user.uid }.json`, JSON.stringify(newObj, null, 2)), _interface.question(`   \x1b[33m Данные сохранены`, () => {});
    
    const key = objKey[counter];
    const value = dataSettings[key];
    const checkObj = settingsTranslate[key];
  
    const stringCreate = (checkObj.type === 'boolean') ? (`+ или - сейчас ${ (value === true) ? '+' : '-'}`) : value;
    
    _interface.question(`   \x1b[33m ${ checkObj.name } : ${ stringCreate }  ? \x1b[0m > `
      , (line) => {
        newObj[key] = (line.length) ? checkType(line, value, checkObj.type) : value;
    
        
        if (objKey.length > counter) return counter++, recursiveReadLine(); //Calling this function again to ask new question
    });
    
    return null;
  };
  
  recursiveReadLine();
};


terminal.processInput = (str) => { //capture data entered by the user in the console
  str = (typeof(str) === 'string' && str.trim().length) ? str.trim() : false;
  
  if (str) {
    const uniqueInputs = [ //command list
      'help', //---
      'exit', //+
      'stats', //+
      'info', //информация о ресурсах +
      'timers', //все таймеры в игре +
      'settings list', //вывести настройки для пользователя
      'settings change', //изменить настройки
      'restart', //перезапустить бот
      'map', //отсылка чертежей
      'reloaded' //таймер для интервального запуска бота
    ];
    
    let matchFound = false; //if words to be find = true
    
    uniqueInputs.some((input) => {
      if (str.toLowerCase().includes(input)) {
        matchFound = true;
        
        e.emit(input,str);
        
        return true;
      }
    });
    
    if (!matchFound) {
      console.log("Sorry, try again");
    }
  }
};


terminal.init = () => {
  console.log('\x1b[34m%s\x1b[0m','The terminal is running');
  
  _interface.prompt();
  
  _interface.on('line', (str) => {
    
    terminal.processInput(str);
    
    _interface.prompt();
    
  });
  
  _interface.on('close', () => { //if the user closed the terminal then kill the stream
    process.exit(0);
  });
};


module.exports = terminal;

// console.log(process.stdout.columns)
// console.log(process.stdout.rows)