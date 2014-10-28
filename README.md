# grunt-redis-winserver

> A grunt plugin for installing, running and controlling a redis server on windows.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-redis-winserver --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-redis-winserver');
```

## The "redis_server" task

### Overview
In your project's Gruntfile, add a section named `redis_server` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  redis_server: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Calling the task

When calling the task, you need to define what action you with to take with the redis server. These are used as arguments when calling the task target, as `redis_server:your_target:action`, where `your_target` is the name of your target and `action` is any one of the below:

- install
- start
- stop
- uninstall

You cannot call more than one action this way, but you can call this task several times in a row by setting up an alias task.  


### Options

#### options.name
Type: `String`
Default value: `'grunt-redis'`

The name of the windows service. Will show up on services.msc on the computer.

#### options.redisconf
Type: `[Object]`

This objects contains all redis configuration data. A current bug with redis on windows makes redis.conf-files unavailable, so all configuration options must be defined here. The available commands and their format is as follows:

```js
redisconf: {
	'daemonize':                     '[yes/no]',
	'pidfile':                       '[file]',
	'port':                          '[port number]',
	'tcp-backlog':                   '[number]',
	'bind':                          '[address] [address] ...',
	'unixsocket':                    '[path]',
	'timeout':                       '[value]',
	'tcp-keepalive':                 '[value]',
	'loglevel':                      '[value]',
	'logfile':                       '[file]',
	'syslog-enabled':                '[yes/no]',
	'syslog-ident':                  '[string]',
	'syslog-facility':               '[string]',
	'databases':                     '[number]',
	'save':                          '[seconds] [changes] or ""',
	'stop-writes-on-bgsave-error':   '[yes/no]',
	'rdbcompression':                '[yes/no]',
	'rdbchecksum':                   '[yes/no]',
	'dbfilename':                    '[filename]',
	'dir':                           '[path]',
	'slaveof':                       '[master port]',
	'masterauth':                    '[master-password]',
	'slave-serve-stale-data':        '[yes/no]',
	'slave-read-only':               '[yes/no]',
	'repl-ping-slave-period':        '[number]',
	'repl-timeout':                  '[number]',
	'repl-disable-tcp-nodelay':      '[yes/no]',
	'repl-backlog-size':             '[number]',
	'repl-backlog-ttl':              '[number]',
	'slave-priority':                '[number]',
	'min-slaves-to-write':           '[number]',
	'min-slaves-max-lag':            '[number]',
	'requirepass':                   '[string]',
	'rename-command':                '[string]',
	'maxclients':                    '[number]',
	'maxmemory':                     '[bytes]',
	'maxmemory-policy':              '[policy]',
	'maxmemory-samples':             '[number]',
	'appendonly':                    '[yes/no]',
	'appendfilename':                '[value]',
	'appendfsync':                   '[value]',
	'no-appendfsync-on-rewrite':     '[value]',
	'auto-aof-rewrite-percentage':   '[number]',
	'auto-aof-rewrite-min-size':     '[number]',
	'lua-time-limit':                '[number]',
	'slowlog-log-slower-than':       '[number]',
	'slowlog-max-len':               '[number]',
	'notify-keyspace-events':        '[string]',
	'hash-max-ziplist-entries':      '[number]',
	'hash-max-ziplist-value':        '[number]',
	'list-max-ziplist-entries':      '[number]',
	'list-max-ziplist-value':        '[number]',
	'set-max-intset-entries':        '[number]',
	'zset-max-ziplist-entries':      '[number]',
	'zset-max-ziplist-value':        '[number]',
	'hll-sparse-max-bytes':          '[number]',
	'activerehashing':               '[yes/no]',
	'client-output-buffer-limit':    '[class] [hard limit] [soft limit] [soft seconds]',
	'hz':                            '[number]',
	'aof-rewrite-incremental-fsync': '[yes/no]',
	'aof-load-truncated':            '[yes/no]',
	'latency-monitor-threshold':     '[number]' 
}
```

## Release History

### 0.1.2
- Updated description of project

### 0.1.1
- Fixed path to redis-server.exe
- Updated redis conf names with '-signs, so that the conf-object will be valid js
- Prettified output

### 0.1.0
- Initial release
