const natural = require('natural');
const nlp = require('compromise');

// TODO Maninpulate input in someway
exports.tokenizeFormInput = input => new Promise((resolve, reject) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(input);
  console.log(tokens);
  return resolve(input);
  // return resolve(tokens[0]);
});

/* Section 1 Word Count */
// Ineffciently Count words and count various things
exports.countWordTypes = twitter => new Promise((resolve, reject) => {
  try {
    // split up all the words and filter out non-words
    const tokenizer = new natural.WordTokenizer();
    let loweredTwitter = twitter.map(obj => tokenizer.tokenize(obj.full_text.toLowerCase()).filter(x => /^[a-z]+$/i.test(x)));
    loweredTwitter = loweredTwitter.reduce(
      (accumulator, currentValue) => accumulator.concat(currentValue), [],
    );
    /* Section 4 english percent */
    // Count the percent of tokens that are in the english words txt file.
    const fs = require('fs');
    const textData = fs.readFileSync('routes/words.txt', 'utf8');
    const englishWords = loweredTwitter.filter(x => textData.includes(x));
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

    /* Section 1 Word Count end */

    /* Section 2 Count nouns and verbs */


    // /^[a-z]+$/i
    const joinedWords = englishWords.join(' ');
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


    // Create HTML TODO move this to the client or to ejs to handle
    const percentHtml = `<h1>Percent of english words:${(englishWords.length * 100) / loweredTwitter.length}%</h1>`;
    // Or create a different page for errors or for succesful data retrieval
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

    let wordTypeHtml = '';
    wordTypeHtml += `<h3>Word type for: ${wordType.normal}</h3>`;
    // wordTypeHtml += `<h3>Word type for: ${obj.colour}</h3>`;
    wordTypeHtml += '<ul>';
    wordTypeHtml += `<li>Nouns:     ${wordType.nouns.count} Words:${wordType.nouns.list}</li>`;
    wordTypeHtml += `<li>Verbs:     ${wordType.verbs.count} Words:${wordType.verbs.list}</li>`;
    wordTypeHtml += `<li>Adjectives:${wordType.adjectives.count} Words:${wordType.adjectives.list}</li>`;
    wordTypeHtml += `<li>Adverbs:   ${wordType.adverbs.count} Words:${wordType.adverbs.list}</li>`;
    wordTypeHtml += '</ul>';
    /* END Section 2 Count nouns and verbs */


    return resolve({
      // Always refresh the total wordCount & percent, add to Wordtype
      twitter, wordType, countedWords, wordCountHtml, percentHtml, wordTypeHtml,
    });
  } catch (err) {
    console.log(err);
    return reject(new Error(`Error parsing text ${err}`));
  }
});
