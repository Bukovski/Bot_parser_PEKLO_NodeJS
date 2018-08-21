const { parseString } = require('xml2js'); //https://www.npmjs.com/package/xml2js


const helpers = {};


helpers.parseJsonToObject = (str) => {
  try{
    return JSON.parse(str);
  } catch(e){
    return {};
  }
};


helpers.xml = (data, callback) => parseString(data, (err, result) => {
  if (err) return callback('Could not convert to JSON from XML');
  
  callback(null, JSON.stringify(result, null, 2));
});












module.exports = helpers;
