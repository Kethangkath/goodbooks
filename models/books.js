const { string } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const booklistSchema =new Schema({
    image: String,
    title:String,
    price: String,
    description: String,
    author: String,
    
    // imagePath: {
    //     type: String,
    //     required: true
    //   },
    
    owner:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    reviews: [{ 
        type: Schema.Types.ObjectId,
        ref:'Review'
    }]
})

booklistSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.remove({
            _id:{
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('books',booklistSchema);