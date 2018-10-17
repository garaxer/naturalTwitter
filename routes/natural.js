const natural = require('natural');

exports.tokenizeFormInput = input => new Promise((resolve, reject) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(input);
  console.log(tokens);
  return resolve(tokens[0]);
});
