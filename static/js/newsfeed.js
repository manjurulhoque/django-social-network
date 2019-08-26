$("input[name='content']").keyup(function (event) {
    if (event.keyCode === 13) {
        console.log("clicked");
        $("#myButton").click();
    }
});