$(document).ready(function () {
    $("#btnSave").on("click", async (e) => {
        $("#btnSave").removeClass("btn-shake");
        e.preventDefault();
        if (validateCalenderForm() === false) {
            $("#btnSave").addClass("btn-shake");
            return false;
        } else {
            await submitaCalenderForm();
        }
    });
    $('#calendarPrintView').prop('disabled', true);
    $("#btnSearch").on('click', async (e) => {
        var class_id = $('#class_id').val();
        var section_id = $('#section_id').val();
        await loadCalendarDetails(class_id, section_id);
        const classSelected = class_id !== '';
        const sectionSelected = section_id !== '';
        $('#calendarPrintView').prop('disabled', !(classSelected && sectionSelected));
    });
    $('#calendarPrintView').on('click', function () {
        window.print();
    });
    $(".btnCloseEditModel").on("click", function (e) {
        const parentModel = $(this).closest(".modal");
        console.log(parentModel);
        parentModel.modal("hide");
        $("input, textarea, select", parentModel).val("");
        $('.context-menu-root').removeAttr('style').hide();
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
        beforeSend: (e) => {
        },
        success: (response) => {
            for (const class_id of response) {
                $("#class_id").append(`<option value="${class_id.class_id}">${class_id.class_name}</option>`);
                $("#form_class_id").append(`<option value="${class_id.class_id}">${class_id.class_name}</option>`);
            }
        },
        error: function (error) {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: (e) => {
        }
    });
}

function validateCalenderForm() {
    var isValid = true;
    const fields = ["subject_id", "staff_id", "day", "start_time", "end_time", 'form_class_id', 'form_section_id'];

    for (const field of fields) {
        const element = $(`#${field}`);
        const value = element.val();
        if (value === "") {
            element.focus().addClass("is-invalid");
            isValid = false;
        }
    }
    const todayDate = new Date().toISOString().split('T')[0];
    const currentTime = $("#start_time").val();
    const selectedDateTime = new Date(`${currentTime}`);
    const startTime = $("#start_time").val();
    const endTime = $("#end_time").val();
    if (startTime >= endTime) {
        raiseErrorAlert("Start Time must be less than End Time");
        isValid = false;
    }
    return isValid;
}

function resetCalenderForm() {
    const fields = ["subject_id", "staff_id", "day", "start_time", "end_time", 'form_class_id', 'form_section_id'];
    for (const field of fields) {
        const element = $(`#${field}`);
        if (element.length > 0) {
            element.val("");
            element.removeClass("is-invalid");
        }
    }
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
                showLoader('body', 'sm');
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
                var timeKeys = Object.keys(timeDayMap).sort((a, b) => {
                    var timeA = a.split('-')[0];
                    var timeB = b.split('-')[0];
                    return timeA.localeCompare(timeB);
                });
                timeKeys.forEach((timeKey) => {
                    var timeSlotRow = $('<tr class="rowData">');
                    timeSlotRow.append(`<td class="mod" id="tdData">${timeKey}</td>`);
                    daysOfWeek.forEach((day) => {
                        var cellData = timeDayMap[timeKey][day];
                        var cell = $('<td class="editable-cell text-center"></td>');
                        if (cellData && cellData.subject && cellData.staff) {
                            cell.html(`${cellData.subject} <br> (${cellData.staff})`);
                            cell.attr('data-id', cellData.calender_id);
                            cell.addClass('editable-cell').on('click', function (event) {
                                event.preventDefault();
                                simulateContextMenu(cellData);
                            });
                        }
                        timeSlotRow.append(cell);
                    });
                    calendarTable.append(timeSlotRow);
                });
            }
        });
    } catch (error) {
        $('.no_data_found').show();
        raiseErrorAlert(error.message || 'An error occurred.');
    } finally {
        removeLoader('body', 'sm');
    }
}

let currentEditCalenderId = null; // Declare the variable at the top level

