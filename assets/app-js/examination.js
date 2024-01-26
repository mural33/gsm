$(document).ready(function () {
    $("#examTable").DataTable()
    $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`)
    $("#btnSaveExam").on("click", async (e) => {
        $("#btnSaveExam").removeClass("btn-shake");
        e.preventDefault();
        if (validateExamForm() === false) {
            $("#btnSaveExam").addClass("btn-shake");
            return false;
        } else {
            await addParentExam();
        }
    });
    $("#class_id").on("change", async function() {
        const selectedClassId = $(this).val();
        if (selectedClassId) {
            var selectedOptions = $(this).find(`option[value="${selectedClassId}"]`);
            var ExampromotionType = selectedOptions.data("promotion");
            var ExamtotalPromotions = selectedOptions.data("total_number_of_promotion"); 
            loadSemisterOrYear(ExamtotalPromotions, ExampromotionType, "semister_id");
        }
    });
    
    $("#semister_id").on("change", async function() {
        const selectedSemesterId = $(this).val();
        const selectedClassId = $("#class_id").val();
        if (selectedSemesterId && selectedClassId) {
            await fetchSubjectsAndFullMarks(selectedClassId, selectedSemesterId);
        }
    });
    $("#filter_class_id").on("change", function () {
        const filterClassId = $(this).val();
            if (filterClassId) {
                var selectedOptions = $(this).find(`option[value="${filterClassId}"]`);
                var exampromotionType = selectedOptions.data("promotion");
                console.log(exampromotionType)
                var examtotalPromotions = selectedOptions.data("total_number_of_promotion");
                console.log(examtotalPromotions)
                loadSemisterOrYear(examtotalPromotions, exampromotionType, "filter_semister_id");
            }
    });
    
    $('#examTable').on('click', '.btnEditExam', async function () { 
        const parentExamId = $(this).data('id');
        const $row = $(this).closest('tr');
        let start_date, end_date;
    
        // Check if the start and end dates are within span elements
        const $startDateSpan = $row.find('.start_date');
        const $endDateSpan = $row.find('.end_date');
    
        if ($startDateSpan.length && $endDateSpan.length) {
            start_date = $startDateSpan.data('date');
            end_date = $endDateSpan.data('date');
        } else {
            // If not within span elements, assume they are directly within the td
            const dateRangeText = $row.find('.sorting_1').text();
            [start_date, end_date] = dateRangeText.split(' - ');
        }
    
        const resultDate = $row.find('.result_date').text();
        const examName = $row.find('.parent_exam_name').text();
        const classId = $row.find('.class_id').attr("data-class-id");
        $('#parent_exam_id').val(parentExamId);
        $('#start_date').val(start_date);
        $('#end_date').val(end_date);
        $('#result_date').val(resultDate);
        $('#parent_exam_name').val(examName);
        $('#class_id').val(classId).prop('disabled', true);
        $('#addeditExamModal').modal('show');
        editChildExam(parentExamId);
    });
    

    $('#examTable').on('click', '.btndelete', async function () {
        var examId = $(this).attr("data-id");
        await deleteExamination(examId);
    });
    initializeClassSelect();
    $('#btnFilterExam').on('click',filterExamination);
});



function validateExamForm() {
    var isValid = true;
    const fields = ["start_date", "end_date", "result_date", "parent_exam_name", "subject_Input"];
    for (const field of fields) {
        const element = $(`#${field}`);
        const value = element.val();
        if (value === "") {
            element.focus().addClass("is-invalid");
            isValid = false;
        }
    }
    const todayDate = new Date().toISOString().split('T')[0];
    if ($("#start_date").val() <= todayDate) {
        raiseErrorAlert("Start Date must be greater than today's date");
        isValid = false;
    }
    if ($("#start_date").val() > $("#end_date").val() && $("#result_date")) {
        raiseErrorAlert("Start Date can not be greater than End Date and Result Date");
        isValid = false;
    }
    if ($("#end_date").val() > $("#result_date").val()) {
        raiseErrorAlert("End Date must be less than Result Date");
        isValid = false;
    }
    return isValid;
}


