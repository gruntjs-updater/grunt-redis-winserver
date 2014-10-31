/*
 * grunt-redis-winserver
 * https:
 *
 * Copyright (c) 2014 mbaaz
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('underscore');
var execSync = require('execSync');
var path = require('path');

var ACTION_INSTALL = 'INSTALL';
var ACTION_START = 'START';
var ACTION_STOP = 'STOP';
var ACTION_UNINSTALL = 'UNINSTALL';
var ACTION_RESTART = 'RESTART';
var ACTION_STATUS = 'STATUS';
var actions = [ACTION_INSTALL,ACTION_START,ACTION_STOP,ACTION_UNINSTALL,ACTION_RESTART,ACTION_STATUS];

var STATE_NOT_INSTALLED = 'NOT INSTALLED';
var STATE_STOPPED = 'STOPPED';
var STATE_RUNNING = 'RUNNING';
var STATE_UNDEFINED = 'UNDEFINED';

module.exports = function(grunt) {

  grunt.registerMultiTask('redis_server', 'A grunt plugin for installing, running and controlling a redis server on windows.', function() {
    
    /* OPTION MERGE:IFICATION */
    
    // merge task options with default values
    var options = this.options({
      name: 'grunt-redis',
      start_retry_count: 3,
      redisconf: {}
    });
    
    /* TASK VALIDATION */
    
    // Validate options
    if(options.name.length <= 0) {
      grunt.fail.warn('You need to define a name for the service');
      return;
    }
    
    // Validate that this task is started with correct argument
    var action = (arguments[0] || '').toUpperCase();
    if(action === undefined) {
      grunt.fail.warn('No action defined');
      return;
    }
    
    // validate action name
    if(!_.contains(actions,action)) {
      grunt.fail.warn('Unknown action called. Only '+ actions.join(', ') +' are valid.');
      return;
    }
    
    // get state of windows service, and validate against action
    var state = getServiceState(options.name);
    if(state === undefined || state === STATE_UNDEFINED) {
      grunt.fail.warn('Unknown state of service detected. I do not know what to do with this...');
      return;
    }
    if(action !== ACTION_STATUS && (
      (state === STATE_NOT_INSTALLED && action !== ACTION_INSTALL && action !== ACTION_START) ||
      (state === STATE_STOPPED && action !== ACTION_START && action !== ACTION_UNINSTALL) ||
      (state === STATE_RUNNING && action !== ACTION_STOP && action !== ACTION_RESTART && action !== ACTION_UNINSTALL)
      )) {
      grunt.fail.warn('Service is '+state+'. Action '+action+' is not applicable.');
      return;
    }

    /* TAKE ACTION */

    // Run the redis service command
    performAction(action, options);
  });

  var performAction = function(action, options) {
    var state = getServiceState(options.name);
    
    if(action === ACTION_STATUS) {
      var msg = 'Status of the redis service is: ';
      if(state === undefined || state === STATE_UNDEFINED)
        msg += 'UNKNOWN';
      else
        msg += state;
      grunt.log.writeln(msg);
      return;
    }
    
    if(action === ACTION_RESTART) {
      var res = performAction(ACTION_STOP, options);
      if(!res.success) return res;
      return performAction(ACTION_START, options);
    }
    
    // Setup first, then start
    if(action === ACTION_START && state === STATE_NOT_INSTALLED) {
      grunt.log.writeln('Redis service must be installed before service can start.');
      performAction(ACTION_INSTALL, options);
    }
    
    // Stop first, then uninstall
    if(action === ACTION_UNINSTALL && state === STATE_RUNNING) {
      grunt.log.writeln('Redis service must be stopped before service can uninstall.');
      performAction(ACTION_STOP, options);
    }
    
    // Starting the service can be grusome, so apply some retry logic
    if(action === ACTION_START) {
      var tries = 0, absmax=10;
      while(tries < absmax && tries < options.start_retry_count) {
        tries++;
        var res = runAction(ACTION_START, options);
        
        // Check if started OK (dbl-check against service state)
        var isStarted = res.success && getServiceState(options.name) === STATE_RUNNING;
        
        // If started, all is well
        if(isStarted) {
          grunt.log.writeln(res.msg);
          return;
        }
        
        // Check if this was last try
        if(tries >= absmax || tries >= options.start_retry_count) {
          grunt.fail.warn(res.msg + ' Will not try anymore.');
          return;
        }
        
        // Not started this time, log the try
        grunt.log.writeln(res.msg + ' Retrying...');
      }
      return;
    }
    
    // run action
    var res = runAction(action, options);
      
    // Log status
    if(!res.success) {
      grunt.fail.warn(res.msg);
    } else {
      grunt.log.writeln(res.msg);
    }
    
    return res;
  };

};

var runAction = function(action, options) {
  var cmd = buildRedisCommand(options.name, action, options.redisconf);
  var msg = runRedisCommand(cmd);
  var iserr = isErrorMsg(msg);
  return { success: !iserr, msg: msg };
};

var isErrorMsg = function(msg) {
  return msg.indexOf('failed')>0 || 
          msg.indexOf('timed out')>0 || 
          msg.indexOf('error')>0
  ;
};

var buildRedisCommand = function(name, action, redisconf) {
  var redisPath = path.normalize(__dirname + '\\..\\redis\\redis-server.exe');
  var cmd = redisPath;
  cmd += ' --service-' + action;
  cmd += ' --service-name ' + name;
  if(action === ACTION_INSTALL) {
    for(var key in redisconf) {
      cmd += ' --' + key + ' ' + redisconf[key];
    }
  }
  return cmd;
};

var runRedisCommand = function(cmd) {
  var result = execSync.exec(cmd).stdout.split('\r\n');
  var msg = result.pop();
  while(msg.length===0 && result.length>0) { msg = result.pop(); }  
  return msg.match(/ # .*/img).pop().substring(3);
};

var getServiceState = function(serviceName) {
  var result = execSync.exec('sc query ' + serviceName + ' | findstr STATE').stdout;
  if(!result || result.length===0) {
    return STATE_NOT_INSTALLED;
  }
  var state = result.match(/(RUNNING|STOPPED)/img);
  if(state && state.length>0) {
    if(state[0]==='RUNNING') return STATE_RUNNING;
    if(state[0]==='STOPPED') return STATE_STOPPED;
  }
  return STATE_UNDEFINED;
};
