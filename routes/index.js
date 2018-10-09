const express = require('express');

const indexRouter = express.Router();

/* GET home page. */
function router(nav) {
  indexRouter.get('/', (req, res, next) => {
    res.render('index', {
      title: nav.title,
    });
  });

  return indexRouter;
}

module.exports = router;