async function submitaCalenderForm() {
    const isUpdate = $("#calender_id").val() !== "";
    const calenderId = isUpdate ? $("#calender_id").val() : currentEditCalenderId;
    const sectionId = $('#form_section_id').val();
    const classId = $('#form_class_id').val();

    const calenderData = {
        "institute_id": instituteId,
        "class_id": classId,
        "section_id": sectionId,
        "subject_id": $('#subject_id').val(),
        "staff_id": $("#staff_id").val(),
        "day": $("#day").val(),
        "start_time": $("#start_time").val(),
        "end_time": $("#end_time").val(),
    };

    const calenderEndpointUrl = isUpdate ? `${apiUrl}/Calender/update_calender/?calender_id=${calenderId}` : `${apiUrl}/Calender/add_calender/`;
    const requestType = isUpdate ? 'PUT' : 'POST';

    try {
        const response = await $.ajax({
            type: requestType,
            url: calenderEndpointUrl,
            data: JSON.stringify(calenderData),
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            contentType: "application/json",
            dataType: "json",
            beforeSend: () => showLoader("calender_details", "sm"),
            success: (data) => {
                if (data && data.response) {
                    const responseData = data.response;
                    if (isUpdate) {
                        $("#calendarmodal").modal("hide");
                        const calenderCell = $(`#calenderTable td[data-id="${calenderId}"]`);
                        if (calenderCell.length) {
                            loadCalendarDetails(classId, sectionId);
                            raiseSuccessAlert("Calender Updated Successfully");
                            $('.context-menu-root').removeAttr('style').hide();
                            // Clear the data-id attribute of the edited cell after a successful edit
                            calenderCell.data('id', null);
                        } else {
                            console.error('Cell with data-id not found:', calenderId);
                        }
                    } else {
                        $("#calender_id").val("");
                        raiseSuccessAlert("Calender Added Successfully");
                    }
                    // Clear the data-id attribute after a successful operation
                    currentEditCalenderId = null;
                }
            },
            error: (error) => raiseErrorAlert(error.responseJSON.detail),
            complete: () => {
                removeLoader("calender_details", "sm");
                resetCalenderForm();
            }
        });
    } catch (error) {
        raiseErrorAlert(error.responseJSON.detail);
    }
}

function simulateContextMenu(cellData) {
    const contextMenuItems = {
        edit: { name: 'Edit', icon: 'edit' },
        delete: { name: 'Delete', icon: 'delete' },
    };

    $('#calenderTable').contextMenu({
        selector: '.editable-cell',
        items: contextMenuItems,
        callback: function (key, options) {
            if (key === 'edit') {
                // Store the calendar ID of the clicked cell
                currentEditCalenderId = cellData.calender_id;
                openEditForm(currentEditCalenderId);
            } else if (key === 'delete') {
                const rowIndex = $(options.$trigger).closest('tr').index();
                const colIndex = $(options.$trigger).index();
                const calenderId = cellData.calender_id;
                deletePeriod(rowIndex, colIndex, calenderId);
            }
        },
    });
    // Trigger the context menu for the clicked cell
    const $targetCell = $(`.editable-cell[data-id="${cellData.calender_id}"]`);
    const e = $.Event('contextmenu', { pageX: $targetCell.offset().left, pageY: $targetCell.offset().top });
    $targetCell.trigger(e);
}

