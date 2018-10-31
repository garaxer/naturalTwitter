const axios = require('axios');
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

  // Gets tweets and adds them to the database
  function getTweets(req, res) {
    const { count, term } = req.params; // add default later
    const search = term.split('_').join(' ');

    const params = {
      q: search,
      lang: 'en',
      count,
      tweet_mode: 'extended',
    };
    twittera.getUserTweet(params)
      .then((tweets) => {
        console.log(tweets);
        if (tweets instanceof Error) { throw tweets; }
        return bucket.addToNewNew(tweets, search)
      })
      .then((tweets) => {
        console.log(tweets);
        if (tweets instanceof Error) { throw tweets; }
        res.json(search);
      })
      .catch(err => res.json({ e: `error processing twitter results ${err}` }));
  }

  // Actions performed when posting to index
  function getIndexPost(req, res) {
    let retrieve = false;
    if (req.path === '/retrieve') {
      retrieve = true;
    }
    // Check form input
    if (!req.body.filter || req.body.filter.length < 1) {
      res.render('index', { title: nav.title, err: 'Please enter something' });
    }
    const { filter, count } = req.body;

    // Get input and search tweets
    // TODO change this to async await
    natural.tokenizeFormInput(filter)
      // Get the tweets
      .then((filtered) => {
        if (retrieve) { return filtered; }
        const search = filtered.split(' ').join('_');
        return axios.get(`${req.protocol}://${req.get('host')}${req.originalUrl}twitter/${count}/${search}`);
      })
      // Filter the Twitter results down to what's needed //if error
      .then((terms) => {
        if (terms.data.e) { throw terms.data.e; }
        console.log("#########");
        console.log(terms.data);
        return (terms.data) ? bucket.getTweets(terms.data) : bucket.getTweets(terms);
      })
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
        // res.json({ error: `error with data e:${err}` });
        res.render('index', {
          title: nav.title,
          err,
        });
      });
  }

  return {
    getIndex,
    getIndexPost,
    getTweets,
  };
}

module.exports = appController;
