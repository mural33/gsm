$(document).ready(function () {
    // loadUpcomingNotice();
    getStudentCount();
    getStaffCount();
    getBirthdays();
    // loadAccountSummary();
});


function loadUpcomingNotice() {
    const upomingNoticeUrl = apiUrl + `/Notice/get_notices_institute/?institute_id=${instituteId}`;
    console.log(upomingNoticeUrl);
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
            const upcomingNoticeContainer = $("#upcomingNotice");
            upcomingNoticeContainer.empty();
            const currentDate = new Date();
            responseData = responseData.filter(notice => new Date(notice.notice_date) >= currentDate);
            responseData.sort((a, b) => new Date(a.notice_date) - new Date(b.notice_date));
            const upcomingNotices = responseData.slice(0, 5);
            if (upcomingNotices.length > 0) {
            upcomingNotices.forEach((notice) => {
                const noticeHtml= `
                    <div class="flex-grow-1 d-flex align-items-center">
                        <div class="flex-grow-1">
                            <i class="ti ti-point-filled align-baseline me-1 text-success fs-4"></i>
                        </div>
                        <div class="flex-grow-1 px-3 py-2 overflow-hidden">
                            <h6 class="text-start">${notice.notice_title}</h6>
                        </div>
                        <div class="flex-grow-0">
                            ${notice.notice_date}
                        </div>
                    </div>
                `;
                upcomingNoticeContainer.append(noticeHtml);
            });
    } else {
        const noDataHtml = `
            <div class="text-center">
                <img src="/assets/img/no_data_found.png" alt="No Data Found" class="no_data_found">
            </div>
        `;
        upcomingNoticeContainer.append(noDataHtml);
    }
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
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
            raiseErrorAlert(error.responseJSON.detail);
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

        const birthdayContent = $("#birthdays");
        birthdayContent.empty();

        if (allBirthdays.length > 0) {
            allBirthdays.forEach(person => {
                const personHtml = `
                <div class="p-2 border-bottom">
                <div class="d-flex align-items-center gap-2">
                    <div class="flex-shrink-0">
                    <img src="${person.photo || '/assets/img/default_photo.jpg'}" alt="" class="img-fluid rounded-circle sizeimg">
                    </div>
                    <div class="flex-grow-2 names">
                        <h6 class="mb-1">${person.student_name || person.staff_name}</h6>
                        <p class="text-muted fs-sm mb-0">${person.classes?.class_name || 'Staff'}</p>
                        </div>
                </div>
            </div>
                `;
                birthdayContent.append(personHtml);
            });
        } else {
            const noBirthdayHtml = `
                <div class="p-3 text-center">
                    <img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">
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