async function openEditForm(calenderId) {
    if (!calenderId || calenderId === '') {
        console.log('Invalid calendarId for editing:', calenderId);
        return;
    }

    const fetchUrl = `${apiUrl}/Calender/get_calender_by_id/?calender_id=${calenderId}`;
    showLoader("calender_details", "lg");

    try {
        const response = await $.ajax({
            type: 'GET',
            url: fetchUrl,
            headers: {
                Authorization: `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                $('#calendarmodal').modal('show');
                if (data && data.response && data.response.length > 0) {
                    const responseData = data.response[0];
                    const classId = responseData.class_id;
                    getSectionsByClass(classId, 'form_section_id');
                    subjectName(classId, 'subject_id');
                    $('#calender_id').val(responseData.calender_id);
                    $('#form_class_id').val(classId);
                    $('#staff_id').val(responseData.staff_id);
                    $('#day').val(responseData.day);
                    $('#start_time').val(responseData.start_time);
                    $('#end_time').val(responseData.end_time);

                    // Clear the dynamically stored calendar ID after opening the edit form
                    currentEditCalenderId = null;
                }
            },
            error: function (xhr, status, error) {
                raiseErrorAlert(xhr.responseJSON.detail);
            },
            complete: function () {
                removeLoader("calender_details", "lg");
            }
        });
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        raiseErrorAlert('An unexpected error occurred. Please try again.');
    }
}






















//Delete with No Record Found Image
async function deletePeriod(rowIndex, colIndex) {
    try {
        const table = $('#calenderTable');
        const cell = table.find(`tr:eq(${rowIndex}) td:eq(${colIndex})`);
        const calenderId = cell.data('id');

        if (!calenderId || calenderId === '') {
            return;
        }
        const deleteUrl = `${apiUrl}/Calender/delete_calender/?calender_id=${calenderId}`;
        await $.ajax({
            type: 'DELETE',
            url: deleteUrl,
            headers: {
                Authorization: `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
            contentType: 'application/json',
            dataType: 'json',
            beforeSend: (e) => {
                showLoader("body", "sm");
            },
            success: (response) => {
                if (response && response.status_code === 200) {
                    raiseSuccessAlert(response.msg);

                    // Clear the data-id and content of the cell
                    cell.data('id', null);
                    cell.empty();

                    // Find the row and remove it if all cells in the row are empty
                    const row = cell.closest('tr');
                    const cellsToCheck = row.find('td:not(:first-child)');
                    const allCellsEmptyInRow = cellsToCheck.toArray().every(cell => $(cell).text().trim() === '');

                    if (allCellsEmptyInRow) {
                        row.remove();
                    }
                    // Check if the table is empty and hide it, show "No Record Found" image
                    if (table.find('td.editable-cell').length === 0) {
                        table.hide();
                        $('#no_data_found').show();
                    }
                } else {
                    raiseErrorAlert(response.msg);
                }
            },
            error: () => {
                raiseErrorAlert('Error deleting data. Please try again.');
            },
            complete: (e) => {
                removeLoader("body", "sm");
            },
        });

    } catch (error) {
        raiseErrorAlert('An unexpected error occurred. Please try again.');
    }
}


// async function deletePeriod(rowIndex, colIndex) {
//     try {
//         const table = $('#calenderTable');
//         const cell = table.find(`tr:eq(${rowIndex}) td:eq(${colIndex})`);
//         const calenderId = cell.data('id');

//         if (!calenderId || calenderId === '') {
//             return;
//         }
//         const deleteUrl = `${apiUrl}/Calender/delete_calender/?calender_id=${calenderId}`;
//         const response = await $.ajax({
//             type: 'DELETE',
//             url: deleteUrl,
//             headers: {
//                 Authorization: `Bearer ${jwtToken}`,
//                 'Content-Type': 'application/json',
//             },
//             contentType: 'application/json',
//             dataType: 'json',
//             beforeSend: (e) => {
//                 showLoader("body", "sm");
//             },
//             success: (response) => {
//                 if (response && response.status_code === 200) {
//                     raiseSuccessAlert(response.msg);

//                     // Set calendarId to null after successful deletion
//                     // (Assuming that cell.data('id', null) sets the data-id attribute to null)
//                     cell.data('id', null);

//                     // Remove the cell from the table
//                     cell.empty();

//                     // Check if all cells in the row are empty and remove the row
//                     const row = cell.closest('tr');
//                     const cellsToCheck = row.find('td:not(:first-child)');
//                     const allCellsEmpty = cellsToCheck.toArray().every(cell => $(cell).text().trim() === '');

//                     if (allCellsEmpty) {
//                         row.remove();
//                     }
//                 } else {
//                     raiseErrorAlert(response.msg);
//                 }
//             },
//             error: () => {
//                 raiseErrorAlert('Error deleting data. Please try again.');
//             },
//             complete: (e) => {
//                 removeLoader("body", "sm");
//             },
//         });
//     } catch (error) {
//         raiseErrorAlert('An unexpected error occurred. Please try again.');
//     }
// }
