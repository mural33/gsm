// // importing pie chart function from utlity.js
// import {genaratePieChart} from "./utlity.js";

$(document).ready(e => {
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
    loadCalendarDetails(studentInfo.classId, studentInfo.sectionId);
    callPieChart();

    $("#btnSubmitAssignment").on('click', e => {
        studentData.submitAssignment($("#assginmentId").val(),studentInfo.studentId);
    });
    $("#btnstudentDocument").on('click', e => {
        studentData.uploadDocument(studentInfo.studentId);
    }) 
});

function callPieChart(absent, present) {
    var existingChart = Chart.getChart("studentPieChart");
    if (existingChart) {
        existingChart.destroy();
    }
    // Create a new pie chart
    generatePieChart("studentPieChart", [present, absent, 0], ["Present", "Absent", "Leave"], ["#28a745", "#dc3545", "#ffc107"]);
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

    await ajaxRequest(method, totalUrl, parentData,"parent_form","sm",(response) => {
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
        } else {
            displayNewParent(parentData);
        }
        resetForm(parentFieldNames);
    });
}

async function displayNewParent(response){
    var parentData = response;
    var parentRow = $("#parentRow");
    var card = `
    <div class="card col-md-4 mx-2" id="parent-card-${parentData.parent_id}">
        <div class="card-heade text-center my-2">
            <img src="/assets/img/men.jpg" alt="" srcset="" class="card-img-top parent_profile">
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

    await ajaxRequest(method, totalUrl,"","body","lg",(response) =>{
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
            callPieChart(absent,present)
        });
    }
    async submitAssignment(assignmentId,studentId){
        var endPoint = `/AssignmentSubmission/submit_assignment/`;
        var totalUrl = apiUrl + endPoint;
        var payload = {
            "assignment_file":await uploadFile("assignment_file", "student-assignment-documents"),
            "assignment_id": assignmentId,
            "student_id":parseInt(studentId),
            "submission_date": "2024-01-04",
            "submission_details":$("#submission_details").val(),
            "is_deleted": false
        }
        payload["assignment_file"] = "http//"
        raiseErrorAlert("Blob not working,Access-Control-Allow-Origin’ missing");

        await this.ajaxCall("POST", totalUrl, payload, "assignmentSubmission", "sm",(response) => {
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
            "document_file": uploadFile("document_file", "student-documents"),
            "student_id": student_id,
            "is_deleted": false
        }
        payload["document_file"] = "hpp//"
        raiseErrorAlert("Blob not working");

        var method = documentId ? "PUT" : "POST";
        var postEndPoint = `/StudentsDocuments/add_student_documents/`;
        var updateEndPoint = `/StudentsDocuments/update_student_documents/?document_id=${documentId}`;
        var endPoint = documentId ? updateEndPoint : postEndPoint;
        var totalUrl = apiUrl + endPoint;

        await this.ajaxCall(method, totalUrl, payload, "documentForm", "sm",(response) => {
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
                                <p class="card-title">Document Name:${document_name}</p>
                                <p class="card-text">Document type:${docsName}</p>
                                
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
                raiseSuccessAlert("Document Added Successfully")
            }
            else{
                $(`.card-student-${docs.document_id}`).find(".card-title").text(document_name)
                $(`.card-student-${docs.document_id}`).find(".card-text").text(docsName)
                raiseSuccessAlert("Document Updated Successfully")
            }
        });
    }

    async getStudentDocuments(studentId){
        var endPoint = `/StudentsDocuments/get_student_documents_by_student_id/?student_id=${studentId}`;
        var totalUrl = apiUrl + endPoint;
        await this.ajaxCall("GET", totalUrl, "", "documents", "sm",(response) => {
            this.documents = $("#documentRow")
            this.studenDocuments = response.response
            if(this.studenDocuments){
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
                                    <p class="card-title">Document Name:${document_name}</p>
                                    <p class="card-text">Document type:${docsName}</p>
                                    
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
                </tr>
                `;
                upcomingExams.append(row);
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
                pastExams.append(row);
            }
        }
    }

    async displayAssignmentData(response){
        this.tBody = $("#assignments_details")
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
                this.tBody.append(row);
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
                this.tBody.append(row);
            }
        }
    }

    async displayAttendanceData(response) {
        this.tBody = $("#attendance_data");
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
                this.tBody.append(row);
            }
        }
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
            $('#documentRow > .no_data_found').show();
        }
    })
}
async function editeDocument(element){
    var documentId = $(element).attr("data-documentId");
    var endPoint = `/StudentsDocuments/get_student_documents_by_id/?document_id=${documentId}`;
    var totalUrl = apiUrl + endPoint;
    await ajaxRequest("GET", totalUrl, "","body","lg",(response) => {
        var documentData = response.response;
        $("#documentForm").modal('show')
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
async function loadCalendarDetails(ClassId,sectionId) {
  var loadCalendarUrl =
    apiUrl +`/Calender/get_calender_by_class&section/?class_id=${ClassId}&section_id=${sectionId}`;

  const calendarData = await $.ajax({
    type: "GET",
    url: loadCalendarUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("tabCalender", "sm");
    },
    success: async function (calendarData) {
      var calendarDetailsContainer = $("#tabCalender");
      var calendarTable = calendarDetailsContainer.find("#calenderTable");
      calendarTable.empty();
      if (calendarData.length === 0) {
        calendarDetailsContainer.html(
          '<img src="/assets/img/no_data_found.png" class="no_data_found">'
        );
      } else {
        var data = calendarData.response;
        var uniqueClassIds = [...new Set(data.map((item) => item.class_id))];
        var uniqueSectionIds = [
          ...new Set(data.map((item) => item.section_id)),
        ];
        var classSectionRow = $("<tr>");
        classSectionRow.append(
          `<td colspan="8" class="col" id="column"><center><b>${uniqueClassIds}  ${uniqueSectionIds}</b></center></td>`
        );
        calendarTable.append(classSectionRow);

        var headerRow = $("<tr class='col' id='column'>");
        headerRow.append("<th>Time</th>");

        if (Array.isArray(data)) {
          var uniqueDays = [...new Set(data.map((item) => item.day))];
          uniqueDays.forEach((day) => {
            headerRow.append(`<th>${day}</th>`);
          });
        }
        calendarTable.append(headerRow);
        var timeDayMap = {};
        data.forEach((item) => {
          var timeKey = `${item.start_time}-${item.end_time}`;
          if (!timeDayMap[timeKey]) {
            timeDayMap[timeKey] = {};
          }
          timeDayMap[timeKey][item.day] = {
            subject: item.subject_id,
            staff: item.staff_id,
          };
        });

        for (var timeKey in timeDayMap) {
          var timeSlotRow = $("<tr class='rowData'>");
          timeSlotRow.append(`<td class="mod" id="tdData">${timeKey}</td>`);

          uniqueDays.forEach((day) => {
            var cellData = timeDayMap[timeKey][day];
            if (cellData) {
              timeSlotRow.append(
                `<td id="tableData">${cellData.subject} <br> (${cellData.staff})</td>`
              );
            } else {
              timeSlotRow.append('<td id="tableData"></td>');
            }
          });
          calendarTable.append(timeSlotRow);
        }
      }
    },
    error: (error) => {
      raiseErrorAlert(error["detail"]);
    },
    complete: (e) => {
      removeLoader("tabCalender", "sm");
    },
  });
}