$(function () {
    $('.post-add-icon').on('click', function () {
        let url = $(this).data('url');
        $(this).attr("disabled", true);
        let that = this;
        $.ajax({
            url,
            dataType: 'json',
            success: function (res) {
                $(that).attr("disabled", false);
                if (res.success) {
                    if (res.type === 'remove') {
                        $(that).css({'fill': '#c2c5d9', 'color': '#c2c5d9'});
                    } else if (res.type === 'add') {
                        $(that).css({'fill': '#ff5e3a', 'color': '#ff5e3a'});
                    }

                    $(that).find('span').text(res.total);
                } else {
                    $(that).removeClass('active-like');
                    if (res.total) {
                        $(that).find('span').text(res.total);
                    }
                }
                $("body").trigger("click");
                // alert(res.message);
            }
        });
    })
});