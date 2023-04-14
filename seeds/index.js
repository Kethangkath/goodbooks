const mongoose = require('mongoose');
const data = require('./random_data')
const bookLists = require('../models/books');
const books = require('../models/books');


mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/booklist', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Database Connected")
    })
    .catch(err => {
        console.log("DB Connection Failure")
        console.log(err)
    })

const sample = array=>{array[Math.floor(Math.random() * array.length)]}

const seedDB = async () => {
    await books.deleteMany({});
    for (let i = 0; i <= 50; i++) {
      const randomIndex = Math.floor(Math.random() * data.length);
      const book = new books({
        owner: '64196d8cf78522cf2888e9ee',
        title: data[randomIndex].title,
        author: data[randomIndex].author,
        
        price: data[randomIndex].price,
        image: 'https://source.unsplash.com/random/350x250/?books',
        description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Libero sunt distinctio quasi ullam ipsam alias fugiat, corrupti eum maxime omnis aut, vero sapiente unde in provident neque nulla deleniti minima.'
      });
      await book.save();
    }
  };
  seedDB().then(() => {
    mongoose.connection.close();
})
  


