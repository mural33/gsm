$(document).ready(function () {
    loadUpcomingNotice();
    getStudentCount();
    getStaffCount();
    getBirthdays();
    loadAccountSummary();
    loadUpcomingExamResults();
    loadUpcomingFees();
    loadAbsentData();
    getStudentAttendRate();
});

function loadUpcomingNotice() {
    const upomingNoticeUrl = apiUrl + `/Notice/get_notices_institute/?institute_id=${instituteId}`;
    $.ajax({
        type: "GET",
        url: upomingNoticeUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        success: function (responseData) {
            const upcomingNoticeContainer = $("#noticeBody");
            upcomingNoticeContainer.empty();
            const currentDate = new Date();
            responseData = responseData.filter(notice => new Date(notice.notice_date) >= currentDate);
            responseData.sort((a, b) => new Date(a.notice_date) - new Date(b.notice_date));
            const upcomingNotices = responseData.slice(0, 8);
            if (upcomingNotices.length > 0) {
            upcomingNotices.forEach((notice) => {
                const noticeHtml= `
                    <div class="mb-4">
                                <div class="d-flex align-items-center">
                                    <i class="ti ti-point-filled align-baseline me-1 text-success fs-4"></i>
                                    <h6 class="mb-2 flex-grow-1 textIndent">${notice.notice_title}</h6>
                                    <span class="badge text-body float-end flex-grow-0">${notice.notice_date}</span>
                                </div>
                            </div>
                `;
                upcomingNoticeContainer.append(noticeHtml);
            });
    } else {
        const noDataHtml = `
            <div class="text-center">
            <img src="/assets/img/no_data_foundSmalll.png" alt="No Data Found" class="mt-5 noticeImg" id="noDataImage">
            </div>
        `;
        upcomingNoticeContainer.append(noDataHtml);
    }
        },
        error: (error) => {
            raiseErrorAlert(error.detail);
        },
    });
}

function getStudentCount(){
    const countStudentUrl = apiUrl + `/Students/get_students_by_intitute/?institute_id=${instituteId}`;
    $.ajax({
        type: "GET",
        url: countStudentUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        success: function (responseData) {
            const countStudentCard = $("#countStudent");
            countStudentCard.empty();
            const totalStudents = responseData.length;
            const countStudentHtml = `
            <div class="text-center mt-2">
                <p class="text-uppercase fw-medium text-muted text-truncate fs-md">Total Students</p>
                <h5 class="fw-semibold mb-3">${totalStudents}</h5>
            </div>
            `;
                countStudentCard.append(countStudentHtml);
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
    });
}

function getStaffCount(){
    const countStaffUrl = apiUrl + `/Staff/get_staffs_by_institute/?institute_id=${instituteId}`;
    $.ajax({
        type: "GET",
        url: countStaffUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        success: function (responseData) {
            const countStaffCard = $("#countStaff");
            countStaffCard.empty();
            const totalStaffs = responseData.length;
            const countStaffHtml = `
            <div class="text-center mt-2">
                <p class="text-uppercase fw-medium text-muted text-truncate fs-md">Total Staffs</p>
                <h5 class="fw-semibold mb-3">${totalStaffs}</h5>
            </div>
            `;
            countStaffCard.append(countStaffHtml);
        },
        error: (error) => {
            raiseErrorAlert(error.detail);
        },
    });
}

function getBirthdays() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; 
    const currentDay = today.getDate();

    const studentUrl = apiUrl + `/Students/get_students_by_intitute/?institute_id=${instituteId}`;
    const staffUrl = apiUrl + `/Staff/get_staffs_by_institute/?institute_id=${instituteId}`;

    Promise.all([
        $.ajax({
            type: "GET",
            url: studentUrl,
            mode: "cors",
            crossDomain: true,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`,
            },
        }),
        $.ajax({
            type: "GET",
            url: staffUrl,
            mode: "cors",
            crossDomain: true,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`,
            },
        })
    ])
    .then(([studentData, staffData]) => {
        const allBirthdays = [...studentData, ...staffData].filter(person => {
            const birthdate = new Date(person.date_of_birth || person.staff_dob);
            const birthMonth = birthdate.getMonth() + 1;
            const birthDay = birthdate.getDate();

            return birthMonth === currentMonth && birthDay === currentDay;
        });

        const birthdayContent = $("#birthdayBoard");
        birthdayContent.empty();

        if (allBirthdays.length > 0) {
            allBirthdays.forEach(person => {
                const personHtml = `
                <div class="col-md-4 mb-4 smallCards">
                    <div class="card birthday">
                        <div class="imgBox">
                            <img src="${person.photo}" class="card-img-top rounded-circle birthdayImg" alt="">
                        </div>
                        <div class="card-body mt-3">
                            <p class="card-text textSize">${person.student_name || person.staff_name}</p>
                        </div>
                    </div>
                </div>
                `;
                birthdayContent.append(personHtml);
            });
        } else {
            const noBirthdayHtml = `
            <div class="col-md-12 text-center">
                <img src="/assets/img/no_data_foundSmalll.png" alt="No Data Found" id="noDataImage">
                </div>
            `;
            birthdayContent.append(noBirthdayHtml);
        }
    })
    .catch(error => {
        raiseErrorAlert(error.responseJSON?.detail || 'Error fetching data.');
    });
}

