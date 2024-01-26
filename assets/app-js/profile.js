$(document).ready(function() {
    $('#profilePicInput').change(function(event) {
        var input = event.target;
        var reader = new FileReader();
        reader.onload = function() {
            var dataURL = reader.result;
            $('#profilePic').attr('src', dataURL);
        };
        reader.readAsDataURL(input.files[0]);
    });
    $('.edit-icon').click(function() {
        $('#profilePicInput').click();
    });
    $('#profileSave').on('click', function() {
        profileSave();
    });
    $('#changePassword').on('click', function() {
        if(validateForm(passwordFields) === true){
            passwordReset();
        }  
    }); 
});
passwordFields = ["currentPassword", "newPassword"];
async function profileSave(){
    const profileData = {
        "user_photo_url": await uploadFile("profilePicInput", "user_profile"),
        "user_name": $("#fullName").val(),
        "user_phone_number": $("#phoneNumber").val(),
    }
    localStorage.setItem("profile_img",profileData.user_photo_url)
    var storedProfileImg = localStorage.getItem('profile_img');
    $("#profileImageId").attr("src", storedProfileImg);
    userId = $("#user_id").val();
    var method = "PATCH";
    var endPoint = `/Users/update_user_partial/?user_id=${userId}`;
    var totalUrl = apiUrl + endPoint
    ajaxRequest(method, totalUrl, profileData, "userDetails", "lg", (response) => {
        if (response && response.response) {
            raiseSuccessAlert(response.msg);
        }
    });
}  
function passwordReset(){
    const passwordData = {
        "currentPassword": $("#currentPassword").val(),
        "newPassword": $("#newPassword").val(),
    }
    if(passwordData.currentPassword === passwordData.newPassword){
        raiseWarningAlert("Current password and new password cannot be same");
    }
    else{
        userId = $("#user_id").val();
        var method = "PATCH";
        var endPoint = `/Users/update_user_password/?user_id=${userId}&user_password=${passwordData.newPassword}`;
        var totalUrl = apiUrl + endPoint
        ajaxRequest(method, totalUrl, passwordData, "passwordDetails", "lg", (response) => {
            if(response){
                raiseSuccessAlert(response.msg);
            }
        });
    }
}