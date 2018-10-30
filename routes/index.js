const express = require('express');

const controller = require('./controller');

const indexRouter = express.Router();


function router(nav) {
  // Revealing module pattern, refactored to simply move code away
  const { getIndex, getIndexPost, getTweets } = controller(nav);
  /* GET home page. */
  indexRouter.route('/').get(getIndex);
  /* POST home page. */
  indexRouter.route('/').post(getIndexPost);

  indexRouter.route('/twitter/:count/:term').get(getTweets);

  indexRouter.route('/retrieve').post(getIndexPost);

  return indexRouter;
}

module.exports = router;
