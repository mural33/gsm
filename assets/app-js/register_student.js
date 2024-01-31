$(document).ready(() => {
    let studentInfo = ""
    if($("#studentId").val().trim()){
        studentInfo = JSON.parse($("#studentInfo").val());
    }
    // student form validation
    $("#btnStudentForm").on("click", async (e) => {
        e.preventDefault();
        $("#btnStudentForm").removeClass("btn-shake")
        var isFormValid = await validateStudentForm()
        if (isFormValid === false) {
            removeInvalid()
            $("#btnStudentForm").addClass("btn-shake");
            return false;
        } else {
            await submitStudentForm();
            // await resetForm()
        }
    });


    $("#class_id").on("change", async (e) => {
        const classId = $("#class_id");
        const duration = $("#class_id option:selected").attr("data-tnp");
        const promotionType = $("#class_id option:selected").attr("data-promotion_type"); 
        await getSectionsByClass(classId.val());
        await loadSemOrYear(duration,promotionType,"semistor")
    })
    
    // phoneNumber validation
    $("#phone_number, #parent_phone,#pincode").on("input", function () {
        phoneNumber($(this).attr('id'));
    });
    
    async function runClass() {
        var StudentClassID = $("#class_id option:selected").val();
        if (StudentClassID && StudentClassID !== "" ) {
            await getSectionsByClass(StudentClassID,studentInfo.sectionId);
            const duration = $("#class_id option:selected").attr("data-tnp");
            const promotionType = $("#class_id option:selected").attr("data-promotion_type"); 
            await loadSemOrYear(duration,promotionType,"semistor")
        }
    }
    runClass();
});

let fields = [
    'admission_date', 'student_name', 'date_of_birth', 'blood_group', 'gender','roll_number','studentPhoto',
    // contact Details
    'email', 'phone_number',
    // address Details
    'address', 'city', 'state', 'country', 'pincode',
    // class Details
    'class_id', 'section_id'
];

async function resetForm() {
    for (const field of fields) {
        const element = $(`#${field}`);
        const value = element.val("");
    }
}

// formSubmit
async function submitStudentForm() {
    const totalAddress = `${$("#address").val()}, ${$("#city").val()}, ${$("#state").val()}, ${$("#country").val()}, ${$("#pincode").val()}`
    const studentData = {
        "photo":"",
        "institute_id": instituteId,
        "student_name": $("#student_name").val(),
        "gender": $("#gender").val(),
        "date_of_birth": $("#date_of_birth").val(),
        "blood_group": $("#blood_group").val(),
        "address": totalAddress,
        "phone_number": $("#phone_number").val(),
        "email": $("#email").val(),
        "admission_date": $("#admission_date").val(),
        "roll_number": $("#roll_number").val(),
        "class_id": $("#class_id").val(),
        "section_id": $("#section_id").val(),
    };
    const fileInput = document.getElementById("studentPhoto");
    const file = fileInput.files[0];
    if(file && file != "" && file != undefined){
        
        studentData["photo"] = await uploadFile("studentPhoto","student_profile")
    }

    var isEdit = $("#isEdit").val();
    var method = isEdit === "1" ? "PUT" : "POST";
    var studentId = $("#studentId").val();  // Make sure studentId is defined
    var endPoint = isEdit === "1" ? `/Students/update_student/${studentId}` : `/Students/create_student/`;
    var studentUrl = `${apiUrl}${endPoint}`;
    await $.ajax({
        type: method,
        url: studentUrl,
        data: JSON.stringify(studentData),
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: (e) => {
            showLoader("body", "lg")
        },
        success:(response) => {
            raiseSuccessAlert(response.msg);
            // resetForm()            
            // if(isEdit === "1"){
            //     window.location.href = `/app/students/`;
            // }
        },
        error:(error) => {
            // raiseErrorAlert(error.responseJSON.detail);
            raiseWarningAlert(error.responseJSON.detail)
            return false
        },
        complete:(e) => {
            removeLoader("body", "lg")
            // if(isEdit === "1"){
            //     window.location.href = `/app/students/`;
            // }
        }
    });
}

