
const express = require('express');
const routes = require('./app/routes/routes.js');
const app = express();
const config = require('./app/config/passport');
const env = require('dotenv')
env.config();

const mongoose = require('mongoose');

const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');


mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI); // connect to our database
// mongoose.connect(req.webtaskContext.secrets.MONGO_URL);
 // pass passport for configuration
config(passport);


app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // read cookies (needed for auth)

app.set('view engine', 'ejs');
app.set('views', __dirname + '/public');


// required for passport
app.use(session({ secret: 'cats',
      saveUninitialized: true,
      resave: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


//routes
routes(app, passport);


// module.exports = Webtask.fromExpress(app);

app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', () =>{
	console.log('app listening on 3000');
})