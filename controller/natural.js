const natural = require('natural');
const nlp = require('compromise');
const Sentiment = require('sentiment');
const fs = require('fs');

// normalize the input of the user
exports.tokenizeFormInput = input => new Promise((resolve, reject) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(input.toLowerCase());
  console.log(tokens.join(' '));
  return resolve(tokens.join(' '));
  // return resolve(tokens[0]);
});

// split up all the words and filter out non-words
exports.formatResults = twitter => new Promise((resolve, reject) => {
  try {
    const tokenizer = new natural.WordTokenizer();
    let tweets = twitter.map(obj => tokenizer.tokenize(obj.full_text.toLowerCase()).filter(x => /^[a-z]+$/i.test(x)).filter(x => !/^https/i.test(x)));
    tweets = tweets.reduce(
      (accumulator, currentValue) => accumulator.concat(currentValue), [],
    );
    tweets = tweets.filter(x => !/^t$|^rt$|^co$|^https$/i.test(x));
    return resolve({ twitter, tweets });
  } catch (err) {
    console.log(err);
    return reject(new Error(`Error getting results ${err}`));
  }
});

// Attach a sentiment to each tweet
exports.attachSentiments = twitter => new Promise((resolve, reject) => {
  try {
    const sentiment = new Sentiment();
    const tweets = twitter.map(obj => ({
      // Remove Url
      full_text: obj.full_text.split(/\s+/).filter(x => !/^https|#/i.test(x)).join(' '),
      name: obj.user.name,
      sentiment: sentiment.analyze(obj.full_text),
      url: obj.full_text.split(/\s+/).filter(x => /^https/i.test(x)).join(' '),
      hashtags: obj.full_text.split(/\s+/).filter(x => /^#/.test(x)).join(' '),
    }));
    return resolve(tweets);
  } catch (err) {
    console.log(err);
    return reject(new Error(`Error getting sentiments2 ${err}`));
  }
});

// get the global sentiment for the search type
exports.getSentiments = tweets => new Promise((resolve, reject) => {
  try {
    const sentiment = new Sentiment();
    return resolve(sentiment.analyze(tweets.join(' ')));
  } catch (err) {
    console.log(err);
    return reject(new Error(`Error getting sentiments ${err}`));
  }
});

// get the number of words sorted by amount
exports.getCount = twitter => new Promise((resolve, reject) => {
  try {
    const textData = fs.readFileSync('routes/words.txt', 'utf8');
    const englishWords = twitter.filter(x => textData.includes(x));
    const percentEnglish = englishWords.length * 100 / twitter.length;
    /* Section 4 english percent end */
    // Count words
    let countedWords = englishWords.reduce((allNames, name) => {
      if (name in allNames) {
        allNames[name] += 1;
      } else {
        allNames[name] = 1;
      }
      return allNames;
    }, {});
    // Get a more object like countwords
    let words = [];
    for (var word in countedWords) {
      words.push({
        word: word,
        count: countedWords[word],
      })
    }
    countedWords = words.sort((a, b) => b.count - a.count);

    let wordCountHtml = '';
    countedWords.forEach((obj) => {
      const size = 15 + obj.count / countedWords.length * 150;
      let colour = String(0.8 * obj.count / countedWords.length * 256 ** 3);
      [colour] = colour.split('.');
      while (colour.length < 6) {
        colour = `0${colour}`;
      }
      wordCountHtml += `<span id="Span-${obj.count}" style="font-size:${size}px; color: #${colour}"> ${obj.word}</span> `;
    });

    return resolve({ wordCountHtml, percentEnglish, countedWords });
  } catch (err) {
    console.log(err);
    return reject(new Error(`Error getting count ${err}`));
  }
});


// Ineffciently Count words type and count various things
exports.countWordTypes = twitter => new Promise((resolve, reject) => {
  try {
    // /^[a-z]+$/i
    const joinedWords = twitter.join(' ');
    const wordType = {
      normal: nlp(joinedWords).normalize().out(),
      colour: nlp(joinedWords).normalize().out('color'),
      sort: nlp(joinedWords).sort('frequency').out(),
      html: nlp(joinedWords).normalize().out('html'),
      nouns: {
        list: nlp(joinedWords).match('#Noun').out('array'),
        count: nlp(joinedWords).match('#Noun').out('array').length,
      },
      verbs: {
        list: nlp(joinedWords).match('#Verb').out('array'),
        count: nlp(joinedWords).match('#Verb').out('array').length,
      },
      adjectives: {
        list: nlp(joinedWords).match('#Adjective').out('array'),
        count: nlp(joinedWords).match('#Adjective').out('array').length,
      },
      adverbs: {
        list: nlp(joinedWords).match('#Adverb').out('array'),
        count: nlp(joinedWords).match('#Adverb').out('array').length,
      },
    };
    return resolve(wordType);
  } catch (err) {
    console.log(err);
    return reject(new Error(`Error getting wordtype ${err}`));
  }
});
