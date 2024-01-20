$(document).ready(async function () {
    $('#assignmentInfoTable').DataTable();
    $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`)
    let assignmentId = $("#assignment_id").val();
    await loadAssignmentDetails(assignmentId);

    $("#btnSubmitAssignment").click(async function (e) {
        $("#btnSubmitAssignment").removeClass("btn-shake")
        e.preventDefault();
        if (validateForm(assignDocsField) === false) {
            $("#btnSubmitAssignment").addClass("btn-shake")
            return false;
        } else {
            await uploadAssignment();
        }
    });

    $(document).on("click", "#assigBtnDelete", async function (e) {
        e.preventDefault();
        let Id = $(this).data("assigninfo-id");
        await deleteAssignmentSubmission(Id);
    });

    $('#assignment_file').on('change', function () {
        var selectedFile = this.files[0];
        if (selectedFile) {
            var fileSize = selectedFile.size;
            var maxSizeInBytes = 5 * 1024 * 1024;
            if (fileSize > maxSizeInBytes) {
                raiseErrorAlert('File size exceeds the allowed limit (5MB). Please choose a smaller file.');
                $(this).val('');
            }
        }
    });

    var sectionId = $(".sectionId").data("section-id");
    $("#studentRollNumberInput").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: apiUrl + `/Students/get_students_by_field/section_id/${sectionId}/`,
                type: "GET",
                dataType: "json",
                mode: "cors",
                crossDomain: true,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwtToken}`,
                },
                data: {
                    term: request.term
                },
                beforeSend: (e) => {
                    showLoader("uploadAssign", "sm");
                },
                success: function (data) {
                    var suggestions = $.map(data, function (item) {
                        var label = item.roll_number;
                        var value = item.roll_number;

                        return {
                            label: label,
                            value: value,
                            student_id: item.student_id,
                            section_id: item.section_id
                        };
                    });
                    response(suggestions);
                },
                complete: (e) => {
                    removeLoader("uploadAssign", "sm");
                },
            });
        },
        select: function (event, ui) {

        }
    });
    $("#searchStudent").on("click", async function () {
        var selectedRollNumber = $("#studentRollNumberInput").val();
        if (selectedRollNumber) {
            try {
                var isValid = await validateStudentByRollNumber(selectedRollNumber, sectionId);
                if (isValid) {
                    raiseInfoAlert("Roll Number is validated!");
                    $("#btnSubmitAssignment").prop("disabled", false).removeClass("disabled-button");
                } else {
                    raiseErrorAlert("Roll Number not found for this Section.");
                    $("#btnSubmitAssignment").prop("disabled", true).addClass("disabled-button");
                }
            } catch (error) {
                raiseErrorAlert("Select a valid Roll Number.");
            }
        }
    });
});
async function validateStudentByRollNumber(rollNumber, sectionId) {
    var getStudentUrl = apiUrl + `/Students/get_students_by_field/roll_number/${rollNumber}/`;
    try {
        var responseData = await $.ajax({
            type: "GET",
            url: getStudentUrl,
            mode: "cors",
            dataType: "json",
            crossDomain: true,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`,
            },
        });
        for (let i = 0; i < responseData.length; i++) {
            if (responseData[i].section_id === sectionId) {
                $("#student_id").val(responseData[i].student_id);
                return true;
            }
        }
        return false;
    } catch (error) {
        raiseErrorAlert("An error occurred during validation.");
        throw error;
    }
}

async function checkStudentAssignmentSubmission(studentRollNumber, assignmentId) {
    var checkUrl = apiUrl + `/AssignmentSubmission/check_student_assignment_submission/?student_roll_number=${studentRollNumber}&assignment_id=${assignmentId}`;
        const checkResponse = await $.ajax({
            type: "GET",
            url: checkUrl,
            mode: "cors",
            crossDomain: true,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`,
            },
            success :(data)=>{
                console.log(data);
                return true
            },
            error:(data)=>{
                raiseErrorAlert(data.responseJSON.detail)
                return false
            }
        });
}

