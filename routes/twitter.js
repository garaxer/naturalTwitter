const axios = require('axios');
const Twitter = require('twitter');
const auth = require('../auth.json');


const client = new Twitter({
  consumer_key: auth.consumer_key,
  consumer_secret: auth.consumer_secret,
  access_token_key: auth.access_token,
  access_token_secret: auth.access_token_secret,
});
exports.getUserTweet = params => new Promise((resolve, reject) => {
  // This works too // client.get('https://api.twitter.com/1.1/search/tweets.json?q=Raining', (error, tweets, response) => {
  client.get('search/tweets', params, (error, tweets, response) => {
    if (error) { console.log(error); }
    console.log(tweets);
    return resolve(tweets);
  });
});