function resetExamForm() {
    const fields = ["start_date", "end_date", "result_date", "parent_exam_name", "class_id","semister_id"];
    for (const field of fields) {
        const element = $(`#${field}`);
        if (element.length > 0) {
            element.val("");
            element.removeClass("is-invalid");
        }
    }
}
function resetAttendanceForm() {
    const fields = ["class_id", "attendance_dates"];
    for (const field of fields) {
        const element = $(`#${field}`);
        element.val("");  // Clear the value
        element.removeClass("is-invalid");  // Remove any error styling
    }
}


async function addParentExam() {
    let editExams = $("#parent_exam_id").val() !== "";
    classesId = $("#class_id").val();
    $('#class_id').prop('disabled', false);
    const data = {
        institute_id: instituteId,
        class_id: classesId,
        parent_exam_id: $("#parent_exam_id").val(),
        parent_exam_name: $("#parent_exam_name").val(),
        start_date: $("#start_date").val(),
        end_date: $("#end_date").val(),
        result_date: $("#result_date").val(),
        is_deleted: false,
    };
    const parentExamUrl = editExams ? apiUrl + "/ParentExams/update_parent_exam?parent_exam_id=" + data.parent_exam_id : apiUrl + "/ParentExams/create_parent_exam";
    const requestsType = editExams ? "PUT" : "POST";
    await $.ajax({
        type: requestsType,
        url: parentExamUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        beforeSend: (e) => {
            showLoader("ExamFormArea", "sm");
        },
        data: JSON.stringify(data),
        success: async function (data) {
            if (data) {
                $("#addeditExamModal").modal("hide");
                const responseData = data["response"];
                if (editExams) {
                    let rows = document.querySelectorAll('.subjectRow');
                    rows.forEach(element => {
                        var subjectId = element.querySelector(".sublabel").getAttribute("data-subjects-id")
                        var fullMarksValue = element.querySelector(".fullMarks").value;
                        var examId = element.querySelector(".fullMarks").getAttribute("data-child-id")
                        updateChildExams(examId, responseData.parent_exam_id, subjectId, fullMarksValue);
                    })                    
                    const existingRow = $("tr[data-exams-id='" + responseData.parent_exam_id + "']");

                    if (existingRow.length) {
                        existingRow.find('td:eq(0)').html(`
                            <span class="start_date" data-date="${responseData.start_date}" data-start-date="${responseData.start_date}">
                                ${responseData.start_date}
                            </span> - 
                            <span class="end_date" data-date="${responseData.end_date}" data-exam-enddate="${responseData.end_date}">
                                ${responseData.end_date}
                            </span>
                        `);
                        existingRow.find('td:eq(1)').html(`
                            <a href="/app/examinationInfo/${responseData.parent_exam_slug}">
                                ${responseData.parent_exam_name}
                            </a>
                        `);
                        existingRow.find('td:eq(2)').text(responseData.result_date);
                        existingRow.find('td:eq(3)').text(`${responseData.classes.class_name}`);
                    }
                    raiseSuccessAlert("Examination Updated Successfully");
                    $("#parent_exam_id").val("");
                    
                } else {
                    var tableBody = $('#examination_details');
                    var noDataImage = tableBody.find('.no_data_found-tr');
                    if (noDataImage.length > 0) {
                        noDataImage.remove();
                    }
                    addChildExams(responseData.parent_exam_id);
                    const examNewRow = `
                    <tr class="tr-exam-${responseData.parent_exam_id} exam-row" data-exams-id="${responseData.parent_exam_id}" data-start-date="${responseData.start_date}" data-exam-enddate="${responseData.end_date}" data-exam-class="${responseData.class_id}">
                    <td class="text-break">
                        <span class="start_date" data-date="${responseData.start_date}" data-start-date="${responseData.start_date}">${responseData.start_date}</span> - 
                        <span class="end_date" data-date="${responseData.end_date}" data-exam-enddate="${responseData.end_date}">${responseData.end_date}</span>
                    </td>
                    <td class="text-break parent_exam_name">
                    <a href="/app/examinationInfo/${responseData.parent_exam_slug}">${responseData.parent_exam_name}</a>
                </td>
                
                    <td class="result_date">${responseData.result_date}</td>
                    <td class=" text-break class_id" data-class-id="${responseData.class_id}" data-exam-class="${responseData.class_id}" data-promotion='${responseData.promotion_type}'
                    data-total_number_of_promotion='${responseData.total_number_of_promotion}'>${responseData.classes.class_name}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-info btnEditExam" data-id="${responseData.parent_exam_id}">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button type="button" class="btndelete btn btn-sm btn-danger" id="btndelete" data-id="${responseData.parent_exam_id}">
                        <i class="bi bi-trash3"></i>
                    </button>
                    </td>
                </tr>`
                    $('#examTable').DataTable().row.add($(examNewRow)).draw();
                    raiseSuccessAlert("Examination Added Successfully.");
                }
                resetExamForm();
            }
        },
        error: (error) => {
            raiseErrorAlert(error["responseJSON"]["detail"]);
        },
        complete: (e) => {
            removeLoader("ExamFormArea", "sm");
        },
    });
}
async function addChildExams(parentExamsId) {
    const examUrl = apiUrl + "/Exams/create_bulk_exam/";
    let subjects = document.querySelectorAll(".sublabel");
    let fullmarksList = document.querySelectorAll(".fullMarks");
    let subjects_data = [];

    subjects.forEach((element, index) => {
        let subjectId = element.dataset.subjectsId;
        let fullmarks = fullmarksList[index].value;

        subjects_data.push({
            full_marks: fullmarks,
            subject_id: subjectId,
            parent_exam_id: parentExamsId,
            is_deleted: false,
        });
    });
    await $.ajax({
        type: "POST",
        url: examUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        beforeSend: (e) => {
            showLoader("ExamFormArea", "sm");
        },
        data: JSON.stringify(subjects_data),
        success: (examsData) => {
        },
        complete: (e) => {
            removeLoader("ExamFormArea", "sm");
            resetSubjectsTable()
        },
    });
}
async function updateChildExams(examId, parentExamsId, subjectId, fullMarksValue) {
    const editChildExam = apiUrl + "/Exams/update_exam/?exam_id=" + examId;
    const updatedChildExamData = {
        "parent_exam_id": parentExamsId,
        "subject_id": subjectId,
        "full_marks": fullMarksValue,
        "is_deleted": false,
    };
    await $.ajax({
        type: "PUT",
        url: editChildExam,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        beforeSend: (e) => {
            showLoader("ExamFormArea", "sm");
        },
        data: JSON.stringify(updatedChildExamData),
        success: (childData) => {
        },
        complete: (e) => {
            removeLoader("ExamFormArea", "sm");
            resetSubjectsTable()

        },
    });
}

