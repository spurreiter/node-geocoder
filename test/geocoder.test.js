"use strict";

const chai   = require("chai");
const should = chai.should();
const assert = chai.assert;
const sinon  = require("sinon");

const Geocoder = require("../lib/geocoder.js");

const stupidGeocoder = {
  geocode: function(data, cb) {
    cb(null, []);
  },
  reverse: function(data, cb) {
    cb(null, []);
  }
};

describe("Geocoder", () => {
  beforeEach(() => {
    sinon.spy(stupidGeocoder, "geocode");
    sinon.spy(stupidGeocoder, "reverse");
  });

  afterEach(() => {
    stupidGeocoder.geocode.restore();
    stupidGeocoder.reverse.restore();
  });


  describe("#constructor" , () => {
    test("Should set _geocoder", () => {
      const geocoder = new Geocoder(stupidGeocoder);

      geocoder._geocoder.should.be.equal(stupidGeocoder);
    });
  });

  describe("#geocode" , () => {
    test("Should call geocoder geocode method", () => {
      const geocoder = new Geocoder(stupidGeocoder);

      return geocoder.geocode("127.0.0.1")
        .then(function() {
          stupidGeocoder.geocode.calledOnce.should.be.true;
        });
    });

    test("Should return a promise", () => {
      const geocoder = new Geocoder(stupidGeocoder);

      const promise = geocoder.geocode("127.0.0.1");
      promise.then.should.be.a("function");

      return promise;
    });
  });

  describe("#batchGeocode" , () => {
    test("Should call stupidGeocoder geocoder method x times", () => {
      const geocoder = new Geocoder(stupidGeocoder);
      return geocoder.batchGeocode([
        "127.0.0.1",
        "127.0.0.1"
      ]).then(function() {
        assert.isTrue(stupidGeocoder.geocode.calledTwice);
      });
    });

    test("Should return a promise", () => {
      const geocoder = new Geocoder(stupidGeocoder);

      const promise = geocoder.batchGeocode(["127.0.0.1"]);
      promise.then.should.be.a("function");

      return promise;
    });
  });

  describe("#reverse" , () => {
    test("Should call stupidGeocoder reverse method", () => {
      const geocoder = new Geocoder(stupidGeocoder);

      return geocoder.reverse(1, 2)
        .then(function() {
          stupidGeocoder.reverse.calledOnce.should.be.true;
        });
    });

    test("Should return a promise", () => {
      const geocoder = new Geocoder(stupidGeocoder);

      const promise = geocoder.reverse("127.0.0.1");

      promise.then.should.be.a("function");
    });
  });
});

