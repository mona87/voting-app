const path = process.cwd();

const pollController = require('../controllers/pollController');


module.exports = (app, passport) => {
	//home page w/login links
	app.get('/', (req, res) => {
		res.render('index.ejs', {user: req.user});
	});
	//login form
	app.get('/login', (req,res)=>{
		res.render('login.ejs',  { message: req.flash('loginMessage'), user: req.user});
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	//sign up
	app.get('/signup', (req, res) => {
		console.log('body',req.body)
		res.render('signup.ejs',  { message: req.flash('signupMessage'), user: req.user });
	});
	//redirect if logging out
	app.get('/logout', (req, res)=>{
		req.logout();
		res.redirect('/')
	});

	//profile
	app.get('/profile', isLoggedIn, (req, res)=>{
		res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        })
	});

	app.post('/signup', passport.authenticate('local-signup',{
		successRedirect: '/profile', // redirect to the secure profile section
		failureRedirect: '/signup', // redirect back to the signup page if there is an error
		failureFlash: true // allow flash messages

	}));

	//facebook routes
	  // route for facebook authentication and login
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email']  }));

	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect: '/profile',
		failureRedirect: '/',
		failureFlash: true
	}));

	app.get('/chart', pollController.getJSON);
	//share link to poll
	app.get('/vote', pollController.findPoll);

	//vote in poll
	app.post('/vote', pollController.vote);

	//link to poll page
	app.post('/poll', pollController.findUser, pollController.success);

	//show all polls
	app.get('/showAll', pollController.showAll);

	//delete poll
	app.post('/delete', pollController.delete);

	//show all polls
	app.get('/allPolls', pollController.allPolls);

}

const isLoggedIn = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}

	res.redirect('/');
}