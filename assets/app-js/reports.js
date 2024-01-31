$(document).ready(function () {
    $("#btnPaymentDefaulters").on("click", async function(e){
        await dropdownPaymentDefaulters();
    })
    $("#btnFeesCollected").on("click", async function (e) {
        await dropdownFeesCollected();
    });
    $("#btnFeesToCollect").on("click",  async function (e){
        await dropdownFeesToCollect();
    });
    $("#btnStudentCountByClass").on("click", async function(e){
        await dropDownStudentCountByClass();
    });
    $("#btnstudentCountByPosition").on("click", async function(e){
        await dropDownStudentCountByPosition();
    })
    var classDrop7 = $("#classDrop7");
    classDrop7.on("change", async (e) => {
        const classId = classDrop7.val();
        if(classId != "" && classId != undefined){
            const tnp = $("#classDrop7 option:selected").attr("data-tnp");
            const promotionType = $("#classDrop7 option:selected").attr("data-promotion"); 
            loadSemOrYear(tnp, promotionType,"tnp");
        }

    })

    getFeesCollected(instituteId, null);
    getFeesToCollect(instituteId, null);
    getStudentByClass(instituteId, null);
    getPaymentDefaulters(instituteId, null);
    getStudentByPosition(instituteId, null);
    const gradesData = {
        labels: ['Fail', 'A+', 'A', 'B+'],
        datasets: [{
            data: [10, 25, 30, 15],
            backgroundColor: ['#FF0000', '#00FF00', '#0000FF', '#FFA500'],
        }],
    };
    
    
    const canvas = document.getElementById('gradeChart');
    const ctx = canvas.getContext('2d');
    canvas.style.width = '150px';
    canvas.style.height = '150px'; 
    
    const gradePieChart = new Chart(ctx, {
        type: 'pie',
        data: gradesData,
        options: {
            title: {
                display: true,
                text: 'Grade Distribution',
                fontSize: 18,
            },
            legend: {
                display: true,
                position: 'bottom',
            },
        },
    });
});

//Fees Collected
async function dropdownFeesCollected() {
    var class_id = parseInt($("#classDrop2").val());
    $('#feesCollectedTable').DataTable().destroy();
    $('#feesCollectedTable tbody').empty();
    await getFeesCollected(instituteId, class_id);
}
async function getFeesCollected(instituteId, classId) {
    fromDate = $("#from_date2").val()
    toDate = $("#to_date2").val()
    const endPoint = `/Reports/fees_collected_report/?institute_id=${instituteId}`
    var totalUrl = apiUrl + endPoint
    var method = "GET";
    await ajaxRequest(method, totalUrl, {}, "feesCollectedTable", "lg", (response) => {
        if(classId == 0) {
            response = response
        }
        else if ((classId !== null && classId !== undefined) ) {
            response = response.filter(student => student.student.classes.class_id === classId);
        }
        if (fromDate && toDate) {
            response = response.filter(student => {
                const installmentDate = new Date(student.installment_paid_date);
                return installmentDate >= new Date(fromDate) && installmentDate <= new Date(toDate);
            });
        }
        else if(fromDate && ((toDate === null) || (toDate === ""))){
            response = response.filter(student => {
                const installmentDate = new Date(student.installment_paid_date);
                return installmentDate >= new Date(fromDate);
            });
        }
        else if(toDate && ((fromDate === null) || (fromDate === ""))){
            response = response.filter(student => {
                const installmentDate = new Date(student.installment_paid_date);
                return installmentDate <= new Date(toDate);
            });
        }
        else {
            response = response
        }
        
        response.forEach(function (student) {
            $('#feesCollectedTable tbody').append(`
                <tr>
                    <td>${student.student.roll_number}</td>
                    <td>${student.student.student_name}</td>
                    <td>${student.student.classes.class_name}</td>
                    <td>${student.student.current_position}</td>
                    <td>${student.student.sections.section_name}</td>
                    <td>${student.installment_amount}</td>
                    <td>${student.installment_paid_date}</td>
                </tr>
            `);
        });
        $("#feesCollectedTable").dataTable();
    });
}

// Payment Deafaulters
async function dropdownPaymentDefaulters() {
    var class_id = parseInt($("#classDrop1").val());
    $('#paymentDefaultersTable').DataTable().destroy();
    $('#paymentDefaultersTable tbody').empty();
    await getPaymentDefaulters(instituteId, class_id);
}
async function getPaymentDefaulters(instituteId, classId) {
    const endPoint = `/Reports/payment_defaulters_report/?institute_id=${instituteId}`
    var totalUrl = apiUrl + endPoint
    var method = "GET";
    await ajaxRequest(method, totalUrl, {}, "paymentDefaultersTable", "lg", (response) => {
        response.forEach(function (student) {
            $('#paymentDefaultersTable tbody').append(`
                <tr>
                    <td>${student.student.roll_number}</td>
                    <td>${student.student.student_name}</td>
                    <td>${student.student.classes.class_name}</td>
                    <td>${student.student.current_position}</td>
                    <td>${student.student.sections.section_name}</td>
                    <td>${student.installment_amount}</td>
                    <td>${student.installment_paid_date}</td>
                </tr>
            `);
        });
        $("#paymentDefaultersTable").dataTable();
    });
}

