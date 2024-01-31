$("document").ready(function(){
    $("#passwordChange3").on("click", function () {
        const passwordField = $("#password3");
        const showPassword = $("#showPassword3");
        console.log("pass",passwordField,showPassword)
        if (passwordField.attr("type") === "password") {
            passwordField.attr("type", "text");
            showPassword.removeClass("bi-eye").addClass("bi-eye-slash");
        } else {
            passwordField.attr("type", "password");
            showPassword.removeClass("bi-eye-slash").addClass("bi-eye");
        }
    });
});