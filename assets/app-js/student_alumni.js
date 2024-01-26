$(document).ready(function () {
    loadClassinAlumni();
    $("#btnSearchAlumni").click(async function (e) {
        $("#btnSearchAlumni").removeClass("btn-shake")
        e.preventDefault();
        if (validateForm(searchAlumniFields) === false) {
          $("#btnSearchAlumni").addClass("btn-shake")
          return false;
        } else {
          await searchAlumni();
        }
      });
});

async function loadClassinAlumni() {
    const getClassesUrl = apiUrl + "/Classes/get_classes_by_institute/?institite_id=" + instituteId;
    let data;
    data = await $.ajax({
        type: "GET",
        url: getClassesUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        data: JSON.stringify(data),
        success: function (responseData) {
            const classDropdown = $("#selectClass");
            classDropdown.empty();
            classDropdown.append("<option value='0'>All Classes</option>");
            responseData.forEach(option => {
                classDropdown.append(`<option value="${option.class_id}">${option.class_name}</option>`);
            });
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
    });
}

let searchAlumniFields=["selectClass","completetion_type"]
let resetAlumniField = ["selectClass","completetion_type","fromDate","toDate"]
function formatDate(inputDate) {
    const date = new Date(inputDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}-${month < 10 ? '0' : ''}${month}-${year}`;
}
async function searchAlumni() {
    classId = $("#selectClass").val();
    const data = {
        institute_id: instituteId,
        class_id: classId,
        from_date: $("#fromDate").val(),
        to_date: $("#toDate").val(),
        course_complete_type: $("#completetion_type").val(),
    };
    if($("#fromDate").val() != ""){

        data.from_date = formatDate(data.from_date);
    }
    if($("#toDate").val() != ""){
        data.to_date = formatDate(data.to_date);
    }
    const alumniUrl = apiUrl + "/Students/get_alumini_students/";
    await $.ajax({
        type: "POST",
        url: alumniUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        data: JSON.stringify(data),
        beforeSend: (e) => {
            showLoader("alumniFormArea", "sm");
        },
        success: async function (data) {
            if (data.length > 0) {
                console.log(data);
                $("#searchAlumnimodal").modal("hide");
    
                var tableBody = $("#studentAlumni");
                var noDataImage = tableBody.find('.no_data_found-tr');
                if (noDataImage.length > 0) {
                    noDataImage.remove();
                }
                $('#studentsAlumniTable').DataTable().clear().draw();
                for (var i = 0; i < data.length; i++) {
                    var student = data[i];
                    var newRow =
                        `<tr id="alumniId-${student.student_id}">
                            <td><img src='${student.photo}' alt="" srcset="" with="50px" height="50px"></td>
                            <td><a href='/app/student/${student.slug}'>${student.student_name}</a></td>
                            <td>${student.roll_number}</td>
                            <td>${student.classes.class_name}</td>
                            <td>${student.sections.section_name}</td>
                            <td>${student.gender}</td>
                            <td>${student.course_complete_type}</td>
                        </tr>`;
                        $('#studentsAlumniTable').DataTable().row.add($(newRow)).draw();
                }
                // resetForm(resetAlumniField);
            }else {
                raiseInfoAlert("No data available for these criteria.");
        }
        },        
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: (e) => {
            removeLoader("alumniFormArea", "sm");
        },
    });
}
