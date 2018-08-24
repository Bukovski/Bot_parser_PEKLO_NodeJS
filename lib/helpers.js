const { parseString } = require('xml2js'); //https://www.npmjs.com/package/xml2js


const helpers = {};


helpers.parseJsonToObject = (str) => {
  try{
    return JSON.parse(str);
  } catch(e){
    return {};
  }
};


helpers.xml = (data, callback) => parseString(data, (err, result) => { //xpm --> json
  if (err) return callback('Could not convert to JSON from XML');
  
  callback(null, JSON.stringify(result, null, 2));
});


helpers.sortBy = {
  arr          : (str) => str.sort((a, b) => (a > b) - (a < b)),
  arrDesc      : (str) => str.sort((a, b) => (a < b) - (a > b)),
  objKey       : (obj) => Object.keys(obj).sort((a, b) => (a > b) - (a < b)),
  objKeyDesc   : (obj) => Object.keys(obj).sort((a, b) => (a < b) - (a > b)),
  objValue     : (obj) => Object.keys(obj).sort((a, b) => obj[a] - obj[b]),
  objValueDesc : (obj) => Object.keys(obj).sort((a, b) => obj[b] - obj[a])
};


helpers.objAttach = (obj, field, find) => Object.keys(obj).filter(elem => obj[elem][field] === find); //'42': {type: 'factory', level: '3'} return Object key '42'









module.exports = helpers;
