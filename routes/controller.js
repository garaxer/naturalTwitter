const twittera = require('./twitter');
const natural = require('./natural');

function appController(nav) {
  // Actions performed when making a get request to index
  function getIndex(req, res) {
    res.render('index', {
      title: nav.title,
      
    });
  }

  // Actions performed when posting to index
  function getIndexPost(req, res) {
    // Check form input
    if (!req.body.filter || req.body.filter.length < 1) {
      // res.json({ error: 'forms are empty' });
      res.render('index', { title: nav.title, err: 'Please enter something' });
    }
    const { filter } = req.body;

    // Filter the raw tweets and pass back what is needed for this scenario
    function filterResults(response) {
      // Here split it up
      console.log(response);
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
      // Remove any unwanted info from tweets and combine them all
      .then(response => natural.formatResults(response)) // returns tweets and combined tweets
      // use the results to gather statistics and perform sentiment analysis
      .then(results => Promise.all([
        natural.attachSentiments(results.twitter),
        natural.getSentiments(results.tweets),
        natural.getCount(results.tweets),
        natural.countWordTypes(results.tweets),
      ]))
      // return the tweets and the data
      .then((resultsa) => {
        console.log(resultsa);
        const results = {
          tweets: resultsa[0],
          allSentiment: resultsa[1],
          wordCountHtml: resultsa[2].wordCountHtml,
          percentEnglish: resultsa[2].percentEnglish,
          wordType: resultsa[3],
        };
        console.log(results.twitter);
        // res.json({ error: ('error with data e:') });
        // res.json(results);
        res.render('index', {
          title: nav.title,
          results,
        });
      })
      .catch((err) => {
        console.log(err);
        // res.json({ error: `error with data e:${err}` });
        res.render('index', {
          title: nav.title,
          results: err,
          err: 'Something went wrong processing the tweets',
        });
      });
  }

  return {
    getIndex,
    getIndexPost,
  };
}

module.exports = appController;
