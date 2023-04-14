module.exports = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must be signed in first!');
        return res.redirect('/login');
      }
      next();
}
module.exports.isReviewOwner = async(req,res,next)=>{
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if(!review.owner.equals (req.user._id)){
    req.flash('error','Not authorized to do that!');
    return res.redirect(`/bookList/${id}`);
    }
    next();
}

