/*
 * grunt-redis-winserver
 * https:
 *
 * Copyright (c) 2014 mbaaz
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

module.exports = function(grunt) {

  grunt.registerMultiTask('redis_server', '', function() {
    
    var options = this.options({
      name: 'grunt-redis',
      redisconf: {}
    });
    
    if(options.name.length <= 0) {
      grunt.fail.warn('You need to define a name for the service');
      return;
    }
    
    var action = arguments[0];
    if(action === undefined) {
      grunt.fail.warn('No action defined');
      return;
    }
    
    if(action !== 'install' && action !== 'start' && action !== 'stop' && action !== 'uninstall') {
      grunt.fail.warn('Unknown action called. Only \'install\', \'start\', \'stop\' and \'uninstall\' are valid.');
      return;
    }
    
    var args = ['--service-'+action, '--service-name', options.name];
    for(var key in options.redisconf) {
      args.push('--'+key);
      args.push(options.redisconf[key]);
    }
    
    var done = this.async();
    grunt.util.spawn(
      {
        cmd: 'redis/redis-server.exe',
        args: args,
        stdio: 'inherit'
      },
      function(error, result, code) {
        grunt.log.writeln(result);
        done();
      }
    );
    
  });

};
