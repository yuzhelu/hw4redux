var mongoose = require ('mongoose');
var Schema = mongoose.Schema;
/*
var reviewSchema = Schema({
    MovieTitle:{type: String, required: true},
    ReviewerName:{type:String, required: true},
    Quote:{type:String, required: true},
    Rating:{type:Number, max:5, min:1, required: true}
});
*/
var ReviewSchema = new Schema(
    {
        username: {type: String, required: true},
        review: {type: String, required: true},
        rating: {type: Number, required: true},
        movie: {type: String, required: true}
    }
);

ReviewSchema.pre('save',function (next) {
    if(this.rating > 5 || this.rating < 1){
        return next(new Error('Rating must be a number from 1 to 5.'));
    }
    next()
});

// return the model
module.exports = mongoose.model('Review', ReviewSchema);