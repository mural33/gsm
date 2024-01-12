$(document).ready(() => {
    $("#btnSave").on("click", async (e) => {
        $("#btnSave").removeClass("btn-shake");
        if (validateForm(fields) === false) {
            $("#btnSave").addClass("btn-shake");
            return false;
        } else {
            addAssignment();
        }
    });
    $('#assignmentTable').on('click', '.btndelete', async function () {
        var assignmentId = $(this).attr("data-id");
        await deleteAssignment(assignmentId);
    });
    $('#assignmentTable').on('click', '.btnEdit', async function () {
        var assignment_id = $(this).attr("data-id");
        await editAssignment(assignment_id);
    });
    $("#class_id").on("change", function () {
        const selectedClassId = $(this).val();
        getSectionsByClass(selectedClassId, "section_id");
    });
    initializeClassSelect();
});
$('#assignmentTable').on('click', '.openAssignmentBtn', function () {
    var assignmentId = $(this).data('id');
    var assignmentDescription = $(this).data('description');
    $('#assignment-view-modal #assignment-modal-body').html(`${assignmentDescription}`);
    $('#assignment-view-modal').modal('show');
});
async function getSectionsByClass(classId) {
    const classEndPoint = `${apiUrl}/Sections/get_sections_by_class/?class_id=${classId}`;
    $.ajax({
        type: "GET",
        url: classEndPoint,
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: (e) => {
            showLoader("assignment", "sm");
        },
        success: (response) => {
            $('#section_id').empty();
            for (const section of response) {
                $("#section_id").append(`<option value="${section.section_id}">${section.section_name}</option>`);
            }
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: (e) => {
            removeLoader("assignment", "sm");
        }
    });
}

function initializeClassSelect() {
    const classurl = `${apiUrl}/Classes/get_classes_by_institute/?institite_id=${instituteId}`;
    $.ajax({
        url: classurl,
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        success: (response) => {
            for (const class_id of response) {
                $("#class_id").append(`<option value="${class_id.class_id}">${class_id.class_name}</option>`);
            }
        },
        error: function (error) {
            raiseErrorAlert(error.responseJSON);
        }
    });
}

let fields = [
    'class_id', 'section_id', 'institute_id', 'assignment_Date', 'assignment_title',
    'assignment_details', 'assignment_due_date', 'is_deleted'
];

function addAssignment() {
    let isUpdate = $("#assignment_id").val() !== "";
    const assignmentId = $("#assignment_id").val();
    const assignmentData = {
        "institute_id": instituteId,
        "class_id": $("#class_id").val(), 
        "section_id": $("#section_id").val(),  
        "assignment_Date": $("#assignment_Date").val(),
        "assignment_title": $("#assignment_title").val(),
        "assignment_details": $("#assignment_details").val(),
        "assignment_due_date": $("#assignment_due_date").val(),
        "is_deleted": false
    };
    const assignmentEndpoint = isUpdate ? `${apiUrl}/Assignments/update_assignment/?assignment_id=${assignmentId}` : `${apiUrl}/Assignments/create_assignment/`;
    const requestType = isUpdate ? 'PUT' : 'POST';
    $.ajax({
        type: requestType,
        url: assignmentEndpoint,
        data: JSON.stringify(assignmentData),
        headers: {
            'accept': 'application/json',
            "Authorization": `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
        },
        beforeSend: (e) => {
            showLoader("assignment", "sm");
        },
        success: function (data) {
            $("#assignmentModal").modal("hide");
            if (data) {
                const responseData = data.response; 
                    if (isUpdate) {
                        const tr = document.querySelector(`.tr-assign-${responseData.id}`);
                        tr.querySelector(".assignment_title").textContent = responseData.assignment_title;
                        tr.querySelector(".class_id").textContent = responseData.classes.class_name;
                        tr.querySelector(".section_id").textContent = responseData.sections.section_name;
                        tr.querySelector(".assignment_Date").textContent = responseData.assignment_Date;
                        tr.querySelector(".assignment_due_date").textContent = responseData.assignment_due_date;
                        tr.querySelector(".openAssignmentBtn").setAttribute("data-description", responseData.assignment_details);
                        $("#assignment_id").val("");
                        $('#assignmentModal').addClass("model fade");
                        raiseSuccessAlert("Assignment Updated Successfully");

                } else {
                    const newRow = `
                    <tr class="tr-assign-${responseData.id}">
                        <td>${$("#assignments_info tr").length + 1}</td>
                        <td class="text-break assignment_title">${responseData.assignment_title}</td>
                        <td class="text-break">
                        <span class="class_id">${responseData.classes.class_name}</span>-
                        <span class="section_id">${responseData.sections.section_name}</span>
                    </td>
                        <td class="assignment_Date">${responseData.assignment_Date}</td>
                        <td class="assignment_due_date">${responseData.assignment_due_date}</td>
                        <td>
                            <button type="button" class="openAssignmentBtn btn btn-sm btn-dark rounded-pill" 
                                data-bs-toggle="modal" data-bs-target="#assignment-view-modal"
                                data-id="${responseData.id}" data-description="${responseData.assignment_details}">
                                View
                            </button>
                        </td>
                        <td>
                            <button type="button" class="btn btn-sm btn-info btnEdit" id="btnEdit" data-id="${responseData.id}">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button type="button" class="btndelete btn btn-sm btn-danger" id="btndelete" data-id="${responseData.id}">
                                <i class="bi bi-trash3"></i>
                            </button>
                        </td>
                    </tr>
                `;
                $("#assignments_info").append(newRow);
                $('#no_data_found').hide();
                    raiseSuccessAlert("Assignment Added Successfully");
                }
            }
        },
        error: function (xhr, status, error) {
            raiseErrorAlert(error.responseJSON);
        },
        complete: (e) => {
            removeLoader("assignment", "sm");
            resetForm(fields);
        }
    });
}

function editAssignment(assignment_id) {
    const fetchUrl = `${apiUrl}/Assignments/get_assignment_by_id/?assignment_id=${assignment_id}`;
    $.ajax({
        type: "GET",
        url: fetchUrl,
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        success: (data) => {
            if (data && data.assignment_details) {
                var responseData = data;
                $('#assignmentModal').modal('show');
                $("#assignment_id").val(responseData.id);
                $("#class_id").val(responseData.class_id);
                getSectionsByClass(responseData.class_id, "section_id");
                $("#assignment_details").val(responseData.assignment_details);
                $("#assignment_Date").val(responseData.assignment_Date);
                $("#assignment_title").val(responseData.assignment_title);
                $("#assignment_due_date").val(responseData.assignment_due_date);
            }
        },
        error: function (xhr, status, error) {
            raiseErrorAlert(error.responseJSON.detail);
        }
    });
}

async function deleteAssignment(assignmentId) {
    const assignmentRow = `.tr-assign-${assignmentId}`;
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
            $(assignmentRow).remove();
            const endpoint = `/Assignments/delete_assignment/?assignment_id=${assignmentId}`;
            const url = `${apiUrl}${endpoint}`;
            const response = await $.ajax({
                type: 'DELETE',
                url: url,
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
                contentType: 'application/json',
                dataType: 'json',
                beforeSend: (e) => {
                    showLoader("body", "sm");
                },
                success: (response) => {
                    raiseSuccessAlert("Assignment Deleted Successfully");
                    if ($('#assignments_info tr').length === 1) {
                        $('#no_data_found').show();
                    }
                },
                error: (error) => {
                    raiseErrorAlert(error.responseJSON.detail);
                },
                complete: (e) => {
                    removeLoader("body", "sm");
                    resetForm(fields);
                }
            });
        }
    });
}