function initializeClassSelect() {
    const classurl = `${apiUrl}/Classes/get_classes_by_institute/?institite_id=${instituteId}`;
    try {
        $.ajax({
            url: classurl,
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            success: (response) => {
                for (const class_id of response) {
                    $("#class_id").append(`<option value="${class_id.class_id}" data-promotion='${class_id.promotion_type}' data-total_number_of_promotion='${class_id.total_number_of_promotion}'>${class_id.class_name}</option>`);
                    $("#filter_class_id").append(`<option value="${class_id.class_id}"  data-promotion='${class_id.promotion_type}' data-total_number_of_promotion='${class_id.total_number_of_promotion}'>${class_id.class_name}</option>`);
                }
            },
            error: function (error) {
                raiseErrorAlert(error.responseJSON.detail);
            },
        });
    } catch (error) {
        console.error("Error in initializeClassSelect:", error);
    }
}

async function  loadSemisterOrYear(examdDurationTime, exampromotionType, examtnpId) {
    var examtnp = $(`#${examtnpId}`);
    var ExamlabelElement = $("label[for='" + examtnpId + "']");

    var exampromotionTypeMap = {
        "semister_vise": "Semester",
        "year_vise": "Year",
    };

    if (exampromotionTypeMap[exampromotionType] === undefined) {
        examtnp.html("");
        ExamlabelElement.text("Semester/Year");
        examtnp.append(`<option value="">Not Applicable</option>`);
        return;
    }

    console.log("Label Element:", ExamlabelElement);
    ExamlabelElement.text(exampromotionTypeMap[exampromotionType]);

    examtnp.html("");
    examtnp.append(`<option value="">All ${exampromotionTypeMap[exampromotionType]}</option>`);

    for (let index = 0; index < examdDurationTime; index++) {
        var option = `<option value="${index + 1}">${index + 1} ${exampromotionTypeMap[exampromotionType]}</option>`;
        examtnp.append(option);
    }

    console.log("Label Content:", ExamlabelElement);
}




