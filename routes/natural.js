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
  // Doing this in a very un-optimsed way, calling the function each time
  // to generate load
  try {
    const data = twitter.map(obj => ({
      normal: nlp(obj.full_text).normalize(),
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
    return resolve({ twitter, data });
  } catch (err) {
    console.log(err);
    return reject(new Error(`Error parsing text ${err}`));
  }
});
