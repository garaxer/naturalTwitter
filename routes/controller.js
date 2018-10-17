const twittera = require('./twitter');
const natural = require('./natural');

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
    // Check form input
    if (!req.body.filter || req.body.filter.length < 1) {
      res.render('index', { title: nav.title, results: 'Error on submision', err: 'Please enter something' });
    }
    const { filter } = req.body;

    // Filter the raw results and pass back what is needed for this scenario
    function filterResults(response) {
      if (response.statuses.length === 0) {
        console.log('####Error' + 'yes');
        throw new Error('0 Statuses Found');
      }
      try {
        const reformattedArray = response.statuses.map(obj => ({
          full_text: obj.full_text,
          user: {
            name: obj.user.name,
          },
        }));
        return reformattedArray;
      } catch (error) {
        throw new Error(`Error Processing Twitter Results please try again. ${error}`);
      }
    }

    // edit params here then add to top of chain /(
    natural.tokenizeFormInput(filter)
      .then((filtered) => {
        const params = {
          q: filtered, // Hashtag
          lang: 'en',
          count: 2,
          tweet_mode: 'extended',
        };
        console.log(params);
        return twittera.getUserTweet(params);
      })
      .then(response => filterResults(response))
      .then((results) => {
        res.render('index', {
          title: nav.title,
          results: JSON.stringify(results),
        });
      })
      .catch((err) => {
        console.log(err);
        res.render('index', {
          title: nav.title,
          results: err,
        });
      });
  }

  return {
    getIndex,
    getIndexPost,
  };
}

module.exports = appController;
