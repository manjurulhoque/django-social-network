let csrfmiddlewaretoken = document.getElementsByName("csrfmiddlewaretoken")[0].value;
$('.notification-icon .add-friend').click(function () {

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
            if (res.status) {
                toastr.success('Friend request sent');
            } else {
                toastr.info(res.message || 'Something went wrong');
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
});

function accept(element) {
    $.ajaxSetup({
        headers: {
            'X-CSRFToken': csrfmiddlewaretoken
        }
    });

    let friend = $(element).data('friend');

    let url = `/accept-request/${friend}`;

    $.ajax({
        type: 'POST',
        url: url,
        dataType: 'json',
        success: function (res) {
            if (res.status) {
                toastr.success(res.message);
            }
        },
        error: function (err) {
            toastr.warning(err);
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
    // friendRequestNotificationSocket.send(JSON.stringify({'command': 'fetch_friend_requests'}));
}

function createNotification(notification) {
    let single = `<li>
                        <div class="container">
                            <div class="row">
                                <div class="col-md-3">
<!--                                    <img src="img/avatar55-sm.jpg" alt="author">-->
                                    <img src="static/img/bg-birthdays.jpg" class="author-img" alt="author" style="height: 45px">
                                </div>
                                <div class="col-md-9">
                                    <a href="#" class="h6 notification-friend">${notification.from_user.first_name} ${notification.from_user.last_name}</a>
                                </div>
                            </div>
                        </div>
                        <br>
                        <button class="btn btn-sm btn-success" onclick="accept(this)" data-friend="${notification.from_user.username}">
                            Accept
                        </button>
                        <button class="btn btn-sm btn-danger">
                            Reject
                        </button>
                    </li>`;
    $('#friend-requests').prepend(single);
}

friendRequestNotificationSocket.onmessage = function (event) {
    let data = JSON.parse(event.data);
    if (data['command'] === "all_friend_requests") {
        let notifications = data['friend_requests'];
        $('#total-friend-requests').text(notifications.length);
        for (let i = 0; i < notifications.length; i++) {
            createNotification(notifications[i]);
        }
    } else if (data['command'] === 'new_friend_request') {
        let notification = $('#total-friend-requests');
        notification.text(parseInt(notification.text()) + 1);
        createNotification(data['notification']);
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
    let single = `
                <li>
                    <div class="author-thumb">
<!--                        <img src="img/avatar62-sm.jpg" alt="author">-->
                    </div>
                    <div class="notification-event">
                        <div><a href="#" class="h6 notification-friend">${notification.actor.username}</a> ${notification.description} <a href="#" class="notification-link">profile status</a>.</div>
                        <span class="notification-date"><time class="entry-date updated" datetime="2004-07-24T18:18">4 hours ago</time></span>
                    </div>
                    <span class="notification-icon">
                        <svg class="olymp-comments-post-icon"><use xlink:href="#olymp-comments-post-icon"></use></svg>
                    </span>
                        
                    <div class="more">
                        <svg class="olymp-three-dots-icon"><use xlink:href="#olymp-three-dots-icon"></use></svg>
                        <svg class="olymp-little-delete"><use xlink:href="#olymp-little-delete"></use></svg>
                    </div>
                </li>`;
    $('#like-comment-menu').prepend(single);
}

likeCommentNotificationSocket.onopen = function (e) {
    fetchNotifications();
};

likeCommentNotificationSocket.onmessage = function (event) {
    let data = JSON.parse(event.data);
    if (data['command'] === 'notifications') {
        let unread_notifications = data['unread_notifications'];
        $('#notification-count').text(unread_notifications);
        let notifications = data['notifications'];
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
            if (res.status === true) {
            }

        },
        error: function (err) {
            console.log(err);
        }
    });
});
