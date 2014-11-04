var path = require('path'),
	execSync = require('execSync');

module.exports = function(grunt, options, taskThis) {
	var util = {};

	var statusUtil = util.status = require('./status.js')(grunt, util, options);
	var actionUtil = util.action = require('./action.js')(grunt, util, options);

  util.taskThis = taskThis;

	var validCombinations = [
		{
			status: statusUtil.NOT_INSTALLED,
			actions: [actionUtil.STATUS, actionUtil.INSTALL, actionUtil.START, RUN]
		},
		{
			status: statusUtil.STOPPED,
			actions: [actionUtil.STATUS, actionUtil.START, actionUtil.UNINSTALL, RUN]
		},
		{
			status: statusUtil.RUNNING,
			actions: [actionUtil.STATUS, actionUtil.STOP, actionUtil.RESTART, actionUtil.UNINSTALL, RUN]
		}
	];

	var redisPath = util.redisPath = path.normalize(__dirname + '\\..\\..\\redis\\redis-server.exe');

	var validate = util.validate = function(action) {
		// Validate service name
		if(options.name.length <= 0) {
			return { success: false, msg: 'You need to define a name for the service' };
        }

        var status = statusUtil.getStatus(options.name), res;

        // validate action name
        res = actionUtil.validate(action);
        if(res.success !== true) { return res; }

        // validate status
        res = statusUtil.validate(status);
        if(res.success !== true) { return res };

        // validate combination of status and action
        res = validateCombination(status, action);
        if(res.success !== true) { return res };

        // all must be valid
        return { success: true, msg: '' };
	};

	var validateCombination = function(status, action) {
		for(i=0;i<validCombinations.length;i++) {
			if(validCombinations[i].status !== status) {
				continue;
			}
			for(j=0;j<validCombinations[i].actions.length;j++) {
				if(validCombinations[i].actions[j] !== action) {
					continue;
				}
				return { success: true, msg: '' };
			}
		}
		return { success: false, msg: 'Service is '+status+'. Action '+action+' is not valid.' };
	};

	var getCommand = util.getCommand = function(action) {
    	var path = redisPath, args = [];
    	if(action !== actionUtil.RUN) {
    		args = args.concat(['--service-'+action, '--service-name', options.name]);
    	}
    	if(action === actionUtil.INSTALL || action === actionUtil.RUN) {
    		args = args.concat(getConfigArguments());
    	}
    	return [path].concat(args).join(' ');
	};

	var getConfigArguments = function() {
	    var args = [];
	    for(var key in options.redisconf) {
	        args.push('--' + key);
	        args.push(options.redisconf[key]);
	    }
	    return args;
	};

	var runCommand = util.runCommand = function(cmd) {
    	var result = execSync.exec(cmd).stdout.split('\r\n');
    	var msg = result.pop();
    	while(msg.length===0 && result.length>0) { msg = result.pop(); }
    	msg = msg.match(/ # .*/img).pop().substring(3);
    	var isErr = isErrorMsg(msg);
    	return { success: !isErr, msg: msg }
	};

	var isErrorMsg = function(msg) {
    	return msg.indexOf('failed')>0 || 
        	msg.indexOf('timed out')>0 || 
        	msg.indexOf('error')>0
    	;
	};

	return util;
};
