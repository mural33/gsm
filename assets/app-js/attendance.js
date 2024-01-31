$(document).ready(function () {
    $("#studentAttendanceTab,#staffAttendanceTab").DataTable();
    $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`);
    $("#btnSave").on("click", async (e) => {
        $("#btnSave").removeClass("btn-shake");
        if (studentAttendanceForm() === false) {
            $("#btnSave").addClass("btn-shake");
            return false;
        } else {
            addStudentAttendance();
        }
    });
    initializeClass();

    getStudentAttendanceDetails();
    $("#class_id").on("change", async function() {
        const selectedClassId = $(this).val();
        if (selectedClassId) {
            var selectedClass = $(this).find(`option[value="${selectedClassId}"]`);
            var studentpromotionType = selectedClass.data("promotion");
            var studentPromotions = selectedClass.data("total_number_of_promotion");
            await fetchStudentTable(selectedClassId); 
            loadSemisterYearAttendance(studentPromotions, studentpromotionType, "semister_id");
        }
    });
    $("#semister_id").on("change", async function() {
        filterStudentsBySemester();
    });

    $("#classdrop").on("change", function () {
        const filterClassId = $(this).val();
            if (filterClassId) {
                var selectedOptions = $(this).find(`option[value="${filterClassId}"]`);
                var AttendancepromotionType = selectedOptions.data("promotion");
                var AttendancetotalPromotions = selectedOptions.data("total_number_of_promotion");
                loadSemisterYearAttendance(AttendancetotalPromotions, AttendancepromotionType, "filter_semister_id");
            }
    });
    $('#studentAttendanceTab').on('click', '.btnEdit', function () {
        const attendanceId = $(this).data('id');
        editStudentAttendance(attendanceId);
    });
    $("#updateBtnsave").on("click", updateAttendance);
    $("#staffBtnSave").on("click", async (e) => {
        $("#staffBtnSave").removeClass("btn-shake");
        if (staffAttendanceForm() === false) {
            $("#staffBtnSave").addClass("btn-shake");
            return false;
        } else {
            addStaffAttendance();
        }
    });
    getStaffAttendanceDetails();
    $("#btnOpenStaffForm").on("click",async e=>{
        $("#attedenceStaffModal").modal("show");
        fetchStaffTable();
    })
    $("#filterButton").on('click', filterStudentData);
    $('#staffAttendanceTab').on('click', '.btnEdit', function () {
        const staffAttendanceId = $(this).data('staff-id');
        editStaffAttendance(staffAttendanceId);
    });
    $('#updateStaffBtnsave').on('click',updatestaffAttendance);
    $('#staffFillterButton').on('click',filterStaffData);
    $("#staffBtnSave").on('click',addStaffAttendance);
});


function studentAttendanceForm() {
    var isValid = true;
    const fields = ["class_id", "attendance_dates"];
    for (const field of fields) {
        const element = $(`#${field}`);
        const value = element.val();
        if (value === "") {
            element.focus().addClass("is-invalid");
            isValid = false;
        }
    }
    return isValid;
}

function staffAttendanceForm() {
    var isValid = true;
    const fields = ["attendanceDate"];
    for (const field of fields) {
        const element = $(`#${field}`);
        const value = element.val();
        if (value === "") {
            element.focus().addClass("is-invalid");
            isValid = false;
        }
    }
    return isValid;
}
function resetStudentAttendanceForm() {
    const fields = ["class_id", "attendance_dates","semister_id"];
    for (const field of fields) {
        const element = $(`#${field}`);
        if (element.length > 0) {
            element.val("");
            element.removeClass("is-invalid");
        }
    }
}

function resetStudentTable() {
    const studenttTable = $("#student_body");
    studenttTable.empty();

}
function resetStaffAttendanceForm() {
    const fields = ["attendanceDate"];  
    for (const field of fields) {
        const element = $(`#${field}`);       
        if (element.length > 0) {
            element.val("");
            element.removeClass("is-invalid");
        }
    }
}

