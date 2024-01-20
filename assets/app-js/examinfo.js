$(document).ready(function(){
    let examInfo = JSON.parse($('#parentData').attr('data-examinfo'));
    $(".dataTables_empty").html(`
        <img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">
    `)
    // examResult 
    let examResult = new ExamResult(parseInt(examInfo.parentId));
    let subjectData = []
    let gradeData = {}
    async function getExamsData(){
        gradeData = await examResult.getGradeData(parseInt(examInfo.classId));
        subjectData = await examResult.getExamSubjects();
        await examResult.getExamResultData();
    }
    $("#btnFileSubmit").on("click", async function () {
        var excelFile = document.querySelector("#excelFilePath");
        if (!excelFile.files[0]) {
            $("#excelFilePath").addClass('is-invalid');
            raiseErrorAlert("Please select a file to upload");
            return;
        }
        var file = excelFile.files[0];
        try{
            var data = await readExcelData(file,parseInt(examInfo.parentId),subjectData,gradeData);
            var payload = {
                "exam_id": parseInt(examInfo.parentId),
                "data": data
            }
            await examResult.sendBulkData(payload);
            showBtnResultRefresh()
        }catch(error){
            raiseErrorAlert("Error reading Excel file");
        }
    });
    getExamsData();
})
async function refreshResult(){
    let examInfo = JSON.parse($('#parentData').attr('data-examinfo'));
    let examResult = new ExamResult(parseInt(examInfo.parentId));
    await examResult.getExamResultData()
    $("#resultRefresh").html("")
}

function showBtnResultRefresh(){
    $("#resultRefresh").html(`
        <button type="button" class="btn btn-primary btn-sm" id="btnResultRefresh" onClick="refreshResult()">
        <i class="bi bi-arrow-repeat"></i>
        Refresh
        </button>
    `)
}

