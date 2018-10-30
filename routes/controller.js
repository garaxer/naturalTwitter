const twittera = require('./twitter');
const natural = require('./natural');
const bucket = require('./buckets');

const axios = require('axios');

function appController(nav) {
  // Actions performed when making a get request to index
  function getIndex(req, res) {
    res.render('index', {
      title: nav.title,

    });
  }

  function getTweets(req, res) {
    const { count, term } = req.params; // add default later
    const search = term.split('_').join(' ');
    console.log(count);
    console.log(term);
    console.log(search);


    function filterResults(response) {
      // Here split it up
      // console.log(response);
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
    const params = {
      q: search,
      lang: 'en',
      count,
      tweet_mode: 'extended',
    };
    twittera.getUserTweet(params)
      .then(response => filterResults(response))
      .then(tweets => bucket.addToNewNew(tweets, search))
      .then(dbresponse => res.json(dbresponse))
      .catch((err) => {
        console.log(err);
        // res.json({ error: `error with data e:${err}` });
        res.render('index', {
          title: nav.title,
          err,
        });
      });
  }

  // Actions performed when posting to index
  function getIndexPost(req, res) {
    console.log(req.path);
    console.log(req.host);

    let retrieve = false;
    if (req.path === '/retrieve') {
      console.log('flag set');
      retrieve = true;
    }
    // Check form input
    if (!req.body.filter || req.body.filter.length < 1) {
      // res.json({ error: 'forms are empty' });
      res.render('index', { title: nav.title, err: 'Please enter something' });
    }
    const { filter, count } = req.body;

    // Filter the raw tweets and pass back what is needed for this scenario

    // If the user searches, call tweets add to database then on success call it
    // TODO change this to async await
    // Tokenize user input to maximize search results TODO
    let input; // side effect // could use nested promise instead
    natural.tokenizeFormInput(filter)
      // Get the tweets
      .then((filtered) => {
        input = filtered;
        if (retrieve) {
          console.log('flag set');
          return input;
        }
        const search = filtered.split(' ').join('_');
        return axios.get(`http://localhost:3000/twitter/${count}/${search}`);
      })
      // Filter the Twitter results down to what's needed
      .then(terms => ((retrieve || terms.data.success) ? bucket.getTweets(input) : new Error('no tweets')))
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
        // console.log(resultsa);
        const results = {
          tweets: resultsa[0],
          allSentiment: resultsa[1],
          wordCountHtml: resultsa[2].wordCountHtml,
          percentEnglish: resultsa[2].percentEnglish,
          wordType: resultsa[3],
        };
        // console.log(results.twitter);
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
          err,
        });
      });
  }

  function getRetrieve(req, res) {
    res.render('index', {
      title: nav.title,

    });
  }

  return {
    getIndex,
    getIndexPost,
    getRetrieve,
    getTweets,
  };
}

module.exports = appController;
