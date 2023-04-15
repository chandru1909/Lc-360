let env = "dev";

process.argv.forEach(arg => {
    if (arg.startsWith("--env=")) {
        env = arg.split("=")[1];
    }
});

const configJSON = require(`./config/${env}.json`);
Object.keys(configJSON).forEach(key => {
    process.env[key] = configJSON[key];
});

const app = require('./app');
require('./database');

if (process.env.secure === 'true' || process.env.secure === true) {
    const https = require('https');
    const httpsPort = normalizePort(443);
    const privateKey = fs.readFileSync(process.env.privateKey, 'utf8');
    const certificate = fs.readFileSync(process.env.certificate, 'utf8');
    const ca = fs.readFileSync(process.env.ca, 'utf8');
    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    httpsServer = https.createServer(credentials, app);
    httpsServer.listen(httpsPort, () => {
        console.log('HTTPS Server running on port 443');
    });
    httpsServer.on('error', onHttpsError);
    httpsServer.on('listening', onHttpsListening);

    function onHttpsError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof httpsPort === 'string' ? 'Pipe ' + httpsPort : 'Port ' + httpsPort;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    function onHttpsListening() {
        var addr = httpsServer.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }
}
else {
    const http = require('http');
    const server = http.createServer(app);
    server.listen(process.env.port, () => {
        console.log("Server is running on port ", server.address().port);
    });

    server.on("error", function (error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof httpsPort === 'string' ? 'Pipe ' + httpsPort : 'Port ' + httpsPort;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    });
}