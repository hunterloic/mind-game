const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const GameModel = require('./models/game');
const GameBusiness = require('./business/game');
const SiteBusiness = require('./business/site');

app.use(morgan('dev'));
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(session({
    secret: 'mysecret',
    resave: true,
    saveUninitialized: true,
}));

app.set('view engine', 'ejs');

// Allow CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Autorization');
    if(req.method == 'OPTIONS')
    {
        req.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use((req, res, next) => {
    try {
        if(req.url == '/login') {
            next();
        } else {
            if(!req.session.username || req.session.username == "") {
                req.session.username = "";
                res.redirect("/login");
            }
        }
        next();
    } catch(ex) {
        console.log(ex);
        next(new Error(ex));
    }
});

app.get('/', (req, res) => {
    try {
        res.render(
            'index', 
            { 
                username : req.session.username,
                games : SiteBusiness.getGames(),
                config : SiteBusiness.getConfig(),
            }
        );
    } catch(ex) {
        console.log(ex);
        next(new Error(ex));
    }
});

app.post('/game', (req, res, next) => {
    try {
        var game = new GameModel(req.session.username);
        if(!SiteBusiness.addGame(game)) {
            next(new Error(SiteBusiness.error));
            return;
        }
        res.redirect('game?host=' + game.host);
    } catch(ex) {
        console.log(ex);
        next(new Error(ex));
    }
});

app.get('/game', (req, res, next) => {
    try {
        var game = SiteBusiness.getGame(req.query.host);
    
        res.render(
            'game', 
            {
                game : game,
                username : req.session.username
            }
        );
    } catch(ex) {
        console.log(ex);
        next(new Error(ex));
    }

});

app.get('/login', (req, res) => {
    try {
        res.render('login');
    } catch(ex) {
        console.log(ex);
        next(new Error(ex));
    }
});

app.post('/login', (req, res) => {
    try {

        req.session.username = req.body.username;
        res.redirect("/");
    } catch(ex) {
        console.log(ex);
        next(new Error(ex));
    }

});

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
    
});

app.use((error, req, res, next) => {
    var status = error.status || 500;
    res.status(status);
    res.send("error : " + status + " : " + error.message);
});

module.exports = app;
