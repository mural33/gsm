$(document).ready(() => {
    let studentInfo =JSON.parse($("#studentInfo").val());
    populateVehicleDetails();
    updateUnassignButtonState();
    $("#btnParentForm").on("click", assignTransport);
    $("#unassignButton").on("click", unassignTransport);

    // student calendar
    loadCalendarDetails(studentInfo.classId, studentInfo.sectionId);
    // 
    const studentAttendance = new StudentAttendance();
    studentAttendance.getAttendance();
    // student exam
    const studentExam = new StudentExam(studentInfo.classId);
    studentExam.getExamsData();
    // student fee
    const studentFee = new StudentFee(parseInt(studentInfo.studentId));
    studentFee.getFeeData();
    $("#btnFeeForm").on("click", async (e) => {
        await studentFee.fixFee();
    })
    // student activity
    const studentActivity = new StudentActivity(studentInfo.studentId);
    studentActivity.getStudentActivity();
    $("#btnActivityForm").on("click", async (e) => {
        await studentActivity.saveStudentActivity();
    })
    // student assignment
    const studentAssignment = new StudentAssignment(studentInfo.studentId,studentInfo.classId,studentInfo.sectionId);
    studentAssignment.getAssignmentData();

    $("#btnParentForm").on("click", async (e) => {
        e.preventDefault();
        const studentParent = new StudentParent();
        await studentParent.addParent();
    })
    // student Documents
    const studentDocuments = new StudentDocuments(studentInfo.studentId);
    studentDocuments.getStudentDocuments();
    $("#btnstudentDocument").on("click", async (e) => {
        var docsName = $("#document_name").val();
        if (docsName.trim().length >= 2) {
            await studentDocuments.uploadStudentDocument();
        } else {
            $("#document_name").addClass("is-invalid");
        }
    });

    $(".dataTables_empty").html(
        `<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found" id="no_data_found">`
    )
});
// --------------------------Base AJax Request--------------------------
async function ajaxRequest(type, url, data,loaderId,loaderSize,successCallback) {
    await $.ajax({
        type: type,
        url: url,
        data: JSON.stringify(data),
        mode: "cors",
        crossDomain: true,
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: () => {
            showLoader(loaderId,loaderSize);
        },
        success: (response) => {
            successCallback(response);
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON);
        },
        complete: () => {
            removeLoader(loaderId, loaderSize);
        }
    });
}

//-------------------------------Student Transport

function updateUnassignButtonState() {
    var noRecordImagePresent = $(".transportContainer .no_data_found").length > 0;
    $("#unassignButton").prop("disabled", noRecordImagePresent);
}

function populateVehicleDetails() {
    var endPoint = `/Transports/get_all_transports_by_institute/?institute_id=${instituteId}`;    
    var selectedVehicleNumber = $("#vehicle_number").val();
    var selectedRouteName = $("#route_name").val();
    var selectedVehicleDetails = $("#vehicle_details").val();
    var totalUrl = apiUrl + endPoint;
    ajaxRequest("GET", totalUrl, "", "transport_form", "sm", (response) => {
        var vehicleDropdown = $("#vehicle_number").html('<option value="" selected disabled>Select Transport</option>');
        for (const vehicle of response) {
            vehicleDropdown.append(`<option value="${vehicle.transport_id}">${vehicle.vehicle_number} (${vehicle.transport_name})</option>`);
        }
        if (selectedVehicleNumber) vehicleDropdown.val(selectedVehicleNumber);
        if (selectedRouteName) $("#route_name").val(selectedRouteName);
        if (selectedVehicleDetails) $("#vehicle_details").val(selectedVehicleDetails);
    });
}

async function unassignTransport() {
    var rollNumber = $("#rollNumberStu").attr("data-roll_number");
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will unassign the transport for this Student!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, unassign it!'
    });

    if (result.isConfirmed) {
        var endpoint = `${apiUrl}/Transports/unassign_transport_to_student/?student_roll_number=${rollNumber}`;
        $.ajax({
            url: endpoint,
            type: 'PUT',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            beforeSend: (e) => {
                showLoader("transportContainerId", "sm");
            },
            success: function (data) {
                $("transportContainer").remove();
                $(".transportContainer").empty().append('<img src="/assets/img/no_data_found.png" %}" alt="No Image" class="no_data_found">');
                raiseSuccessAlert("Transport Unassigned");
                updateUnassignButtonState();
            },
            error: function () {
            },
            complete: function () {
                removeLoader("transportContainerId", "sm");
            }
        });
    }
}

function assignTransport() {
    var rollNumber = $("#rollNumberStu").attr("data-roll_number");
    var selectedVehicleNumber = $("#vehicle_number").val();
    var endpoint = `${apiUrl}/Transports/assign_transport_to_student/?student_roll_number=${rollNumber}&transport_id=${selectedVehicleNumber}`;
    $.ajax({
        url: endpoint,
        type: 'PUT',
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        beforeSend: (e) => {
            showLoader("parentFormAreaa", "sm");
        },
        success: function (data) {
            const assignedData = data.response;
            $('#transport_form').modal('hide');
            fetchTransportDetails(selectedVehicleNumber, function () {
            });
            raiseSuccessAlert("Transport Assigned Successfully");
        },
        error: function () {
        },
        complete: function () {
            removeLoader("parentFormAreaa", "sm");
            updateUnassignButtonState();
        }
    });
}

