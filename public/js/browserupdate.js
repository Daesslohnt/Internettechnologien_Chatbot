
$('.chat-input').submit(function (e) {
    e.preventDefault();
    response =
    '<article class="msg-container msg-self" id="msg-0">' +
    '<div class="msg-box"><div class="flr"><div class="messages">' +
    '<p class="msg" id="msg-1">' + $('.chat-input input').val() + '</p></div><span class="timestamp"><span class="username">' +
    $('.chat-input').val() + '</span></div><img class="user-img" id="user-0"' +
    'src="//gravatar.com/avatar/56234674574535734573000000000001?d=retro" /></div></article>'


    $('.chat-window').append(response)

    $('.chat-input').val('');
});
