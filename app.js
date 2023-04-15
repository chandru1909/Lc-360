const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
const path = require('path');
const fs = require("fs");
const sessions = require("express-session");

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));

const secure = (process.env.secure === 'true' || process.env.secure === true);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/favicon.ico', function (req, res) {
    const favicon = fs.readFileSync('public/images/favicon.ico');
    res.statusCode = 200;
    res.setHeader('Content-Length', favicon.length);
    res.setHeader('Content-Type', 'image/x-icon');
    res.setHeader("Cache-Control", "public, max-age=2592000");                // expiers after a month
    res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
    res.end(favicon);
});

if (secure) {
    app.use(function (req, res, next) {
        if (req.secure) next();
        else res.redirect("https://" + req.headers.host + req.url);
    });
}

app.use(function (req, res, next) {
    if (req.url === "/sign-in" || req.url === "/sign-up" ||
        req.url.startsWith("/assets") || req.url.startsWith("/js") ||
        req.url.startsWith("/images") || req.url.startsWith("/fonts") || req.url.startsWith("/file")) {
        next();
    }
    else {
        if (!req.session.user || !req.session.user.id) {
            req.session.redirectTo = req.url;
            res.redirect("/sign-in");
        }
        else {
            next();
        }
    }
});

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
app.use(express.json());

app.use("/assets", express.static(__dirname + '/public'));
app.use('/', require('./routes/index'));
app.use('/charts', require('./routes/charts'));

module.exports = app;