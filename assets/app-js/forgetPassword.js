$(document).ready(function () {
    $("#submit").click(function (e) {
        e.preventDefault();
        var email = $("#email").val();
        apiUrl = $("#apiUrl").val();
        var method = "PATCH";
        var endPoint = `/Users/update_user_password_by_email/?user_email=${email}`;
        var totalUrl = apiUrl + endPoint;
        $.ajax({
        type: method,
        url: totalUrl,
        data: { "user_email": email },
        success: function (response) {
            console.log("response: ", response);
            
            Swal.fire({
            icon: 'success',
            title: 'New Password Set!',
            text: 'Check your email for the New password.',
            }).then(() => {
            window.location.href = "/app/login/";
            });
        },
        error: function (error) {
            Swal.fire({
            icon: 'error',
            title: 'Not Found!',
            text: 'Please Enter a valid email!',
            });
        }
        });
    });
});