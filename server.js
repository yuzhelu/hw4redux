var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');
var jwt = require('jsonwebtoken');
var cors = require('cors')

var dotenv = require('dotenv').config();
var mongoose = require('mongoose');

mongoose.connect(process.env.mongoDB, (err, database) =>{
    if(err) throw err;
    console.log('Connected to database.');
    db = database;
    console.log('Database connected on ' + process.env.mongoDB);

})

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(cors());

var router = express.Router();

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/movie/:title')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.findOne({title: req.params.title}).exec(function(err, movie1) {
            if (err) res.send(err);

            //var userJson = JSON.stringify(movie);
            // return that user
            if (movie1 !== null){
                res.json(movie1);
            }
            else{
                res.json({ message: 'Movie is not found' });
            }

        });
    })
    .delete(authJwtController.isAuthenticated, function (req, res) {
        if (!req.params.title)
        {
            res.json({success: false, msg: 'Please pass movie title.'});
        }
        else
        {
            Movie.findOne({Title: req.params.title}).exec(function(err, result){ //Make sure movie exists before deleting
                if (result !== null) {
                    Movie.remove({Title: req.params.title}).exec(function (err) {
                        if (err)  res.json({ success: false, message: "Could not find movie with title '" + req.body.Title + "'"});
                        else res.json({ success: true, message: "Movie deleted."});
                    })
                }
            });
        }
    })

    .put(authJwtController.isAuthenticated, function (req, res) {
        Movie.findOne({Title: req.params.title}).exec(function(err, movie) {
            if (movie !== null) {
                newMovie.title = req.body.title;
                newMovie.yearReleased = req.body.yearReleased;
                newMovie.genre = req.body.genre;
                newMovie.actors = req.body.actors;
                movie.save(function(err) {
                    if (err) {
                        // duplicate entry
                        if (err.code == 11000)
                            return res.json({ success: false, message: 'Movie title cannot be duplicated. '});
                        else
                            return res.send({ success: false,  message:"Failed to update a movie"});
                    }
                    res.json({ message: 'Movie updated!' });
                });
            }
            else
            {
                res.json({ message: 'Movie is not found' });
            }
        });
    });


router.route('/movies')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var reviewOption = req.params.reviews;

        Movie.find(function (err, movies) {
            if (err) res.send(err);
            if(reviewOption === "true"){
                Movie.aggregate([{
                    $lookup: {
                        from: "reviews",
                        localField: "title",
                        foreignField: "movieTitle",
                        as: 'review'
                    }
                },

                    {
                        $match:{ title: movie.title }
                    }

                ], function (err, result) {
                    if(err) res.send(err);
                    else res.json(result);
                });
            } else {
                res.json(movie);
            }


            // return the users
            res.json(movies);
        });
    })

    .post(authJwtController.isAuthenticated, function (req, res) {
        var newMovie = new Movie();
        newMovie.title = req.body.title;
        newMovie.yearReleased = req.body.yearReleased;
        newMovie.genre = req.body.genre;
        newMovie.actors = req.body.actors;
        // save the movie
        newMovie.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'Movie title cannot be duplicated. '});
                else
                    return res.send({ success: false,  message:"Failed to create a movie"});
            }

            res.json({ message: 'Movie created!' });
        });
    });

router.route('/:movieId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.movieId;
        var reviewOption = req.headers.reviews;
        Movie.findById(id, function (err, movie) {
            if (err) res.send(err);

            // var movieJson = JSON.stringify(movie);
            // return that user
            if(reviewOption === "true"){
                Movie.aggregate([{
                    $lookup: {
                        from: "reviews",
                        localField: "title",
                        foreignField: "movieTitle",
                        as: 'review'
                    }
                },

                    {
                        $match:{ title: movie.title }
                    }

                ], function (err, result) {
                    if(err) res.send(err);
                    else res.json(result);
                });
            } else {
                res.json(movie);
            }
        });

    })

router.route('/reviews/:title')
    .get(authJwtController.isAuthenticated, function (req, res) {
        if (req.query.reviews === 'true')
        {
            var title = req.params.title;
            Movie.aggregate([
                {
                    $match: {
                        Title: movieTitle
                    }
                },
                {
                    $lookup:
                        {
                            from: 'reviews',
                            localField: 'title',
                            foreignField: 'movieTitle',
                            as: 'reviews'
                        }
                }

            ]).exec((err, movie)=>{
                if (err) res.json({message: 'Failed to get review'});
                res.json(movie);
            });
        }
        else
        {
            res.json({message: 'Please send a response with the query parameter true'});
        }


        Movie.findOne({Title: req.params.title}).exec(function(err, movie1) {
            if (err) res.send(err);

            //var userJson = JSON.stringify(movie);
            // return that user
            if (movie1 !== null){
                res.json(movie1);
            }
            else{
                res.json({ message: 'Movie is not found' });
            }

        });
    });

router.route('/reviews').post(authJwtController.isAuthenticated, function (req, res) {
    Movie.findOne({Title: req.body.MovieTitle}).exec(function (err, movie) {
        if (err) res.send(err);
        // if the movie with reviews already exists, then just add new Reviews
        if (movie !== null) {
            var newReview = new Review();
            newReview.MovieTitle = req.body.MovieTitle;
            newReview.ReviewerName = req.body.ReviewerName;
            newReview.Quote = req.body.Quote;
            newReview.Rating = req.body.Rating;
            newReview.save(function (err) {
                if (err) {
                    return res.send({success: false, message: "Failed to create a review"});
                }
                res.json({message: 'Review created!'});
            });
        }
        else
        {
            res.json({message: 'Movie with the title not found'});
        }
    });
});
router.route('/reviews')
    .get(authJwtController.isAuthenticated, function (req, res) {
        if (req.query.reviews === 'true')
        {
            Movie.aggregate([
                {
                    $lookup:
                        {
                            from: 'reviews',
                            localField: 'Title',
                            foreignField: 'MovieTitle',
                            as: 'Reviews'
                        }
                }
            ]).exec((err, movie)=>{
                if (err) res.json({message: 'Failed to get reviews'});
                res.json(movie);
            });
        }
        else
        {
            res.json({message: 'Please send a response with the query parameter true'});
        }
    });

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
            }
        });


    });
});

app.use('/', router);
app.listen(process.env.PORT || 8080);