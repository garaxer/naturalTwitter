const express = require('express');

const controller = require('./controller');

const indexRouter = express.Router();


function router(nav) {
  const { getIndex, getIndexPost } = controller(nav);
  /* GET home page. */
  indexRouter.route('/').get(getIndex);
  /* POST home page. */
  indexRouter.route('/').post(getIndexPost);

  return indexRouter;
}

module.exports = router;
