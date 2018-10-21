$('.submit').click(function () {
  $('.dimmer').addClass('active');
});



function sendFormContent() {
  let form = $('#searchEntry');
  let query = form.serialize();
  console.log(query);
  $.post('/', query, function (data) {
    //TO DO check if error or load a different page without this js or somthign
    if (data.twitter) {
      readMsg(data);
    } else {
      console.log(data);
      $('.dimmer').removeClass('active');
    }
  });
}

function readMsg(data) {
  console.log(data);
  $('#results').prepend(JSON.stringify(data));
  $('.dimmer').removeClass('active');
}