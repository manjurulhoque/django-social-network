$("input[name='content']").keyup(function (event) {
    if (event.keyCode === 13) {
        $("#myButton").click();
    }
});