//Fees To Collect
async function dropdownFeesToCollect(){
    var class_id = parseInt($("#classDrop3").val());
    $('#feesToCollectTable').DataTable().destroy();
    $('#feesToCollectTable tbody').empty();
    await getFeesToCollect(instituteId, class_id);
}
async function getFeesToCollect(instituteId, classId) {
    toDate = $("#to_date3").val()
    const endPoint = `/Reports/fees_to_collect_report/?institute_id=${instituteId}`
    var totalUrl = apiUrl + endPoint
    var method = "GET";
    await ajaxRequest(method, totalUrl, {}, "feesToCollectTable", "lg", (response) => {
        if(classId == 0) {
            response = response
        }
        else if ((classId !== null && classId !== undefined) ) {
            response = response.filter(student => student.student.classes.class_id === classId);
        }
        if(toDate){
            response = response.filter(student => {
                const installmentDate = new Date(student.installment_due_date);
                return installmentDate <= new Date(toDate);
            });
        }
        response.forEach(function (student) {
            $('#feesToCollectTable tbody').append(`
                <tr>
                    <td>${student.student.roll_number}</td>
                    <td>${student.student.student_name}</td>
                    <td>${student.student.classes.class_name}</td>
                    <td>${student.student.current_position}</td>
                    <td>${student.student.sections.section_name}</td>
                    <td>${student.installment_amount}</td>
                    <td>${student.installment_due_date}</td>
                </tr>
            `);
        });
        $("#feesToCollectTable").dataTable();
    });
}

//student Count By Class
async function dropDownStudentCountByClass(){
    var class_id = parseInt($("#classDrop6").val());
    $('#studentCountByClassTable').DataTable().destroy();
    $('#studentCountByClassTable tbody').empty();
    var alumni = $("#alumni1").val();
    const endPoint = `/Reports/get_all_student_count/`
    var totalUrl = apiUrl + endPoint
    method = "POST"
    data = {
        "institute_id": instituteId,
        "class_id": class_id,
        "is_alumini": alumni
    }
    await ajaxRequest(method, totalUrl, data, "studentCountByClassTable", "lg", (response) => {
        StudentCount = response.response
        StudentCount.forEach(function (student) {
            $('#studentCountByClassTable tbody').append(`
                <tr>
                    <td>${student.class_name}</td>
                    <td>${student.student_count}</td>
                </tr>
            `);
        });
        $('#studentCountByClassTable').DataTable();
        
    });
}

async function getStudentByClass(instituteId, classId){
    const endPoint = `/Reports/count_students_by_class?instiute_id=${instituteId}`
    var totalUrl = apiUrl + endPoint
    var method = "GET";
    await ajaxRequest(method, totalUrl, {}, "studentCountByClassTable", "lg", (response) => {
        StudentCount = response.response
        StudentCount.forEach(function (student) {
            $('#studentCountByClassTable tbody').append(`
                <tr>
                    <td>${student.class_name}</td>
                    <td>${student.student_count}</td>
                </tr>
            `);
        });
        $("#studentCountByClassTable").dataTable();
    });
}

// get student count by position
async function loadSemOrYear(duration, promotionType,tnpId) {
    var tnp = $(`#${tnpId}`);
    var promotionTypeMap = {
        "semister_vise":"Semester",
        "year_vise":"Year",
    }
    if(promotionTypeMap[promotionType] === undefined){
        tnp.html("");
        $(`#${tnpId}-label`).text("Semester/Year");
        tnp.append(`<option value="">Not Applicable</option>`);
        return
    }
    $(`#${tnpId}-label`).text(promotionTypeMap[promotionType]);
    tnp.html("");
    tnp.append(`<option value="">All ${promotionTypeMap[promotionType]}</option>`);
    for (let index = 0; index < duration; index++) {
        var option = `<option value="${index+1}">${index+1} ${promotionTypeMap[promotionType]}</option>`;
        tnp.append(option);
    }
}

async function dropDownStudentCountByPosition(){
    var class_id = parseInt($("#classDrop7").val());
    $('#studentCountByPositionTable').DataTable().destroy();
    $('#studentCountByPositionTable tbody').empty();
    var alumni = $("#alumni2").val();
    var semester = parseInt($("#tnp").val()) || 0;
    const endPoint = `/Reports/get_students_by_sems/`
    var totalUrl = apiUrl + endPoint
    method = "POST"
    data = {
        "institute_id": instituteId,
        "semester": semester,
        "class_id": class_id,
        "is_alumini": alumni
    }
    await ajaxRequest(method, totalUrl, data, "studentCountByPositionTable", "lg", (response) => {
        StudentCount = response.response
        StudentCount.forEach(function (student) {
            $('#studentCountByPositionTable tbody').append(`
                <tr>
                    <td>${student.class_name}</td>
                    <td>${student.student_count}</td>
                </tr>
            `);
        });
        $("#studentCountByPositionTable").dataTable({
            dom: 'Bfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'pdf', 'print'
            ]
        });
    });
}

async function getStudentByPosition(instituteId, classId){
    const endPoint = `/Reports/count_students_by_class?instiute_id=${instituteId}`
    var totalUrl = apiUrl + endPoint
    var method = "GET";
    await ajaxRequest(method, totalUrl, {}, "studentCountByPositionTable", "lg", (response) => {
        StudentCount = response.response
        StudentCount.forEach(function (student) {
            $('#studentCountByPositionTable tbody').append(`
                <tr>
                    <td>${student.class_name}</td>
                    <td>${student.student_count}</td>
                </tr>
            `);
        });
        $("#studentCountByPositionTable").dataTable();
    });
}
