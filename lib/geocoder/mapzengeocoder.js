const querystring = require('querystring'), util = require('util'), AbstractGeocoder = require('./abstractgeocoder');

/**
 * Constructor
 */
const MapzenGeocoder = function MapzenGeocoder(httpAdapter, apiKey) {

  MapzenGeocoder.super_.call(this, httpAdapter);

  if (!apiKey || apiKey == 'undefined') {

    throw new Error(this.constructor.name + ' needs an apiKey');
  }

  this.apiKey = apiKey;
  this._endpoint = 'https://search.mapzen.com/v1';
};

util.inherits(MapzenGeocoder, AbstractGeocoder);

/**
 * Geocode
 * @param <string>   value    Value to geocode (Address)
 * @param <function> callback Callback method
 */
MapzenGeocoder.prototype._geocode = function (value, callback) {
  const _this = this;
  this.httpAdapter.get(this._endpoint + '/search', {
    'text': value,
    'api_key': querystring.unescape(this.apiKey)
  }, function (err, result) {
    if (err) {
      return callback(err);
    }
    if (result.error) {
      return callback(new Error('Status is ' + result.error), {raw: result});
    }

    const results = [];

    const locations = result.features;

    for (let i = 0; i < locations.length; i++) {
      results.push(_this._formatResult(locations[i]));
    }

    results.raw = result;
    callback(false, results);
  });
};

MapzenGeocoder.prototype._formatResult = function (result) {
  const accuracy = (result.properties.confidence < 1) ? result.properties.confidence - 0.1 : 1;

  return {
    'latitude': result.geometry.coordinates[1],
    'longitude': result.geometry.coordinates[0],
    'country': result.properties.country,
    'city': result.properties.locality,
    'state': result.properties.region,
    'zipcode': null,
    'streetName': result.properties.street,
    'streetNumber': result.properties.housenumber,
    'countryCode': result.properties.country_a,
    'extra': {
      confidence: accuracy || 0
    }
  };
};

/**
 * Reverse geocoding
 * @param {lat:<number>,lon:<number>}  lat: Latitude, lon: Longitude
 * @param <function> callback Callback method
 */
MapzenGeocoder.prototype._reverse = function (query, callback) {
  const lat = query.lat;
  const lng = query.lon;

  const _this = this;

  this.httpAdapter.get(this._endpoint + '/reverse', {
    'point.lat': lat,
    'point.lon': lng,
    'api_key': querystring.unescape(this.apiKey)
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

module.exports = MapzenGeocoder;