let assignDocsField = ['studentRollNumberInput', 'assignment_file']
async function uploadAssignment() {
    var assignmentId = $("#assignment_id").val();
    var studentRollNumber = $("#studentRollNumberInput").val();

    const isRollNumberPresent = await checkStudentAssignmentSubmission(studentRollNumber, assignmentId);
    console.log(isRollNumberPresent);

    if (isRollNumberPresent === false) {
        raiseErrorAlert("Roll number already exists for this assignment.");
        return;
    }

    var todayDate = new Date();
    var formattedDate = todayDate.toISOString().split('T')[0];
    var assignmentData = {
        "assignment_id": $("#assignment_id").val(),
        "student_id": $("#student_id").val(),
        "assignment_file": await uploadFile("assignment_file", "student_assignment_document"),
        "submission_date": formattedDate,
        "submission_details": '',
        "is_deleted": false,
    }
    var assignmentSubmitUrl = apiUrl + "/AssignmentSubmission/submit_assignment/";
    await $.ajax({
        type: "POST",
        url: assignmentSubmitUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        data: JSON.stringify(assignmentData),
        beforeSend: (e) => {
            showLoader("assignmentCard", "sm");
        },
        success: (data) => {
            if (data && data.response) {
                var responseData = data.response[0];
                loadAssignmentDetails(responseData.assignment_id);
                $("#student_id").val(' ');
                raiseSuccessAlert(data.msg);
                resetForm(assignDocsField);
                $("#btnSubmitAssignment").prop("disabled", true).addClass("disabled-button");
            }
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: (e) => {
            removeLoader("assignmentCard", "sm");
        },
    });
}

async function loadAssignmentDetails(assignmentId) {
    const assignmentDetailsUrl = apiUrl + "/AssignmentSubmission/get_assignment_submission_by_assignment_id/?assignment_id=" + assignmentId;
    let data;
    data = await $.ajax({
        type: "GET",
        url: assignmentDetailsUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        beforeSend: (e) => {
            showLoader("assignmentCard", "sm");
        },
        data: JSON.stringify(data),
        success: function (responseData) {
            if (responseData && responseData.response && responseData.response.length > 0) {
                $("#assignmentsInfo").empty();
                const response = responseData.response;
                $('#assignmentInfoTable').DataTable().clear().draw();
                response.forEach(assign => {
                    const assignmentFile = assign.assignment_file ? assign.assignment_file.split('/').pop() : '';
                    const row = `<tr id="assignInfoId-${assign.id}">
                                    <td>${assign.students.roll_number}</td>
                                    <td>${assign.students.student_name}</td>
                                    <td>
                                        <a href="/app/azure_download/${assignmentFile}/student_assignment_document/" type="button" class="btn btn-dark btn-label rounded-pill right" data-assinInfo-id=${assign.id}>
                                            <i class="bi bi-download label-icon align-middle fs-lg ms-2"></i>Download
                                        </a>
                                    </td>
                                    <td>${assign.submission_date}</td>
                                    <td class="text-success">Submitted</td>
                                    <td>
                                    <a class="btn btn-sm btn-danger" data-assigninfo-id='${assign.id}' id="assigBtnDelete"><i class="bi bi-trash3"></i></a>
                                    </td>
                                </tr>`;
                    $('#assignmentInfoTable').DataTable().row.add($(row)).draw();
                });
            }
        },
        error: (error) => {
            raiseErrorAlert(error["responseJSON"]["detail"]);
        },
        complete: (e) => {
            removeLoader("assignmentCard", "sm");
        },
    });
}
async function deleteAssignmentSubmission(Id) {
    const deleteAssignInfoUrl = apiUrl + "/AssignmentSubmission/delete_assignment_submission/?assignment_submission_id=" + Id;
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
                url: deleteAssignInfoUrl,
                mode: "cors",
                crossDomain: true,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwtToken}`,
                },
                beforeSend: (e) => {
                    showLoader("assignmentCard", "sm");
                },
                success: async function (data) {
                    const dataTable = $('#assignmentInfoTable').DataTable();
                    const deletedRow = dataTable.row(`#assignInfoId-${Id}`);
                    if (deletedRow) {
                        deletedRow.remove().draw();

                        if (dataTable.rows().count() === 0) {
                            $('#assignmentsInfo').html(`
                                <tr class="no_data_found-tr">
                                    <td colspan="6" class="text-center">
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
                    removeLoader("assignmentCard", "sm");
                },
            });
        }
    });
}