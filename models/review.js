const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body:String,
    rating: Number,
    owner:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        immutable: true // disallows updates to the timestamp field
    }
}, {
    timestamps: true // adds createdAt and updatedAt fields
});

module.exports = mongoose.model("Review", reviewSchema);
 