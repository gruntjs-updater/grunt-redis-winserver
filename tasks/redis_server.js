'use strict';

var _ = require('underscore'),
    execSync = require('execSync'),
    path = require('path');

module.exports = function(grunt) {

    grunt.registerMultiTask('redis_server', 'A grunt plugin for installing, running and controlling a redis server on windows.', function() {

        // merge task options with default values
        var options = this.options({
            name: 'grunt-redis',
            start_retry_count: 3,
            redisconf: {}
        });

        // Get called action
        var action = (arguments[0] || '').toUpperCase();

        // Create the util
        var util = require('./utils/util.js')(grunt, options, this);

        // Validate task
        var validationResult = util.validate(action);
        if(validationResult.success !== true) {
            grunt.fail.warn(validationResult.msg);
            return;
        }
    
        // Perform Action
        util.action.performAction(action);
    });
};