function loadAccountSummary(){
    const accountSummayUrl = apiUrl + `/Accounts/get_all_transaction_by_institute/?institute_id=${instituteId}`;
    $.ajax({
        type: "GET",
        url: accountSummayUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        success: function (responseData) {
            const accountSummary = responseData.summary;

            $("#balance").text(accountSummary.balance || 0);
            $("#feesCollections").text(accountSummary.fee_collections || 0);
            $("#salary").text(accountSummary.salary || 0);
            $("#expenditure").text(accountSummary.expenditure || 0);
            $("#otherCredits").text(accountSummary.other_credits || 0);
            $("#otherDebits").text(accountSummary.other_debits || 0);
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
    });
}

function loadUpcomingExamResults() {
    const upomingExamUrl = apiUrl + `/ParentExams/get_all_parent_exam_by_institute_id?institute_id=${instituteId}`;
    $.ajax({
        type: "GET",
        url: upomingExamUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        success: function (responseData) {
            const currentDate = new Date();
            const upcomingExams = responseData.filter(exam => {
                const resultDate = new Date(exam.result_date);
                return resultDate > currentDate;
            });
            const examBoard = $("#examResultTable");
            const tableBody = $("#examResultBody"); 
            tableBody.empty();  
            if (upcomingExams.length > 0) {
                upcomingExams.forEach(exam => {
                    const examHtml = `
                        <tr>
                            <td class="examdate">${exam.start_date} - ${exam.end_date}</td>
                            <td class="examname">${exam.parent_exam_name}</td>
                            <td class="result">${exam.result_date}</td>
                            <td class="class">${exam.classes.class_name}</td>
                        </tr>
                    `;
                    tableBody.append(examHtml);
                });
            } else {
                const noExamHtml = `
                    <tr>
                        <td colspan="4" class="text-center">
                            <img src="/assets/img/no_data_foundSmalll.png" alt="No Data Found" id="noDataImage">
                        </td>
                    </tr>
                `;
                tableBody.append(noExamHtml);
            }
            $('#examResultTable').DataTable({
                "pageLength": 5
            });
            $('select[name="examResultTable_length"]').prepend('<option value="5">5</option>');
        },        
        error: (error) => {
            raiseErrorAlert(error.detail);
        },
    });
}

function loadUpcomingFees(){
    const upcomingFeeUrl = apiUrl + `/Reports/fees_to_collect_report/?institute_id=${instituteId}`;
    $.ajax({
        type: "GET",
        url: upcomingFeeUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        success: function (responseData) {
            const feeBoard = $("#feeBoard");
            feeBoard.empty();
            if (responseData.length > 0) {
                responseData.forEach(fee => {
                    const dueDate = new Date(fee.installment_due_date);
                    const formattedDueDate = `${dueDate.getDate()}.${dueDate.getMonth() + 1}.${dueDate.getFullYear()}`;
                    const feeHtml = `
                        <div class="d-flex bg-body-secondary rounded">
                            <div class="flex-shrink-0 w-md py-2 px-3 text-center border-end">
                                <h6 class="mt-3">${formattedDueDate}</h6>
                            </div>
                            <div class="flex-grow-1 px-3 py-2 overflow-hidden">
                            <h6><a href="#">${fee.student.student_name} <br> ${fee.student.roll_number}</a></h6>
                            <p class="text-muted fs-sm text-truncate mb-0">${fee.student.classes.class_name}</p>
                            </div>
                        </div>
                    `;
                    feeBoard.append(feeHtml);
                
                });
                const totalInstallmentAmount = responseData.reduce((total, item) => {
                    return total + (item.installment_amount || 0);
                }, 0);
                const totalFeetoCollect = $("#collectFees");
                totalFeetoCollect.empty();
                const countFeeHtml = `
                <div class="text-center mt-2">
                <p class="text-uppercase fw-medium text-muted text-truncate fs-md">Fees to Collect</p>
                <h5 class="fw-semibold mb-3">${totalInstallmentAmount}</h5>
            </div>
                `;
                totalFeetoCollect.append(countFeeHtml);
            } else {
                const noDataHtml = `
                    <div class="col-md-12 text-center">
                        <img src="/assets/img/no_data_foundSmalll.png" alt="No Data Found" id="noDataImage">
                    </div>
                `;
                feeBoard.append(noDataHtml);
            }
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
    });
}

function loadAbsentData(){
    const absentUrl = apiUrl + `/Dashboard/today_absent_data/?institute_id=${instituteId}`;
    $.ajax({
        type: "GET",
        url: absentUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        success: function (responseData) {
            const absentStudents = responseData.response.student_absent;
            const absentStaff = responseData.response.staff_absent;
            $('#absentBoard').empty();
            if (absentStudents.length > 0) {
                absentStudents.forEach(student => {
                    const studentCardHtml = `
                        <div class="col-md-4 mb-4 smallCards">
                            <div class="card birthday">
                                <div class="imgBox">
                                    <img src="${student.student.photo}" class="card-img-top rounded-circle birthdayImg" alt="">
                                </div>
                                <div class="card-body mt-3">
                                    <p class="card-text textSize">${student.student.student_name}</p>
                                    <p class="text-muted fs-sm text-truncate mb-0">${student.student.roll_number}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    $('#absentBoard').append(studentCardHtml);
                });
            } 
            if (absentStaff.length > 0) {
                absentStaff.forEach(staff => {
                    const staffCardHtml = `
                        <div class="col-md-4 mb-4 smallCards">
                            <div class="card birthday">
                                <div class="imgBox">
                                    <img src="${staff.staff.photo}" class="card-img-top rounded-circle birthdayImg" alt="">
                                </div>
                                <div class="card-body mt-3">
                                    <p class="card-text textSize">${staff.staff.staff_name}</p>
                                    <p class="text-muted fs-sm text-truncate mb-0">Staff</p>
                                </div>
                            </div>
                        </div>
                    `;
                    $('#absentBoard').append(staffCardHtml);
                });
            } 
            if (absentStudents.length === 0 && absentStaff.length === 0) {
                const noDataCardHtml = `
                    <div class="col-md-12 text-center">
                    <img src="/assets/img/no_data_foundSmalll.png" alt="No Data Found" id="noDataImage">
                    </div>
                `;
                $('#absentBoard').append(noDataCardHtml);
            }
        },
        error: (error) => {
            raiseErrorAlert(error.detail);
        },
    });
}
function getStudentAttendRate(){
    const today = new Date().toISOString().split('T')[0];
    const attendanceUrl = apiUrl + `/StudentAttendance/get_student_attendance_by_institute_id/?institute_id=${instituteId}`;
    $.ajax({
        type: "GET",
        url: attendanceUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        success: function (responseData) {
            const studentAttendanceCard = $("#attendantRate");
            studentAttendanceCard.empty();

            const todayAttendance = responseData.attendance_data.filter(entry => entry.attendance_date === today);
            const presentCount = todayAttendance.filter(entry => entry.attendance_status === "Present").length;
            const attendanceRate = todayAttendance.length > 0 ? ((presentCount / todayAttendance.length) * 100).toFixed(0) : 0;
            const countStudentAttendHtml = `
            <div class="text-center mt-2">
            <p class="text-uppercase fw-medium text-muted text-truncate fs-md">Attendant Rate</p>
            <h5 class="fw-semibold mb-3">${attendanceRate}%</h5>
        </div>
            `;
            studentAttendanceCard.append(countStudentAttendHtml);
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
    });
}