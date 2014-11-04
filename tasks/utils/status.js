var _ = require('underscore'),
	execSync = require('execSync');

module.exports = function(grunt, util, options) {
	var statusUtil = {};

	var NOT_INSTALLED = statusUtil.NOT_INSTALLED = 	'NOT INSTALLED',
		STOPPED = 		statusUtil.STOPPED = 		'STOPPED',
		RUNNING = 		statusUtil.RUNNING = 		'RUNNING',
		ALL_STATUSES = 	statusUtil.ALL_STATUSES = 	[NOT_INSTALLED, STOPPED, RUNNING];

	validate = statusUtil.validate = function(status) {
		if(status === undefined) {
			status = getStatus();
		}
		if(_.contains(ALL_STATUSES, status) !== true) {
			return { success: false, msg: 'Unknown status of service detected. I do not know what to do with this...' };
		}
	    
	    return { success: true, msg: '' };
	};

	getStatus = statusUtil.getStatus = function() {
		var result = execSync.exec('sc query ' + options.name + ' | findstr STATE').stdout;
		if(!result || result.length===0) {
			return NOT_INSTALLED;
		}
		var status = result.match(/(RUNNING|STOPPED)/img);
		if(status && status.length>0) {
			if(status[0]==='RUNNING') return RUNNING;
			if(status[0]==='STOPPED') return STOPPED;
		}
		return undefined;
	};

	return statusUtil;
};