function resetStaffTable() {
    const staffTable = $("#staff_body");
    staffTable.empty();

}
function callingPieChart(absent, present) {
    var existingChart = Chart.getChart("studentAttendancePieChat");
    if (existingChart) {
        existingChart.destroy();
    }
    generateingPieChart("studentAttendancePieChat", [present, absent], ["Present%", "Absent%",], ["green", " #CE2029",]);
}

async function getStudentAttendanceDetails() {
    var endPoint = `${apiUrl}/StudentAttendance/get_student_attendance_by_institute_id/?institute_id=${instituteId}`;
    const studentAttendance = await $.ajax({
        type: "GET",
        url: endPoint,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        beforeSend: (e) => {
            showLoader("body", "sm");
        },
        success: function (response) {
            var studentAttendanceData = response.attendance_data;
            var absent = response.attendance_percentage.absent_percentage;
            var present = response.attendance_percentage.present_percentage;
            localStorage.setItem("studentAbsent", JSON.stringify(absent));
            localStorage.setItem("studentPresent", JSON.stringify(present));
            callingPieChart(absent, present);
            studentAttendanceData.forEach(entry => {
                var style = '';
                if (entry.attendance_status === 'Present') {
                    style = 'color: green';
                } else if (entry.attendance_status === 'Absent') {
                    style = 'color: #CE2029;';
                }
                const AttendancepromotionType = entry.student.classes.promotion_type;
                let AttendancesemesterText = "";
                if (AttendancepromotionType === 'year_vise') {
                    AttendancesemesterText = `${entry.student.current_position} Year`;
                } else if (AttendancepromotionType === 'course_vise') {
                    AttendancesemesterText = `${entry.student.current_position} Course`;
                } else if (AttendancepromotionType === 'semister_vise') {
                    AttendancesemesterText = `${entry.student.current_position} Semester`;
                }
                var newRow = `<tr class='tr-attendance-${entry.id} attendance-row'>
                <td class="attendance_date" data-day=${entry.attendance_date}>${entry.attendance_date}</td>
                <td>${entry.student.student_name}</td>
                <td>${entry.student.roll_number}</td>
                <td class="class_id" data-class='${entry.student.classes.class_id}'data-promotion='${entry.promotion_type}'
                data-total_number_of_promotion='${entry.total_number_of_promotion}'>${entry.student.classes.class_name}</td>
                <td class="semister" data-promotion='${entry.promotion_type}'
                data-total_number_of_promotion='${entry.total_number_of_promotion}'>${AttendancesemesterText}</td>
                <td style="${style}" class="attendance_status" data-student-status="${entry.attendance_status}">${entry.attendance_status}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-info btnEdit" id="btnEdit" data-id=${entry.id}>
                        <i class="bi bi-pencil-square"></i>
                    </button>
                </td>
            </tr>`;
                $('#studentAttendanceTab').DataTable().row.add($(newRow)).draw();

            });
        },
        error: function (error) {
            raiseErrorAlert(error)
        },
        complete: (e) => {
            removeLoader("body", "sm");
        },
    });
}


function generateingPieChart(id = "", percentage = [], labels = [], colors = []) {
    var data = {
        labels: labels,
        datasets: [{
            data: percentage,
            backgroundColor: colors
        }]
    };
    var options = {
        responsive: true,
        maintainAspectRatio: false,
    };
    var ctx = document.getElementById(id).getContext('2d');
    var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: options,
    });
    
}
function initializeClass() {
    const classesurl = `${apiUrl}/Classes/get_classes_by_institute/?institite_id=${instituteId}`;
    $.ajax({
        url: classesurl,
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        success: (response) => {
            for (const classes of response) {
                $("#class_id").append(`<option value="${classes.class_id}" data-promotion='${classes.promotion_type}' data-total_number_of_promotion='${classes.total_number_of_promotion}'>${classes.class_name}</option>`);
                $("#classdrop").append(`<option value="${classes.class_id}" data-promotion='${classes.promotion_type}' data-total_number_of_promotion='${classes.total_number_of_promotion}'>${classes.class_name}</option>`);
            }
        },
        error: function (error) {
            raiseErrorAlert(error.responseJSON);
        },
    });
}


