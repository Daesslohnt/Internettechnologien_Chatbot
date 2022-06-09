
var socket = new WebSocket('ws://localhost:8181/', 'chat');
var name = 'u1'
socket.onopen = function () {

    name = "name" + Math.floor(Math.random() * Math.floor(1000));

    socket.send('{"type": "join", "name":" ' + name + '"}');
}
$('.chat-input').submit(function (e) {
    e.preventDefault()
    appendOwnMessage()

    msg = $('.chat-input input').val();
    //console.log(msg);
    socket.send('{"type": "msg", "msg": "' + msg + '"}');
    $('.chat-input input').val('');  
});

socket.onmessage = function (msg) {
    var data = JSON.parse(msg.data)
    switch (data.type) {
        case 'msg':
            appendOtherMessage(data)
            
            /*
            $('<div>' + data.name + ': ' + data.msg +
                '</div>');
            */
            break;
        case 'join':
            $('#users').empty();
            for (var i = 0; i < data.names.length; i++) {
                var user = $('<div>' + data.names[i] + '</div>');
                $('#users').append(user);
            }
            break; 
    }
};

function appendOtherMessage(data) {
    let msg
    if (data.name.trim() === name){
        
    }  else {
        msg = '<article class="msg-container msg-remote" id="msg-0"><div class="msg-box">' +
        '<img class="user-img" id="user-0" src="/media/MegaBot.jpg" />' +
        '<div class="flr"> <div class="messages"> <p class="msg" id="msg-0">' +
        data.msg +
        '</p> </div><span class="timestamp"><span class="username">' +
        data.name +
        '</span></span></div> </div> </article>'
    }
    

    $('.chat-window').append(msg);


}

function appendOwnMessage() {
    const msg =
        '<article class="msg-container msg-self" id="msg-0">' +
        '<div class="msg-box"><div class="flr"><div class="messages">' +
        '<p class="msg" id="msg-1">' + $('.chat-input input').val() + '</p></div><span class="timestamp"><span class="username">' +
        name + '</span></div><img class="user-img" id="user-0"' +
        'src="/media/userimg.jpg" /></div></article>'

    $('.chat-window').append(msg)
}


