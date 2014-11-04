var _ = require('underscore'),
	path = require('path'),
	spawn = require('child_process').spawn;

module.exports = function(grunt, util, options) {
	var statusUtil = util.status;
	var actionUtil = {};

	INSTALL = actionUtil.INSTALL = 'INSTALL';
	START = actionUtil.START = 'START';
	STOP = actionUtil.STOP = 'STOP';
	UNINSTALL = actionUtil.UNINSTALL = 'UNINSTALL';
	RESTART = actionUtil.RESTART = 'RESTART';
	STATUS = actionUtil.STATUS = 'STATUS';
	RUN = actionUtil.RUN = 'RUN';
	ALL_ACTIONS = actionUtil.ALL_ACTIONS = [INSTALL, START, STOP, UNINSTALL, RESTART, STATUS, RUN];

	var validate = actionUtil.validate = function(action) {
		if(action === undefined) {
			return {
				success: false,
				msg: 'No action defined'
			};
	    }

	    if(!_.contains(ALL_ACTIONS,action)) {
	      return {
	      	success: false,
	      	msg: 'Unknown action called. Only '+ ALL_ACTIONS.join(', ') +' are valid.'
	      };
	    }

	    return { success: true, msg: '' };
	};

	
	var performStatus = function() {
		var msg = 'Status of redis service is: ';
		var status = statusUtil.getStatus();
		if(status === undefined) {
			msg += 'UNKNOWN';
		} else {
			msg += status;
		}
		grunt.log.writeln(msg);
	};

	var performRestart = function() {
		var res = performAction(ACTION_STOP);
        if(!res.success) return res;
        res = performAction(ACTION_START);
        return res;
	};

	var performRun = function() {
		console.log('Starting Redis Server...');

		var args = util.getCommand(RUN).split(' ');
		var cmd = args.shift();
		var exe = path.basename(cmd);
		var cwd = path.dirname(cmd);

		args = ['cmd', '/S', '/C', exe].concat(args);

		var done = util.taskThis.async();
		var run = spawn(args.shift(), args, {cwd: cwd});

		run.stdout.on('data', function(data) {
			processDataBuffer(data, process.stdout);
		});

		run.stderr.on('data', function(data) {
			processDataBuffer(data, process.stderr, '> '.red.bold);
		});

		run.on('exit', function() {
			console.log('Redis server stopped.');
			done();
		});
	};

	// "basic" means either [install,start,stop,uninstall]
	var performBasic = function(action, status) {
		// Setup first, then start
        if(action === START && status === statusUtil.NOT_INSTALLED) {
            grunt.log.writeln('Redis service must be installed before service can start.');
            performAction(INSTALL, status);
        }

        // Stop first, then uninstall
        if(action === UNINSTALL && status === statusUtil.RUNNING) {
            grunt.log.writeln('Redis service must be stopped before service can uninstall.');
            performAction(STOP, status);
        }

        var res;

        // Starting the service can be gruesome, so apply some retry logic
        if(action === START) {
            var tries = 0, absmax=10;
            while(tries < absmax && tries < options.start_retry_count) {
                tries++;
                res = runAction(START);
	        
                // Check if started OK (dbl-check against service state)
                var isStarted = res.success && statusUtil.getStatus() === statusUtil.RUNNING;
	        
                // If started, do not retry anymore
                if(isStarted) { break; }
	        
                // Check if this was last try
                if(tries >= absmax || tries >= options.start_retry_count) {
                	res.success = isStarted;
                	res.msg += ' Will not try anymore.';
                    break;
                }
	        
                // Not started this time, log the try
                grunt.log.writeln(res.msg + ' Retrying...');
            }
        } else {
        	// run other action
        	res = runAction(action);
        }
	      
        // Log status
        if(!res.success) {
            grunt.fail.warn(res.msg);
        } else {
            grunt.log.writeln(res.msg);
        }
	    
        return res;
	};

	var performAction = actionUtil.performAction = function(action, status) {
		// ensure status is set
		if(status === undefined) {  status = statusUtil.getStatus(); }
    
    	// perform action
        if(action === STATUS) { return performStatus(); }
		if(action === RESTART) { return performRestart(); }
		if(action === RUN) { return performRun(); }
		return performBasic(action, status);
	};

	var runAction = function(action) {
    	var cmd = util.getCommand(action);
    	return util.runCommand(cmd);
	};

	var processDataBuffer = function(data, output, prefix) {
		if(prefix === undefined) prefix = '> '.yellow.bold;
		var msgs = data.toString().split('\n');
		msgs.forEach(function(msg){
			if(msg.length==0) return;
			var match = msg.match(/ [#*-] .*/);
			if(match && match.length>0) msg = match[0].substring(3);
			output.write(prefix + msg + '\n');
		});
	};

	return actionUtil;
};
