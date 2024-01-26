// ____Add/Edit User____
$(document).ready(function () {
    $('#userTable').DataTable();
    $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`)

    $("#btnSaveUser").click(async function (e) {
        $("#btnSaveUser").removeClass("btn-shake")
        e.preventDefault();
        if (validateAddUserForm() === false) {
          $("#btnSaveUser").addClass("btn-shake")
          return false;
        } else {
          await addUser();
        }
      });

      $("#btnEditUser").click(async function (e) {
        $("#btnEditUser").removeClass("btn-shake")
        e.preventDefault();
        if (validateEditUserForm() === false) {
          $("#btnEditUser").addClass("btn-shake")
          return false;
        } else {
          await updateUser();
        }
      });
      $("#btnResetPwd").click(async function (e) {
        $("#btnResetPwd").removeClass("btn-shake")
        e.preventDefault();
        if (validateForm(resetPwd) === false) {
          $("#btnResetPwd").addClass("btn-shake")
          return false;
        } else {
          await resetPassword();
        }
      });

      $(document).on("click", ".btnPasswordReset", async function (e) {
        e.preventDefault();
        let userId = $(this).data("user-id");
        let userName = $(this).closest("tr").find(".user_name").text();
        let userEmail = $(this).closest("tr").find(".user_email").text();
        await getDataForResetPassword(userId, userName, userEmail);
    });
    
      $(document).on("click", ".btnEditUser", async function (e) {
        e.preventDefault();    
        let userId = $(this).data("user-id")
        await editUser(userId);
      });
      $(document).on("click", ".btnDeleteUser", async function (e) {
        e.preventDefault();    
        let userId = $(this).data("user-id")
        await deleteUser(userId);
      }); 

      $("#resetBtn").on("click", function() {
        const generatedPassword = generateRandomPassword(10); 
        $("#resetPassword").val(generatedPassword);
    });  
    $("#togglePasswordField").on("click",function(){
        const passwordField = $("#user_password");
        const showPassword = $("#seePassword");

        if (passwordField.attr("type") === "password") {
            passwordField.attr("type", "text");
            showPassword.removeClass("bi-eye").addClass("bi-eye-slash");
        } else {
            passwordField.attr("type", "password");
            showPassword.removeClass("bi-eye-slash").addClass("bi-eye");
        }
    });
    
    $("#togglePassword").on("click", function() {
        const passwordInput = $("#resetPassword");
        const eyeIcon = $("#eyeIcon");
    
        if (passwordInput.attr("type") === "password") {
            passwordInput.attr("type", "text");
            eyeIcon.removeClass("bi-eye").addClass("bi-eye-slash");
        } else {
            passwordInput.attr("type", "password");
            eyeIcon.removeClass("bi-eye-slash").addClass("bi-eye");
        }
    });
    
});
async function validateAddUserForm() {
    const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const validPhoneRegex = /^[6-9][0-9]{9}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

    function validateInput(input, regex, min, max, errorMessageId, errorMessage) {
        const value = input.val().trim();
        const errorMessageElement = $("#" + errorMessageId);

        if (regex && (value.length < min || value.length > max || !regex.test(value))) {
            input.addClass("is-invalid");
            input.focus();
            errorMessageElement.text(errorMessage);
            return false;
        } else if (!regex && (value.length < min || value.length > max)) {
            input.addClass("is-invalid");
            input.focus();
            errorMessageElement.text(errorMessage);
            return false;
        } else {
            input.removeClass("is-invalid");
            errorMessageElement.text("");
            return true;
        }
    }
    function validatePassword(password) {
        if (password.length < 8) {
            return false;
        }
        if (!passwordRegex.test(password)) {
            return false;
        }

        return true;
    }
    let user_name = $("#user_name");
    let user_email = $("#user_email");
    let user_phone_number = $("#user_phone_number");
    let user_role = $("#user_role");
    let user_password = $("#user_password");

    let isNameValid = validateInput(user_name, null, user_name.attr("minLength"), user_name.attr("maxLength"), "user_name_error", "Invalid Name");
    let isRoleValid = user_role.val() !== "";
    let isEmailValid = validateInput(user_email, validRegex, user_email.attr("minLength"), user_email.attr("maxLength"), "user_email_error", "Invalid Email");
    let isPhoneValid = validateInput(user_phone_number, validPhoneRegex, user_phone_number.attr("minLength"), user_phone_number.attr("maxLength"), "user_phone_number_error", "Invalid Phone");
    let isPasswordValid = validatePassword(user_password, passwordRegex, user_password.attr("minLength"), user_password.attr("maxLength"), "user_password_error", "Invalid Role");

    return isNameValid && isRoleValid && isEmailValid && isPhoneValid && isPasswordValid;
}
async function validateEditUserForm() {
    const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const validPhoneRegex = /^[6-9][0-9]{9}$/;

    function validateInput(input, regex, min, max, errorMessageId, errorMessage) {
        const value = input.val().trim();
        const errorMessageElement = $("#" + errorMessageId);

        if (regex && (value.length < min || value.length > max || !regex.test(value))) {
            input.addClass("is-invalid");
            input.focus();
            errorMessageElement.text(errorMessage);
            return false;
        } else if (!regex && (value.length < min || value.length > max)) {
            input.addClass("is-invalid");
            input.focus();
            errorMessageElement.text(errorMessage);
            return false;
        } else {
            input.removeClass("is-invalid");
            errorMessageElement.text("");
            return true;
        }
    }

    let userName = $("#userName");
    let userEmail = $("#userEmail");
    let user_phoneNumber = $("#user_phoneNumber");
    let userRole = $("#userRole");

    let isNameEditValid = validateInput(userName, null, userName.attr("minLength"), userName.attr("maxLength"), "userName_error", "Invalid Name");
    let isRoleEditValid = userRole.val() !== "";
    let isEmailEditValid = validateInput(userEmail, validRegex, userEmail.attr("minLength"), userEmail.attr("maxLength"), "userEmail_error", "Invalid Email");
    let isPhoneEditValid = validateInput(user_phoneNumber, validPhoneRegex, user_phoneNumber.attr("minLength"), user_phoneNumber.attr("maxLength"), "user_phoneNumber_error", "Invalid Phone");

    return isNameEditValid && isRoleEditValid && isEmailEditValid && isPhoneEditValid;
}
let userFields=['user_name','user_email','user_phone_number','user_role','user_password']
async function addUser() {
    const data = {
        institute_id: instituteId,
        user_name: $("#user_name").val(),
        user_email: $("#user_email").val(),
        user_phone_number: $("#user_phone_number").val(),
        user_role: $("#user_role").val(),
        user_password: $("#user_password").val(),
    };
    const userUrl = apiUrl + "/Users/create_user/";
    console.log(userUrl);
    await $.ajax({
        type: "POST",
        url: userUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        data: JSON.stringify(data),
        beforeSend: (e) => {
            showLoader("userFormArea", "sm");
        },
        success: async function (data) {
            if (data && data.response) {
                $("#user_creation_modal").modal("hide");
                var responseData = data.response;
  
                    var tableBody = $("#user_details");
                    var noDataImage = tableBody.find('.no_data_found-tr');
                    if (noDataImage.length > 0) {
                      noDataImage.remove();
                    }
                    var newRow = `
                    <tr class="tr-user-${responseData.user_id}" id="userId-${responseData.user_id}">
                    <td class="user_name">${responseData.user_name}</td>
                    <td class="user_email">${responseData.user_email}</td>
                    <td class="user_phone_number">${responseData.user_phone_number}</td>
                    <td class="user_role">${responseData.user_role}</td>
                    <td>
                    <button type="button" class="btn btn-sm btn-dark btnPasswordReset" data-user-id="${responseData.user_id}">
                    <i class="bi bi-lock-fill"></i></button>
                <button type="button" class="btn btn-sm btn-info btnEditUser" data-user-id="${responseData.user_id}">
                    <i class="bi bi-pencil-square"></i></button>
                <button type="button" class="btn btn-sm btn-danger btnDeleteUser" data-user-id="${responseData.user_id}">
                    <i class="bi bi-trash3"></i></button>
            </td>
                  </tr>`;               
                    $('#userTable').DataTable().row.add($(newRow)).draw();  
                    raiseSuccessAlert(data.msg);
                    resetForm(userFields);
            }
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: (e) => {
            removeLoader("userFormArea", "sm");
        },
    });
}
let userEditFields=['userName','userEmail','user_phoneNumber','userRole']
async function editUser(userId){
    $("#user_edit_modal").modal("show");
    const editUserUrl = apiUrl + "/Users/get_user_by_id/?user_id=" + userId;
    await $.ajax({
      type: "GET",
      url: editUserUrl,
      mode: "cors",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`,
      },
      beforeSend: (e) => {
        showLoader("userEditFormArea", "sm");
      },
      success: (data) => {
        console.log(data);
        if (data) {
          $("#user_id").val(data.user_id);
          $("#userName").val(data.user_name);
          $("#userEmail").val(data.user_email);
          $("#user_phoneNumber").val(data.user_phone_number);
          $("#userRole").val(data.user_role);        
        }
      },
      error: (error) => {
        raiseErrorAlert(error.responseJSON.detail);
      },
      complete: (e) => {
        removeLoader("userEditFormArea", "sm");
      },
    });
}
async function updateUser(){
    const data = {
        institute_id: instituteId,
        user_id: $("#user_id").val(),
        user_name: $("#userName").val(),
        user_email: $("#userEmail").val(),
        user_phone_number: $("#user_phoneNumber").val(),
        user_role: $("#userRole").val(),
    };
    const userUpdateUrl = apiUrl + "/Users/update_user_partial/?user_id=" + data.user_id ;
    await $.ajax({
        type: "PATCH",
        url: userUpdateUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        data: JSON.stringify(data),
        beforeSend: (e) => {
            showLoader("userEditFormArea", "sm");
        },
        success: async function (data) {
            if (data && data.response) {
                $("#user_edit_modal").modal("hide");
                var responseData = data.response;
                    const existingRow = $("tr[id='userId-" + responseData.user_id + "']");
                    if (existingRow.length) {
                      existingRow.find('td:eq(0)').text(responseData.user_name);
                      existingRow.find('td:eq(1)').text(responseData.user_email);
                      existingRow.find('td:eq(2)').text(responseData.user_phone_number);
                      existingRow.find('td:eq(3)').text(responseData.user_role);
                    }
                    raiseSuccessAlert(data.msg);
                    $("#id").val("");
                    resetForm(userEditFields);
            }
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: (e) => {
            removeLoader("userEditFormArea", "sm");
        },
    });
}

async function deleteUser(userId) {
    const deleteUserUrl = apiUrl + "/Users/delete_user/?user_id=" + userId;
    Swal.fire({
        title: 'Are you sure, you want to delete this Record?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const data = await $.ajax({
                type: "DELETE",
                url: deleteUserUrl,
                mode: "cors",
                crossDomain: true,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwtToken}`,
                },
                beforeSend: (e) => {
                    showLoader("userTable", "sm");
                },
                success: async function (data) {
                    const dataTable = $('#userTable').DataTable();
                    const deletedRow = dataTable.row(`#userId-${userId}`);
                    if (deletedRow) {
                        deletedRow.remove().draw();

                        if (dataTable.rows().count() === 0) {
                            $('#user_details').html(`
                                <tr class="no_data_found-tr">
                                    <td colspan="5" class="text-center">
                                        <img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">
                                    </td>
                                </tr>
                            `);
                        }
                        raiseSuccessAlert(data.msg);
                    } else {
                        raiseErrorAlert("Row not found in DataTable.");
                    }
                },
                error: (error) => {
                    raiseErrorAlert(error.responseJSON.detail);
                },
                complete: (e) => {
                    removeLoader("userTable", "sm");
                },
            });
        }
    });
}

async function getDataForResetPassword(userId, userName, userEmail) {
    $("#user_id").val(userId);
    $("#userResetName").val(userName);
    $("#userResetEmail").val(userEmail);
    $("#resetPassword").val("");  
    $("#user_resetPassword_modal").modal("show");
}
function generateRandomPassword(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset.charAt(randomIndex);
    }
    return password;
}
let resetPwd=['resetPassword']
async function resetPassword(){
    const data = {
        user_id: $("#user_id").val(),
        user_password : $("#resetPassword").val(),
    };
    const resetPasswordUrl = apiUrl + "/Users/update_user_password/?user_id=" + data.user_id + "&user_password=" + encodeURIComponent(data.user_password);
    await $.ajax({
        type: "PATCH",
        url: resetPasswordUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        data: JSON.stringify(data),
        beforeSend: (e) => {
            showLoader("userResetPasswordArea", "sm");
        },
        success: async function (data) {
                $("#user_resetPassword_modal").modal("hide");
                    raiseSuccessAlert(data.msg);
                    resetForm(resetPwd);
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: (e) => {
            removeLoader("userResetPasswordArea", "sm");
        },
    });
}
