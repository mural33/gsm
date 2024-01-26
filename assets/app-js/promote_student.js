$(document).ready(() => {
    let promotionTable = $("#promotionTable").DataTable();
    assignAllClass("classDrop")
    var classDrop = $("#classDrop");
    classDrop.on("change", async (e) => {
        const classId = classDrop.val();
        if(classId != "" && classId != undefined){
            const tnp = $("#classDrop option:selected").attr("data-tnp");
            const promotionType = $("#classDrop option:selected").attr("data-promotion"); 
            loadSemOrYear(tnp, promotionType,"tnp");
            await loadSections(classId);
        }

    })
    var classDropPromotion = $("#classDropPromotion");
    classDropPromotion.on("change", async (e) => {
        const classId = classDropPromotion.val();
        if(classId != "" && classId != undefined){
            const tnp = $("#classDropPromotion option:selected").attr("data-tnp");
            const promotionType = $("#classDropPromotion option:selected").attr("data-promotion"); 
            await loadSemOrYear(tnp, promotionType,"tnpPromotion");
        }
        
    })
    $("#searchStudent").on("click", async (e) => {
        var classId = $("#classDrop").val();
        if(classId === "" ||classId === undefined){
            raiseWarningAlert("Please Select Class");
            return
        }
        await searchStudent();
    })

    // calling promotion
    $("#btnPromoteStudent").on("click", async (e) => {
        await collectDataForPromotion();
    })

    $("#btnCloseStudent").on("click", async (e) => {
        var courseCompleteType = $("#courseCompleteType").val();
        var courseCompleteReason = $("#courseCompleteTypeComment").val();
        if (!courseCompleteType.trim()) {
            raiseWarningAlert("Please Select Course Complete Type");
            return;
        }
        if (!courseCompleteReason.trim()) {
            raiseWarningAlert("Please Enter Course Complete Reason");
            return;
        }
        await collectDataForClose();
    });
    
})
// ajax call to get all classes
async function ajaxRequest(type, url, data, loaderId, loaderSize, successCallback) {
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

// Assign Class
async function assignAllClass(classDropId) {
    var classDrop = $(`#${classDropId}`);
    var endpoint = `/Classes/get_classes_by_institute/?institite_id=${instituteId}`
    var totalUrl = `${apiUrl}${endpoint}`
    await ajaxRequest("GET", totalUrl, {}, 'studentFillterArea', 'sm', async function (response) {
        classDrop.html("");
        var option = `<option value="">Select Class</option>`;
        classDrop.append(option);
        for (const classObj of response) {
            var option = `<option value="${classObj.class_id}" data-promotion="${classObj.promotion_type}" data-tnp="${classObj.total_number_of_promotion}">${classObj.class_name}</option>`;
            classDrop.append(option);
        }
    })
}
// loadSections and sem or year
async function loadSections(classId) {
    var endpoint = `/Sections/get_sections_by_class/?class_id=${classId}`
    var totalUrl = `${apiUrl}${endpoint}`
    await ajaxRequest("GET", totalUrl, {}, 'studentFillterArea', 'sm', async function (response) {
        var sections = $("#sectionDrop");
        sections.html("");
        var option = `<option value="">All Sections</option>`;
        sections.append(option);
        for (const section of response) {
            var option = `<option value="${section.section_id}">${section.section_name}</option>`;
            sections.append(option);
        }
    })
}
async function loadSemOrYear(duration, promotionType,tnpId) {
        var tnp = $(`#${tnpId}`);
        console.log(tnpId);
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
        console.log($(`#${tnpId}-label`));
        $(`#${tnpId}-label`).text(promotionTypeMap[promotionType]);
        tnp.html("");
        tnp.append(`<option value="">All ${promotionTypeMap[promotionType]}</option>`);
        for (let index = 0; index < duration; index++) {
            var option = `<option value="${index+1}">${index+1} ${promotionTypeMap[promotionType]}</option>`;
            tnp.append(option);
        }
}

// Search Student
async function searchStudent() {
    var class_id = parseInt($("#classDrop").val());
    var section_id = parseInt($("#sectionDrop").val()) || 0;
    var current_position = parseInt($("#tnp").val()) || 0;
    if (class_id === "") {
        raiseErrorAlert("Please Select Class");
        return;
    }
    var data = {
            "institute_id": instituteId,
            "class_id": class_id,
            "section_id": section_id,
            "current_position":current_position,
        }
    var endPoint = `/Students/get_students_for_promotion/`
    var totalUrl = `${apiUrl}${endPoint}`
    await ajaxRequest("POST", totalUrl, data, 'promotionTable', 'sm', async function (response) {
        await displayStudent(response);
    })

    async function displayStudent(response) {
        var promotionTypeMap = {
            "semister_vise":"Semester",
            "year_vise":"Year",
        }
        var promotionTable = $("#promotionTable");
        promotionTable.DataTable().destroy();
        promotionTable.DataTable().clear().draw();
        for (const student of response) {
            var year = promotionTypeMap[student.classes.promotion_type] ? `${student.current_position} ${promotionTypeMap[student.classes.promotion_type]}` : "";
            $('.promotionType').text(promotionTypeMap[student.classes.promotion_type] || "Not Applicable");
            var tr = `
                <tr class="tr-promotoStudent-${student.student_id}">
                    <td>
                        <input type="checkbox" name="student_id" value="${student.student_id}" class="form-check-input promotionCheckBox" onClick="CheckTotal(this)">
                    </td>
                    <td>${student.student_name}</td>
                    <td>${student.roll_number}</td>
                    <td>${student.classes.class_name}</td>
                    <td>${year}</td>
                    <td>${student.sections.section_name}</td>
                </tr>`
                // 
            promotionTable.DataTable().row.add($(tr)).draw();
        }
    }
}

function selectAllStudents() {
    var checkBox = $("#mainCheckbox");
    var table = $("#promotionTable");
    var isChecked = checkBox.is(":checked");
    if (isChecked) {
        $(".promotionCheckBox").prop("checked", true);
    } else {
        $(".promotionCheckBox").prop("checked", false);
    }
}
function CheckTotal(element){
    var checkBox = element
    var isChecked = checkBox.checked;
    var totalCheck = $(".promotionCheckBox").length;
    var totalChecked = $(".promotionCheckBox:checked").length;
    if(totalCheck === totalChecked){
        $("#mainCheckbox").prop("checked", true);
    }
    else{
        $("#mainCheckbox").prop("checked", false);
    }
}

async function OpenPromotionModal(){
    showLoader("studentFillterArea", "sm")
    var totalChecked = $(".promotionCheckBox:checked").length;
    if(totalChecked === 0){
        raiseErrorAlert("Please Select Student");
        return;
    }
    $("#promoteStudent").modal("show");
    assignAllClass("classDropPromotion")
    removeLoader("studentFillterArea", "sm")
}

// collect data for promotion
async function collectDataForPromotion(){
    class_id = $("#classDropPromotion").val();
    if(class_id === "" ||class_id === undefined){
        raiseWarningAlert("Please Select Class");
        return 
    }
    var data = {
        "class_id":parseInt($("#classDropPromotion").val()),
        "section_id": $("#sectionDropPromotion").val() || 0,
        "current_position": $("#tnpPromotion").val() || 0,
        "student_id": $(".promotionCheckBox:checked").map(function(){return parseInt($(this).val())}).get(),
    }

    async function promotionStudent(data){
        var endPoint = `/Students/promote_students/`
        var totalUrl = `${apiUrl}${endPoint}`
        await ajaxRequest("POST", totalUrl, data, 'promoteStudentArea', 'sm', async function (response) {
            raiseSuccessAlert("Student Promoted Successfully");
            await removeRows(data["student_id"]);
            $("#promoteStudent").modal("hide");
        })
    }
    await promotionStudent(data);
}
async function removeRows(data){
    var promotionTable = $("#promotionTable");
    for (const studentId of data) {
        promotionTable.DataTable().row(`.tr-promotoStudent-${studentId}`).remove().draw();
    }

}

// OpenCloseModal
function OpenCloseModal(){
    showLoader("studentFillterArea", "sm")
    var totalChecked = $(".promotionCheckBox:checked").length;
    if(totalChecked === 0){
        raiseErrorAlert("Please Select Student");
        return;
    }
    $("#completeStudent").modal("show");
}
async function collectDataForClose(){
    var data = {
        "course_complete_type":$("#courseCompleteType").val(),
        "course_complete_note":$("#courseCompleteReason").val(),
        "student_id": $(".promotionCheckBox:checked").map(function(){return parseInt($(this).val())}).get(),
    }
    async function closeStudent(data){
        var endPoint = `/Students/close_students/`
        var totalUrl = `${apiUrl}${endPoint}`
        await ajaxRequest("POST", totalUrl, data, 'completeStudentArea', 'sm', async function (response) {
            raiseSuccessAlert("Student Closed Successfully");
            await removeRows(data["student_id"]);
            $("#completeStudent").modal("hide");
        })
    }
    await closeStudent(data);
}
