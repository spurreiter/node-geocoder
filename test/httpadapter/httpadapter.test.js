"use strict";
  const chai = require("chai");
  const should = chai.should();
  const assert = chai.assert;
  const sinon = require("sinon");

  const HttpAdapter = require("../../lib/httpadapter/httpadapter.js");
  const HttpError = require("../../lib/error/httperror.js");

describe("HttpAdapter", () => {
  describe("#constructor" , () => {
    test("if no http specified must instanciate one", () => {
      const http = require("http");
      const httpAdapter = new HttpAdapter();

      assert.equal(httpAdapter.http, http);
    });

    test("if client specified must use it", () => {
      const mockedHttp = {"test" : 1};
      const httpAdapter = new HttpAdapter(mockedHttp);

      httpAdapter.http.should.equal(mockedHttp);
    });

    test("if client specified timeout use it", () => {
      const options = { timeout: 5 * 1000 };
      const httpAdapter = new HttpAdapter(null, options);

      httpAdapter.options.timeout.should.equal(options.timeout);
    });

  });

  describe("#get" , () => {
    test("get must call http  request", () => {
      const http = { request: function () {} };
      const mock = sinon.mock(http);
      mock.expects("request").once().returns({
          end: function() {},
          on: function() { return this; }
      });

      const httpAdapter = new HttpAdapter(http);

      httpAdapter.get("http://test.fr");

      mock.verify();
    });


    test("get must call http request with set options", () => {
      const http = { request: function () {} };
      const mock = sinon.mock(http);
      mock.expects("request")
      .withArgs({ headers: { "user-agent": "Bla blubber" }, host: "test.fr", path: "/?" })
      .once().returns({
          end: function() {},
          on: function() { return this; }
      });

      const httpAdapter = new HttpAdapter(http,
        {headers: {
          "user-agent": "Bla blubber"
        }
      });

      httpAdapter.get("http://test.fr");

      mock.verify();
    });

    test("get must call http request with timeout", done => {
      const options = { timeout: 1 * 1000 };

      const httpAdapter = new HttpAdapter(null, options);

      httpAdapter.get("http://www.google.com", {}, function(err) {
        if(err instanceof HttpError && typeof err.code !== "undefined") {
          err.code.should.equal("ETIMEDOUT");
        }

        done();
      });
    });
  });
});

