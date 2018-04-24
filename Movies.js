var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// user schema

var actorSchema = Schema({
    actorName: {type:String,required: true},
    characterName: {type:String,required:true}
});

var movieSchema = Schema({
    title:{type: String, required: true, index: { unique: true }},
    yearReleased: {type: Number, required: true},
    genre:{
        type: String,
        enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
            'Horror', 'Mystery', 'Thriller', 'Western']
    },
    imageUrl:{type:String},
    actors: {type:[actorSchema]}
});

movieSchema.pre('save',function (next) {
    if(this.Actors.length < 3){
        return next(new Error('Fewer than 3 Actors'));
    }
    next()
});

module.exports = mongoose.model('Movie', movieSchema);