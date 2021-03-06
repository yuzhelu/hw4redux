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
var reviewSchema = new Schema
(
    {
        movieTitle:
            {
                type: String
            },
        reviewer:
            {
                type: String
            },
        rating:
            {
                type: Number,
                min: 1,
                max: 5
            },
        quote:
            {
                type: String

            }

    }
);

reviewSchema.pre('save', function(next){
    if(this.length== 0){
        return next(new Error('Error: Must be one reviewer'));
    }
    next()
});

module.exports = mongoose.model('Review', reviewSchema);
