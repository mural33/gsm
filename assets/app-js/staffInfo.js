$(document).ready(e => {
    $("#btnPayrollForm").on('click', e => {
        if(validateForm(payrollFieldNames) === true){
            addPayroll();
        }
        })

        $('#staffPayroll').on('click', '.dltBtn', async function() {
            var StaffPayRoleId = $(this).attr("data-payroll-id");
            await deletePayroll(StaffPayRoleId);
        });

        $("#btnstaffDocument").on('click', e => {
            if(validateForm(documentFields) === true){
                addDocuments();
            }
        })
})

let payrollFieldNames = [
    'payment_date','payroll_type','salary_amount','payment_mode',
    'payroll_details'
]
let documentFields = [
    'document_name','document_file'
]
isUpdate = false
async function addPayroll(){
    var payrollData = {
        "payment_date": $("#payment_date").val(),
        "payroll_type": $("#payroll_type").val(),
        "salary_amount": $("#salary_amount").val(),
        "payment_mode":$("#payment_mode").val(),
        "payroll_details":$("#payroll_details").val(),
        "staff_id":$("#staff_id").val()
    }
    var payrollId = $("#payroll_id").val();
    var method = isUpdate ? "PUT" : "POST";
    var endPoint = isUpdate ? `/StaffPayrole/update_payroll/?payroll_id=${payrollId}` : "/StaffPayrole/add_payroll/";
    var totalUrl = apiUrl + endPoint
    await ajaxRequest(method, totalUrl, payrollData,"payrollFormId","lg", (response) => {
        $("#payroll_form").modal('hide');
        var payrollData = response.response;
        raiseSuccessAlert(response.msg);
        if (isUpdate) {
            var updatedRow = $(`#payroll_detail .tr-payroll-${payrollId}`);
            updatedRow.find('.payment_date').text(payrollData.payment_date);
            updatedRow.find('.payroll_type').text(payrollData.payroll_type);
            updatedRow.find('.salary_amount').text(payrollData.salary_amount);
            updatedRow.find('.payment_mode').text(payrollData.payment_mode);
            updatedRow.find('.payroll_details').text(payrollData.payroll_details);
        } else {
            displayNewPayroll(payrollData);
        }
        resetForm(payrollFieldNames);
    });
}
async function displayNewPayroll(response) {
    newRow = `
    <tr class="tr-payroll-${response.payroll_id}">
        <td>${$("#payroll_detail tr").length + 1}</td>
        <td class="payment_date">${response.payment_date}</td>
        <td class="payroll_type">${response.payroll_type}</td>
        <td class="salary_amount">${response.salary_amount}</td>
        <td class="payment_mode">${response.payment_mode}</td>
        <td class="payroll_details">${response.payroll_details}</td>
        <td>
            <a href="#"  data-payroll-id="${response.payroll_id}"
                class="btn btn-sm btn-info" onclick="openPayrollForm(this)">
                <i class="bi bi-pencil-square"></i>
            </a>
            <a href="#" data-payroll-id="${response.payroll_id}"
                class="dltBtn btn btn-sm btn-danger">
                <i class="bi bi-trash3"></i>
            </a>
        </td>
    </tr>
    `;
    var tableBody = document.querySelector('.tbl__bdy');
    tableBody.innerHTML += newRow;
    resetForm(payrollFieldNames);
    isUpdate = false
}


async function openPayrollForm(element){
    var payrollId = $(element).attr("data-payroll-id");
    $("#payroll_form").modal('show')
    var endPoint = `/StaffPayrole/get_payroll_by_id/?payroll_id=${payrollId}`
    var totalUrl = apiUrl+endPoint;
    var method = "GET";

    await ajaxRequest(method, totalUrl,"","payrollFormId","lg", (response) =>{
        var payrollData = response.response;
        for (const key in payrollData) {
            try{
                $(`#${key}`).val(payrollData[key]);
            }
            catch(e){
                
            }
        }
        isUpdate = true
    })
} 

// base ajax request function
async function ajaxRequest(type, url, data,loaderId,loaderSize,successCallback) {
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
            showLoader(loaderId,loaderSize);
        },
        success: (response) => {
            successCallback(response);
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON);
        },
        complete: () => {
            removeLoader(loaderId, loaderSize);
        }
    });
}