class ExamResult{
    constructor(examID){
        this.examID = examID;
        this.subjectData = {}
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
    async getExamResultData(){
        var endPoint = `/Result/get_result_entry_by_parent_exam_id/?parent_exam_id=${this.examID}`;
        var totalUrl = apiUrl+endPoint;
        await this.ajaxRequest("GET", totalUrl, {}, "resultTableColumn", "sm", async (response) => {
            var resultData = response.response["result_entry"]
            var rankData = response.response["rank"]["data"]
            var count = response.response["count"];
            var label = []
            var data = []
            var backgroundColor = []
            $(".total_student_count").text(response.response["total_student_count"] || 0);
            $(".student_count").text(response.response["student_count"] || 0);            
            count.forEach((count) => {
                label.push(
                    count["grade"]?count["grade"]:"No Grade"
                )
                data.push(count["grade_count"])
                backgroundColor.push("#"+((1<<24)*Math.random()|0).toString(16))
            })
            createBarChart(label,data,backgroundColor,"resultChart");
            await this.displayExamResult(resultData);
            await this.displayRank(rankData);
        }); 
    }
    async getExamSubjects(){
        var endPoint = `/Exams/get_exam_by_parent_exam_id/?parent_exam_id=${this.examID}`;
        var totalUrl = apiUrl+endPoint;
        var subjectData = []
        await this.ajaxRequest("GET", totalUrl, {}, "uploadExcelColumn", "sm", async (response) => {
            var subjects = response.response;
            subjects.forEach(subject => {
                var subjectName =subject.subject.subject_name;
                var row ={
                    "subject":subjectName,
                    "full_marks":subject.full_marks
                }
                subjectData.push(row);
            });
        });
        return subjectData;
    }
    async displayExamSubjects(response) {
        var table = $("#examResultTable");
        table.find("thead tr").html(""); 
        var ths = [];
        ths.push(`<th>Student Name</th>`);
        ths.push(`<th>Roll Number</th>`);
        for (const subject in response) {
            var subjectName =response[subject]["subject"].subject_name;
            this.subjectData.push(subjectName.toLowerCase().replace(" ", "_"));
            var fullMarks = response[subject].full_marks;
            var th = `<th>${subjectName}(${fullMarks})</th>`;
            ths.push(th);
        }
        table.find("thead tr").append(ths.join(""));
        table.find("tbody").html("");
        table.dataTable()
    }
    async displayExamResult(response) {
        var resultTable = $("#resultTable");
        resultTable.find("tbody").html("");
        response.forEach(result => {
            var tr = `
                <tr>
                    <td>${result.student.student_name}</td>
                    <td>${result.student.roll_number}</td>
                    <td>${result.result.total_obtained_marks}</td>
                    <td>${result.result.percentage}</td>
                    <td>${result.result.grade}</td>
                    <td>
                        <button type="button" class="btn btn-danger btn-sm">
                            <i class="bi bi-trash mx-2"></i>
                        </button>
                    </td>
                </tr>
            `;
            resultTable.find("tbody").append(tr);
        });
        resultTable.dataTable();
    }
    async displayRank(response) {
        showLoader("tableRank", "sm")
        var table = $("#tableRank");
        table.find("tbody").html("");
        response.forEach(result => {
            if(result.student_id != null){
                var tr = `
                    <tr>
                        <td>${result.percentage}</td>
                        <td>${result.student.student_name}</td>
                        <td>${result.student.roll_number}</td>
                        <td>${result.rank}</td>

                    </tr>
                `;
            table.find("tbody").append(tr);
            }
        });
        table.dataTable();
        removeLoader("tableRank", "sm")
    }

    async sendBulkData(data){
        var endPoint = `/Result/bulk_result_entry`;
        var totalUrl = apiUrl+endPoint;
        await this.ajaxRequest("POST", totalUrl, data, "resultEntry", "sm", async (response) => {
            if(response.status == 200){
                raiseSuccessAlert(response.msg);
            }
        });
    }

    async getGradeData(classId){
        var endPoint = `/Grades/get_grade_for_exam/?class_id=${classId}`;
        var totalUrl = apiUrl+endPoint;
        var gradeData = null
        await this.ajaxRequest("GET", totalUrl, {}, "gradeColumn", "sm", async (response) => {
            gradeData = response;
        });
        return gradeData;
    }
}
async function readExcelData(file, parentExamId, examSubjects, gradeData) {
    try {
        var bulkData = [];
        var rows = await readXlsxFile(file);

        var firstRow = rows[0];
        var subjectData = firstRow.slice(3);

        for (const marks of rows.slice(1)) {
            var rollNumber = marks[0];
            var studentData = {
                "student_id": rollNumber,
                "exam_id": parentExamId,
                "result": {
                    "marks": [],
                    "total_obtained_marks": 0,
                    "percentage": null,
                    "grade": null,
                    "total_full_marks": 0
                },
                "is_deleted": false
            };

            var total_obtained_marks = 0;
            var total_full_marks = 0;

            for (const [index, mark] of marks.slice(3).entries()) {
                var examSubject = examSubjects[index];
                var subject = subjectData[index];

                var subjectMarks = {
                    "subject_name": subject,
                    "full_mark": examSubject.full_marks,
                    "obtained_mark": mark,
                    "percentage": parseFloat((mark / examSubject.full_marks) * 100).toFixed(2),
                    "grade": await getGrade(parseFloat((mark / examSubject.full_marks) * 100).toFixed(2), gradeData)
                };

                studentData.result["marks"].push(subjectMarks);
                total_obtained_marks += parseFloat(mark);
                total_full_marks += parseFloat(examSubject.full_marks);
            }

            studentData.result["total_obtained_marks"] = total_obtained_marks;
            studentData.result["total_full_marks"] = total_full_marks;
            studentData.result["percentage"] = parseFloat((total_obtained_marks / total_full_marks) * 100).toFixed(2);
            studentData.result["grade"] = await getGrade(studentData.result["percentage"], gradeData);
            bulkData.push(studentData);
        }

        return bulkData;
    } catch (error) {
        raiseErrorAlert("Error reading Excel file");
    }
}

// creating barchat
function createBarChart(label,data,backgroundColor,chartId) {
    var ctx = document.getElementById(chartId).getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        labels:"Grade",
        data: {
            labels:label,
            datasets: [{
                label:"No of Students in Grade",
                data: data,
                backgroundColor:backgroundColor,
                borderColor: 'rgba(75, 192, 192, 1)', 
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function getGrade(percentage,gradeData){
    for (const key in gradeData) {
        if (Object.hasOwnProperty.call(gradeData, key)) {
            const grade = gradeData[key];
            if(percentage >= grade.lower_limit && percentage <= grade.upper_limit){
                return key
            }
            else{
                return null
            }
        }
    }
}

