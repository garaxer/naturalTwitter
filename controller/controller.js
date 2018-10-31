const twittera = require('./twitter');
const natural = require('./natural');
const bucket = require('./buckets');

function appController(nav) {
  // Actions performed when making a get request to index
  function getIndex(req, res) {
    res.render('index', {
      title: nav.title,
    });
  }

  // Actions performed when posting to index
  function getIndexPost(req, res) {
    console.log(req.path);
    let retrieve = false;
    if (req.path === '/retrieve') {
      console.log('GETTING DATABASE');
      retrieve = true;
    }
    // Check form input
    if (!req.body.filter || req.body.filter.length < 1) {
      res.render('index', { title: nav.title, err: 'Please enter something' });
    }
    const { filter, count } = req.body;

    // Filter the raw tweets and pass back what is needed for this scenario
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
    // If the user searches, call tweets add to database then on success call it
    // TODO change this to async await
    let input; // side effect // could use nested promise instead
    natural.tokenizeFormInput(filter)
      // Get the tweets
      .then((filtered) => {
        input = filtered;
        const params = {
          q: filtered, 
          lang: 'en',
          count,
          tweet_mode: 'extended',
        };
        if (retrieve) { return bucket.getTweets(input); }
        return twittera.getUserTweet(params);
      })
      // Filter the Twitter results down to what's needed
      .then(response => (retrieve ? response : filterResults(response)))
      // Persistance
      .then(response => (retrieve ? response : bucket.addToNew(response, input)))
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
        const results = {
          tweets: resultsa[0],
          allSentiment: resultsa[1],
          wordCountHtml: resultsa[2].wordCountHtml,
          percentEnglish: resultsa[2].percentEnglish,
          wordType: resultsa[3],
        };
        res.render('index', {
          title: nav.title,
          results,
        });
      })
      .catch((err) => {
        console.log(err);
        res.render('index', {
          title: nav.title,
          err,
        });
      });
  }

  return {
    getIndex,
    getIndexPost,
  };
}

module.exports = appController;
