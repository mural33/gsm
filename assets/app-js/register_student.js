$(document).ready(() => {

    // student form validation
    $("#btnStudentForm").on("click", async (e) => {
        $("#btnStudentForm").removeClass("btn-shake")
        e.preventDefault();
        if (validateForm(fields) === false) {
            $("#btnStudentForm").addClass("btn-shake");
            return false;
        } else {
            await submitStudentForm();
            await resetForm()
            // await resetForm();
        }
    });


    $("#class_id").on("change", async (e) => {
        const classId = $("#class_id").val();
        await getSectionsByClass(classId);
    })
    
    // phoneNumber validation
    $("#phone_number, #parent_phone").on("input", function () {
        phoneNumber($(this).attr('id'));
    });
});

let fields = [
    'admission_date', 'student_name', 'date_of_birth', 'blood_group', 'gender',
    // contact Details
    'email', 'phone_number',
    // parent Details
    'parent_name', 'relation_with_student', 'parent_phone', 'parent_email',
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
        "institute_id": instituteId,
        "student_name": $("#student_name").val(),
        "gender": $("#gender").val(),
        "date_of_birth": $("#date_of_birth").val(),
        "blood_group": $("#blood_group").val(),
        "address": totalAddress,
        "phone_number": $("#phone_number").val(),
        "email": $("#email").val(),
        "admission_date": $("#admission_date").val(),
        "photo": "string",
        "roll_number": 0,
        "class_id": $("#class_id").val(),
        "section_id": $("#section_id").val(),
    };
    var isEdit = $("#isEdit").val();
    var method = isEdit === "1" ? "PUT" : "POST";
    var studentId = $("#studentId").val();  // Make sure studentId is defined
    var endPoint = isEdit === "1" ? `/Students/update_student/${studentId}` : `/Students/create_student/`;
    var studentUrl = `${apiUrl}${endPoint}`;
    console.log(method, studentUrl, studentData);
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
            console.log("beforeSend");
            showLoader("body", "lg")
        },
        succes:(response) => {
            console.log(response);
            // caling addParent function
            addParent(response.id);
            
            if(isEdit === "1"){
                window.location.href = `/app/students/`;
            }
            // window.location.href = "/Students/";
        },
        error:(error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete:(e) => {
            raiseSuccessAlert("Student Added Successfully");
            removeLoader("body", "lg")
            if(isEdit === "1"){
                window.location.href = `/app/students/`;
            }
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
            console.log(error.responseJSON.detail);
        },
        complete:(e) => {
        }
    });
}




// geting class and section
async function getSectionsByClass(classId) {
    const classEndPoint = `/Sections/get_sections_by_class/?class_id=${classId}`;
    const classUrl = `${apiUrl}${classEndPoint}`;
    const response = await $.ajax({
        type: "GET",
        url: classUrl,
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: (e) => {
            
        },
        succes:(response) => {
            for (const section of response) {
                $("#section_id").append(`<option value="${section.id}">${section.section_name}</option>`);
            }
        },
        error:(error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete:(e) => {
            
        },
    });
}