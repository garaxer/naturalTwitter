$('.submit').click(function () {
  $('.dimmer').addClass('active');
});
// Not in use
function sendFormContent() {
  let form = $('#searchEntry');
  let query = form.serialize();
  console.log(query);
  $.post('/tweets', query, function (data) {
    console.log(data);
    if (data.twitter) {
      readMsg(data);
    } else if (data.error) {
      readError(data.error);
    } else {
      //nothing returned
      $('.dimmer').removeClass('active');
    }
  });
}

// Not in use
function readMsg(data) {
  $('#words').html(data.wordCountHtml);
  console.log(data.wordType);
  $('#results').html(data.wordTypeHtml);
  $('#percent').html(data.percentHtml);
  $('#twitter').prepend(JSON.stringify(data.twitter));
  $('.dimmer').removeClass('active');
}

// Not in use
function readError(data) {
  $('form').addClass('error');
  $('#error').html(data);
  $('.dimmer').removeClass('active');
}