async function addParent(studentId){
    await $.ajax({
        type: "POST",
        url: `${apiUrl}/Parents/add_parent/`,
        data: JSON.stringify({
            // ---------------
            "parent_name": $("#parent_name").val(),
            "parent_email": $("#parent_email").val(),
            "parent_phone": $("#parent_phone").val(),
            "parent_profile": "string",
            "parent_gender": "Male",
            "parent_age": "45",
            "relation_with_student": $("#relation_with_student").val(),
            "parent_address": "string",
            "parent_profession": "string",
            "photo": "string",
            "student_id": studentId
        }),
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: (e) => {
        },
        succes:(response) => {
        },
        error:(error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete:(e) => {
        }
    });
}

// geting class and section
async function getSectionsByClass(classId,section) {
    const classEndPoint = `/Sections/get_sections_by_class/?class_id=${classId}`;
    const classUrl = `${apiUrl}${classEndPoint}`;
    await $.ajax({
        type: "GET",
        url: classUrl,
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: (e) => {
            showLoader("accor_borderedExamplecollapse5","sm")
        },
        success:(response) => {
            var sections = $("#section_id");
            sections.empty();
            sections.append(
                $("<option>").text('Select Section').attr("value", "")
            )
            for (const section of response) {
                if(section === section.section_id){

                    var option = `<option value="${section.section_id}" selected>${section.section_name}</option>`;
                }
                else{
                    var option = `<option value="${section.section_id}" >${section.section_name}</option>`;
                }
                sections.append(option);
            }
        },
        error:(error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete:(e) => {
            removeLoader("accor_borderedExamplecollapse5","sm")
        },
    });
}

async function validateStudentForm(){
    // Define validation rules for each field
    var is_valid = true
    const validationRules = {
        'student_name': {regex: null },
        'roll_number': {regex: null },
        'email': {regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        'phone_number': {regex:/^[6-9][0-9]{9}/},
        'address': {regex: null },
        'city': {regex: null },
        'state': { regex: null },
        'country': {regex: null },
        'pincode': {regex: /^\d{4,10}$/ },
        // non text inputs
        "admission_date":{regex: null},
        "date_of_birth":{regex: null},
        "blood_group":{regex: null},
        "gender":{regex: null},
        "class_id":{regex: null},
        "section_id":{regex: null},
        "semistor":{regex: null}
    };
    // Validate each field based on the rules
    for (let field in validationRules) {
        let {regex } = validationRules[field];
        let input = $("#" + field);
        let inputType = input.attr("type")
        let min = input.attr("minlength")
        let max = input.attr("maxlength")
        const value = input.val().trim();  
        if (inputType === "text" && regex && (value.length < min || value.length > max || !regex.test(value))) {
            input.addClass("is-invalid");
            input.focus();
            const parentAccordion = input.parents(".accordion");
            parentAccordion.find(".collapse").addClass("show");
            is_valid = false
        } else if (inputType === "text" && !regex && (value.length < min || value.length > max)) {
            input.addClass("is-invalid");
            input.focus();
            const parentAccordion = input.parents(".accordion");
            parentAccordion.find(".collapse").addClass("show");
            is_valid = false
        }else if((inputType != "text" || inputType === undefined) && (value === "" || value === undefined)){
            input.addClass("is-invalid");
            input.focus();
            const parentAccordion = input.parents(".accordion");
            parentAccordion.find(".collapse").addClass("show");
            is_valid = false
        }
        else {
            input.removeClass("is-invalid");
        }
    }
    var dateOfBirth = new Date($("#date_of_birth").val());
    var admissionDate = new Date($("#admission_date").val());
    if (dateOfBirth <= admissionDate) {
        $("#date_of_birth").addClass("is-invalid");
        $("#admission_date").addClass("is-invalid")
        raiseWarningAlert("Birthday  cannot be earlier than Admission Day.")
        is_valid = false;
    }
    return is_valid; 
}
async function loadSemOrYear(duration,promotionType,tnpId) {
    var tnp = $(`#${tnpId}`);
    var promotionTypeMap = {
        "semister_vise":"Semester",
        "year_vise":"Year",
    }
    if(promotionTypeMap[promotionType] === undefined){
        tnp.html("");
        $(`#${tnpId}-label`).text("Semester/Year");
        tnp.append(`<option value="1">Not Applicable</option>`);
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

function removeInvalid() {
    $(".is-invalid").on("input", function() {
        $(this).removeClass("is-invalid");
    });
}





