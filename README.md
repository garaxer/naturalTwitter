# naturalTwitter
 A Cloud-based query processor based on Twitter messages.

npm install && npm start


ME TODO: 

Split up twitter, so a get to /tweets gets the  tweets and adds them to the DB then returns success, then we can retreive them or do whatever


have a seperate function to split the tweets up and filter out junk

get the stats in indivual functions and resolve on promise.all
Get persistence going for single session, try a global first like the prac
remove link from tweets or don't include it in data
doesn't work after second one
partner TODO:
Display words types in a bubble graph
https://github.com/chartjs/Chart.js
// Always refresh the total wordCount & percent, add to Wordtype


For developing
eslint use
$npm run eslint
nodemon use
$npm run winmon

TODO:\
// Create HTML TODO move this to the client or to ejs to handle
    // Or create a different page for errors or for succesful data retrieval


Display data, most users words  in word map.
Mix the data around so it's split by verb and noun etc.]
Have a word cloud that changes colour if the word is a noun etc. Keep em seperate.

Use Azure blob service


LEARN Dj3s

Twitter

For displaying tweets have another route like /tweets which gets the current tweets from the bucket like the chat app instead of passing them to the client
 instead of posting with the form use client side js to retrieve the post results which can just be JSOn like in the chat app example.

 npm install wordnet-db
  npm install compromise
maybe find two users and see which one uses more verbs or something. 