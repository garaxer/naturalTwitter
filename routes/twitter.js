

const Twitter = require('twitter');
const auth = require('../auth.json');


const client = new Twitter({
  consumer_key: auth.consumer_key,
  consumer_secret: auth.consumer_secret,
  access_token_key: auth.access_token,
  access_token_secret: auth.access_token_secret,
});

function filterResults(response) {
  throw new Error(`Error Processing Twitter Results please try again. 111`);
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

exports.getUserTweet = params => new Promise((resolve, reject) => {
  // This works too // client.get('https://api.twitter.com/1.1/search/tweets.json?q=Raining', (error, tweets, response) => {
  client.get('search/tweets', params, (error, tweets, response) => {
    if (error) { console.log(error); return reject(error); }
    // console.log(tweets);
    try {
      tweets = filterResults(tweets)
      return resolve(tweets);
    } catch (err) {
      console.log('error');
      return reject(error);
    }
  });
});