function fetchSubjectsAndFullMarks(classId) {
    const subjectUrl = `${apiUrl}/Subjects/get_subjects_by_class/?class_id=${classId}`;
    const responsePromise = $.ajax({
        url: subjectUrl,
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        beforeSend: (e) => {
            showLoader("ExamFormArea", "sm");

        },
        success: (response) => {
            const subjectsTable = $("#subjects");
            subjectsTable.empty();
            const tableStructure = `
                <table id="subjects">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Full Marks</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            `;
            subjectsTable.append(tableStructure);

            const tableBody = $("#subjects tbody");

            for (const subjectData of response) {
                $("#subject_id").append(`<option value="${subjectData.subject_id}">${subjectData.subject_name}</option>`);

                const newRow = `
                    <tr class="subjectRow" id="subjectnameRow-${subjectData.subject_id}" }>
                        <td class="sublabel" id="subjectsId" name="subject_id" data-subjects-id="${subjectData.subject_id}" value="${subjectData.subject_id}">${subjectData.subject_name}</td>
                        <td><input type="text" class="form-control fullMarks" id="subject_Input" value="100"></td>
                        <td>
                        <button type="button" class="btndelete btn btn-sm btn-danger" onclick="removeSubjects(this)" data-subject-id="${subjectData.subject_id}">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </td>
                    
                    </tr>
                `;

                tableBody.append(newRow);
            }
        },
        error: (response) => {
            raiseErrorAlert(response.responseJSON.detail);
        },
        complete: (e) => {
            removeLoader("ExamFormArea", "sm")

        }
    });
}


async function deleteExamination(examId) {
    const dataTable = $('#examTable').DataTable();
    const examRowId = dataTable.row(`.tr-exam-${examId}`);
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
            examRowId.remove().draw();
            const deleteExamUrl = `${apiUrl}/ParentExams/delete_parent_exam?parent_exam_id=${examId}`;
            await $.ajax({
                type: 'DELETE',
                url: deleteExamUrl,
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
                    if (dataTable.rows().count() === 0) {
                        $('#examination_details').html(`
                            <tr class="no_data_found-tr" id="no_data_found">
                                <td colspan="7" class="text-center">
                                    <img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found" id="no_data_found">
                                </td>
                            </tr>
                        `)
                    }
                    raiseSuccessAlert("Examination Deleted Successfully");
                },
                error: (error) => {
                    raiseErrorAlert(error);
                },
                complete: (e) => {
                    removeLoader("body", "sm");
                    resetSubjectsTable();
                }
            });
        }
    });
}