function fetchTransportDetails(transportId, callback) {
    var transportDetailsEndpoint = `${apiUrl}/Transports/get_transport_data_by_id/?transport_id=${transportId}`;
    $.ajax({
        url: transportDetailsEndpoint,
        type: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        success: function (transportDetails) {
            const fetchedData = transportDetails.response;
            const transportContainer = document.querySelector('.transportContainer');
            if (fetchedData) {
                transportContainer.innerHTML = `
                    <div>
                        <img src="/assets/img/school-bus.png" alt="bus" class="bus-vehicle">
                    </div>
                    <div class="text-left">
                        <p class="text-dark text-right">Vehicle Number: ${fetchedData.vehicle_number}</p>
                        <p class="text-dark text-right">Route Name: ${fetchedData.transport_name}</p>
                        <p class="text-dark text-right">Vehicle Details: ${fetchedData.vehicle_details}</p> 
                    </div>`;
            } else {
                html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`);
            }
            $("#transportContainer").html();
            updateUnassignButtonState();
            if (callback && typeof callback === 'function') {
                callback();
            }
        },
        error: function () {
        }
    });
}

// student parent Code Here
class StudentParent {
    async ajaxRequest(type, url, data,loaderId,loaderSize,successCallback) {
        await $.ajax({
            type: type,
            url: url,
            data: JSON.stringify(data),
            mode: "cors",
            crossDomain: true,
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            contentType: "application/json",
            dataType: "json",
            beforeSend: () => {
                showLoader(loaderId,loaderSize);
            },
            success: (response) => {
                successCallback(response);
            },
            error: (error) => {
                raiseErrorAlert(error.responseJSON);
            },
            complete: () => {
                removeLoader(loaderId, loaderSize);
            }
        });
    }
    async addParent() {        
        if (await this.validateParentForm()) {
            var parentData = {
                "parent_name": $("#parent_name").val(),
                "parent_email": $("#parent_email").val(),
                "parent_phone": $("#parent_phone").val(),
                "parent_profile": "string",
                "parent_gender":$("#parent_gender").val(),
                "parent_age": $("#parent_age").val(),
                "relation_with_student":$("#relation_with_student").val(),
                "parent_address": "string",
                "parent_profession":$("#parent_profession").val(),
                "photo": "string",
                "student_id":$("#student_id").val()
            }
            var parentId = $("#parent_id").val();
            var method = parentId ? "PUT" : "POST";
            var endPoint = parentId ? `/Parents/update_parent/?parent_id=${parentId}` : "/Parents/add_parent/";
            var totalUrl = apiUrl+endPoint
            this.ajaxRequest(method, totalUrl,parentData, "parentFormArea", "sm", async (response) => {
                $("#parent_form").modal('hide');
                var parentData = response.response
                if(parentId){
                    await this.updateParentCard(parentData);
                    await this.restForm()
                }
                else{
                    await this.addNewParent(parentData);
                    await this.restForm()
                }
            });
        }
        else{
            this.restField();
            raiseErrorAlert("Please fill all the fields");
        }
    }

    async validateParentForm() {
        const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        const validPhoneRegex = /^[6-9][0-9]{9}$/;
        function validateInput(input, regex, min, max, errorMessageId, errorMessage) {
            const value = input.val().trim();
            const errorMessageElement = $("#" + errorMessageId);
        
            if (regex && (value.length < min || value.length > max || !regex.test(value))) {
                input.addClass("is-invalid");
                input.focus();
                errorMessageElement.text(errorMessage);
                return false;
            } else if (!regex && (value.length < min || value.length > max)) {
                input.addClass("is-invalid");
                input.focus();
                errorMessageElement.text(errorMessage);
                return false;
            } 
            else {
                input.removeClass("is-invalid");
                errorMessageElement.text("");
                return true;
            }
        }

        const parentName = $("#parent_name");
        const parentAge = $("#parent_age");
        const parentGender = $("#parent_gender");
        const parentRelation = $("#parent_relation");
        const parentEmail = $("#parent_email");
        const parentPhone = $("#parent_phone");
        const parentOccupation = $("#parent_profession");

        const isNameValid = validateInput(parentName, null,parentName.attr("minLength"),parentName.attr("maxLength"), "parent_name_error", "Invalid Name");
        const isAgeValid = validateInput(parentAge, null,parentAge.attr("minLength"),parentAge.attr("maxLength"),"parent_age_error", "Invalid Age");
        const isGenderValid = parentGender.val() !== "";
        const isRelationValid = parentRelation.val() !== "";
        const isEmailValid = validateInput(parentEmail, validRegex,parentEmail.attr("minLength"),parentEmail.attr("maxLength"), "parent_email_error", "Invalid Email");
        const isPhoneValid = validateInput(parentPhone, validPhoneRegex,parentPhone.attr("minLength"),parentPhone.attr("maxLength"), "parent_phone_error", "Invalid Phone");
        const isOccupationValid = validateInput(parentOccupation, null,parentOccupation.attr("minLength"),parentOccupation.attr("maxLength"),"parent_occupation_error", "Invalid Occupation");
    
        return isNameValid && isAgeValid && isGenderValid && isRelationValid && isEmailValid && isPhoneValid && isOccupationValid;

    }

    async restField(){
        $(".is-invalid").on('input', function () {
            if ($(this).val().trim().length > 2) {
                $(this).removeClass("is-invalid");
            }
        }); 
    }

    async addNewParent(response) {
        $("#parentRow").find("#no_data_found").hide();
        var parentData = response;
        var parentRow = $("#parentRow");
        var img = parentData.parent_gender === 'Male' ?'/assets/img/male.png' :'/assets/img/female.png'
        var card = `
        <div class="card col-md-4 mx-2" id="parent-card-${parentData.parent_id}">
            <div class="card-heade text-center my-2">
                <img src=${img} alt="" srcset="" class="card-img-top parent_profile">
            </div>
            <div class="card-body row">
                <p class="card-title col-md-6">
                    Name: <span class="parent-${parentData.parent_id}-parent_name">${parentData.parent_name}</span>
                </p>
                <p class="card-title col-md-6 ">
                    Gender: <span class="parent-${parentData.parent_id}-parent_gender">${parentData.parent_gender}</span>
                </p>
                <p class="card-title col-md-6">
                    Relation: <span
                        class="parent-${parentData.parent_id}-relation_with_student">${parentData.relation_with_student}</span>
                </p>
                <p class="card-title col-md-6 ">
                    Age: <span class="parent-${parentData.parent_id}-parent_age">${parentData.parent_age}</span>
                </p>
            </div>
            <div class="card-footer">
                <button onclick="openParentForm(this)" class="btn btn-md btn-info" data-parent_id="${parentData.parent_id}">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button onclick="deleteParent(this)" data-parent_id="${parentData.parent_id}"
                    class="btn btn-md btn-danger float-end">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
        </div>
        `;
        parentRow.append(card);
    }

    async updateParentCard(parentData) {
        var parentId = parentData.parent_id;
        var parentFieldNames = [
            'parent_name','parent_age','parent_email','parent_phone',
            'parent_gender','relation_with_student','parent_profession',
        ]
        for (const field of parentFieldNames) {
            try {
                $(`.parent-${parentId}-${field}`).text(parentData[field]);
            } catch (e) {
            }
        }
        var imgElement = $(`#parent-img-${parentData.parent_id}`);
        const imgSrc = parentData.parent_gender === 'Male' ? '/assets/img/male.png' : '/assets/img/female.png';
        imgElement.attr("src", imgSrc);
    }

    async restForm(){
        $("#parent_name").val(""),
        $("#parent_email").val(""),
        $("#parent_phone").val(""),
        $("#parent_gender").val(""),
        $("#parent_age").val(""),
        $("#relation_with_student").val(""),
        $("#parent_profession").val(""),
        $("#student_id").val("")
    }
}
// --------------------------------------------------
// parent update
async function openParentForm(element){
    var parentId = $(element).attr("data-parent_id");
    $("#parent_form").modal('show')
    var endPoint = `/Parents/get_parent_data/?parent_id=${parentId}`
    var totalUrl = apiUrl+endPoint;
    var method = "GET";

    await ajaxRequest(method, totalUrl,"","parentFormArea","sm",(response) =>{
        var parentData = response.response;
        for (const key in parentData) {
            try{
                $(`#${key}`).val(parentData[key]);
            }
            catch(e){
                
            }
        }
    })
}
// --------------------------------------------------
// parent delete
async function deleteParent(element){
    var parentId = $(element).attr("data-parent_id");
    await Swal.fire({
        title: 'Are you sure, you want to delete this Record?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $(`#parent-card-${parentId}`).remove()
            var endPoint = `/Parents/delete/${parentId}`
            var totalUrl = apiUrl+endPoint;
            ajaxRequest("DELETE",totalUrl, "","basic","sm",(response) => {
            })
        }
    });
    if ($('#parentRow .card').length === 0) {
        $('#no_data_found').show();
    }

}
// --------------------------------------------------studentAttendance------------------
class StudentAttendance{
    constructor(){
        this.studentId = $("#student_id").val();
    }
    async ajaxRequest(type, url, data,loaderId,loaderSize,successCallback) {
        await $.ajax({
            type: type,
            url: url,
            data: JSON.stringify(data),
            mode: "cors",
            crossDomain: true,
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            contentType: "application/json",
            dataType: "json",
            beforeSend: () => {
                showLoader(loaderId,loaderSize);
            },
            success: (response) => {
                successCallback(response);
            },
            error: (error) => {
                raiseErrorAlert(error.responseJSON);
            },
            complete: () => {
                removeLoader(loaderId, loaderSize);
            }
        });
    }

    async getAttendance(){
        var endPoint = `/StudentAttendance/get_student_attendance_by_student_id/?student_id=${this.studentId}`
        var totalUrl = apiUrl + endPoint;
        await this.ajaxRequest("GET", totalUrl, "", "attendance", "sm",(response) => {
            var studentAttedance = response.student_attendance;

            this.dispalyAttendance(studentAttedance);
            var absent = response.student_attendance_percentage.absent_percentage
            var present = response.student_attendance_percentage.present_percentage
            var leave = response.student_attendance_percentage.leave_percentage
            callPieChart(absent,present,leave)
        });
    }

    async dispalyAttendance(response){
        this.tBody = $("#attendanceTable").find("tbody");
        if(response.length){
            this.tBody.empty();
            for (const attendance of response) {
                let statusClass;
                if (attendance.attendance_status === "Present") {
                    statusClass = "bg-success";
                } else if (attendance.attendance_status === "Absent") {
                    statusClass = "bg-danger";
                } else {
                    statusClass = "bg-warning";
                }
                const row = `
                    <tr>
                        <td>${attendance.attendance_date}</td>
                        <td class="bg ${statusClass} text-white">${attendance.attendance_status}</td>
                    </tr>
                `;
                $("#attendanceTable").DataTable().row.add($(row)).draw()
            }
        }
    }
}
function callPieChart(absent, present,leave) {
    var existingChart = Chart.getChart("studentPieChart");
    if (existingChart) {
        existingChart.destroy();
    }
    // Create a new pie chart
    generatePieChart("studentPieChart", [present, absent,leave], ["Present", "Absent", "Leave"], ["#28a745", "#dc3545", "#ffc107"]);
}
function generatePieChart (id = "",parcenatge= [],labels = [],colors = []) {
    var data = {
        labels:labels,
        datasets: [{
            data: parcenatge,
            backgroundColor: colors
        }]
    };
    // Configuration options
    var options = {
        responsive: true,
        maintainAspectRatio: false
    };
    // Get the canvas element
    var ctx = document.getElementById(`${id}`).getContext('2d');
    // Create the pie chart
    var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: options
    });
}
// --------------------------------------------------studentAttendance------------------
// ----------------------------------studenExam----------------------------------------
class StudentExam{
    constructor(classId){
        this.classId = classId;
    }
    async ajaxRequest(type, url, data,loaderId,loaderSize,successCallback) {
        await $.ajax({
            type: type,
            url: url,
            data: JSON.stringify(data),
            mode: "cors",
            crossDomain: true,
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            contentType: "application/json",
            dataType: "json",
            beforeSend: () => {
                showLoader(loaderId,loaderSize);
            },
            success: (response) => {
                successCallback(response);
            },
            error: (error) => {
                raiseErrorAlert(error.responseJSON);
            },
            complete: () => {
                removeLoader(loaderId, loaderSize);
            }
        });
    }
    async getExamsData(){
        var endPoint = `/ParentExams/get_parent_exam_by_class_id?class_id=${this.classId}`;
        var totalUrl = apiUrl + endPoint;
        await this.ajaxRequest("GET", totalUrl, "", "examination", "sm",async (response) => {
            var upcomingExams = response.upcoming_parent_exam
            var pastExams = response.old_parent_exams
            await this.displayUpcomingExamsData(upcomingExams);
            await this.displayPastExamsData(pastExams);
        });
    }
    async displayUpcomingExamsData(response){
        var upcomingExams = $("#UpComingExamTable").DataTable();
        if(response.length > 0){
            upcomingExams.clear().draw()
            for (const key in response) {
                var exam = response[key]
                var row = `
                <tr>
                    <td>${exam.parent_exam_name}</td>
                    <td>${exam.start_date}</td>
                    <td>${exam.end_date}</td>
                    <td>${exam.result_date}</td>
                </tr>
                `;
                upcomingExams.row.add($(row)).draw()
            }
        }
    }
    async displayPastExamsData(response){
        var pastExams = $("#pastExamTable");
        let studentData =JSON.parse($("#studentInfo").val());
        if(response.length > 0){
            pastExams.find("tbody").empty();
            for (const key in response) {
                var exam = response[key]
                var row = `
                <tr>
                    <td>${exam.parent_exam_name}</td>
                    <td>${exam.start_date}</td>
                    <td>${exam.end_date}</td>
                    <td>${exam.result_date}</td>
                    <td>
                        <button data-parent_exam=${exam.parent_exam_id} data-student_id=${studentData.studentId} class="btn btn-primary btn-label right rounded-pill" onClick="getResultData(this)">Show Result</button>
                    </td>
                </tr>
                `;
                pastExams.find("tbody").append(row);
            }
        }
        pastExams.DataTable();
    }
}
async function getResultData(element){
    var examId = $(element).attr("data-parent_exam");
    var studentId = $(element).attr("data-student_id");
    $("#resultModel").modal('show');
    var endPoint = `/Result/get_result_entry_by_student_id_and_parent_exam_id/?student_id=${studentId}&parent_exam_id=${examId}`;
    var totalUrl = apiUrl + endPoint;
    await this.ajaxRequest("GET", totalUrl, "", "resultModelArea", "sm",async(response) => {
        var resultTable = $("#resultTable");
        if(response.response){
            var resultData = response.response["result"];
            var marksData = resultData.marks;
            resultTable.find("tbody").html("");
            var trs = [];
            marksData.forEach(result => {
                var tr = `
                    <tr>
                        <td>${result.subject_name}</td>
                        <td>${result.full_marks}</td>
                        <td>${result.obtained_marks}</td>
                        <td>${result.percentage}</td>
                        <td>${result.grade}</td>
                    </tr>
                `;
                trs.push(tr);
            });
            var lastTr = `<tr>
                    <td>Total</td>
                    <td>${resultData.total_marks}</td>
                    <td>${resultData.total_obtained_marks}</td>
                    <td>${resultData.percentage}</td>
                    <td>${resultData.grade}</td>
                </tr>`
            trs.push(lastTr);
            resultTable.find("tbody").append(trs.join(""));
            resultTable.dataTable();
        }
        else{
            resultTable.dataTable();
        }
    }); 

}
// ----------------------------------studenExam----------------------------------------
// ----------------------------------studentFee----------------------------------------
class StudentFee{
    constructor(studentId){
        this.studentId =studentId
    }
    async ajaxRequest(type, url, data,loaderId,loaderSize,successCallback) {
        await $.ajax({
            type: type,
            url: url,
            data: JSON.stringify(data),
            mode: "cors",
            crossDomain: true,
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            contentType: "application/json",
            dataType: "json",
            beforeSend: () => {
                showLoader(loaderId,loaderSize);
            },
            success: (response) => {
                successCallback(response);
            },
            error: (error) => {
                raiseErrorAlert(error.responseJSON);
            },
            complete: () => {
                removeLoader(loaderId, loaderSize);
            }
        });
    }
    async getFeeData(){
        var endPoint = `/StudentFee/get_all_student_installments/?student_id=${this.studentId}`;
        var totalUrl = apiUrl + endPoint;
        await this.ajaxRequest("GET", totalUrl, "", "fee", "sm",async(response) => {
            var discountData = response.discount;
            var feeData = response.fee_data?response.fee_data[0]:[];
            var installmentData = response.student_fee;
            var isFeeFixed = installmentData.length > 0 ? true : false;
            await this.shoeFeeDetails(feeData,discountData,isFeeFixed);
            await this.displayInstallentData(installmentData); 
        })
    }
    async displayInstallentData(response){
        showLoader("installmentTable","sm")
        var installmentTable = $("#installmentTable").DataTable(
            {
                "ordering": [],
                'sort': false,
            }
        )
        if(response.length > 0){
            installmentTable.clear().draw();
            for (const key in response) {
                var installment = response[key]
                var color = installment.installment_status === true ? "bg-success" : "bg-danger"
                var statusMsg = installment.installment_status === true ? "Paid" : "Unpaid"
                var payBtn = installment.installment_status === true ? 
                `<button class="btn btn-sm btn-danger" Onclick="deleteInstallment(this)" data-installment_id ='${installment.installment_id}'>
                    <i class="bi bi-trash3"></i>
                </button>` : 
                `<button class="btn btn-info btn-label rounded-pill right" 
                onClick="editInstallment(this)" data-installment_id ='${installment.installment_id}'>
                    Pay
                    <i class="bi bi-currency-rupee label-icon align-middle fs-lg ms-2"></i>
                </button>`
                var row = `
                    <tr class="tr-installment-${installment.installment_id}">
                        <td>${installment.installment_name}</td>
                        <td>${installment.installment_due_date}</td>
                        <td>${installment.installment_amount}</td>
                        <td>${installment.installment_paid_date}</td>
                        <td class="${color}">
                            ${statusMsg}
                        </td>
                        <td>
                            ${payBtn}
                        </td>
                    </tr>
                `
                installmentTable.row.add($(row)).draw()
            }
        }
        removeLoader("installmentTable","sm")
    }
    async shoeFeeDetails(feeData,discountData,isFeeFixed){
        let discount = 0;
        function displayInstallemenst(installments){
            var select = $("#installment_type");
            var option = `<option value="">Select Installment</option>`
            select.append(option);
            for (const installment of installments) {
                var option = `<option value="${installment.installment_number}">${installment.installment_name}</option>`
                select.append(option);
            }
        }
        if(discountData){
                discount = discountData.discount || 0
                $("#discount").val(discount);
                $("#discount").attr("readonly","readonly");
        }
        if(feeData){
            $("#total_fee").val(feeData.fee_total || 0);
            $("#admission_fee").val(feeData.fee_admission || 0);
            $("#total_insta_amount").val( feeData.total_installments - discount || 0);
            if(isFeeFixed){
                $("#installment_type").attr("disabled","disabled");
                var option = `<option value="${feeData.installment_number}">${feeData.installment_name}</option>`
                $("#installment_type").append(option);
                $("#btnFeeForm").attr("disabled","disabled");
            }else{
                displayInstallemenst(feeData.class_installments);
            }
        }
        else{
            $("#installment_type").attr("disabled","disabled");
            $("#btnFeeForm").attr("disabled","disabled");
        }
    }
    async fixFee(){
        var endPoint = `/StudentFee/create_student_fee/`;
        var totalUrl = apiUrl + endPoint;
        var payload = {
            "student_id":this.studentId,
            "fee_total":$("#total_insta_amount").val(),
            "discount": $("#discount").val(),
            "intstall_count": $("#installment_type").val(),
        }
        await this.ajaxRequest("POST", totalUrl, payload,"fee","sm",async (response) => {
            $("#installment_type").attr('disabled', 'disabled')
            raiseSuccessAlert("Fee Fixed Successfully")
        })
    }
}
function showDiscount(element){
    var discount = $(element).val();
    var totalFee = $("#total_fee").val() - $("#admission_fee").val();
    var totalInstaAmount = totalFee - discount;
    $("#total_insta_amount").val(totalInstaAmount);
}
function showInstallments(element) {
    let installmentTable = $("#installmentTable").DataTable();
    installmentTable.clear().destroy();
    var installmentCount = $(element).val();
    var totalFee = $("#total_insta_amount").val();
    var installmentAmount = (parseFloat(totalFee) / installmentCount).toFixed(2);
    for (let i = 1; i <= installmentCount; i++) {
        var color = "bg-danger";
        var statusMsg = "Unpaid";
        var dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (30 * i));
        dueDate = dueDate.toISOString().split('T')[0];
        var row = `
            <tr>
                <td>installment_${i}</td>
                <td>${dueDate}</td>
                <td>${installmentAmount}</td>
                <td>-</td>
                <td class="${color}">
                    ${statusMsg}
                </td>
            </tr>
        `;
        installmentTable.row.add($(row)).draw()
    }
    installmentTable.draw();
}

