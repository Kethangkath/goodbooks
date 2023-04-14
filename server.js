if(process.env.NODE_ENV!== "production"){
  require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bookLists = require('./models/books');
// const methodOverride = require('method-override');
// const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const Review = require('./models/review');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const router = express.Router;
const session = require('express-session');
const flash = require('connect-flash');
const User = require('./models/user');
const isLoggedIn = require('./middleware');
const fileUpload = require('express-fileupload');

const isReviewOwner  = require('./middleware');
const cloudinary = require('cloudinary').v2;


// app.use(fileUpload({
//   useTempFiles:true
// }))
// cloudinary.config({
//   cloud_name: 'dzqaofgdg',
//   api_key: '147122927871591',
//   api_secret: 'h_HdYl-nBCouA3UqDc2pp7aFFWU'
// });

// app.post('/bookList/new',(req,res,next)=>{
//   console.log(req.body);
//   const file = req.files.photo;//image?
//   cloudinary.uploader.upload(file.tempFilePath,(err,result)=>{
//     console.log(result);
//     const book = new books  ({
//       imagePath:result.url
//     });
//   })
// });

app.engine('ejs', ejsMate);

const port = process.env.PORT || 5000;
const path = require('path');
const books = require('./models/books');

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '/public')));

app.listen(port, () => {
  console.log(`Serving in port ${port}`);
});

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/booklist', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database Connected")
  })
  .catch(err => {
    console.log("DB Connection Failure")
    console.log(err)
  })
app.use(express.urlencoded({ extended: true }));

// app.use(methodOverride('_method'));

const sessionConfig = {
  secret: 'thisisasecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));
app.use(flash());



app.use(passport.initialize());
app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));//colts version=> login using username
passport.use(User.createStrategy());//login using email

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {

  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});



app.get('/register', (req, res) => {
  res.render('users/register');
});
app.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const regUser = await User.register(user, password);
    req.login(regUser,err=>{
      if(err) return next(err);
      req.flash('success', `Welcome to GoodBooks,  ${username}!`);
    res.redirect('/bookList');
     });}
     catch(e){
      req.flash('error',e.message);
      res.redirect('register');
     }  
});

app.get('/login', (req, res) => {
  res.render('users/login');
});
app.get('/users/login', function(req, res) {
  res.render('users/login');
});


//do not delete
// app.post('/login',passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}), async(req,res)=>{
//     const { email, username, password } = req.body;
//     const user = new User({ email, username });
//     req.flash('success', `Welcome back,  ${email}!`);
//     const redirectUrl = req.session.returnTo || '/bookList';
//     delete req.session.returnTo;
//     res.redirect(redirectUrl)
// });
//Do not delete 
app.post('/register', async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const user = new User({ email, username }); 
    const registeredUser = await User.register(user, password);
    req.flash('success', `Welcome to the site, ${username}!`);
    req.login(registeredUser, err => {
      if (err) return next(err);
      const redirectUrl = req.session.returnTo || '/bookList';
      delete req.session.returnTo;
      res.redirect(redirectUrl);
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/register');
  }
});


app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  req.flash('success', `Welcome back, ${user.username}!`  );
  const redirectUrl = req.session.returnTo || '/bookList';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
});

app.get('/logout',(req,res)=>{
  req.logout(function(err){
    if(err) { return next(err); }
    req.flash('success', 'Goodbye');
    res.redirect('/booklist');
  });
});

app.get('/', function (req, res) {//routing to home page
  res.render('home.ejs');
});

app.get('/bookList', async (req, res) => {//routing to home page
  const books = await bookLists.find({});
  res.render('bookList/index', { books });
});


app.get('/bookList/new', isLoggedIn, (req, res) => {
  res.render('bookList/newbook');
});


app.post('/bookList', isLoggedIn,async (req, res) => {
  const book = new books(req.body.books);
  book.owner = req.user._id;
  await book.save();
  req.flash('success', 'Successfully added a new book!');
  res.redirect(`/bookList/${book._id}`);
});

//bookList is used for routing, bookLists for await, while books is the variable name. 
//show-page-route
app.get('/bookList/:id', isLoggedIn,async (req, res) => {
  const books = await bookLists.findById(req.params.id).populate({
    path:'reviews',
    populate:{
      path:'owner'
    }
  }).populate('owner');
  console.log(books);
  if (!books) {
    req.flash('error', 'Book is unavailable');
    return res.redirect('/bookList');
  }
  res.render('bookList/show', { books });
});

//edit-page-route
app.get('/bookList/:id/edit', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const books = await bookLists.findById(id);
  if(!books){
    req.flash('error', 'Cannot find that book');
    return res.redirect('/bookList');
  }
  const bookAuth = await bookLists.findById(id);
  if(!bookAuth.owner.equals (req.user._id)){
    req.flash('error','Not authorized to do that!');
    return res.redirect(`/bookList/${id}`);
  }
  res.render('bookList/edit', { books });
});

app.delete('/bookList/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const bookAuth = await bookLists.findById(id);
  if(!bookAuth.owner.equals (req.user._id)){
    req.flash('error','Not authorized to do that!');
    return res.redirect(`/bookList/${id}`);
  }
  
  await bookLists.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted book')
  res.redirect('/bookList');
})
app.put('/bookList/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const bookAuth = await bookLists.findById(id);
  if(!bookAuth.owner.equals (req.user._id)){
    req.flash('error','Not authorized to do that!');
    return res.redirect(`/bookList/${id}`);
  }
  const book = await bookLists.findByIdAndUpdate(id, { ...req.body.books });
  req.flash('success', 'Book updated successfully');
  res.redirect(`/bookList/${book._id}`);
});

app.post('/bookList/:id/reviews', isLoggedIn,async (req, res) => {
  const book = await bookLists.findById(req.params.id);
  const review = new Review(req.body.review);
  review.owner = req.user._id;
  book.reviews.push(review);
  await review.save();
  await book.save();
  req.flash('success', 'Your review has been added');
  res.redirect(`/bookList/${book._id}`);
});

app.delete('/bookList/:id/reviews/:reviewId',isLoggedIn,isReviewOwner, async (req, res) => {
  const { id, reviewId } = req.params;
  await bookLists.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Review has been deleted');
  res.redirect(`/bookList/${id}`);
});


