
let apiUrl = ""
let jwtToken = ""
let instituteId = 0
$(document).ready(()=>{
    apiUrl = $("#apiUrl").val();
    jwtToken = $("#jwtToken").val();
    instituteId = $("#instituteId").val();
    
    $(".btnCloseModel").on("click", function(e){
        const parentModel = $(this).closest(".modal"); 
        parentModel.modal("hide");
        $("input, textarea, select",parentModel).val("");
    });
})
function raiseErrorAlert(msg) {
    toastr.options = {
        "closeButton": true,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "timeOut": "5000",
        "extendedTimeOut": "2000"
    };
    toastr.error(msg, 'Error');
}
function raiseSuccessAlert(msg) {
    toastr.options = {
        "closeButton": true,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "timeOut": "5000",
        "extendedTimeOut": "2000"
    };
    toastr.success(msg, 'Success');
}

function raiseWarningAlert(msg) {
    toastr.options = {
        "closeButton": true,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "timeOut": "5000",
        "extendedTimeOut": "2000"
    };
    toastr.warning(msg, 'Warning !');
}

function raiseInfoAlert(msg) {
    toastr.options = {
        "closeButton": true,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "timeOut": "5000",
        "extendedTimeOut": "2000"
    };
    toastr.info(msg, 'Information');
}
// form reset
function resetForm(fields) {
    for (const field of fields) {
        try{
        const element = $(`#${field}`);
        const value = element.val(""); 
        }
        catch(e){
        }
    }
}
// form validation
function validateForm(fields) {
    var isValid = true;
    for (const field of fields) {
        try{
            const element = $(`#${field}`);
            const value = element.val().trim();
            if (value === '') {
                element.focus().addClass('is-invalid');
                // find parent accordion
                const parentAccordion = element.parents(".accordion");
                // open parent accordion
                parentAccordion.find(".collapse").addClass("show");
                isValid = false;
            }
        }  
        catch(e){
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
    if (loaderContainerElementId == "body") {
        $("#spinner-element-" + size).show();
    } else {
        var loaderContainer = $("#" + loaderContainerElementId);
        if (!loaderContainer.hasClass("modal")) {
            loaderContainer.css("position", "relative");
            loaderContainer.append($("#spinner-element-" + size).html());
        } else {
            loaderContainer.append($("#spinner-element-" + size).html());
        }
    }
}


// loader stop
function removeLoader(loaderContainerElementId, size) {
    if(loaderContainerElementId == "body"){
        $("#spinner-element-"+size).hide();
    }
    else{
        $("#"+loaderContainerElementId).css("position", "")
        $("#"+loaderContainerElementId).find(".spinner-element-"+size+'-overlay').remove();
    }
}


// azure blob upload
async function uploadFile(fieldId,location) {
    var defaultBlob = "https://gsmstore.blob.core.windows.net/student-profile-pictures/students.jpg";
    var url = window.location.origin;
    try{
        const fileInput = document.getElementById(fieldId);
        const file = fileInput.files[0];
        const formData = new FormData();
        var csrfmiddlewaretoken = $('input[name=csrfmiddlewaretoken]').val()
        formData.append('file', file);
        formData.append('location', location);
        formData.append('csrfmiddlewaretoken', csrfmiddlewaretoken);
        formData.append('file_name', file.name);
        try {
            const response = await $.ajax({
                type: "POST",
                url: `${url}/app/azure_upload/`,
                data: formData,
                processData: false,
                contentType: false,
            });
            if(response.file_url){
                return response.file_url;
            }
            return defaultBlob;
        } catch (error) {
            // Handle the error
            return defaultBlob;
        }
    }
    catch(e){
        return defaultBlob;
    }
}
// azure blob  download
async function downloadFile(fileName,location) {
    var url = window.location.origin;
    const formData = new FormData();
    var csrfmiddlewaretoken = $('input[name=csrfmiddlewaretoken]').val()
    formData.append('file_name', fileName);
    formData.append('location', location);
    formData.append('csrfmiddlewaretoken', csrfmiddlewaretoken);
    window.location.href = `${url}/app/azure_download/`
    try{
        const response = await $.ajax({
            type: "POST",
            url: `${url}/app/azure_download/`,
            data: formData,
            processData: false,
            contentType: false,
        });
        if(response){
            console.log(response);
            return response.file_url;
        }
        return "";
    }
    catch(e){
        console.log(e);
        return "";
    }
}



