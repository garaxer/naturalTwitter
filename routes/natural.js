const natural = require('natural');
const nlp = require('compromise');


exports.tokenizeFormInput = input => new Promise((resolve, reject) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(input);
  console.log(tokens);
  return resolve(input);
  // return resolve(tokens[0]);
});

// TO DO COUNT THE WORDS Like in python example
// AND DISPLAY THEM AND MISMATCH THEM
// Count the word types - temp
exports.countWordTypes = twitter => new Promise((resolve, reject) => {
  // Grab the global word and count of each word
  // Create an array of only the tweets // Filter all none words
  const tokenizer = new natural.WordTokenizer();
  const loweredTwitter = twitter.map(obj => tokenizer.tokenize(obj.full_text.toLowerCase()).filter(x => /^[a-z]+$/i.test(x)));
  const flattened = loweredTwitter.reduce(
    (accumulator, currentValue) => accumulator.concat(currentValue),
    [],
  );
  // Count words
  // { 'Alice': 2, 'Bob': 1, 'Tiff': 1, 'Bruce': 1 }
  let countedWords = flattened.reduce((allNames, name) => {
    if (name in allNames) {
      allNames[name] += 1;
    } else {
      allNames[name] = 1;
    }
    return allNames;
  }, {});

  let words = [];
  for (var word in countedWords) {
    words.push({
      word: word,
      count: countedWords[word],
    })
  }

  countedWords = words.sort((a, b) => b.count - a.count);

  console.log(countedWords);
  // Doing this in a very un-optimsed way, calling the function each time
  // to generate load
  try {
    const data = twitter.map(obj => ({
      // /^[a-z]+$/i
      normal: nlp(obj.full_text).normalize().out(),
      nouns: {
        list: nlp(obj.full_text).match('#Noun').out('array'),
        count: nlp(obj.full_text).match('#Noun').out('array').length,
      },
      verbs: {
        list: nlp(obj.full_text).match('#Verb').out('array'),
        count: nlp(obj.full_text).match('#Verb').out('array').length,
      },
      adjectives: {
        list: nlp(obj.full_text).match('#Adjectives').out('array'),
        count: nlp(obj.full_text).match('#Adjectives').out('array').length,
      },
      adverbs: {
        list: nlp(obj.full_text).match('#Adverb').out('array'),
        count: nlp(obj.full_text).match('#Adverb').out('array').length,
      },

    }));
    // console.log(data);
    return resolve({ twitter, data, countedWords });
  } catch (err) {
    console.log(err);
    return reject(new Error(`Error parsing text ${err}`));
  }
});