async function editInstallment(element){
    var installmentId = $(element).attr("data-installment_id");
    $("#editInstallment").modal('show');
    $("#editInstallment").attr("data-installment_id",installmentId)
    var endPoint = `/StudentFee/update_student_installment/?installment_id=${installmentId}`;
    var totalUrl = apiUrl + endPoint;
    await ajaxRequest("PATCH", totalUrl, "", "installmentTable", "sm",async(response) => {
        var installmentData = response.response;
        var installmentTr = $(`.tr-installment-${installmentId}`);
        installmentTr.find("td").eq(3).text(installmentData.installment_paid_date);
        installmentTr.find("td").eq(4).removeClass("bg-danger").addClass("bg-success").text("Paid");
        installmentTr.find("td").eq(5).html(`
        <button class="btn btn-sm btn-danger" Onclick="deleteInstallment(this)" data-installment_id="${installmentId}">
        <i class="bi bi-trash3"></i>
        </button>
        `)
        $(element).remove();
    })
}

async function deleteInstallment(element){
    var installmentId = $(element).attr("data-installment_id");
    await Swal.fire({
        title: 'Are you sure, you want to delete this Record?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
    }).then(async(result) => {
        if (result.isConfirmed) {
            var endPoint = `/StudentFee/delete_student_installment/?installment_id=${installmentId}`;
            var totalUrl = apiUrl + endPoint;
            await ajaxRequest("PATCH", totalUrl, "", "installmentTable", "sm",async(response) => {
                var installmentTr = $(`.tr-installment-${installmentId}`);
                installmentTr.find("td").eq(3).text("");
                installmentTr.find("td").eq(4).removeClass("bg-success").addClass("bg-danger").text("Unpaid");
                installmentTr.find("td").eq(5).html(`
                <button class="btn btn-info btn-label rounded-pill right" 
                onClick="editInstallment(this)" data-installment_id ='${installmentId}'>
                    Pay
                    <i class="bi bi-currency-rupee label-icon align-middle fs-lg ms-2"></i>
                </button>
                `)
            })
        }
    });

}

