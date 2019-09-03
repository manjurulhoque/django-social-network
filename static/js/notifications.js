let csrfmiddlewaretoken = document.getElementsByName("csrfmiddlewaretoken")[0].value;
$('.nearby-contct .add-friend').click(function () {

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
                // $('.add-friend').text('Request Sent');
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
});

function accept(li) {
    $.ajaxSetup({
        headers: {
            'X-CSRFToken': csrfmiddlewaretoken
        }
    });

    let friend = $(li).data('friend');

    let url = `/accept-request/${friend}`;

    $.ajax({
        type: 'POST',
        url: url,
        dataType: 'json',
        success: function (res) {
            if (res.status === false) {
            }
            if (res.status === true) {

            }
        },
        error: function (err) {
            console.log(err);
        }
    });
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
    let single = `<li class="list">
                       <a href="#" title="">
                            <img src="images/resources/thumb-1.jpg" alt="">
                            <div class="mesg-meta">
                                <span>${notification.actor.username} ${notification.verb}</span>
                                <button class="btn btn-primary btn-sm accept-request" onclick="accept(this)" data-friend="${notification.actor.username}">Accept</button>
                                <button class="btn btn-danger btn-sm">Reject</button>
                                <br>
                                <i>2 min ago</i>
                            </div>
                       </a>
                   </li>`;
    $('#friend-menu').prepend(single);
}

friendRequestNotificationSocket.onmessage = function (event) {
    let data = JSON.parse(event.data);
    if (data['command'] === 'notifications') {
        let notifications = JSON.parse(data['notifications']);
        $('#total-friend-notifications').text(notifications.length);
        for (let i = 0; i < notifications.length; i++) {
            createNotification(notifications[i]);
        }
    } else if (data['command'] === 'new_notification') {
        let notification = $('#total-friend-notifications');
        notification.text(parseInt(notification.text() + 1));
        createNotification(JSON.parse(data['notification']));
    }
};


// like and comment notification
let likeCommentNotificationSocket = new ReconnectingWebSocket(
    'ws://' + window.location.host +
    '/ws/like-comment-notification/');


function fetchNotifications() {
    likeCommentNotificationSocket.send(JSON.stringify({'command': 'fetch_like_comment_notifications'}));
}

function createLikeCommentNotification(notification) {
    let single = `<li>
                        <a href="#" title="">
                            <img src="images/resources/thumb-1.jpg" alt="">
                            <div class="mesg-meta">
                                <span>${notification.actor.username} ${notification.verb}</span>
                                <i>2 min ago</i>
                            </div>
                        </a>
                    </li>`;
    $('#like-comment-menu').prepend(single);
}

likeCommentNotificationSocket.onopen = function (e) {
    fetchNotifications();
};

likeCommentNotificationSocket.onmessage = function (event) {
    let data = JSON.parse(event.data);
    if (data['command'] === 'notifications') {
        let notifications = JSON.parse(data['notifications']);
        $('#total-like-comment-notifications').text(notifications.length);
        for (let i = 0; i < notifications.length; i++) {
            createLikeCommentNotification(notifications[i]);
        }
    } else if (data['command'] === 'new_like_comment_notification') {
        let notification = $('#total-like-comment-notifications');
        notification.text(parseInt(notification.text()) + 1);
        createLikeCommentNotification(JSON.parse(data['notification']));
    }
};

$('#mark-like-comment-notifications-as-read').click(function () {

    let url = $(this).data('url');

    $.ajaxSetup({
        headers: {
            'X-CSRFToken': csrfmiddlewaretoken
        }
    });

    $.ajax({
        type: 'POST',
        url: url,
        dataType: 'json',
        success: function (res) {
            console.log(res);
            if (res.status === false) {
            }
            if (res.status === true) {}

        },
        error: function (err) {
            console.log(err);
        }
    });
});
