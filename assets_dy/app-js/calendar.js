$(document).ready(function () {
    $("#btnSave").on("click", async (e) => {
        $("#btnSave").removeClass("btn-shake");
        e.preventDefault();
        if (validateForm(fields) === false) {
            $("#btnSave").addClass("btn-shake");
            return false;
        } else {
            await submitaCalenderForm();
        }
    });
    $("#btnSearch").on('click', async (e) => {
        var class_id = $('#class_id').val();
        var section_id = $('#section_id').val();        
        await loadCalendarDetails(class_id,section_id);
    });
    $("#class_id").on("change", function () {
        const selectedClassId = $(this).val();
        getSectionsByClass(selectedClassId, "section_id", 'body');
    });
    $("#form_class_id").on("change", function () {
        const selectedClass = $(this).val();
        getSectionsByClass(selectedClass, 'form_section_id', "calender_details");
    });
    $("#form_class_id").on("change", function () {
        const selectedClassSubject = $(this).val();
        subjectName(selectedClassSubject, 'subject_id');
    });
    initializeClassSelect();
    staffName();
});
async function getSectionsByClass(classId, selectedClass, loaderTarget) {
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
            showLoader(loaderTarget, "sm");
        },
        success: (response) => {
            $(`#${selectedClass}`).empty();
            for (const section of response) {
                $(`#${selectedClass}`).append(`<option value="${section.section_id}">${section.section_name}</option>`);
            }
        },
        error: (error) => {
            raiseErrorAlert(error);
        },
        complete: (e) => {
            removeLoader(loaderTarget, "sm");
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
                $("#form_class_id").append(`<option value="${class_id.class_id}">${class_id.class_name}</option>`);
            }
        },
        error: function (error) {
            raiseErrorAlert(error.responseJSON.detail);
        }
    });
}

let fields = [
    "subject_id", "staff_id", "day", "start_time", "end_time",
    'form_class_id', 'form_section_id'
];