// ----------------------------------studentFee----------------------------------------
// ----------------------------------studentActivity----------------------------------------
class StudentActivity{
    constructor(studentId){
        this.studentId = studentId;
        this.activityTable = $("#activityTable").DataTable();
    }
    async ajaxRequest(type, url, data,loaderId,loaderSize,successCallback) {
        await $.ajax({
            type: type,
            url: url,
            data: JSON.stringify(data),
            mode: "cors",
            crossDomain: true,
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            contentType: "application/json",
            dataType: "json",
            beforeSend: () => {
                showLoader(loaderId,loaderSize);
            },
            success: (response) => {
                successCallback(response);
            },
            error: (error) => {
                raiseErrorAlert(error.responseJSON);
            },
            complete: () => {
                removeLoader(loaderId, loaderSize);
            }
        });
    }
    async getStudentActivity(){
        var endPoint = `/Activity/get_all_activity_by_student/?student_id=${this.studentId}`;
        var totalUrl = apiUrl + endPoint;
        await this.ajaxRequest("GET", totalUrl, "", "activites", "sm",async(response) => {
            var studentActivity = response.response;
            this.displayStudentActivity(studentActivity);
        })
    }
    async saveStudentActivity(){
        var activityId = $("#activity_id").val();
        var activityData = {
            "institution_id":instituteId,
            "activity_name":$("#activity_name").val(),
            "activity_description": $("#activity_description").val(),
            "activity_date":$("#activity_date").val(),
            "activity_location":$("#activity_location").val(),
            "is_deleted": false,
            "student_id":this.studentId
        }
        var postEndPoint = "/Activity/create_activity/";
        var putEndPoint = `/Activity/update_activity/?actity_id=${activityId}`;
        var endPoint = activityId ? putEndPoint : postEndPoint;
        var totalUrl = apiUrl + endPoint;
        var method = activityId ? "PUT" : "POST";
        if(await this.validateStudentActivityForm() === true){
            await this.ajaxRequest(method, totalUrl, activityData, "activityFormArea", "sm",async(response) => {
                var studentActivity = response.response;
                if(activityId){
                    updateActivity(studentActivity)
                }
                else{
                    var row = showActivity(studentActivity)
                    this.activityTable.row.add($(row)).draw()
                }
                function showActivity(response){
                    var activity = response
                    var title = activity.activity_name
                    var desc = activity.activity_description
                    var row = `
                        <tr class="tr-activity-${activity.activity_id}">
                            <td class="activity_name">${title}</td>
                            <td class="activity_date">${activity.activity_date}</td>
                            <td class="activity_desc">
                                <button class="btn btn-dark btn-label right rounded-pill" onClick="showActivityDetailse('${title}','${desc}')">
                                <i class="ri-eye-line label-icon align-middle rounded-pill fs-lg ms-2"></i>
                                    View
                                </button>
                            </td>
                            <td class="activity_location">${activity.activity_location}</td>
                            <td>
                                <button class="btn btn-sm btn-info" onClick="editActivity(this)" data-activity_id ='${activity.activity_id}'>
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" data-activity_id ='${activity.activity_id}' onClick="deleteActivity(this)">
                                    <i class="bi bi-trash3"></i>
                                </button>
                            </td>
                        </tr>`;;
                    $("#activityForm").modal('hide');
                    return row
                }
                function updateActivity(response){
                    var activityTr = $(`.tr-activity-${activityId}`);
                    $("#activityForm").modal('hide');
                    var activity = response
                    var title = activity.activity_name
                    var desc = activity.activity_description
                    activityTr.find(".activity_name").text(title);
                    activityTr.find(".activity_date").text(activity.activity_date);
                    activityTr.find(".activity_location").text(activity.activity_location);
                    activityTr.find(".activity_desc").html(
                        `<button class="btn btn-dark btn-label right rounded-pill" onClick="showActivityDetailse('${title}','${desc}')">
                        <i class="ri-eye-line label-icon align-middle rounded-pill fs-lg ms-2"></i>
                            View
                        </button>`
                    )
                }
            })
        }
        else{
            raiseErrorAlert("Please fill all the fields");
        }
    }
    async displayStudentActivity(response){
        if(response.length > 0){
            this.activityTable.clear().draw();
            for (const key in response) {
                var activity = response[key]
                var title = activity.activity_name
                var desc = activity.activity_description
                var row = `
                    <tr class="tr-activity-${activity.activity_id}">
                        <td class="activity_name">${title}</td>
                        <td class="activity_date">${activity.activity_date}</td>
                        <td class="activity_desc">
                            <button class="btn btn-dark btn-label right rounded-pill" onClick="showActivityDetailse('${title}','${desc}')">
                            <i class="ri-eye-line label-icon align-middle rounded-pill fs-lg ms-2"></i>
                                View
                            </button>
                        </td>
                        <td class="activity_location">${activity.activity_location}</td>
                        <td>
                            <button class="btn btn-sm btn-info" onClick="editActivity(this)" data-activity_id ='${activity.activity_id}'>
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" data-activity_id ='${activity.activity_id}' onClick="deleteActivity(this)">
                                <i class="bi bi-trash3"></i>
                            </button>
                        </td>
                    </tr>`;;
                this.activityTable.row.add($(row)).draw();
            }
        }
    }

