const express = require('express');

const controller = require('./controller');

const indexRouter = express.Router();


function router(nav) {
  // Revealing module pattern, refactored to simply move code away
  const { getIndex, getIndexPost, getTest } = controller(nav);
  /* GET home page. */
  indexRouter.route('/').get(getIndex);
  /* POST home page. */
  indexRouter.route('/').post(getIndexPost);

  indexRouter.route('/test').get(getTest);

  return indexRouter;
}

module.exports = router;
