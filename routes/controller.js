const twittera = require('./twitter');

function appController(nav) {
  function getIndex(req, res) {
    res.render('index', {
      title: nav.title,
      results: 'submit',
    });
  }

  function asyncTest(req, res) {
    function sleep(millis) {
      return new Promise(resolve => setTimeout(resolve, millis));
    }
    async function main() {
      console.log('Foo');
      await sleep(2000);
      res.render('index', {
        title: nav.title,
        results: 'fake',
      });
    }
    main();
  }

  function getIndexPost(req, res) {
    if (!req.body.filter || req.body.filter.length < 1) {
      res.render('index', { title: nav.title, results: 'Error on submision', err: 'Please enter something' });
    }
    const { filter } = req.body;
    const params = {
      q: filter, // Hashtag
      count: 2,
    };

    twittera.getUserTweet(params)
      .then((results) => {
        res.render('index', {
          title: nav.title,
          results: JSON.stringify(results),
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return {
    getIndex,
    getIndexPost,
  };
}

module.exports = appController;
