const network = require('lib/network');


module.exports = (jsonXML) => Object.keys(jsonXML.userItems).forEach(elem => {
  if (/star_(.*?)_activeted/.test(elem)) {
    network.executeAction(`${ elem.slice(0, -10)}_starter_quest`);
  }
});
