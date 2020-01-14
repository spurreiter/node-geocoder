const querystring = require("querystring"), util = require("util"), AbstractGeocoder = require("./abstractgeocoder");

/**
 * Constructor
 */
const GeocodioGeocoder = function GeocodioGeocoder(httpAdapter, apiKey) {

  GeocodioGeocoder.super_.call(this, httpAdapter);

  if (!apiKey || apiKey == "undefined") {

    throw new Error(this.constructor.name + " needs an apiKey");
  }

  this.apiKey = apiKey;
  this._endpoint = "https://api.geocod.io/v1";
};

util.inherits(GeocodioGeocoder, AbstractGeocoder);

/**
 * Geocode
 * @param <string>   value    Value to geocode (Address)
 * @param <function> callback Callback method
 */
GeocodioGeocoder.prototype._geocode = function (value, callback) {
  const _this = this;
  this.httpAdapter.get(this._endpoint + "/geocode", {
    "q": value,
    "api_key": querystring.unescape(this.apiKey)
  }, function (err, result) {
    if (err) {
      return callback(err);
    }
    if (result.error) {
      return callback(new Error("Status is " + result.error), {raw: result});
    }

    const results = [];

    const locations = result.results;

    for (let i = 0; i < locations.length; i++) {
      results.push(_this._formatResult(locations[i]));
    }

    results.raw = result;
    callback(false, results);
  });
};

GeocodioGeocoder.prototype._formatResult = function (result) {
  const accuracy = (result.accuracy < 1) ? result.accuracy - 0.1 : 1;
  return {
    "latitude": result.location.lat,
    "longitude": result.location.lng,
    "country": null,
    "city": result.address_components.city,
    "state": result.address_components.state,
    "zipcode": result.address_components.zip,
    "streetName": result.address_components.formatted_street,
    "streetNumber": result.address_components.number,
    "countryCode": null,
    "extra": {
      confidence: accuracy || 0
    }
  };
};

/**
 * Reverse geocoding
 * @param {lat:<number>,lon:<number>}  lat: Latitude, lon: Longitude
 * @param <function> callback Callback method
 */
GeocodioGeocoder.prototype._reverse = function (query, callback) {
  const lat = query.lat;
  const lng = query.lon;

  const _this = this;

  this.httpAdapter.get(this._endpoint + "/reverse", {
    "q": lat + "," + lng,
    "api_key": querystring.unescape(this.apiKey)
  }, function (err, result) {
    if (err) {
      return callback(err);
    }

    const results = [];
    const locations = result.results;

    for (let i = 0; i < locations.length; i++) {
      results.push(_this._formatResult(locations[i]));
    }

    results.raw = result;
    callback(false, results);
  });
};

module.exports = GeocodioGeocoder;
