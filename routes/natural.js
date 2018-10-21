const natural = require('natural');
const nlp = require('compromise');


exports.tokenizeFormInput = input => new Promise((resolve, reject) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(input);
  console.log(tokens);
  return resolve(input);
  // return resolve(tokens[0]);
});

// Count the word types - temp
exports.countWordTypes = twitter => new Promise((resolve, reject) => {
  let doc = nlp(twitter[0].full_text).match('#Noun').out('array');
  // let nouns = doc.nouns().length();
  console.log(doc);
  return resolve({ twitter, doc });
});
