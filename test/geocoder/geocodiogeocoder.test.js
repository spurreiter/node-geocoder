const chai = require("chai"), should = chai.should(), expect = chai.expect, sinon = require("sinon");

const GeocodioGeocoder = require("../../lib/geocoder/geocodiogeocoder.js");
const HttpAdapter = require("../../lib/httpadapter/httpadapter.js");

const mockedHttpAdapter = {
  get: function() {}
};

describe("GeocodioGeocoder", () => {

  describe("#constructor" , () => {

    test("an http adapter must be set", () => {

      expect(function() {new GeocodioGeocoder();}).to.throw(Error, "GeocodioGeocoder need an httpAdapter");
    });

    test("an apiKey must be set", () => {

      expect(function() {new GeocodioGeocoder(mockedHttpAdapter);}).to.throw(Error, "GeocodioGeocoder needs an apiKey");
    });

    test("Should be an instance of GeocodioGeocoder", () => {

      const mapquestAdapter = new GeocodioGeocoder(mockedHttpAdapter, "API_KEY");

      mapquestAdapter.should.be.instanceof(GeocodioGeocoder);
    });

  });

  describe("#geocode" , () => {

    test("Should not accept IPv4", () => {

      const mapquestAdapter = new GeocodioGeocoder(mockedHttpAdapter, "API_KEY");

      expect(function() {
        mapquestAdapter.geocode("127.0.0.1");
      }).to.throw(Error, "GeocodioGeocoder does not support geocoding IPv4");

    });

    test("Should not accept IPv6", () => {

      const mapquestAdapter = new GeocodioGeocoder(mockedHttpAdapter, "API_KEY");

      expect(function() {
        mapquestAdapter.geocode("2001:0db8:0000:85a3:0000:0000:ac1f:8001");
      }).to.throw(Error, "GeocodioGeocoder does not support geocoding IPv6");

    });

  });

  describe("#reverse" , () => {
    test("Should call httpAdapter get method", () => {

      const mock = sinon.mock(mockedHttpAdapter);
      mock.expects("get").once().returns({then: function() {}});

      const mapquestAdapter = new GeocodioGeocoder(mockedHttpAdapter, "API_KEY");

      mapquestAdapter.reverse({lat:10.0235,lon:-2.3662});

      mock.verify();
    });

  });


});

