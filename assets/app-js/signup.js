$("document").ready(function(){
    $("#passwordChange1").on("click",function(){
        const passwordField = $("#institute_password");
        const showPassword = $("#showPassword");

        if (passwordField.attr("type") === "password") {
            passwordField.attr("type", "text");
            showPassword.removeClass("bi-eye").addClass("bi-eye-slash");
        } else {
            passwordField.attr("type", "password");
            showPassword.removeClass("bi-eye-slash").addClass("bi-eye");
        }
    });

    $("#passwordChange2").on("click", function() {
        const passwordInput = $("#confirm_password");
        const eyeIcon = $("#confirmPassword");

        if (passwordInput.attr("type") === "password") {
            passwordInput.attr("type", "text");
            eyeIcon.removeClass("bi-eye").addClass("bi-eye-slash");
        } else {
            passwordInput.attr("type", "password");
            eyeIcon.removeClass("bi-eye-slash").addClass("bi-eye");
        }
    });
});