async function  loadSemisterYearAttendance(studentDurationTime, studentpromotionType, studenttnpId) {
    var studenttnp = $(`#${studenttnpId}`);
    var studentlabelElement = $("label[for='" + studenttnpId + "']");

    var studentpromotionTypeMap = {
        "semister_vise": "Semester",
        "year_vise": "Year",
    };

    if (studentpromotionTypeMap[studentpromotionType] === undefined) {
        studenttnp.html("");
        studentlabelElement.text("Semester/Year");
        studenttnp.append(`<option value="">Not Applicable</option>`);
        return;
    }
    studentlabelElement.text(studentpromotionTypeMap[studentpromotionType]);
    studenttnp.html("");
    studenttnp.append(`<option value="">All ${studentpromotionTypeMap[studentpromotionType]}</option>`);
    for (let index = 0; index < studentDurationTime; index++) {
        var option = `<option value="${index + 1}">${index + 1} ${studentpromotionTypeMap[studentpromotionType]}</option>`;
        studenttnp.append(option);
    }
}

function addStudentAttendance() {
    const selectedStudents = getSelectedStudentsData();
    const requestData = {
        "data": selectedStudents
    };
    const addStudentUrl = `${apiUrl}/StudentAttendance/create_bulk_student_attendance/`;
    $.ajax({
        type: 'POST',
        url: addStudentUrl,
        data: JSON.stringify(requestData),
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
        },
        beforeSend: () => {
            showLoader("attedanceModal", "sm");
        },
        success: function (data) {
            $("#attedanceModal").modal("hide");
            if (data.status_code === 200) {
                const responseData = data.response;
                if (responseData === "") {
                    raiseSuccessAlert(data.msg);
                } else {
                    const responseDataArray = data.response;
                var absentPercentage = JSON.parse(localStorage.getItem("studentAbsent")) || 0;
                var presentPercentage = JSON.parse(localStorage.getItem("studentPresent")) || 0;
                var totalAbsent = $("#studentAttendanceTab tbody tr").length;
                var newAbsent = (absentPercentage * totalAbsent) / 100;
                var newPresent = (presentPercentage * totalAbsent) / 100;
                var newTotal = totalAbsent + responseDataArray.length;
                    if (Array.isArray(responseDataArray)) {
                        responseDataArray.forEach((responseData) => {
                            if (responseData.attendance_status === 'Present') {
                                newPresent++;
                            } else {
                                newAbsent++;
                            }
                            if (responseData.attendance_status === 'Present') {}
                            const style = responseData.attendance_status === 'Present' ? 'color: green' : 'color: #CE2029';
                            const PromotionType = responseData.student.classes.promotion_type;
                            let currentpramotion = "";
                            if (PromotionType === 'year_vise') {
                                currentpramotion = `${responseData.student.current_position} Year`;
                            } else if (PromotionType === 'course_vise') {
                                currentpramotion = `${responseData.student.current_position} Course`;
                            } else if (PromotionType === 'semister_vise') {
                                currentpramotion = `${responseData.student.current_position} Semester`;
                            }    
                            const studentnewRow = `<tr class="tr-attendance-${responseData.id}">
                                <td class="attendance_date" data-day=${responseData.attendance_date}>${responseData.attendance_date}</td>
                                <td>${responseData.student.student_name}</td>
                                <td>${responseData.student.roll_number}</td>
                                <td class='class_id' data-class='${responseData.student.classes.class_id}'>${responseData.student.classes.class_name}</td>
                                <td>${currentpramotion}</td>
                                <td style='${style}'  class="attendance_status" data-student-status="${responseData.attendance_status}">${responseData.attendance_status}</td>
                                <td>
                                    <button type="button" class="btn btn-sm btn-info btnEdit" id="btnEdit" data-id="${responseData.id}" data-bs-toggle="modal" data-bs-target="#editstudentModalForm">
                                        <i class="bi bi-pencil-square"></i>
                                    </button>
                                </td>
                            </tr>`;
                            
                            $('#studentAttendanceTab').DataTable().row.add($(studentnewRow)).draw();
                        });
                        raiseSuccessAlert("Attendance Added Successfully.");
                        resetStudentAttendanceForm();
                        resetStudentTable();
                        var newAbsentPercentage = (newAbsent * 100) / newTotal;
                        var newPresentPercentage = (newPresent * 100) / newTotal;
                        localStorage.setItem("studentAbsent", JSON.stringify(newAbsentPercentage));
                        localStorage.setItem("studentPresent", JSON.stringify(newPresentPercentage));
                        callingPieChart(newAbsentPercentage, newPresentPercentage);
                    } else {
                        raiseErrorAlert('Invalid response data format. Expected an array. Actual:', responseDataArray);
                    }
                }
            } else {
                raiseErrorAlert('Error adding attendance:', data.msg);
            }
        },
        error: function (error) {
            raiseErrorAlert(error)
        },
        complete:(e)=>{
            removeLoader('attedanceModal','sm')
        }
    });
}

    function getSelectedStudentsData() {
        const selectedStudents = [];
        $("#student_table tbody tr").each(function () {
            const studentId = $(this).find(".student-id").text(); 
            const attendanceDate = $('#attendance_dates').val();
            const attendanceStatus = $(this).find("input[type='radio']:checked").val();
            if (!isNaN(studentId) && Number.isInteger(Number(studentId))) {
                selectedStudents.push({
                    "student_id": parseInt(studentId),
                    "attendance_date": attendanceDate,
                    "attendance_status": attendanceStatus,
                    "institute_id": instituteId,
                    "is_deleted": false,
                });
            }
        });
    
        return selectedStudents;
    }
    
    async function fetchStudentTable(selectedClassId) {
        const studentsUrl = `${apiUrl}/Students/get_students_by_field/class_id/${selectedClassId}/`;
        const studentsResponse = await $.ajax({
            url: studentsUrl,
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            beforeSend: (e) => {
                showLoader('attedanceModal', 'sm');
            },
            complete: (e) => {
                removeLoader('attedanceModal', 'sm');
            },
        });
    
        $("#student_table tbody").empty();
        $("#student_table thead").html("<tr><th>Roll Number</th><th>Name</th><th>Current Position</th><th>Status</th></tr>");
    
        for (const student of studentsResponse) {
            const statusHtml = `
                <input type="radio" value="Present" name="status_${student.student_id}" checked>
                <label class="present-label">P</label>
                
                <input type="radio" value="Absent" name="status_${student.student_id}">
                <label class="absent-label">A</label>
            `;
            
            // Access promotion type and determine current position
            const promotionType = student.classes.promotion_type;
            let currentText = "";
            if (promotionType === 'year_vise') {
                currentText = `${student.current_position} Year`;
            } else if (promotionType === 'course_vise') {
                currentText = `${student.current_position} Course`;
            } else if (promotionType === 'semister_vise') {
                currentText = `${student.current_position} Semester`;
            }       
            const newRow = $("<tr class='semister'>")
            .append($("<td>").css("display", "none").addClass("student-id").text(student.student_id))
            .append($("<td>").text(student.roll_number))
            .append($("<td>").text(student.student_name))
            .append($("<td>").attr("data-position", student.current_position).text(currentText)) 
            .append($("<td>").attr("id", "attendance_status").html(statusHtml));
        
        $("#student_table tbody").append(newRow);
            
        }
    }

    function filterStudentsBySemester() {
        const selectedSemesterId = $('#semister_id').val();
        $('.semister').each(function() {
            const row = $(this);
            const positionType = parseInt(row.find("[data-position]").attr("data-position"));
            if (selectedSemesterId === "" || selectedSemesterId === String(positionType)) {
                row.show();
            } else {
                row.hide();
            }
        });
    }
    
    
    



    
