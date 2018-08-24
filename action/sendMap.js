const network = require('lib/network');


module.exports = (sendMaps) => {
  let sendMapsType;
  
  if (sendMaps.includes('request_key=interaction')) {
    sendMapsType = sendMaps.match(/interaction%3A(.*?)-in_/);
  } else {
    sendMapsType = sendMaps.match(/interaction%3A(.*?)$/);
  }
  
  const sendMapsIdUser = sendMaps.match(/app3558212_(.*?)[?]/);
  
  network.sendMap(sendMapsType[1], sendMapsIdUser[1], (response) => {
    if (response.includes('error')) {
      console.log('Чертеж не отправился');
    } else {
      console.log('Чертежи', response);
    }
  });
};
