
$(document).ready(e => {
    $("#UpComingExamTable,#pastExamTable,#Installment,\
    #activityTable,#assginmentTable,#attendanceTable").DataTable()
    $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`)

    let studentInfo =JSON.parse($("#studentInfo").val());
    $("#btnParentForm").on('click', e => {
        if (validateForm(parentFieldNames) === true) {
            addParent();
        }
    });

    $("#parent_phone").on('input', function () {
        phoneNumber($(this).attr('id'));
    });

    let studentData = new StudentData();
    studentData.getAssignmentData(studentInfo.classId, studentInfo.sectionId);
    studentData.getStudentAttendance(studentInfo.studentId); 
    studentData.getExamsData(studentInfo.classId)
    studentData.getStudentDocuments(studentInfo.studentId);
    studentData.getFeeData(studentInfo.studentId);
    loadCalendarDetails(studentInfo.classId, studentInfo.sectionId);
    studentData.showStudentActivity();
    callPieChart();
    $("#btnFeeForm").on('click', async (e) => {
        await studentData.fixStudentFee(studentInfo.studentId);
    })

    $("#btnSubmitAssignment").on('click', e => {
        studentData.submitAssignment($("#assginmentId").val(),studentInfo.studentId);
    });
    $("#btnstudentDocument").on('click', e => {
        studentData.uploadDocument(studentInfo.studentId);
    }) 
    
    $("#btnActivityForm").on('click', e => {
        if (studentActivityForm() === true) {
            studentData.saveActivity();
        }
        else{
            restField()
        }
    });
    $("#installment_type").on("change",()=>{
        var installment = $("#installment_type").val()
        if(installment.trim() != ""){
            var discount = $("#discount").val() || 0
            var total_fee = ((parseFloat($("#total_fee").val()) || 0) - (parseFloat($("#admission_fee").val()) || 0)) - parseFloat(discount)
            var total_insta_amount = parseFloat(total_fee) - parseFloat(discount)
            $("#total_insta_amount").val(total_insta_amount)
            showDynamicFee(installment)
        }
        else{
            $("#Installment tbody").empty()
        }
    })
    $("#discount").on("input",(e)=>{
        var discount = $("#discount").val() || 0
        var total_fee = ((parseFloat($("#total_fee").val()) || 0) - (parseFloat($("#admission_fee").val()) || 0)) - parseFloat(discount)
        var total_insta_amount = parseFloat(total_fee) - parseFloat(discount)
        $("#total_insta_amount").val(total_insta_amount)
    })

});

function callPieChart(absent, present,leave) {
    var existingChart = Chart.getChart("studentPieChart");
    if (existingChart) {
        existingChart.destroy();
    }
    // Create a new pie chart
    generatePieChart("studentPieChart", [present, absent,leave], ["Present", "Absent", "Leave"], ["#28a745", "#dc3545", "#ffc107"]);
}


let parentFieldNames = [
    'parent_name','parent_age','parent_email','parent_phone',
    'parent_gender','relation_with_student','parent_profession',
]
// data-bs-dismiss="modal"

async function addParent(){
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

    await ajaxRequest(method, totalUrl, parentData,"parentFormArea","sm",(response) => {
        $("#parent_form").modal('hide');
        var parentData = response.response;
        raiseSuccessAlert(response.msg);
        $("#no_data_found").hide()
        if (parentId) {
            for (const field of parentFieldNames) {
                try {
                    $(`.parent-${parentId}-${field}`).text(parentData[field]);
                } catch (e) {
                }
            }
            var imgElement = $(`#parent-img-${parentData.parent_id}`);
            const imgSrc = parentData.parent_gender === 'Male' ? '/assets/img/male.png' : '/assets/img/female.png';
            imgElement.attr("src", imgSrc);
        } else {
            displayNewParent(parentData);
        }
        resetForm(parentFieldNames);
    });
}

