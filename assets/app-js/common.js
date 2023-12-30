let apiUrl = ""
let jwtToken = ""
let instituteId = 0
$(document).ready(()=>{
    apiUrl = $("#apiUrl").val()
    jwtToken = $("#jwtToken").val()
    instituteId = $("#instituteId").val()    
})
function raiseErrorAlert(msg) {
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: msg,
    });
}
function raiseSuccessAlert(msg) {
    Swal.fire({
        icon: "success",
        title: "Success",
        text: msg,
    });
}

// form reset
function resetForm(fields) {
    for (const field of fields) {
        const element = $(`#${field}`);
        const value = element.val(""); 
    }
}
// form validation
function validateForm(fields) {
    var isValid = true;
    for (const field of fields) {
        const element = $(`#${field}`);
        const value = element.val().trim();
        if (value === '') {
            element.focus().addClass('is-invalid');
            isValid = false;
        }
    }
    return isValid;
}

// 
function phoneNumber(fieldId) {
    var input = $(`#${fieldId}`);
    if (isNaN(input.val())) {
        input.val(input.val().replace(/[^0-9]/g, ''));
    }
}

// loader start
function showLoader(loaderContainerElementId, size) {
    if(loaderContainerElementId == "body"){
        $("#spinner-element-"+size).show();
    }
    else{
        $("#"+loaderContainerElementId).append($("#spinner-element-"+size).html());
    }
}
// loader stop
function removeLoader(loaderContainerElementId, size) {
    if(loaderContainerElementId == "body"){
        $("#spinner-element-"+size).hide();
    }
    else{
        $("#"+loaderContainerElementId).find(".spinner-element-"+size+'-overlay').remove();
    }
}

