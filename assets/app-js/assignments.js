
$(document).ready(() => {
    const dataTable = $('#assignmentTable').DataTable();
    $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`)
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
    
        if (selectedClassId) {
            var selectedOptions = $(this).find(`option[value="${selectedClassId}"]`);
            var promotionTypes = selectedOptions.data("promotion");
            var totalPromotions = selectedOptions.data("total_number_of_promotion");
            loadSemYear(totalPromotions, promotionTypes, "semister");
            getSectionsByClass(selectedClassId, "section_id", function () {
            });
        }
    });
    
    
    initializeClassSelect();
    $('#btnFilterAssignment').on('click', filterAssignment);

    $("#filter_class_id").on("change", function () {
        const filterClassId = $(this).val();
            if (filterClassId) {
                var selectedOption = $(this).find(`option[value="${filterClassId}"]`);
                var promotionType = selectedOption.data("promotion");
                var totalPromotions = selectedOption.data("total_number_of_promotion");
                getSectionsByClass(filterClassId, "filter_section_id", function () {
                    loadSemYear(totalPromotions, promotionType, "filter_semister_id");
                });
            }
    });

    $('#assignmentTable').on('click', '.openAssignmentBtn', function () {
        var assignmentId = $(this).data('id');
        var assignmentDescription = $(this).data('description');
        $('#assignment-view-modal #assignment-modal-body').html(`${assignmentDescription}`);
        $('#assignment-view-modal').modal('show');
    });

    async function getSectionsByClass(classId, filterClassId, callback) {
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
                $(`#${filterClassId}`).empty();
                $(`#${filterClassId}`).append(`<option value="">Select Section</option>`);
                for (const section of response) {
                    $(`#${filterClassId}`).append(`<option value="${section.section_id}">${section.section_name}</option>`);
                }
                if (typeof callback === 'function') {
                    callback();
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
                for (const classData of response) {
                    $("#class_id").append(`<option value="${classData.class_id}" data-promotion='${classData.promotion_type}' data-total_number_of_promotion='${classData.total_number_of_promotion}'>${classData.class_name}</option>`);
                    $("#filter_class_id").append(`<option value="${classData.class_id}"  data-promotion='${classData.promotion_type}' data-total_number_of_promotion='${classData.total_number_of_promotion}'>${classData.class_name}</option>`);
                }
            },
            error: function (error) {
                raiseErrorAlert(error.responseJSON);
            }
        });
    }
    

    async function loadSemYear(durationTime, promotionType, tnpId, current) {
        console.log("current", current);
        var tnp = $(`#${tnpId}`);
        var labelElement = $("label[for='" + tnpId + "']");
        var promotionTypeMap = {
            "semister_vise": "Semester",
            "year_vise": "Year",
        };
    
        if (promotionTypeMap[promotionType] === undefined) {
            tnp.html("");
            labelElement.text("Semester/Year");
            tnp.append(`<option value="">Not Applicable</option>`);
            return;
        }
        labelElement.text(promotionTypeMap[promotionType]);
    
        tnp.html("");
        tnp.append(`<option value="">All ${promotionTypeMap[promotionType]}</option>`);
    
        // Adjust the loop to start from 1 if your semesters start from 1
        for (let index = 1; index <= durationTime; index++) {
            if (current && current === index) {
                var option = `<option value="${index}" selected>${index} ${promotionTypeMap[promotionType]}</option>`;
            } else {
                var option = `<option value="${index}">${index} ${promotionTypeMap[promotionType]}</option>`;
            }
            tnp.append(option);
        }
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
            "semistor": parseInt($("#semister").val()),

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
                        var NopromotionType = responseData.classes.promotion_type;
                        var NosemesterText = "";
                        if (NopromotionType === 'year_vise') {
                            NosemesterText = `${responseData.semistor} Year`;
                        } else if (NopromotionType === 'course_vise') {
                            NosemesterText =`${responseData.semistor}  Course`;
                        } else if (NopromotionType === 'semister_vise') {
                            NosemesterText = `${responseData.semistor} Semester`;
                        } 
                        const tr = dataTable.row($(`.tr-assign-${responseData.id}`)).node();
                        dataTable.cell(tr, 1).data(`<a href=/app/assignmentinfo/${responseData.assignment_slug}>${responseData.assignment_title}</a>`);
                        dataTable.cell(tr, 2).data(
                            `<span class="class_id" data-class='${responseData.class_id}'>${responseData.classes.class_name}</span>-` +
                            `<span class="section_id" data-section='${responseData.section_id}'>${responseData.sections.section_name}</span>`
                        );
                        dataTable.cell(tr, 3).data(responseData.assignment_Date);
                        dataTable.cell(tr, 4).data(responseData.assignment_due_date);
                        dataTable.cell(tr, 5).data(
                            `<span class="semister" data-promotions="${responseData.promotion_type}" data-total_number_of_promotion="${responseData.total_number_of_promotion}">${NosemesterText}</span>`
                        );
                        $(`.tr-assign-${responseData.id}`).find(".openAssignmentBtn").attr("data-description", responseData.assignment_details);
                        $("#assignment_id").val("");
                        $('#assignmentModal').addClass("model fade");
                        raiseSuccessAlert("Assignment Updated Successfully");
                    } else {
                        var promotionType = responseData.classes.promotion_type;
                        var semesterText = "";
                        if (promotionType === 'year_vise') {
                            semesterText = `${responseData.semistor} Year`;
                        } else if (promotionType === 'course_vise') {
                            semesterText =`${responseData.semistor}  Course`;
                        } else if (promotionType === 'semister_vise') {
                            semesterText = `${responseData.semistor} Semester`;
                        } 
                        const newRow = `
                    <tr class="tr-assign-${responseData.id} assignment-row">
                    <td>${$("#assignments_info tr").length + 1}</td>
                    <td class="text-break assignment_title"><a href=/app/assignmentinfo/${responseData.assignment_slug}>${responseData.assignment_title}</a></td>
                    <td class="text-break">
                        <span class="class_id" data-class='${responseData.class_id}'>${responseData.classes.class_name}</span>-
                        <span class="section_id" data-section='${responseData.section_id}'>${responseData.sections.section_name}</span>
                    </td>
                        <td class="assignment_Date">${responseData.assignment_Date}</td>
                        <td class="assignment_due_date">${responseData.assignment_due_date}</td>
                        <td class="semister" data-promotions='${responseData.promotion_type}}' data-total_number_of_promotion='${responseData.total_number_of_promotion}'>${semesterText}</td>
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
                        dataTable.row.add($(newRow)).draw();
                        raiseSuccessAlert(data.msg);
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
            success: async (data) => {
                if (data && data.assignment_details) {
                    var responseData = data;
                    console.log("im in if",data);
                    $('#assignmentModal').modal('show');
                    $("#assignment_id").val(responseData.id);
                    $("#class_id").val(responseData.class_id);
                    getSectionsByClass(responseData.class_id, "section_id", function () {
                        $("#section_id").val(responseData.section_id);
                    });
                    $("#assignment_details").val(responseData.assignment_details);
                    $("#assignment_Date").val(responseData.assignment_Date);
                    $("#assignment_title").val(responseData.assignment_title);
                    var PromotionType = responseData.classes.promotion_type;
                    var tnp = responseData.classes.total_number_of_promotion
                    console.log("PromotionType",PromotionType)
                    console.log('total numberof promotions',tnp)
                    var semesterWise = "";
                    if (PromotionType === 'year_vise') {
                        semesterWise = `${responseData.semistor} Year`;
                    } else if (PromotionType === 'course_vise') {
                        semesterWise = `${responseData.semistor} Empty`;
                    } else if (PromotionType === 'semister_vise') {
                        semesterWise = `${responseData.semistor} Semester`;
                    }   
                    loadSemYear(tnp, PromotionType, "semister",responseData.semistor,semesterWise);
                    $("#assignment_due_date").val(responseData.assignment_due_date);
                }
            },
            error: function (xhr, status, error) {
                raiseErrorAlert(error.responseJSON.detail);
            }
        });
    }
    

    async function deleteAssignment(assignmentId) {
        const assignmentRow = dataTable.row(`.tr-assign-${assignmentId}`);
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
                        if (assignmentRow) {
                            assignmentRow.remove().draw();
                            if (dataTable.rows().count() === 0) {
                                $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`)
                            }
                        }
                        raiseSuccessAlert(response.msg);
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
});



