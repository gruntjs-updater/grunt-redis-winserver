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

  grunt.registerMultiTask('redis_server', 'A grunt plugin for installing, running and controlling a redis server on windows.', function() {
    
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
    
    action = action.toLowerCase();
    
    if(action !== 'install' && action !== 'start' && action !== 'stop' && action !== 'uninstall') {
      grunt.fail.warn('Unknown action called. Only \'install\', \'start\', \'stop\' and \'uninstall\' are valid.');
      return;
    }
    
    var redis = path.normalize(__dirname + '\\..\\redis\\redis-server.exe');
    var args = ['--service-'+action, '--service-name', options.name];
    
    if(action === 'install') {
      for(var key in options.redisconf) {
        args.push('--'+key);
        args.push(options.redisconf[key]);
      }
    }
    
    var done = this.async();
    grunt.util.spawn(
      { cmd: redis, args: args, stdio: 'inherit' },
      function(error, result, code) {
        var re = / # .*/img;
        var matches = result.toString().match(re);
        if(matches !== null) {
          var msg = matches[0].substring(3);
          if(msg.indexOf('failed')>0 || msg.indexOf('timed out')>0)
            grunt.fail.warn(msg);
          else
            grunt.log.writeln(msg);
        }
        else {
          grunt.fail.warn('Unexpected result from redis service: \n'+result);
        }
        done();
      }
    );
    
  });

};
