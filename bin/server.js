var cluster = require('cluster');

if (cluster.isMaster && false) {

    const cpuCount = require('os').cpus().length;

    for (let i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    cluster.on('exit', function (worker) {

        console.log('Worker ' + worker.id + ' died');
        cluster.fork();

    });
}
else {

    const app = require('../src/app');
    const http = require('http');

    const port = normalizePort(process.env.PORT || '3000');
    app.set('port', port);

    const server = http.createServer(app);

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    function normalizePort(val) {
        var port = parseInt(val, 10);

        if (isNaN(port)) {
            return val;
        }

        if (port >= 0) {
            return port;
        }

        return false;
    }

    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.log(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.log(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    function onListening() {
        var addr = server.address();
        var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
        console.log('Server running at http://127.0.0.1:' + port + '/');
    }
}