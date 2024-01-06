$(document).ready(function () {
    $('#gradeTable').on('click', '.dltBtn', async function () {
        var gradeId = $(this).attr("data-id");
        await deleteGrade(gradeId);
    });

    $('#gradeTable').on('click', '.btnGradeEdit', async function () {
        const gradeId = $(this).data("id");
        if (gradeId) {
        await  editGrade(gradeId);
        }
    });

    $("#btnSaveGrade").on("click", async (e) => {
        $("#btnSaveGrade").removeClass("btn-shake")
        e.preventDefault();
        if (validateGradeForm() === false) {
            $("#btnSaveGrade").addClass("btn-shake");
            return false;
        } else {
            await gradeSubmitForm();
        }
    });
});

async function deleteGrade(gradeId) {
    const gradeRow = `.tr-grade-${gradeId}`;
    // confirm alert
    await Swal.fire({
        title: 'Are you sure, you want to delete this Grade?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            $(gradeRow).remove();
            const endpoint = `/Grades/delete_grade/?grade_id=${gradeId}`;
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
                    showLoader("body", "lg");
                },
                success: (response) => {
                    checkNoRecords();
                    raiseSuccessAlert('Grade Deleted Successfully');
                },
                error: (error) => {
                    raiseErrorAlert(error.responseJSON.detail);
                },
                complete: (e) => {
                    removeLoader("body", "lg");
                }
            });
        }
    });
}

async function checkNoRecords() {
    var rowCount = $('#grade_details tr').length;
    if (rowCount <= 0) {
        $("#grade_details").html(
            `<tr class="no_data_found-tr">
                <td colspan="7" class="text-center">
                    <img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">
                </td>
            </tr>`
        );
    }
}

let fields = [
    'grade_name', 'percent_from', 'percent_upto', 'class_id',
];

function validateGradeForm() {
    var minPercentage = parseFloat($("#percent_from").val());
    var maxPercentage = parseFloat($("#percent_upto").val());
    var isValid = true;
    // const fields = ["percent_from", "percent_upto", "grade_name"];
    for (const field of fields) {
        const element = $(`#${field}`);
        const value = element.val().trim();
        if (value === "") {
            element.focus().addClass("is-invalid");
            isValid = false;
        }
    }
    if (!isNaN(minPercentage) && !isNaN(maxPercentage)) {
        if (!(0 <= minPercentage && minPercentage <= 100) || !(0 <= maxPercentage && maxPercentage <= 100)) {
            raiseErrorAlert("Percentage should be between 0 to 100");
            isValid = false;
        }
    } else {
        raiseErrorAlert("Invalid percentage values");
        isValid = false;
    }
    if (parseFloat($("#percent_from").val()) >= parseFloat($("#percent_upto").val())) {
        raiseErrorAlert("Minimum Percentage should be less than Maximum Percentage");
        isValid = false;
    }
    return isValid;
}

async function gradeSubmitForm() {
    let isEdit = $("#grade_id").val() !== "";
    const gradeId = $("#grade_id").val(); 
    var selectedClassText = $("#class_id option:selected").text();
    const gradeData = {
        "institute_id": instituteId,
        "grade_id": gradeId, // Fix: Use gradeId instead of responseData.grade_id
        "grade_name": $("#grade_name").val(),
        "percent_from": $("#percent_from").val(),
        "percent_upto": $("#percent_upto").val(),
        "class_id": $("#class_id").val(),
        "is_deleted": false,
    }; 
    const gradeEndPoint = isEdit ? `/Grades/update_grade/?grade_id=${gradeId}` : `/Grades/create_grade/`;
    const gradeUrl = `${apiUrl}${gradeEndPoint}`;
    const method = isEdit ? "PUT" : "POST";
    $.ajax({
        type: method,
        url: gradeUrl,
        data: JSON.stringify(gradeData),
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: (e) => {
            showLoader("gradeFormArea", "sm");
        },
        success: function (data) {
            $("#addeditGradeModal").modal("hide");
            if (isEdit) {
                var gradeData = data.response;
                const tr = $(`.tr-grade-${gradeData.grade_id}`);
                tr.find(".grade_name").text(gradeData.grade_name);
                tr.find(".percentage").text(`${gradeData.percent_from}% - ${gradeData.percent_upto}%`);
                tr.find(".class_id").text(selectedClassText);
                $('#addeditGradeModal').removeClass("model fade"); 
                raiseSuccessAlert("Grade Updated Successfully");
            } else {
                $("#grade_details").find(".no_data_found-tr").remove();
                const responseData = data.response; 
                const newGradeRow = `
                    <tr class="tr-grade-${responseData.grade_id}">
                        <td class="grade_name">${responseData.grade_name}</td>
                        <td class="percentage">${responseData.percent_from}% - ${responseData.percent_upto}%</td>
                        <td class="class_id">${selectedClassText}</td>
                        <td>
                            <button type="button" data-id="${responseData.grade_id}" class="btn btn-sm btn-info btnGradeEdit" id="btnGradeEdit"><i class="bi bi-pencil-square"></i></button>
                            <a href="#" data-id="${responseData.grade_id}" class="dltBtn btn btn-sm btn-danger"><i class="bi bi-trash3"></i></a>
                        </td>
                    </tr>`;
                $("#grade_details").append(newGradeRow);
                raiseSuccessAlert("Grade Added Successfully");
            }
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: (e) => {
            removeLoader("gradeFormArea", "sm");
            resetForm(fields);
        }
    });
}

async function editGrade(gradeId) {
    const fetchUrl = `${apiUrl}/Grades/get_grade_by_id/?grade_id=${gradeId}`;
    $.ajax({
        type: "GET",
        url: fetchUrl,
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        beforeSend: (e) => {
            showLoader("body", "lg");
        },
        success: function (data) {
            if (data) {
                const responseData = data;
                $("#grade_id").val(responseData.grade_id);
                $("#grade_name").val(responseData.grade_name);
                $("#percent_from").val(responseData.percent_from);
                $("#percent_upto").val(responseData.percent_upto);
                $("#class_id").val(responseData.class_id);
                $('#addeditGradeModal').modal('show');
            }
        },
        error: function(error){
            raiseErrorAlert('Error fetching grade details.');
        },
        complete: (e) => {
            removeLoader("body", "lg");
        }
    })
}