async function deletePayroll(payrollId){
    await Swal.fire({
        title: 'Are you sure, do you want to delete this Record?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $(`.tr-payroll-${payrollId}`).remove()
            if ($('#staffPayroll').length === 0) {
                $("#parentRow").html('<img src="/assets/img/no_data_found.png" class="no_data_found">');
              }
            var endPoint = `/StaffPayrole/delete_payroll/?payroll_id=${payrollId}`
            var totalUrl = apiUrl+endPoint;
            ajaxRequest("DELETE",totalUrl, "","payrollFormId","lg", (response) => {  
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

// documentsss
async function addDocuments() {
    var documentData = {
        "document_name": $("#document_name").val(),
        "document_file": await uploadFile("document_file", "staff_documents"),
        "staff_id": $("#staff_id").val(),
        "is_deleted": false,
    }
    var documentId = $("#document_id").val();
    var method = isUpdate ? "PUT" : "POST";
    var endPoint = isUpdate ? `/StaffDocuments/update_staff_documents/?document_id=${documentId}` : "/StaffDocuments/add_staff_documents/";
    var totalUrl = apiUrl + endPoint
    // Extract file name before making the AJAX request
    var documentFile = documentData.document_file;
    var splitFile = documentFile.split('/');
    var fileName = splitFile[splitFile.length - 1];
    await ajaxRequest(method, totalUrl, documentData, "documentFormId", "lg", (response) => {
        $("#documentForm").modal('hide');
        var documentData = response.response;
        raiseSuccessAlert(response.msg);
        if (documentId) {
            var updatedRow = $(`.card-staff-${documentId}`);
            updatedRow.find('.card-title').text(documentData.document_name);
            updatedRow.find('.card-text').text(fileName); 
        } else {
            displayNewDocument(documentData);
        }
        resetForm(documentFields);
    });
}


async function displayNewDocument(response) {
    var documentFile = response.document_file.split('/').pop();
    var newDocumentHTML = `
        <div class="col-md-4 card-staff-${response.document_id}">
            <div class="card mb-3">
                <div class="card-body">
                    <p class="card-title">Document Name: ${response.document_name}</p>
                    <p class="card-text">Document type: ${documentFile}</p>
                </div>
                <div class="card-footer d-flex justify-content-evenly">
                    <button data-document-id="${response.document_id}" class="btn btn-sm btn-info" onclick="openDocumentForm(this)">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button data-document-id="${response.document_id}" class="btn btn-sm btn-danger" onclick="deleteDocuments(this)">
                        <i class="bi bi-trash3"></i>
                    </button>
                    <button data-document-id="${response.document_id}" class="btn btn-sm btn-dark">
                        <i class="bi bi-download"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    $("#documentRow").append(newDocumentHTML);
    resetForm(documentFields);
    isUpdate = false
    
}

 
async function deleteDocuments(element){
    var documentId = $(element).attr("data-document-id");
    await Swal.fire({
        title: 'Are you sure, do you want to delete this Record?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            var endPoint = `/StaffDocuments/delete_staff_documents/?document_id=${documentId}`;
            var totalUrl = apiUrl + endPoint;
            $(`.card-staff-${documentId}`).remove()
            if ($('#documentDetails').length === 0 ) {
                $("#documentRow").html('<img src="/assets/img/no_data_found.png" class="no_data_found">');
            }
            ajaxRequest("DELETE", totalUrl, "","documentRow","lg",(response) => {
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
                raiseSuccessAlert(response.msg);
            })
        }
    });
}

async function openDocumentForm(element) {
    var documentId = $(element).attr("data-document-id");
    $("#documentForm").modal('show');
    var endPoint = `/StaffDocuments/get_staff_documents_by_id/?document_id=${documentId}`;
    var totalUrl = apiUrl + endPoint;
    var method = "GET";

    await ajaxRequest(method, totalUrl, "","documentRow", "lg", function(response) {
        var documentData = response.response;
        for (const key in documentData) {
            try {
                $(`#${key}`).val(documentData[key]);
                isUpdate = true;
            } catch (e) {
                // Handle any potential errors
            }
        }
    });
}


