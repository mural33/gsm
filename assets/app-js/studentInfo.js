$(document).ready(e => {
    $("#btnParentForm").on('click', e => {
        if(validateForm(parentFieldNames) === true){
            addParent();
        }
    })

    $("#parent_phone").on('input', function () {
        phoneNumber($(this).attr('id'));
    });
})

let parentFieldNames = [
    'parent_name','parent_age','parent_email','parent_phone',
    'parent_gender','relation_with_student','parent_profession',
]
// data-bs-dismiss="modal"

async function addParent(){
    var parentData = {
        "parent_name": $("#parent_name").val(),
        "parent_email": $("#parent_email").val(),
        "parent_phone": $("#parent_phone").val(),
        "parent_profile": "string",
        "parent_gender":$("#parent_gender").val(),
        "parent_age": $("#parent_age").val(),
        "relation_with_student":$("#relation_with_student").val(),
        "parent_address": "string",
        "parent_profession":$("#parent_profession").val(),
        "photo": "string",
        "student_id":$("#student_id").val()
    }
    var parentId = $("#parent_id").val();
    var method = parentId ? "PUT" : "POST";
    var endPoint = parentId ? `/Parents/update_parent/?parent_id=${parentId}` : "/Parents/add_parent/";
    var totalUrl = apiUrl+endPoint

    await ajaxRequest(method, totalUrl, parentData, (response) => {
        $("#parent_form").modal('hide');
        var parentData = response.response;
        raiseSuccessAlert(response.msg);
        $("#no_data_found").hide()
        if (parentId) {
            for (const field of parentFieldNames) {
                try {
                    $(`.parent-${parentId}-${field}`).text(parentData[field]);
                } catch (e) {
                    console.log(e);
                }
            }
        } else {
            displayNewParent(parentData);
        }
        resetForm(parentFieldNames);
    });
}

async function displayNewParent(response){
    var parentData = response;
    var parentRow = $("#parentRow");
    var card = `
    <div class="card col-md-4 mx-2" id="parent-card-${parentData.parent_id}">
        <div class="card-heade text-center my-2">
            <img src="/assets/img/men.jpg" alt="" srcset="" class="card-img-top parent_profile">
        </div>
        <div class="card-body row">
            <p class="card-title col-md-6">
                Name: <span class="parent-${parentData.parent_id}-parent_name">${parentData.parent_name}</span>
            </p>
            <p class="card-title col-md-6 ">
                Gender: <span class="parent-${parentData.parent_id}-parent_gender">${parentData.parent_gender}</span>
            </p>
            <p class="card-title col-md-6">
                Relation: <span
                    class="parent-${parentData.parent_id}-relation_with_student">${parentData.relation_with_student}</span>
            </p>
            <p class="card-title col-md-6 ">
                Age: <span class="parent-${parentData.parent_id}-parent_age">${parentData.parent_age}</span>
            </p>
        </div>
        <div class="card-footer">
            <button onclick="openParentForm(this)" class="btn btn-md btn-info" data-parent_id="${parentData.parent_id}">
                <i class="bi bi-pencil-square"></i>
            </button>
            <button onclick="deleteParent(this)" data-parent_id="${parentData.parent_id}"
                class="btn btn-md btn-danger float-end">
                <i class="bi bi-trash3"></i>
            </button>
        </div>
    </div>
    `;
    parentRow.append(card);
}

async function openParentForm(element){
    var parentId = $(element).attr("data-parent_id");
    $("#parent_form").modal('show')
    var endPoint = `/Parents/get_parent_data/?parent_id=${parentId}`
    var totalUrl = apiUrl+endPoint;
    var method = "GET";

    await ajaxRequest(method, totalUrl,"", (response) =>{
        var parentData = response.response;
        for (const key in parentData) {
            try{
                $(`#${key}`).val(parentData[key]);
            }
            catch(e){
                
            }
        }
    })
}

async function deleteParent(element){
    var parentId = $(element).attr("data-parent_id");
    await Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
            title: 'swal-title',
            content: 'swal-text',
            confirmButton: 'swal-confirm-button',
            cancelButton: 'swal-cancel-button',
        },
    }).then((result) => {
        if (result.isConfirmed) {
            $(`#parent-card-${parentId}`).remove()
            var endPoint = `/Parents/delete/${parentId}`
            var totalUrl = apiUrl+endPoint;
            ajaxRequest("DELETE",totalUrl, "", (response) => {
            })
            Swal.fire({
                title: 'Deleted!',
                text: 'Your file has been deleted.',
                icon: 'success',
                customClass: {
                    title: 'swal-title',
                    content: 'swal-text',
                    confirmButton: 'swal-confirm-button',
                },
            });
        }
    });

}


// base ajax request function
async function ajaxRequest(type, url, data, successCallback) {
    await $.ajax({
        type: type,
        url: url,
        data: JSON.stringify(data),
        mode: "cors",
        crossDomain: true,
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: () => {
            showLoader("parent_form", "lg");
        },
        success: (response) => {
            successCallback(response);
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: () => {
            removeLoader("parent_form", "lg");
        }
    });
}