async function submitaCalenderForm() {
    let isUpdate = $("#calender_id").val() !== "";
    var calender_id = $("#calender_id").val();
    var section_id = $('#form_section_id').val();
    var class_id=$('#form_class_id').val();
    const calenderData = {
        "institute_id": instituteId,
        "class_id": $('#form_class_id').val(),
        "section_id": $('#form_section_id').val(),
        "subject_id": $('#subject_id').val(),
        "staff_id": $("#staff_id").val(),
        "day": $("#day").val(),
        "start_time": $("#start_time").val(),
        "end_time": $("#end_time").val(),
    };

    const calenderEndpointurl = isUpdate ? `${apiUrl}/Calender/update_calender/?calender_id=${calender_id}` : `${apiUrl}/Calender/add_calender/`;
    const requestType = isUpdate ? 'PUT' : 'POST';
    const response = await $.ajax({
        type: requestType,
        url: calenderEndpointurl,
        data: JSON.stringify(calenderData),
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: (e) => {
            showLoader("calender_details", "sm");
        },
        success: (data) => {
            $("#calendarmodal").modal("hide");
            if (data && data.response) {
                const responseData = data.response;
                if (isUpdate) {
                    const trSelector = `tr[data-id="${responseData.calender_id}"]`;
                    const tr = $(trSelector);
                    if (tr.length > 0) {
                        for (const key in responseData) {
                            const element = tr.find(`.${key}`);
                            if (element.length > 0) {
                                element.text(responseData[key]);
                            }
                        }
                    }
                }
                $("#calendarmodal").modal("hide");
                $("#calender_id").val("");
                raiseSuccessAlert("Calendar Added Successfully");
                clickRefreshMessage(class_id,section_id);``
            }

        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: (e) => {
            removeLoader("calender_details", "sm");
            resetForm(fields)
        }
    });
}



function subjectName(class_id, selectedClassSubject) {
    const subjecturl = `${apiUrl}/Subjects/get_subjects_by_class/?class_id=${class_id}`;
    $.ajax({
        url: subjecturl,
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        success: (response) => {
            $("#subject_id").empty();
            for (const subject of response) {
                $(`#${selectedClassSubject}`).append(`<option value="${subject.subject_id}">${subject.subject_name}</option>`); // Correct ID here
            }
        },
        error: function (error) {
            raiseErrorAlert(error.responseJSON.detail);
        }
    });
}
function staffName() {
    const staffUrl = `${apiUrl}/Staff/get_staffs_by_institute/?institute_id=${instituteId}`;
    $.ajax({
        url: staffUrl,
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        success: (response) => {
            for (const staff of response) {
                $("#staff_id").append(`<option value="${staff.staff_id}">${staff.staff_name}</option>`);
            }
        },
        error: function (error) {
            raiseErrorAlert(error.responseJSON.detail);
        }
    });
}

async function loadCalendarDetails(class_id, section_id) {
    var searchUrl = `${apiUrl}/Calender/get_calender_by_class&section/?class_id=${class_id}&section_id=${section_id}`;

    try {
        const calendarData = await $.ajax({
            type: 'GET',
            url: searchUrl,
            mode: 'cors',
            crossDomain: true,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
            },
            beforeSend: () => {
                showLoader('calenderTable', 'sm');
            },
            success: function (calendarData) {

                var calendarTable = $('#calenderTable');
                calendarTable.empty();
                var responseData = calendarData.response || calendarData;

                if (!responseData || (responseData.length === 0)) {
                    $('.no_data_found').show();
                    calendarTable.hide();
                    return;
                }

                $('.no_data_found').hide();
                calendarTable.show();
                var data = responseData;
                var className = [...new Set(data.map((item) => item.classes.class_name))];
                var sectionName = [...new Set(data.map((item) => item.sections.section_name))];
                var classSectionRow = $('<tr>');
                classSectionRow.append(
                    `<td colspan="8" class="col" id="column"><center><b>${className} - ${sectionName}</b></center></td>`
                );
                calendarTable.append(classSectionRow);

                var staticHeaderRow = $('<tr class="col">');
                staticHeaderRow.append('<th>Time</th>');
                var daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                daysOfWeek.forEach(day => {
                    staticHeaderRow.append(`<th>${day}</th>`);
                });
                calendarTable.append(staticHeaderRow);

                var timeDayMap = {};
                data.forEach((item) => {
                    var timeKey = `${item.start_time}-${item.end_time}`;
                    if (!timeDayMap[timeKey]) {
                        timeDayMap[timeKey] = {};
                    }
                    timeDayMap[timeKey][item.day] = {
                        subject: item.subjects.subject_name,
                        staff: item.staffs.staff_name,
                        calender_id: item.calender_id
                    };
                });
                for (var timeKey in timeDayMap) {
                    var timeSlotRow = $('<tr class="rowData">');
                    timeSlotRow.append(`<td class="mod" id="tdData">${timeKey}</td>`);
                    daysOfWeek.forEach((day) => {
                        var cellData = timeDayMap[timeKey][day];
                        var cell = $('<td class="editable-cell text-center"></td>');
                        if (cellData && cellData.subject && cellData.staff) {
                            cell.html(`${cellData.subject} <br> (${cellData.staff})`);
                            cell.attr('data-id', cellData.calender_id);
                            cell.on('click', function () {
                                openEditForm(cellData);
                            });
                        }
                        timeSlotRow.append(cell);
                    });
                    calendarTable.append(timeSlotRow);
                }
            }
        });
    } catch (error) {
        $('.no_data_found').show();
        raiseErrorAlert(error.message || 'An error occurred.');
    } finally {
        removeLoader('calenderTable', 'sm');
    }
}


function clickRefreshMessage(classId, sectionId) {
    const refreshMessage = `
        <div class="refresh-message-container">
            To see the updated Calendar for class, kindly refresh.
            <a href="#" class="alert-link">
                <i class="bi bi-arrow-clockwise"></i>
            </a>
        </div>
    `;

    $("#calenderTable").before(refreshMessage);
    $(".refresh-message-container a.alert-link").on("click", function() {
        loadCalendarDetails(classId, sectionId);
        $(this).closest(".refresh-message-container").hide();
    });
}

async function openEditForm(cellData) {
    const calenderId = cellData && cellData.calender_id ? cellData.calender_id : '';
    const fetchUrl = `${apiUrl}/Calender/get_calender_by_id/?calender_id=${calenderId}`;
    $.ajax({
        type: 'GET',
        url: fetchUrl,
        headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
        },
        contentType: 'application/json',
        dataType: 'json',
        success: function (data) {
            if (data && data.response && data.response.length > 0) {
                const responseData = data.response[0];
                const classId = responseData.class_id;
                getSectionsByClass(classId, "form_section_id");
                subjectName(classId, 'subject_id');
                $('#calender_id').val(responseData.calender_id);
                $('#form_class_id').val(classId);
                $('#staff_id').val(responseData.staff_id);
                $('#day').val(responseData.day);
                $('#start_time').val(responseData.start_time);
                $('#end_time').val(responseData.end_time);
                $('#calendarmodal').modal('show');
            }
        },
        error: function (xhr, status, error) {
            raiseErrorAlert(xhr.responseJSON.detail);
        },
    });
}


