
const express = require('express');
const routeBuilder = require('express-route-builder');
const buildController = require('lib/middleware/build_controller');
const dispatcher = require('lib/middleware/dispatcher');

routeBuilder.setMiddlewares([
  {
    name: 'handler',
    // 'required' means it must be specified or an error is thrown
    include: 'required',
    generator: buildController
  },
  {
    name: 'dispatcher',
    include: 'all',
    generator: dispatcher
  }

]);

/**
 * Generate a router from a set of routes data
 * @param   {Array}           routes      route configuration to build into a router
 * @returns {express.Router}              express router object
 */
module.exports = function addRouter (routes) {

  const router = new express.Router();

  routeBuilder.buildRouter(router, routes);

  return router;
};
