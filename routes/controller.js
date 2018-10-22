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

  function getTest(req, res) {
    natural.countWordTypes('Gary building knees body mouse keyboards people i Luckly few')
      .then((results) => {
        res.render('index', {
          title: nav.title,
          results,
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

  // Actions performed when posting to index
  function getIndexPost(req, res) {
    // Check form input
    if (!req.body.filter || req.body.filter.length < 1) {
      res.json({ error: 'forms are empty' });
      // res.render('index', { title: nav.title, results: 'Error on submision', err: 'Please enter something' });
    }
    const { filter } = req.body;

    // Filter the raw results and pass back what is needed for this scenario
    function filterResults(response) {
      if (response.statuses.length === 0) {
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
          count: 6,
          tweet_mode: 'extended',
        };

        return twittera.getUserTweet(params);
      })
      // Filter the Twitter results down to what's needed
      .then(response => filterResults(response))
      // use the results to gather statistic and perform sentiment analysis
      .then(results => natural.countWordTypes(results))
      // return the tweets and the data
      .then((results) => {
        console.log(results.twitter);
        // res.json({ error: ('error with data e:') });
        res.json(results);
        /* res.render('index', {
          title: nav.title,
          results: JSON.stringify(results.twitter),
        }); */
      })
      .catch((err) => {
        console.log(err);
        res.json({ error: `error with data e:${err}` });
        /* res.render('index', {
          title: nav.title,
          results: err,
          err: 'Something went wrong processing the tweets',
        }); */
      });
  }

  return {
    getIndex,
    getIndexPost,
    getTest,
  };
}

module.exports = appController;
