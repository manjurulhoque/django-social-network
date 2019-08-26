$('.nearby-contct .add-friend').click(function () {

    let csrfmiddlewaretoken = document.getElementsByName("csrfmiddlewaretoken")[0].value;

    $.ajaxSetup({
        headers: {
            'X-CSRFToken': csrfmiddlewaretoken
        }
    });

    $(this).text('Request Sent');

    let url = $(this).data('url');

    $.ajax({
        type: 'POST',
        url: url,
        dataType: 'json',
        success: function (res) {
            if (res.status === false) {
            }
            if (res.status === true) {
                $('.add-friend').text('Request Sent');
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
});

function addNewNotification(notification) {
    const template = `<a class="dropdown-item text-success" href="#">${notification.body}</a>`;
    $('#messages').prepend(template);
}

let friendRequestNotificationSocket = new ReconnectingWebSocket(
    'ws://' + window.location.host +
    '/ws/friend-request-notification/');
friendRequestNotificationSocket.onopen = function (e) {
    fetchFriendRequests();
};

function fetchFriendRequests() {
    friendRequestNotificationSocket.send(JSON.stringify({'command': 'fetch_friend_notifications'}));
}

function createNotification(notification) {
    console.log(notification);

    let single = `<li>
                       <a href="#" title="">
                            <img src="images/resources/thumb-1.jpg" alt="">
                            <div class="mesg-meta">
                                <h6></h6>
                                <span>${notification}</span>
                                <i>2 min ago</i>
                            </div>
                       </a>
                       <span class="tag green">New</span>
                   </li>`;
    document.querySelector('#friend-menu').prepend(single);
}

friendRequestNotificationSocket.onmessage = function (event) {
    let data = JSON.parse(event.data);
    if (data['command'] === 'notifications') {
        let notifications = JSON.parse(data['notifications']);
        for (let i = 0; i < notifications.length; i++) {
            createNotification(notifications[i].fields);
        }
    } else if (data['command'] === 'new_message') {
        createNotification(data['message']);
    }
};

