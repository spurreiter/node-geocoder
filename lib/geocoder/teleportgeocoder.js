const util = require("util");
const AbstractGeocoder = require("./abstractgeocoder");

/**
 * Constructor
 */
const TeleportGeocoder = function TeleportGeocoder(httpAdapter, options) {
  TeleportGeocoder.super_.call(this, httpAdapter, options);

  const base = "https://api.teleport.org/api";
  this._cities_endpoint = base + "/cities/";
  this._locations_endpoint = base + "/locations/";
};

util.inherits(TeleportGeocoder, AbstractGeocoder);

function getEmbeddedPath(parent, path) {
  const elements = path.split("/");
  for ( const i in elements) {
    const element = elements[i];
    const embedded = parent._embedded;
    if (!embedded) {
      return undefined;
    }
    const child = embedded[element];
    if (!child) {
      return undefined;
    }
    parent = child;
  }
  return parent;
}

/**
 * Geocode
 *
 * @param <string>    value     Value to geocode (Address)
 * @param <function>  callback  Callback method
 */
TeleportGeocoder.prototype._geocode = function(value, callback) {
  const _this = this;

  const params = {};
  params.search = value;
  params.embed = "city:search-results/city:item/{city:country,city:admin1_division,city:urban_area}";

  this.httpAdapter.get(this._cities_endpoint, params, function(err, result) {
    if (err) {
      return callback(err);
    } else {
      const results = [];

      if (result) {
        const searchResults = getEmbeddedPath(result, "city:search-results") || [];
        for (const i in searchResults) {
          const confidence = (25 - i) / 25.0 * 10;
          results.push(_this._formatResult(searchResults[i], "city:item", confidence));
        }
      }

      results.raw = result;
      callback(false, results);
    }
  });
};

TeleportGeocoder.prototype._formatResult = function(result, cityRelationName, confidence) {
  const city = getEmbeddedPath(result, cityRelationName);
  const admin1 = getEmbeddedPath(city, "city:admin1_division") || {};
  const country = getEmbeddedPath(city, "city:country") || {};
  const urban_area = getEmbeddedPath(city, "city:urban_area") || {};
  const urban_area_links = urban_area._links || {};
  const extra = {
    confidence: confidence,
    urban_area: urban_area.name,
    urban_area_api_url: (urban_area_links.self || {}).href,
    urban_area_web_url: urban_area.teleport_city_url
  };
  if (result.distance_km) {
    extra.distance_km = result.distance_km;
  }
  if (result.matching_full_name) {
    extra.matching_full_name = result.matching_full_name;
  }

  return {
    "latitude": city.location.latlon.latitude,
    "longitude": city.location.latlon.longitude,
    "city": city.name,
    "country": country.name,
    "countryCode": country.iso_alpha2,
    "state": admin1.name,
    "stateCode": admin1.geonames_admin1_code,
    "extra": extra
  };
};

/**
 * Reverse geocoding
 *
 * @param {lat:<number>,lon:<number>}  lat: Latitude, lon: Longitude
 * @param <function> callback          Callback method
 */
TeleportGeocoder.prototype._reverse = function(query, callback) {
  const lat = query.lat;
  const lng = query.lon;
  const suffix = lat + "," + lng;

  const _this = this;

  const params = {};
  params.embed = "location:nearest-cities/location:nearest-city/{city:country,city:admin1_division,city:urban_area}";

  this.httpAdapter.get(this._locations_endpoint + suffix, params, function(err, result) {
    if (err) {
      throw err;
    } else {
      const results = [];

      if (result) {
        const searchResults = getEmbeddedPath(result, "location:nearest-cities") || [];
        for ( const i in searchResults) {
          const searchResult = searchResults[i];
          const confidence = Math.max(0, 25 - searchResult.distance_km) / 25 * 10;
          results.push(_this._formatResult(searchResult, "location:nearest-city", confidence));
        }
      }

      results.raw = result;
      callback(false, results);
    }
  });
};

module.exports = TeleportGeocoder;
