'use strict';

var test = require('blue-tape');

var setup = function setup() {

  var fixtures = {};

  return fixtures;
};

var teardown = function teardown(fixtures) {

  fixtures = null;
};

test('test fixture', function(assert) {

    assert.plan(1);

    var fixture = setup();

    assert.equal(typeof fixture, 'object', 'fixture should return an object');

    teardown(fixture);

    assert.end();

});

test('test aync', function(assert) {

  var start = Date.now();

  var timeout = 100;

  var t = setTimeout(function() {

    clearTimeout(t);

    assert.plan(1);

    assert.pass('elapse time should be ~100s (' + (Date.now() - start) + ')');

    assert.end();

  }, timeout);

});

test('test promise', function() {

  return new Promise(function(resolve) {

    var timeout = 100;

    var t = setTimeout(function() {

      clearTimeout(t);

      resolve();

    }, timeout);

  });

});
