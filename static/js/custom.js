$(function () {
    if (document.getElementById("image-file")) {
        document.getElementById("image-file").addEventListener("change", function () {
            $('#total-images').html(this.files.length + ' files are selected');
            document.getElementsByClassName('icon-close')[0].click();
        });
    }

    // setup session cookie data. This is Django-related
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    let csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    // end session cookie data setup.

    // declare an empty array for potential uploaded files
    let fileItemList = []

    // auto-upload on file input change.
    $(document).on('submit', '#post-form', function (event) {
        event.preventDefault();
        let description = $("#description").val();
        if (description.length === 0) {
            alert("Description is required");
            return true;
        }

        $("#post-form :input").prop('readonly', true);
        $("#post-form :button").prop('disabled', true);
        let post_id = '';
        new Promise(function (resolve, reject) {
            $.ajax({
                method: "POST",
                data: {
                    description: description
                },
                url: "/api/posts/create/",
                success: function (data) {
                    post_id = data.id;
                    resolve();
                },
                error: function (data) {
                    alert("An error occurred, please try again later");
                    reject();
                }
            });
        }).then(() => {
            if (post_id) {
                var selectedFiles = $('#image-file').prop('files');
                if (selectedFiles.length > 0) {
                    for (let $i = 0; $i < selectedFiles.length; $i++) {
                        let item = selectedFiles[$i];
                        if (!['image', 'video'].includes(item['type'].split('/')[0])) {
                            alert("Only Image and video are valid to upload.");
                            $("#post-form :input").prop('readonly', false);
                            $("#post-form :button").prop('disabled', false);
                            return false;
                        }
                    }
                    // $.each(selectedFiles, function (index, item) {
                    //     if (!['image', 'video'].includes(item['type'].split('/')[0])) {
                    //         alert("Only Image and video are valid to upload.");
                    //         return false;
                    //     }
                    // });
                    $.each(selectedFiles, function (index, item) {
                        let myFile = item
                        if (myFile) {
                            uploadFile(myFile, post_id);
                        } else {
                            alert("Some files are invalid to upload.");
                        }
                    })
                } else {
                    alert("Post successfully created");
                    location.reload();
                }
            } else {
                alert("Something wrong. Please try again!")
                location.reload();
            }
        });
    });

    function constructFormPolicyData(policyData, fileItem) {
        var contentType = fileItem.type != '' ? fileItem.type : 'application/octet-stream'
        var url = policyData.url;
        var filename = policyData.filename;
        var repsonseUser = policyData.user;
        var keyPath = policyData.file_bucket_path;
        var fd = new FormData();
        fd.append('key', keyPath + filename);
        fd.append('acl', 'public-read');
        fd.append('Content-Type', contentType);
        fd.append("AWSAccessKeyId", policyData.key)
        fd.append('Policy', policyData.policy);
        fd.append('filename', filename);
        fd.append('Signature', policyData.signature);
        fd.append('file', fileItem);
        return fd
    }

    function fileUploadComplete(fileItem, policyData, post_id) {
        let data = {
            uploaded: true,
            fileSize: fileItem.size,
            mimeType: fileItem['type'],
            file: policyData.file_id,
            post_id: post_id,
            fileType: fileItem['type'].split('/')[0],
        }
        $.ajax({
            method: "POST",
            data: data,
            url: "/api/files/complete/",
            success: function (data) {
                displayItems(fileItemList);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("An error occurred, please refresh the page.")
            }
        })
    }

    function displayItems(fileItemList, fd) {
        let itemList = $('.item-loading-queue');
        itemList.html("")
        $.each(fileItemList, function (index, obj) {
            let item = obj.file
            let id_ = obj.id
            let order_ = obj.order
            let html_ = "<div class=\"progress\">" +
                "<div class=\"progress-bar\" role=\"progressbar\" style='width:" + item.progress + "%' aria-valuenow='" + item.progress + "' aria-valuemin=\"0\" aria-valuemax=\"100\"></div></div>"
            itemList.append("<div>" + order_ + ") " + item.name + "<a href='#' class='srvup-item-upload float-right' data-id='" + id_ + ")'></a> <br/>" + html_ + "</div><hr/>")
        })
    }

    let completed_list = [];

    function uploadFile(fileItem, post_id) {
        let policyData;
        let newLoadingItem;
        // get AWS upload policy for each file uploaded through the POST method
        // Remember we're creating an instance in the backend so using POST is
        // needed.
        $.ajax({
            method: "POST",
            data: {
                filename: fileItem.name,
            },
            url: "/api/files/policy/",
            success: function (data) {
                policyData = data
            },
            error: function (data) {
                alert("An error occurred, please try again later")
            }
        }).done(function () {
            // construct the needed data using the policy for AWS
            var fd = constructFormPolicyData(policyData, fileItem);

            // use XML http Request to Send to AWS.
            var xhr = new XMLHttpRequest()

            // construct callback for when uploading starts
            xhr.upload.onloadstart = function (event) {
                var inLoadingIndex = $.inArray(fileItem, fileItemList)
                if (inLoadingIndex == -1) {
                    // Item is not loading, add to inProgress queue
                    newLoadingItem = {
                        file: fileItem,
                        id: policyData.file_id,
                        order: fileItemList.length + 1
                    }
                    fileItemList.push(newLoadingItem)
                }
                fileItem.xhr = xhr
            }

            // Monitor upload progress and attach to fileItem.
            xhr.upload.addEventListener("progress", function (event) {
                if (event.lengthComputable) {
                    fileItem.progress = Math.round(event.loaded / event.total * 100);
                    // console.log(fileItem.progress);
                    displayItems(fileItemList, fd);
                }
            })

            xhr.upload.addEventListener("load", function (event) {
                // console.log("Complete");
                // handle FileItem Upload being complete.
                fileUploadComplete(fileItem, policyData, post_id);
                if (fileItem.progress === 100) {
                    completed_list.push(fileItem);
                    if (completed_list.length === fileItemList.length) {
                        alert("Post successfully created");
                        location.reload();
                    }
                }
            });

            xhr.open('POST', policyData.url, true);
            xhr.send(fd);
        })
    }

    $('.edit-post').on('click', function () {
        let post_id = $(this).data('post-id');
        if (post_id) {
            let post_description = $(this).data('post-description');
            let url = $(this).data('post-edit-url');
            let modal = $('#edit-widget-blog-post');
            modal.find('form').attr('action', url);
            $('#description-edit').val(post_description);
            modal.modal('show');
        } else {
            alert("Post not found");
        }
    });

    // $(".play-video").magnificPopup({
    //     disableOn: 700,
    //     type: "iframe",
    //     mainClass: "mfp-fade",
    //     removalDelay: 160,
    //     preloader: !1,
    //     fixedContentPos: !1
    // })

    $('.play-video').on('click', function () {
        let id = $(this).data('id');
        videojs(id);
    })
});