async function editStudentAttendance(attendanceId) {
        const fetchUrl = `${apiUrl}/StudentAttendance/get_attendance_by_id/?attendance_id=${attendanceId}`;
        setTimeout(() => {
            showLoader("editstudentModalForm", "sm");
        }, 1000);
    
    const Response = await  $.ajax({
            type: "GET",
            url: fetchUrl,
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            contentType: "application/json",
            dataType: "json",
            success: (data) => {
                if (data && data.status_code === 200 && data.response) {
                    var responseData = data.response[0];
                    $('#editstudentModalForm').modal('show');
                    $("#id").val(responseData.id);
                    $('#form_class_id').val(responseData.student.classes.class_name);
                    $("#attendance_date").val(responseData.attendance_date);
                    if (responseData.attendance_status === 'Present') {
                        $('#present').prop('checked', true);
                    } else if (responseData.attendance_status === 'Absent') {
                        $('#absent').prop('checked', true);
                    }
                    $('#student_id').val(responseData.student.student_name);
                    $('#roll_number').val(responseData.student.roll_number);
                }
            },
            error: function (xhr, status, error) {
                raiseErrorAlert(error.responseJSON.detail);
            },
            complete: function () {
                setTimeout(() => {
                    removeLoader("editstudentModalForm", "sm");
                }, 1000);
            }
        });
    }
    
    function updateAttendance() {
        const attendance_id = $('#id').val();
        const attendance_status = $("input[name='attendance_status']:checked").val();
        const updatedData = {
            "attendance_status": attendance_status
        };
        const patchurl = `${apiUrl}/StudentAttendance/update_student_attendance_partial/?attendance_id=${attendance_id}`;
        $.ajax({
            type: 'PATCH',
            url: patchurl,
            data: JSON.stringify(updatedData),
            headers: {
                'accept': 'application/json',
                "Authorization": `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
            beforeSend:(e)=>{
                showLoader('editstudentModalForm','sm')
            },
            success: function (data) {
                const responseData = data.response
                let existingRow = $(`.tr-attendance-${responseData.id}`);
                if (existingRow.length) {
                    const statusCell = existingRow.find('td:eq(4)');
                    statusCell.text(responseData.attendance_status);
                    if (responseData.attendance_status === 'Present') {
                        statusCell.css({
                            'color': 'green'
                        });
                    } else if (responseData.attendance_status === 'Absent') {
                        statusCell.css({
                            'color': ' #CE2029'
                        });
                    }
                }
                $("#editstudentModalForm").modal("hide");
                raiseSuccessAlert("Attendance Updated Successfully.");
            },
            error: function (error) {
                raiseErrorAlert(error)
            },
            complete:(e)=>{
                removeLoader('editstudentModalForm','sm')
            }
        });
    }
    
    
    function filterStudentData() {
        var studentTable = $('#studentAttendanceTab').DataTable();
        var selectedClass = $("#classdrop").val();
        var startDate = $("#startDate").val();
        var endDate = $("#endDate").val();
        var selectedPromotion = $('#filter_semister_id').val();
        var presentCount = 0;
        var absentCount = 0;
    
        $.fn.dataTable.ext.search = [];
    
        $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
            var filterClass = parseInt(selectedClass);
            var filterStartDate = new Date(startDate).getTime();
            var filterEndDate = new Date(endDate).getTime();
            var filterPromotion = parseInt(selectedPromotion);
            var rowData = studentTable.row(dataIndex).nodes().to$();
            var dataClass = parseInt(rowData.find(".class_id").data("class"));
            var dataDay = new Date(rowData.find('.attendance_date').data('day')).getTime();
            var dataPromotion = parseInt(rowData.find(".semister").text());
            console.log(dataPromotion)
            var status = rowData.find('.attendance_status').data('student-status');
            $("#studentAttendanceFilter").modal("hide");
    
            if (
                (isNaN(filterClass) || filterClass === dataClass || filterClass === '' || filterClass === undefined) &&
                (isNaN(filterEndDate) || filterEndDate === undefined || filterEndDate >= dataDay) &&
                (isNaN(filterStartDate) || filterStartDate <= dataDay) &&
                (isNaN(filterPromotion) || filterPromotion === dataPromotion)
            ) {
                if (status === 'Present') {
                    presentCount++;
                } else if (status === 'Absent') {
                    absentCount++;
                }
                return true;
            } else {
                return false;
            }
        });
    
        studentTable.draw();
        if (studentTable.rows({ search: 'applied' }).count() === 0) {
            $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`)
        } else {
            $(".dataTables_empty").empty();
        }
        resetStudentFillterForm();
    
        var totalAttendance = presentCount + absentCount;
        var presentPercentage = (presentCount / totalAttendance) * 100;
        var absentPercentage = (absentCount / totalAttendance) * 100;
        callingPieChart(absentPercentage, presentPercentage);
    }


    function resetStudentFillterForm() {
        const fields = ["startDate", "endDate","classdrop","filter_semister_id"];
        for (const field of fields) {
            const element = $(`#${field}`);
            if (element.length > 0) {
                element.val("");
                element.removeClass("is-invalid");
            }
        }
    }
    

    
    function callingStaffPieChart(absent, present) {
        var existingChart = Chart.getChart("staffAttendancePieChart");
        if (existingChart) {
            existingChart.destroy();
        }
        generateingStaffPieChart("staffAttendancePieChart", [present, absent], ["Present%", "Absent%"], ["green", " #CE2029"]);
    }

async function getStaffAttendanceDetails() {
    const endPoint = `${apiUrl}/StaffAttendance/get_staff_attendance_by_institute_id/?institute_id=${instituteId}`;
    try {
        const response = await $.ajax({
            type: "GET",
            url: endPoint,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`,
            },
            beforeSend:()=>{
                showLoader("body","sm")
            },
            success: function(response) {
                var staffAttendanceData = response.attendance_data;
                var absent = response.attendance_percentage.absent_percentage;
                var present = response.attendance_percentage.present_percentage;
                localStorage.setItem("staffAbsent", JSON.stringify(absent));
                localStorage.setItem("staffPresent", JSON.stringify(present));
                callingStaffPieChart(absent,present);
                staffAttendanceData.forEach(staffEntry => {
                    const style = staffEntry.attendance_status === 'Present' ? 'color: green;' : 'color: #CE2029;';
                    const newRow = `<tr class='tr-staff-attendance-${staffEntry.id} staff-attendance-row'>
                        <td class="attendance_dates" data-staff-day='${staffEntry.attendance_date}'>${staffEntry.attendance_date}</td>
                        <td>${staffEntry.staff.staff_name}</td>
                        <td>${staffEntry.staff.employee_id}</td>
                        <td style="${style}" class="status" data-attendance-status="${staffEntry.attendance_status}">${staffEntry.attendance_status}</td>
                        <td>
                            <button type="button" class="btn btn-sm btn-info btnEdit" data-staff-id="${staffEntry.id}">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                        </td>
                    </tr>`;
                    $('#staffAttendanceTab').DataTable().row.add($(newRow)).draw();
                });
                
            },
            complete: (e) => {
                removeLoader("body", "sm");
            },
        });
    } catch (error) {
        console.error('Error fetching staff attendance:', error);
    }
}




function generateingStaffPieChart(id = "", percentage = [], labels = [], colors = []) {
    var data = {
        labels: labels,
        datasets: [{
            data: percentage,
            backgroundColor: colors
        }]
    };
    var options = {
        responsive: true,
        maintainAspectRatio: false,
    };
    var ctx = document.getElementById(id).getContext('2d');
    var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: options
    });
}

async function fetchStaffTable() {
    const staffUrl = `${apiUrl}/Staff/get_staffs_by_institute/?institute_id=${instituteId}`;
    const staffResponse = await $.ajax({
        url: staffUrl,
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        beforeSend: (e) => {
            showLoader('assignment', 'sm');
        },
        complete: (e) => {
            removeLoader('assignment', 'sm');
        },
    });

    $("#staff_table tbody").empty();
    for (const staff of staffResponse) {
        const statusHtml = `
            <input type="radio" value="Present" name="status_${staff.staff_id}" checked>
            <label class="present-label">P</label>
            
            <input type="radio" value="Absent" name="status_${staff.staff_id}">
            <label class="absent-label">A</label>
        `;
        const newRow = $("<tr>")
        .data("staff-id", staff.staff_id)
        .append($("<td>").css("display", "none").text(staff.staff_id))
        .append($("<td>").text(staff.employee_id))
        .append($("<td>").text(staff.staff_name))
        .append($("<td>").attr("id", "attendance_status").html(statusHtml));
    
    $("#staff_table tbody").append(newRow);
    }
}



async function editStaffAttendance(StaffattendanceId) {
    const fetchUrl = `${apiUrl}/StaffAttendance/get_staff_attendance_by_id/?attendance_id=${StaffattendanceId}`;
    setTimeout(() => {
        showLoader("editstaffModalForm", "sm");
    }, 1000);
    const Response = await  $.ajax({
        type: "GET",
        url: fetchUrl,
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        success: (data) => {
            if (data) {
                var responseData = data[0];
                $('#editstaffModalForm').modal('show');
                $("#id").val(responseData.id);
                $("#staff_attendance_date").val(responseData.attendance_date);
                if (responseData.attendance_status === 'Present') {
                    $('#staff_present').prop('checked', true);
                } else if (responseData.attendance_status === 'Absent') {
                    $('#staff_absent').prop('checked', true);
                }
                $('#staffs_id').val(responseData.staff.staff_name);
                $('#employee_id').val(responseData.staff.employee_id);
            }
        },
        error: function (xhr, status, error) {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete:(e)=>{
            setTimeout(() => {
                removeLoader("editstaffModalForm", "sm");
            }, 1000);
        }
    });
}


function updatestaffAttendance() {
    const staff_attendance_id = $('#id').val();
    const staff_attendance_status = $("input[name='staff_attendance_status']:checked").val();
    const updatedStaffData = {
        "attendance_status": staff_attendance_status
    };
    const staffpatchurl = `${apiUrl}/StaffAttendance/update_staff_attendance/?attendance_id=${staff_attendance_id}`;
    $.ajax({
        type: 'PATCH',
        url: staffpatchurl,
        data: JSON.stringify(updatedStaffData),
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
        },
        beforeSend:(e)=>{
            showLoader('editstaffModalForm','sm')
        },
        success: function (data) {
            const responseData = data.response[0]
            let existingRow = $(`.tr-staff-attendance-${responseData.id}`);
            if (existingRow.length) {
                const statusCell = existingRow.find('td:eq(3)');
                statusCell.text(responseData.attendance_status);
                if (responseData.attendance_status === 'Present') {
                    statusCell.css({
                        'color': 'green'
                    });
                } else if (responseData.attendance_status === 'Absent') {
                    statusCell.css({
                        'color': ' #CE2029'
                    });
                }
            }
            $("#editstaffModalForm").modal("hide");
            raiseSuccessAlert("Attendance Updated Successfully.");
        },
        error: function (error) {
            raiseErrorAlert(error)
        },
        complete:(e)=>{
            removeLoader('editstaffModalForm','sm')
        }
    });
}

function filterStaffData() {
    var staffTable = $('#staffAttendanceTab').DataTable();
    var start_Date = $("#start_Date").val();
    var end_Date = $("#end_Date").val();
    var presentCount = 0;
    var absentCount = 0;

    $.fn.dataTable.ext.search = [];
    
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        var filterstartDate = new Date(start_Date).getTime();
        var filterendDate = new Date(end_Date).getTime();
        var rowData = staffTable.row(dataIndex).nodes().to$();
        var dataDays = rowData.find('.attendance_dates').data('staff-day');
        dataDays = new Date(dataDays).getTime();
        var status = rowData.find('.status').data('attendance-status');
        $("#staffAttendanceFilter").modal("hide");
        if (
            (isNaN(filterendDate) || filterendDate === undefined || filterendDate >= dataDays) &&
            (isNaN(filterstartDate) || filterstartDate <= dataDays)
        ) {
            if (status === 'Present') {
                presentCount++;
            } else if (status === 'Absent') {
                absentCount++;
            }
            return true;
        } else {
            return false;
        }
    });
    
    staffTable.draw();
    if (staffTable.rows({ search: 'applied' }).count() === 0) {
        $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`)
    } else {
        $(".dataTables_empty").empty();
    }
    resetStaffFillterForm()
    var totalstaffAttendance = presentCount + absentCount;
    var staffpresentPercentage = (presentCount / totalstaffAttendance) * 100;
    var staffabsentPercentage = (absentCount / totalstaffAttendance) * 100;

    callingStaffPieChart(staffabsentPercentage, staffpresentPercentage);
}

function resetStaffFillterForm() {
    const fields = ["start_Date", "end_Date"];
    for (const field of fields) {
        const element = $(`#${field}`);
        if (element.length > 0) {
            element.val("");
            element.removeClass("is-invalid");
        }
    }
}



function getSelectedStaffData() {
    const selectedStaff = [];

    $("#staff_table tbody tr").each(function () {
        const staffId = $(this).data("staff-id");
        const attendanceDate = $('#attendanceDate').val();
        const attendanceStatus = $(this).find("input[type='radio']:checked").val();
        if (!isNaN(staffId) && Number.isInteger(Number(staffId))) {
            selectedStaff.push({
                "staff_id": parseInt(staffId),
                "attendance_date": attendanceDate,
                "attendance_status": attendanceStatus,
                "institute_id": instituteId,
                "is_deleted": false,
            });
        }
    });
    return selectedStaff;
}

function addStaffAttendance() {
    const selectedStaff = getSelectedStaffData();
    const requestData = {
        "data": selectedStaff
    };
    const addStaffUrl = `${apiUrl}/StaffAttendance/create_bulk_staff_attendance/`;

    $.ajax({
        type: 'POST',
        url: addStaffUrl,
        data: JSON.stringify(requestData),
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
        },
        beforeSend: () => {
            showLoader("attedenceStaffModal", "sm");
        },
        success: function (data) {
            $("#attedenceStaffModal").modal("hide");
            if (data.status_code === 200) {
                const responseDataArray = data.response;

                var absentPercentage = JSON.parse(localStorage.getItem("staffAbsent")) || 0;
                var presentPercentage = JSON.parse(localStorage.getItem("staffPresent")) || 0;
                var currentTotal = $("#staffAttendanceTab tbody tr").length;

                var newAbsent = absentPercentage * (currentTotal / 100);
                var newPresent = presentPercentage * (currentTotal / 100);

                var updatedTotal = currentTotal + responseDataArray.length;

                if (Array.isArray(responseDataArray)) {
                    responseDataArray.forEach((entry) => {
                        const style = entry.attendance_status === 'Present' ? 'color: green;' : 'color: #CE2029;';
                        const staffNewRow = `<tr class="tr-staff-attendance-${entry.id}">
                            <td class="attendance_dates" data-staff-day=${entry.attendance_date}>${entry.attendance_date}</td>
                            <td>${entry.staff.staff_name}</td>
                            <td>${entry.staff.employee_id}</td>
                            <td style="${style}" class="status" data-attendance-status="${entry.attendance_status}">${entry.attendance_status}</td>
                            <td>
                                <button type="button" class="btn btn-sm btn-info btnEdit" id="btnEdit" data-staff-id="${entry.id}" data-bs-toggle="modal" data-bs-target="#editstaffModalForm">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                            </td>
                        </tr>`;
                        $('#staffAttendanceTab').DataTable().row.add($(staffNewRow)).draw();
                        if (entry.attendance_status === 'Absent') {
                            newAbsent++;
                        } else if (entry.attendance_status === 'Present') {
                            newPresent++;
                        }
                    });
                    resetStaffAttendanceForm();
                    raiseSuccessAlert(data.msg);
                    resetStaffTable();
                    var newAbsentPercentage = (newAbsent * 100) / updatedTotal;
                    var newPresentPercentage = (newPresent * 100) / updatedTotal;
                    localStorage.setItem("staffAbsent", JSON.stringify(newAbsentPercentage));
                    localStorage.setItem("staffPresent", JSON.stringify(newPresentPercentage));
                    callingStaffPieChart(newAbsentPercentage, newPresentPercentage);
                } else {
                    raiseErrorAlert('Invalid response data format or empty array.');
                }
            } else {
                raiseErrorAlert(`Error adding attendance: ${data.msg}`);
            }
        },
        error: function (error) {
            const errorMessage = error.statusText || error.responseText || 'An unknown error occurred.';
            raiseErrorAlert(`Error: ${errorMessage}`);
        },
        complete: () => {
            removeLoader('attedenceStaffModal', 'sm');
        }
    });
}