async function displayNewParent(response){
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
            ajaxRequest("DELETE",totalUrl, "","body","lg",(response) => {
            })
            Swal.fire({
                title: 'Deleted!',
                text: 'Your file has been deleted.',
                icon: 'success',
                customClass: {
                    title: 'swal-title',
                    content: 'swal-text',
                    confirmButton: 'swal-confirm-button',
                },
            });
        }
    });
    if ($('#parentRow .card').length === 0) {
        $('#no_data_found').show();
    }

}


// base ajax request function
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

// geting all student data
class StudentData {
    async ajaxCall(type, url, data, loaderId,loaderSize ,successCallback) {
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
            }
        });
    }

    // ------------------------------studentFee--------------------------
    async  fixStudentFee(studentId){
    var endPoint = `/StudentFee/create_student_fee/`;
    var totalUrl = apiUrl + endPoint;
    var payload = {
        "student_id":studentId,
        "fee_total":$("#total_insta_amount").val(),
        "discount": $("#discount").val(),
        "intstall_count": $("#installment_type").val(),
    }
    await this.ajaxCall("POST", totalUrl, payload,"fee","sm",async (response) => {
        $("#installment_type").attr('disabled', 'disabled')
        raiseSuccessAlert("Fee Fixed Successfully")
    })
}

    async getAssignmentData(classId, sectionId) {
        var endPoint = `/Assignments/get_assignment_for_student_tab/?class_id=${classId}&section_id=${sectionId}`;
        var totalUrl = apiUrl + endPoint;
        await this.ajaxCall("GET", totalUrl, "", "assignments", "sm",(response) => {

            this.displayAssignmentData(response);
        });
    }

    async getStudentAttendance(studentId) {
        var endPoint = `/StudentAttendance/get_student_attendance_by_student_id/?student_id=${studentId}`
        var totalUrl = apiUrl + endPoint;
        await this.ajaxCall("GET", totalUrl, "", "attendance", "sm",(response) => {
            var studentAttedance = response.student_attendance;

            this.displayAttendanceData(studentAttedance);
            var absent = response.student_attendance_percentage.absent_percentage
            var present = response.student_attendance_percentage.present_percentage
            var leave = response.student_attendance_percentage.leave_percentage
            callPieChart(absent,present,leave)
        });
    }

    async submitAssignment(assignmentId,studentId){
        var endPoint = `/AssignmentSubmission/submit_assignment/`;
        var totalUrl = apiUrl + endPoint;
        var payload = {
            "assignment_file":await uploadFile("assignment_file", "student_assignment_document"),
            "assignment_id": assignmentId,
            "student_id":parseInt(studentId),
            "submission_date": "2024-01-04",
            "submission_details":$("#submission_details").val(),
            "is_deleted": false
        }
        await this.ajaxCall("POST", totalUrl, payload, "assginmentFormArea", "sm",(response) => {
            this.tBody = $("#assignments_details")
            this.tr = this.tBody.find(`.tr-assignment-${assignmentId}`);
            this.tr.find(".assignment_status").html(`<span class="bg-success p-2 text-white">Submited</span>`);
            this.tr.find(".action_btn").html(
                `<button  class="btn btn-primary btn-label right rounded-pill">
                        <i class="ri-check-double-line label-icon align-middle rounded-pill fs-lg ms-2"></i>
                        Download
                </button>`
            )
            $("#assignmentSubmission").modal('hide')
            $("#assignmentSubmission").findall("input,select,textarea").val("")
            raiseSuccessAlert(response.msg);
        });
    }

    async uploadDocument(student_id){
        var documentId = $("#document_id").val();
        var payload = {
            "document_name": $("#document_name").val(),
            "document_file":await uploadFile("document_file", "student_documents"),
            "student_id": student_id,
            "is_deleted": false
        }
        var method = documentId ? "PUT" : "POST";
        var postEndPoint = `/StudentsDocuments/add_student_documents/`;
        var updateEndPoint = `/StudentsDocuments/update_student_documents/?document_id=${documentId}`;
        var endPoint = documentId ? updateEndPoint : postEndPoint;
        var totalUrl = apiUrl + endPoint;

        await this.ajaxCall(method, totalUrl, payload, "documentFormArea", "sm",(response) => {
            $("#documentForm").modal('hide')
            this.docuemntRow = $("#documentRow")
            var docs = response.response
            var docsName = docs.document_file.split('/').pop();
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

    async getStudentDocuments(studentId){
        var endPoint = `/StudentsDocuments/get_student_documents_by_student_id/?student_id=${studentId}`;
        var totalUrl = apiUrl + endPoint;
        await this.ajaxCall("GET", totalUrl, "", "documents", "sm",(response) => {
            this.documents = $("#documentRow")
            this.studenDocuments = response.response
            if(this.studenDocuments.length > 0){
                this.documents.empty();
                for (const key in this.studenDocuments) {
                    var docs = this.studenDocuments[key]
                    var docsName = docs.document_file.split('/').pop();
                    var document_name = docs.document_name
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
                        </div>
                    `
                    this.documents.append(card);
                }
            }
        });
    }

    async getExamsData(classId){
        var endPoint = `/ParentExams/get_parent_exam_by_class_id?class_id=${classId}`;
        var totalUrl = apiUrl + endPoint;
        await this.ajaxCall("GET", totalUrl, "", "examination", "sm",(response) => {
            var upcomingExams = response.upcoming_parent_exam
            var pastExams = response.old_parent_exams
            this.displayUpcomingExamsData(upcomingExams);
            this.displayPastExamsData(pastExams);
        });
    }

    async getFeeData(studentId){
        var endPoint = `/StudentFee/get_all_student_installments/?student_id=${studentId}`;
        var totalUrl = apiUrl + endPoint;
        await this.ajaxCall("GET", totalUrl, "", "fee", "sm",async(response) => {
            var fee = response.fee_data[0]
            var installment = response.student_fee
            var isFeeFixed = false
            $("#discount").val(response.discount["discount"])
            if(installment.length > 0){
                isFeeFixed = true
                $("#discount").attr('readonly', 'readonly')
                $("btnFeeForm").attr('disabled', 'disabled')
            }
            await this.displayFeeData(fee,isFeeFixed);
            await this.showInstallmentData(installment);
        })
    }

    async saveActivity(){
        var activityId = $("#activity_id").val();
        var postEndPoint = `/Activity/create_activity/`;
        var updateEndPoint = `/Activityupdate_activity/?actity_id=${activityId}`;
        var method = activityId ? "PUT" : "POST";
        var endPoint = activityId ? updateEndPoint : postEndPoint;
        var totalUrl = apiUrl + endPoint;
        var payload = {
            "institution_id":instituteId,
            "activity_name": $("#activity_title").val(),
            "activity_description":$("#activity_details").val(),
            "activity_date":$("#activity_date").val(),
            "activity_location":$("#activity_place").val(),
            "is_deleted": false,
            "student_id": 0
        }
        await this.ajaxCall(method, totalUrl, payload, "activityFormArea", "sm",(response) => {
            $("#activityForm").find("input, textarea").val("");
            $("#activityForm").modal('hide')
            this.activityTable = $("#activityTable")
            var activity = response.response
            var title = activity.activity_name
            var desc = activity.activity_description
            if(activityId){
                $(`.tr-activity-${activityId}`).find(".activity_name").text(activity.activity_name)
                $(`.tr-activity-${activityId}`).find(".activity_date").text(activity.activity_date)
                $(`.tr-activity-${activityId}`).find(".activity_location").text(activity.activity_location)
                $(`.tr-activity-${activityId}`).find(".activity_desc").html(`<button class="btn btn-dark btn-label right rounded-pill" onClick="showActivityDetailse('${activity.activity_name}','${activity.activity_description}')">
                <i class="ri-eye-line label-icon align-middle rounded-pill fs-lg ms-2"></i>
                    View
                </button>`)
                raiseSuccessAlert(response.msg);
            }
            else{
                var tr = `
                    <tr class="tr-activity-${activity.activity_id}">
                        <td class="activity_name">${activity.activity_name}</td>
                        <td class="activity_date">${activity.activity_date}</td>
                        <td class="activity_desc">
                            <button class="btn btn-dark btn-label right rounded-pill" onClick="onClick="showActivityDetailse('${title}','${desc}')">
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
                        <td>
                    </tr>
                    ` 
                    $("#activityTable").DataTable().row.add($(tr)).draw()
                raiseSuccessAlert(response.msg);
            }
        });
    }

    async showStudentActivity(){
        var endPoint = `/Activity/get_all_activity_by_institute/?institution_id=${instituteId}`;
        var totalUrl = apiUrl + endPoint;
        await this.ajaxCall("GET", totalUrl, "", "activites", "sm",(response) => {
            var activity = response
            this.displayActivityData(activity);
        });
    }

    async displayUpcomingExamsData(response){
        var upcomingExams = $("#UpComingExam")
        if(response.length > 0){
            upcomingExams.empty();
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
                upcomingExams.DataTable().row.add($(row)).draw()
            }
        }
        
    }

    async displayPastExamsData(response){
        var pastExams = $("#pastExam")
        if(response.length > 0){
            pastExams.empty();
            for (const key in response) {
                var exam = response[key]
                var row = `
                <tr>
                    <td>${exam.parent_exam_name}</td>
                    <td>${exam.start_date}</td>
                    <td>${exam.end_date}</td>
                    <td>${exam.result_date}</td>
                    <td>
                        <button data-bs-toggle="modal" data-bs-target="#resultModel" class="btn btn-primary btn-label right rounded-pill">Show Result</button>
                    </td>
                </tr>
                `;
                pastExams.DataTable().row.add($(row)).draw()
            }
        }
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
    }

    async displayAttendanceData(response) {
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

    async displayActivityData(response){
        var table = $("#activityTable tbody")
        if(response.length > 0){
            table.empty();
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
                        <td>
                    </tr>`;
                $("#activityTable").DataTable().row.add($(row)).draw()
            }
        }
    }

    async displayFeeData(response, isFeeFixed) {
        const {
            fee_total,
            fee_admission,
            fee_discount,
            total_installments,
            class_installments
        } = response;
    
        // Set values using jQuery
        $("#total_fee").val(fee_total);
        $("#admission_fee").val(fee_admission);
        // $("#discount").val(fee_discount || 0);
    
        // Calculate total installment amount
        const total_insta_amount = total_installments -  0;
        $("#total_insta_amount").val(total_insta_amount);
    
        // Update installment options
        this.updateInstallmentOptions(class_installments, isFeeFixed);
    }
    
    async updateInstallmentOptions(installments, isFeeFixed) {
        const select = $("#installment_type");
        select.empty();
        select.append(`<option value="">Select Installment</option>`);
    
        for (const [key, installment] of Object.entries(installments)) {
            const disabledAttribute = isFeeFixed ? "disabled" : "";
            const option = `<option value="${installment.installment_number}" ${disabledAttribute}>${installment.installment_name}</option>`;
            select.append(option);
        }
    }

    async showInstallmentData(response){
        var installmentTable = $("#installmentTable");
        installmentTable.empty();
        for (const key in response) {
            var installment = response[key]
            var color = installment.installment_status === true ? "bg-success" : "bg-danger"
            var statusMsg = installment.installment_status === true ? "Paid" : "Unpaid"
            var row = `
                <tr>
                    <td>${installment.installment_name}</td>
                    <td>${installment.installment_due_date}</td>
                    <td>${installment.installment_amount}</td>
                    <td>${installment.installment_paid_date}</td>
                    <td class="${color}">
                        ${statusMsg}
                    </td>
                </tr>
            `
            $('#Installment').DataTable().row.add($(row)).draw()
        }
        removeLoader("installmentTable","sm")
    }

}

// delete student document
async function deleteStudentDocument(element){
    var documentId = $(element).attr("data-documentId");
    var endPoint = `/StudentsDocuments/delete_student_documents/?document_id=${documentId}`;
    var totalUrl = apiUrl + endPoint;
    $(`.card-student-${documentId}`).remove()
    await ajaxRequest("DELETE", totalUrl, "","documents","lg",(response) => {
        raiseSuccessAlert(response.msg);
        if ($('#documentRow .card').length === 0) {
            $("#documentRow").find(".no_data_found").show()
        }
    })
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

function openAssignmentSubmissionModal(response,assignmentId){
    var submissionModel = $("#assignmentSubmission")
    submissionModel.modal('show')
    submissionModel.find(".modal-title").text(response)
    submissionModel.find("#assginmentId").val(assignmentId)

}

function openAssignmentDetails(response) {
    var assignmentModel =  $("#assignmentDetailse")
    assignmentModel.modal('show')
    assignmentModel.find(".modal-title").text("Assignment Details")
    assignmentModel.find(".modal-desc").text(response)
}
// delete student activity
async function deleteActivity(element){
    const dataTable = $('#activityTable').DataTable();
    var activityId = $(element).attr("data-activity_id");
    var endPoint = `/Activity/delete_activity/?activity_id=${activityId}`;
    var totalUrl = apiUrl + endPoint;

    await Swal.fire({
        title: 'Are you sure, do you want to delete this Record?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            var deleteRow = dataTable.row(`.tr-activity-${activityId}`);
            deleteRow.remove().draw();
            ajaxRequest("DELETE", totalUrl, "","activites","sm",(response) => {
                raiseSuccessAlert(response.msg);
            })
        }
    });
}


// geting all student data

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


// calender
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

// studentActivityForm
function studentActivityForm(){
    var isValid = true;
    var activity_title = $("#activity_title");
    var activity_description = $("#activity_details");
    var activity_date = $("#activity_date");
    var activity_location = $("#activity_place");
    if(activity_title.val().trim() === ""){
        activity_title.addClass("is-invalid");
        isValid = false;
    }
    if(activity_description.val().trim() === ""){
        activity_description.addClass("is-invalid");
        isValid = false;
    }
    if(activity_date.val().trim() === ""){
        activity_date.addClass("is-invalid");
        isValid = false;
    }
    if(activity_location.val().trim() === ""){
        activity_location.addClass("is-invalid");
        isValid = false;
    }
    return isValid;
}

function restField(){
    $(".is-invalid").on('input', function () {
        if ($(this).val().trim().length > 2) {
            $(this).removeClass("is-invalid");
        }
    }); 
}

// show activity details
function showActivityDetailse(title,desc){
    var activityModel = $("#activityDetailse")
    activityModel.modal('show')
    activityModel.find(".modal-title .activityName").text(title)
    activityModel.find(".modal-body .activityDetailse").text(desc)
}
function editActivity(element){
    var activityId = $(element).attr("data-activity_id");
    var endPoint = `/Activity/get_activity_by_id/?activity_id=${activityId}`;
    var totalUrl = apiUrl + endPoint;
    ajaxRequest("GET", totalUrl, "","body","lg",(response) => {
        var activityData = response.response;
        $("#activityForm").modal('show')
        $("#activity_id").val(activityData.activity_id)
        $("#activity_title").val(activityData.activity_name)
        $("#activity_details").val(activityData.activity_description)
        $("#activity_date").val(activityData.activity_date)
        $("#activity_place").val(activityData.activity_location)
    })
}

function showDynamicFee(installment){
    showLoader("installmentTable","sm")
    var installmentTable = $("#installmentTable");
    installmentTable.empty();
    // var installments = {
    //     'Monthly':12,
    //     'Quarterly':4,
    //     'Half Yearly':2,
    //     'Yearly':1
    // }
    var totalFee = $("#total_insta_amount").val();
    installmentTable.empty();
    var noInstallment = parseInt(installment);
    var installmentAmount = parseInt(totalFee/noInstallment);
    for (let index = 1; index <= noInstallment; index++) {
        var dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + index);
        dueDate = dueDate.toLocaleDateString();
        var row = `
            <tr>
                <td>Installment-${index}</td>
                <td>${dueDate}</td>
                <td>${installmentAmount}</td>
                <td>null</td>
                <td class="bg-danger">UnPaid</td>
            </tr>
        `
        $('#Installment').DataTable().row.add($(row)).draw()
    }
    removeLoader("installmentTable","sm")
}
