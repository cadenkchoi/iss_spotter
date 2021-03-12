const request = require('request');

const fetchMyIP = function(callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP address. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    const ip = JSON.parse(body).ip;
    if (ip) {
      callback(null, ip);
    }
  });
};

const fetchCoordsByIP = function(ip, callback) {
  request(`https://freegeoip.app/json/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP address coordinates. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    const myCoords = {};
    myCoords['latitude'] = JSON.parse(body).latitude;
    myCoords['longitude'] = JSON.parse(body).longitude;
    callback(null, myCoords);
  });
};

const fetchISSFlyOverTimes = function(coords, callbacks) {
  request(`http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {
    if (error) {
      callbacks(error, null);
    };
    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    };
    const flyOverInfo = JSON.parse(body).response;
    callbacks(null, flyOverInfo);
  });
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    };
    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      };
      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }
        callback(null, nextPasses);
      });
    });
  });
}

module.exports = { nextISSTimesForMyLocation };

// module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes };
