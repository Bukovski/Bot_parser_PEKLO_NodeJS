var environments = {};


// Development (default) environment
environments.development = {
  "user": {
    "uid": "",
    "auth_key": ""
  },
  
  //only save to file .data/
  // "save_file": true,
  // "read_file": false
  
  //only read to file .data/
  "save_file": false,
  "read_file": true
};

// Production environment
environments.production = {
  "user": {
    "uid": "",
    "auth_key": ""
  },
  "save_file": false,
  "read_file": false
};


const currentEnvironment = (typeof process.env.NODE_ENV === 'string') ? process.env.NODE_ENV.toLowerCase() : '';
const environmentToExport = (typeof environments[currentEnvironment] === 'object') ? environments[currentEnvironment] : environments.development; //NODE_ENV=production node index.js else development


module.exports = environmentToExport;


//node index.js
//NODE_ENV=development node index.js

//NODE_ENV=production node index.js