    async validateStudentActivityForm() {
        const activityTitle = $("#activity_name");
        const activityDescription = $("#activity_description");
        const activityDate = $("#activity_date");
        const activityLocation = $("#activity_location");

        function validateInput(input, min, max, errorMessageId, errorMessage) {
            const value = input.val().trim();
            const errorMessageElement = $("#" + errorMessageId);
            if (value.length < min || value.length > max) {
                input.addClass("is-invalid");
                input.focus();
                errorMessageElement.text(errorMessage);
                return false;
            } else {
                input.removeClass("is-invalid");
                errorMessageElement.text(""); 
                return true;
            }
        }
    
        const titleValid = validateInput(activityTitle, activityTitle.attr("minLength"), activityTitle.attr("maxLength"), "activity_title_error", "Invalid Title");
        const descriptionValid = validateInput(activityDescription, activityDescription.attr("minLength"), activityDescription.attr("maxLength"), "activity_description_error", "Invalid Description");
        var dateValid = true
        if(activityDate.val() === ""){
            activityDate.addClass("is-invalid");
            activityDate.focus();
            $("#activity_date_error").text("Invalid Date");
            dateValid = false;
        }
        else{
            activityDate.removeClass("is-invalid")
            dateValid = true;
        }
        const locationValid = validateInput(activityLocation, activityLocation.attr("minLength"), activityLocation.attr("maxLength"), "activity_location_error", "Invalid Location");
        return titleValid && descriptionValid && dateValid && locationValid;
    }

}
async function deleteActivity(element){
    var activityId = $(element).attr("data-activity_id");
    await Swal.fire({
        title: 'Are you sure, you want to delete this Record?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            var endPoint = `/Activity/delete_activity/?activity_id=${activityId}`
            var totalUrl = apiUrl+endPoint;
            ajaxRequest("DELETE",totalUrl, "","activityTable","sm",(response) => {
                $(`.tr-activity-${activityId}`).remove()

            })
        }
    });

}
function editActivity(element){
    var activityId = $(element).attr("data-activity_id");
    $("#activityForm").modal('show');
    $("#activityForm").attr("data-activity_id",activityId)
    var endPoint = `/Activity/get_activity_by_id/?activity_id=${activityId}`
    var totalUrl = apiUrl+endPoint;
    ajaxRequest("GET",totalUrl, "","activityFormArea","sm",(response) => {
        var activityData = response.response;
        console.log(activityData);
        for (const key in activityData) {
            try{
                $(`#${key}`).val(activityData[key]);
            }
            catch(e){
                
            }
        }
    })
}
function showActivityDetailse(title,desc){
    var activityModel = $("#activityDetailse")
    activityModel.modal('show')
    activityModel.find(".modal-title .activityName").text(title)
    activityModel.find(".modal-body .activityDetailse").text(desc)
}
// ----------------------------------studentAssignment----------------------------------------
class StudentAssignment{
    constructor(studentId,classId,sectionId){
        this.studentId = studentId;
        this.classId = classId;
        this.sectionId =sectionId
    }
    async ajaxRequest(type, url, data,loaderId,loaderSize,successCallback) {
        await $.ajax({
            type: type,
            url: url,
            data: JSON.stringify(data),
            mode: "cors",
            crossDomain: true,
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            contentType: "application/json",
            dataType: "json",
            beforeSend: () => {
                showLoader(loaderId,loaderSize);
            },
            success: (response) => {
                successCallback(response);
            },
            error: (error) => {
                raiseErrorAlert(error.responseJSON);
            },
            complete: () => {
                removeLoader(loaderId, loaderSize);
            }
        });
    }
    async getAssignmentData() {
        var endPoint = `/Assignments/get_assignment_for_student_tab/?class_id=${this.classId}&section_id=${this.sectionId}`;
        var totalUrl = apiUrl + endPoint;
        await this.ajaxRequest("GET", totalUrl, "", "assignments", "sm",(response) => {

            this.displayAssignmentData(response);
        });
    }
    async displayAssignmentData(response){
        this.tBody = $("#assginmentTable").find("tbody");
        var submitAssignment = response.submitted_assignments
        var unsubmitAssignment = response.unsubmitted_assignments
        if(submitAssignment.length > 0 || unsubmitAssignment.length > 0){
            this.tBody.empty();
            for (const assignment of submitAssignment) {
                var desc = assignment.assignment_details
                var row = `
                <tr class="tr-assignment-${assignment.id}">
                    <td class="w-25 text-wrap assignment_title" >${assignment.assignment_title}</td>
                    <td class="assignment_Date">${assignment.assignment_Date}</td>
                    <td class="assignment_due_date">${assignment.assignment_due_date}</td>
                    <td>    
                        <button onClick="openAssignmentDetails('${desc}')"  class="btn btn-dark btn-label right rounded-pill">
                            <i class="ri-eye-line label-icon align-middle rounded-pill fs-lg ms-2"></i>
                            See
                        </button>
                    </td>
                    <td class="assignment_status">
                    <span class="bg-success p-2 text-white">Submited</span>
                    </td>
                    <td class="action_btn">
                            <button  class="btn btn-primary btn-label right rounded-pill">
                                    <i class="ri-check-double-line label-icon align-middle rounded-pill fs-lg ms-2"></i>
                                    Download
                            </button>
                    </td>
                </tr>
                `;
                $("#assginmentTable").DataTable().row.add($(row)).draw()
            }
            for (const assignment of unsubmitAssignment) {
                var desc = assignment.assignment_details
                var row = `
                <tr class="tr-assignment-${assignment.id}">
                    <td class="w-25 text-wrap assignment_title" >${assignment.assignment_title}</td>
                    <td class="assignment_Date">${assignment.assignment_Date}</td>
                    <td class="assignment_due_date">${assignment.assignment_due_date}</td>
                    <td>    
                        <button onClick="openAssignmentDetails('${desc}')"  class="btn btn-dark btn-label right rounded-pill">
                            <i class="ri-eye-line label-icon align-middle rounded-pill fs-lg ms-2"></i>
                            See
                        </button>
                    </td>
                    <td class="assignment_status">
                        <span class="bg-danger p-2 text-white">Not Submited</span>
                    </td>
                    <td class="action_btn">
                        <button onClick = "openAssignmentSubmissionModal('${assignment.assignment_title}','${assignment.id}')" class="btn btn-primary btn-label right rounded-pill">
                            <i class="ri-check-double-line label-icon align-middle rounded-pill fs-lg ms-2"></i>
                            Submit
                        </button>
                    </td>
                </tr>
                `;
                $("#assginmentTable").DataTable().row.add($(row)).draw()
            }
        }
        $("#assginmentTable").DataTable()
        noDataImage()
    }

}
function openAssignmentDetails(response) {
    var assignmentModel =  $("#assignmentDetailse")
    assignmentModel.modal('show')
    assignmentModel.find(".modal-title").text("Assignment Details")
    assignmentModel.find(".modal-desc").text(response)
}
// ----------------------------------studentAssignment----------------------------------------
// ----------------------------------studentDocument----------------------------------------
class StudentDocuments {
  constructor(studentId) {
    this.studentId = parseInt(studentId);
  }
  async ajaxRequest(type, url, data, loaderId, loaderSize, successCallback) {
    await $.ajax({
      type: type,
      url: url,
      data: JSON.stringify(data),
      mode: "cors",
      crossDomain: true,
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      contentType: "application/json",
      dataType: "json",
      beforeSend: () => {
        showLoader(loaderId, loaderSize);
      },
      success: (response) => {
        successCallback(response);
      },
      error: (error) => {
        raiseErrorAlert(error.responseJSON);
      },
      complete: () => {
        removeLoader(loaderId, loaderSize);
      },
    });
  }
  async getStudentDocuments() {
    var endPoint = `/StudentsDocuments/get_student_documents_by_student_id/?student_id=${this.studentId}`;
    var totalUrl = apiUrl + endPoint;
    await this.ajaxRequest(
      "GET",
      totalUrl,
      "",
      "documents",
      "sm",
      async (response) => {
        var studentDocuments = response.response;
        this.displayStudentDocument(studentDocuments);
      }
    );
  }
  async displayStudentDocument(response) {
    this.documents = $("#documentRow");
    this.studenDocuments = response
    if (this.studenDocuments.length > 0) {
    $("#documentRow").find(".no_data_found").hide();
      // this.documents.empty();
    for (const key in this.studenDocuments) {
        var docs = this.studenDocuments[key];
        var docsName = docs.document_file.split("/").pop();
        var document_name = docs.document_name;
        var card = `
        <div class="col-md-4 card-student-${docs.document_id}">
            <div class="card mb-3">
                <!-- Display record details here -->
                <div class="card-body">
                    <p class="card-title">${document_name}</p>                                    
                </div>
                <div class="card-footer d-flex justify-content-evenly">
                    <button data-documentId="${docs.document_id}" class="btn btn-sm btn-info" onclick="editeDocument(this)">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button onClick="deleteStudentDocument(this)" data-documentId="${docs.document_id}" class="btn btn-sm btn-danger">
                        <i class="bi bi-trash3"></i>
                    </button>
                    <a href="/app/azure_download/${docsName}/student_documents/" data-documentId="${docs.document_id}"  class="btn btn-sm btn-dark">
                        <i class="bi bi-download"></i>
                    </a>
                </div>
            </div>
        </div>`;
        this.documents.append(card);
    }
    }
    }
    async uploadStudentDocument() {
        var documentId = $("#document_id").val();
        var payload = {
            "document_name": $("#document_name").val(),
            "document_file":await uploadFile("document_file", "student_documents"),
            "student_id":this.studentId,
            "is_deleted": false
        }
        var method = documentId ? "PUT" : "POST";
        var postEndPoint = `/StudentsDocuments/add_student_documents/`;
        var updateEndPoint = `/StudentsDocuments/update_student_documents/?document_id=${documentId}`;
        var endPoint = documentId ? updateEndPoint : postEndPoint;
        var totalUrl = apiUrl + endPoint;

        await this.ajaxRequest(method, totalUrl, payload, "documentFormArea", "sm",(response) => {
            noDataImage()
            $("#documentForm").find("input,select,textarea").val("")
            $("#documentForm").modal('hide')
            this.docuemntRow = $("#documentRow")
            var docs = response.response
            var document_name = docs.document_name
            if(!documentId){
                var card = `
                    <div class="col-md-4 card-student-${docs.document_id}">
                        <div class="card mb-3">
                            <!-- Display record details here -->
                            <div class="card-body">
                                <p class="card-title">${document_name}</p>                                
                            </div>
                            <div class="card-footer d-flex justify-content-evenly">
                                <button data-documentId="${docs.document_id}" class="btn btn-sm btn-info" onclick="editeDocument(this)">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button onClick="deleteStudentDocument(this)" data-documentId="${docs.document_id}" class="btn btn-sm btn-danger">
                                    <i class="bi bi-trash3"></i>
                                </button>
                                <button data-documentId="${docs.document_id}" class="btn btn-sm btn-dark">
                                    <i class="bi bi-download"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `
                this.docuemntRow.append(card);
                raiseSuccessAlert(response.msg)
                $("#documentRow").find(".no_data_found").hide()
            }
            else{
                $(`.card-student-${docs.document_id}`).find(".card-title").text(`${document_name}`)
                raiseSuccessAlert(response.msg)
            }
            this.docuemntRow.find("input,select,textarea").val("")
        });
    }
}
async function deleteStudentDocument(element){
    var documentId = $(element).attr("data-documentId");
    var endPoint = `/StudentsDocuments/delete_student_documents/?document_id=${documentId}`;
    var totalUrl = apiUrl + endPoint;
    await Swal.fire({
        title: 'Are you sure, you want to delete this Record?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $(`.card-student-${documentId}`).remove()
            ajaxRequest("DELETE", totalUrl, "","documents","lg",(response) => {
                raiseSuccessAlert(response.msg);
                if ($('#documentRow .card').length <= 0) {
                    $("#documentRow").find(".no_data_found").show()
                }
            })
        }
    });
    
}
async function editeDocument(element){
    var documentId = $(element).attr("data-documentId");
    var endPoint = `/StudentsDocuments/get_student_documents_by_id/?document_id=${documentId}`;
    var totalUrl = apiUrl + endPoint;
    $("#documentForm").modal('show')
    await ajaxRequest("GET", totalUrl, "","documentFormArea","sm",(response) => {
        var documentData = response.response;
        $("#document_name").val(documentData.document_name)
        $("#document_id").val(documentData.document_id)
    })
}
async function loadCalendarDetails(class_id, section_id) {
    try {
    var searchUrl = `${apiUrl}/Calender/get_calender_by_class&section/?class_id=${class_id}&section_id=${section_id}`;
      const calendarData = await $.ajax({
        type: "GET",
        url: searchUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        beforeSend: (e) => {
            showLoader('calenderTable', 'sm');
        },
      });
  
      var calendarDetailsContainer = $("#calendar");
      var calendarTable = calendarDetailsContainer.find("#calenderTable");
      var noDataImage = calendarDetailsContainer.find('.no_data_found');
  
      if (!calendarData.response || calendarData.response.length === 0) {
        noDataImage.show();
        calendarTable.hide();
      } else {
        noDataImage.hide();
        calendarTable.show();
  
        var data = calendarData.response;
        var className = [...new Set(data.map(item => item.classes.class_name))];
        var sectionName = [...new Set(data.map(item => item.sections.section_name))];
        var classSectionRow = $("<tr>");
        classSectionRow.append(`<td colspan="8" class="col" id="column"><center><b>${className} - ${sectionName}</b></center></td>`);
        calendarTable.empty().append(classSectionRow);
  
        var headerRow = $("<tr class='col' id='column'>");
        headerRow.append("<th>Time</th>");
  
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        var uniqueDays = [...new Set(data.map(item => item.day))];
        uniqueDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
  
        uniqueDays.forEach(day => {
          headerRow.append(`<th>${day}</th>`);
        });
        calendarTable.append(headerRow);
  
        var timeDayMap = {};
        data.forEach(item => {
          var timeKey = `${item.start_time}-${item.end_time}`;
          if (!timeDayMap[timeKey]) {
            timeDayMap[timeKey] = {};
          }
          timeDayMap[timeKey][item.day] = {
            subject: item.subjects.subject_name,
            staff: item.staffs.staff_name,
          };
        });
  
        for (var timeKey in timeDayMap) {
          var timeSlotRow = $("<tr class='rowData'>");
          timeSlotRow.append(`<td class="mod" id="tdData">${timeKey}</td>`);
  
          uniqueDays.forEach(day => {
            var cellData = timeDayMap[timeKey][day];
            if (cellData) {
              timeSlotRow.append(`<td id="tableData">${cellData.subject} <br> (${cellData.staff})</td>`);
            } else {
              timeSlotRow.append('<td id="tableData"></td>');
            }
          });
          calendarTable.append(timeSlotRow);
        }
      }
    if(calendarData.response.length == 0){
        $("#calendar").html(
          `
            <div class="row">
            <div class="text-center" id="no_data_found">
            <img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found" id="no_data_found">
            </div>
            </div>
            `
        );
    }
    } catch (error) {
        console.log(error);
      raiseErrorAlert(error.responseJSON.detail);
    } finally {
      removeLoader("calenderTable", "sm");
    }
  }
function noDataImage(){
    $(".dataTables_empty").html(
        `<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found" id="no_data_found">`
    )
}
noDataImage()