async function editChildExam(parentExamId) {
    const editChildExamUrl = `${apiUrl}/Exams/get_exam_by_parent_exam_id/?parent_exam_id=${parentExamId}`;
    const childExamData = await $.ajax({
        type: "GET",
        url: editChildExamUrl,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        beforeSend: (e) => {
            showLoader("body", "sm");
        },
        success: function (data) {
            const subjectsTable = $("#subjects");
            subjectsTable.empty();
            const tableStructure = `
                    <table id="subjects">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Full Marks</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                `;
            subjectsTable.append(tableStructure);

            const tableBody = $("#subjects tbody");

            for (const subjectData of data.response) {
                $("#subject_id").append(`<option value="${subjectData.subject_id}">${subjectData.subject_name}</option>`);
                const newRow = `
                        <tr class="subjectRow" id="subjectnameRow-${subjectData.subject_id}">
                            <td class="sublabel" id="subjectsId" name="subject_id" data-subjects-id="${subjectData.subject_id}" value="${subjectData.subject_id}">${subjectData.subject.subject_name}</td>
                            <td><input type="text" class="form-control fullMarks" id="subject_Input" data-child-id=${subjectData.exam_id} value="${subjectData.full_marks}"></td>
                            <td>
                            <button type="button" class="btndelete btn btn-sm btn-danger" onclick="removeSubjects(this)" data-subject-id="${subjectData.subject_id}">
                                <i class="bi bi-trash3"></i>
                            </button>
                        </td>
                        
                        </tr>
                    `;

                tableBody.append(newRow);
            }
            $("#addeditExamModal").modal("show");
            $("#addeditExamModal .modal-title").text("Edit Examination");
        },
        error: function (xhr, status, error) {
            raiseErrorAlert(xhr.responseJSON.detail);
        },
        complete: (e) => {
            removeLoader("body", "sm");
        },
    });
}

function removeSubjects(element) {

    var subjectId = $(element).data("subject-id");
    $(`#subjectnameRow-${subjectId}`).remove();
}


function resetSubjectsTable() {
    const subjectTable = $("#subjects");
    subjectTable.empty();

}


async function filterExamination() {
    const examTable = $("#examTable").DataTable();
    const startdate = $('#startdate').val();
    const enddate = $('#enddate').val();
    const selectedClass = $('#filter_class_id').val();
    const selectedPromotions = $('#filter_semister_id').val();
    console.log(selectedPromotions)

    DataTable.ext.search = [];
    DataTable.ext.search.push(function (settings, data, dataIndex) {
        let row = examTable.row(dataIndex).nodes().to$();
        let filterexamclass = parseInt(selectedClass);
        let filterStartDate = new Date(startdate); 
        let filterEndDate = new Date(enddate);
        let filterPromotions = parseInt(selectedPromotions); // Convert to integer for comparison
        console.log(filterPromotions)

        let examclass = parseInt(row.find(".class_id").data("exam-class"));
        let examstartdate = new Date(row.find(".start_date").data("start-date"));
        let examenddate = new Date(row.find(".end_date").data('exam-enddate'));
        let examPromotions = 2
        console.log("Exam Promotions Data:", examPromotions);

        $("#examinationFilter").modal("hide");

        if (
            (isNaN(filterexamclass) || filterexamclass === examclass) &&
            (isNaN(filterStartDate) || filterStartDate <= examstartdate) &&
            (isNaN(filterEndDate) || filterEndDate >= examenddate) &&
            (isNaN(filterPromotions) || filterPromotions === examPromotions)
        ) {
            return true;
        } else {
            return false;
        }
    });

    examTable.draw();

    resetFillterForm();
}




function resetFillterForm() {
    const fields = ["startdate", "enddate","filter_class_id"];
    for (const field of fields) {
        const element = $(`#${field}`);
        if (element.length > 0) {
            element.val("");
            element.removeClass("is-invalid");
        }
    }
}

