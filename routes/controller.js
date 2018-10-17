const twittera = require('./twitter');
const natural = require('./natural');

function appController(nav) {
  // Actions performed when making a get request to index
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

  // Actions performed when posting to index
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

    // TODO change this to async await so we can call the statistics or do something at the same time.
    // Tokenize user input to maximize search results TODO
    natural.tokenizeFormInput(filter)
      // Get the tweets
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
      // Filter the Twitter results down to what's needed
      .then(response => filterResults(response))
      // use the results to gather statistic and perform sentiment analysis TODO
      .then(results => ({ twitter: results, statistic: 5 }))
      // Display the tweets TODO: Change this to just JSON so the client can fetch it
      .then((results) => {
        res.render('index', {
          title: nav.title,
          results: JSON.stringify(results.twitter),
        });
      })
      .catch((err) => {
        console.log(err);
        res.render('index', {
          title: nav.title,
          results: err,
          err: 'Something went wrong processing your request',
        });
      });
  }

  return {
    getIndex,
    getIndexPost,
  };
}

module.exports = appController;