function filterAssignment() {
    const assignmentTable = $("#assignmentTable").DataTable();
    const filterClassIds = $('#filter_class_id').val();
    const filterSectionIds = $('#filter_section_id').val();
    const filterSemesterId = $('#filter_semister_id').val();
    DataTable.ext.search = [];
    DataTable.ext.search.push(function (settings, data, dataIndex) {
        var filterClass = parseInt(filterClassIds);
        var filterSection = parseInt(filterSectionIds);
        var filterSemester = parseInt(filterSemesterId);
        let row = assignmentTable.row(dataIndex).nodes().to$();
        let classData = parseInt(row.find(".class_id").data("class"));
        let sectionData = parseInt(row.find(".section_id").data("section"));
        let semesterData = parseInt(row.find(".semister").text());
        $("#assignmentFilter").modal("hide");
        if (
            (isNaN(filterClass) || filterClass === classData) &&
            (isNaN(filterSection) || filterSection === sectionData) &&
            (isNaN(filterSemester) || filterSemester === semesterData)
        ) {
            return true;
        } else {
            return false; 
        }
    });

    assignmentTable.draw();
    if (assignmentTable.rows({ search: 'applied' }).count() === 0) {
        $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`)
    } else {
        $(".dataTables_empty").empty();
    }
    resetFillterForm();
}

function resetFillterForm() {
    const fields = ["filter_class_id", "filter_section_id","filter_semister_id"];
    for (const field of fields) {
        const element = $(`#${field}`);
        if (element.length > 0) {
            element.val("");
            element.removeClass("is-invalid");
        }
    }
}


