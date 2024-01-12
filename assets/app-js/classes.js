$(document).ready(function () {
  hideContent();
  $("#class_list").change(async function () {
    var selectedClassId = $(this).val();
    var selectedClassName = "Select Class";
    if (selectedClassId !== "0") {
      selectedClassName = this.options[this.selectedIndex].text;
      showContent();
    } else {
      selectedClassId = 0;
      selectedClassName = "None";
      setTimeout(function () {
        hideContent();
      }, 10);
      return;
    }
    await fetchDropdownValue(selectedClassId, selectedClassName);
    $("#sectionByClass").on("change", function () {
      var selectedSectionId = $(this).val();
      if (selectedSectionId) {
        loadCalendarDetails(selectedClassId, selectedSectionId);
      } else {
      }
    });
    $(".btnCloseExamModel").on("click", function(e){
      const parentModel = $(this).closest(".modal");
      parentModel.modal("hide");
      $('#start_date,#end_date,#result_date,#parent_exam_id,#parent_exam_name,#subject_Input',parentModel).val("");
  });
  });
  const installmentDropdown = document.getElementById("installment-dropdown");
  installmentDropdown.addEventListener("change", function () {
      const selectedInstallment = this.options[this.selectedIndex];
      const installmentNumber = selectedInstallment.getAttribute("data-install-number");
      $("#installment_display").val(installmentNumber);
      console.log("Selected Installment Number:", installmentNumber);
      var installment = $("#installment-dropdown").val()
      if(installment.trim() != ""){
          showDynamicFee(installment)
      }
      else{
          $("#Installment tbody").empty()
      }
  });
  $('#total_fee, #fee_admission').on('input', updateInstallAmount);

  // _____Add/Edit ClassbuttonTrigger_____
  $("#btnSave").click(async function (e) {
    $("#btnSave").removeClass("btn-shake")
    e.preventDefault();
    if (validateClassModuleForm("class") === false) {
      $("#btnSave").addClass("btn-shake")
      return false;
    } else {
      await addClass();
      $("#class_creation_modal .modal-title").text("Save Class");
    }
  });
  // _____Class Update____
  $("#btnEdit").click(async function () {
    var classId = $(this).data("class-id");
    $("#class_creation_modal").modal("show");
    $("#class_creation_modal .modal-title").text("Edit Class");
    const editurl = apiUrl + "/Classes/class_id/?class_id=" + classId;
    await $.ajax({
      type: "GET",
      url: editurl,
      mode: "cors",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`,
      },
      beforeSend: (e) => {
        showLoader("class-form-area", "sm");
      },
      success: (data) => {
        if (data && data.response) {
          var responseData = data.response;
          $("#class_id").val(responseData.class_id);
          $("#class_name").val(responseData.class_name);
        }
      },
      error: (error) => {
        raiseErrorAlert(error["responseJSON"]["detail"]);
      },
      complete: (e) => {
        removeLoader("class-form-area", "sm");
      },
    });
  });

  // _____Class Delete____
  $("#btnDelete").click(async function () {
    var classId = $(this).data("class-id");
    const deleteUrl = apiUrl + "/Classes/" + classId;
    Swal.fire({
      title: 'Are you sure, you want to delete this Record?',
      text: 'This can\'t be reverted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await $.ajax({
          type: "DELETE",
          url: deleteUrl,
          mode: "cors",
          crossDomain: true,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
          },
          beforeSend: (e) => {
            showLoader("body", "sm");
          },
          success: (response) => {
            $("#class_list option[value='" + classId + "']").remove();

            $("#classOption").text("Select Class");

            $("#selected_class_name").text("None");
            hideContent();
            raiseSuccessAlert("Class Deleted Successfully.");
          },
          error: (error) => {
            raiseErrorAlert(error["responseJSON"]["detail"]);
          },
          complete: (e) => {
            removeLoader("body", "sm");
          },
        });
      }
    });
  });

  // _____Add/Edit SectionbuttonTrigger_____
  $("#btnSectionSave").click(async function (e) {
    $("#btnSectionSave").removeClass("btn-shake")
    e.preventDefault();
    if (validateClassModuleForm("section") === false) {
      $("#btnSectionSave").addClass("btn-shake")
      return false;
    } else {
      await addSection();
      $("#section_creation_modal .modal-title").text("Save Section");
    }
  });
  // _____Add/Edit SubjectbuttonTrigger_____
  $("#btnSujectSave").click(async function (e) {
    $("#btnSujectSave").removeClass("btn-shake")
    e.preventDefault();
    if (validateClassModuleForm("subject") === false) {
      $("#btnSujectSave").addClass("btn-shake")
      return false;
    } else {
      await addSubject();
      $("#subject_creation_modal .modal-title").text("Save Subject");
    }
  });
  // _____Add/Edit GradebuttonTrigger_____
  $("#btnGradeSave").click(async function (e) {
    $("#btnGradeSave").removeClass("btn-shake")
    e.preventDefault();
    if (validateGradeForm() === false) {
      $("#btnGradeSave").addClass("btn-shake")
      return false;
    } else {
      await addGrade();
      $("#grade_creation_modal .modal-title").text("Save Grading");
    }
  });
  $("#btnExamSave").click(async function (e) {
    $("#btnExamSave").removeClass("btn-shake")
    e.preventDefault();
    if (validateExamForm() === false) {
      $("#btnExamSave").addClass("btn-shake")
      return false;
    } else {
      await addExam();
      $("#exam_creation_modal .modal-title").text("Save Examination");
    }
  });
});

function showContent() {
  $("#btnEdit, #btnDelete").removeClass("disabled-button").addClass("enabled-button").prop("disabled", false);
  $("#tabContent, .nav-pills").show();
}
function hideContent() {
  $("#btnEdit, #btnDelete").removeClass("enabled-button").addClass("disabled-button").prop("disabled", true);
  $(".nav-pills").hide();
  $("#tabContent").css("display", "none");
}
async function fetchDropdownValue(selectedClassId, selectedClassName) {
  $("#btnDelete").data("class-id", selectedClassId);
  $("#btnEdit").data("class-id", selectedClassId);
  $("#classes_id").val(selectedClassId);
  $("#classesId").val(selectedClassName);
  $("#selected_class_name").text(
    selectedClassName === "Select Class" ? "None" : selectedClassName
  );
  await loadSectionDetails(selectedClassId);
  await loadSubjectDetails(selectedClassId);
  await loadStudentDetails(selectedClassId);
  await loadGradeDetails(selectedClassId);
  await loadExams(selectedClassId);
  await loadCalendarDetails(selectedClassId);
  await loadFeeDetails(selectedClassId)
}

// _______ADD/EDIT Class_______
async function addClass() {
  let isUpdate = $("#class_id").val() !== "";
  const data = {
    institute_id: instituteId,
    class_id: $("#class_id").val(),
    class_name: $("#class_name").val(),
    is_deleted: false,
  };
  const url = isUpdate ? apiUrl + "/Classes/" + data.class_id : apiUrl + "/Classes/create_class/";
  const requestType = isUpdate ? "PUT" : "POST";
  await $.ajax({
    type: requestType,
    url: url,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    data: JSON.stringify(data),
    beforeSend: (e) => {
      showLoader("class-form-area", "sm");
    },
    success: async function (data) {
      $("#class_creation_modal").modal("hide");
      if (data) {
        const responseData = data["response"];
        const $dropdown = $("#class_list");
        if (isUpdate) {
          const selectedOption = $dropdown.find(
            `option[value="${responseData.class_id}"]`
          );
          selectedOption.text(responseData.class_name);
          $("#selected_class_name").text(responseData.class_name);
          $("#class_id").val("");
          raiseSuccessAlert("Class Updated Successfully");
        } else {
          $dropdown.append(
            `<option value="${responseData.class_id}">${responseData.class_name}</option>`
          );
          // $dropdown.val(responseData.class_id);
         await addSectionInClass(responseData.class_id)
          raiseSuccessAlert("Class Added Successfully.");
        }
        resetFormFields("class");
      }
    },
    error: (error) => {
      raiseErrorAlert(error["responseJSON"]["detail"]);
    },
    complete: (e) => {
      removeLoader("class-form-area", "sm");
    },
  });
}

async function addSectionInClass(classId){
  const sectionsUrl = apiUrl + "/Sections/create_section/";
  const sectionData = {
    class_id: classId,
    section_name: "Section A",
  };
  await $.ajax({
    type: "POST",
    url: sectionsUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("class-form-area", "sm");
    },
    data: JSON.stringify(sectionData),
    success: (sectionResponse) => {
    },
    complete: (e) => {
      removeLoader("class-form-area", "sm");
    },
  });
}

function validateClassModuleForm(formType) {
  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  var isValid = true;
  const fields = [`${formType}_name`];

  for (const field of fields) {
    const element = $(`.form-control.${field}`);
    if (element.length === 0) {
      continue;
    }
    const value = element.val().trim();
    if (value === "") {
      element.focus().addClass("is-invalid");
      isValid = false;
    } else if (value.length < 3) {
      element.focus().addClass("is-invalid");
      isValid = false;
      raiseErrorAlert(
        `${capitalizeFirstLetter(
          formType
        )} name must be at least 3 characters long`
      );
    }else{
      element.focus().removeClass("is-invalid");
    }
  }
  return isValid;
}
function resetFormFields(formType) {
  const fields = [`${formType}_name`];
  for (const field of fields) {
    const element = $(`.form-control.${field}`);
    if (element.length > 0) {
      element.val("");
      element.removeClass("is-invalid");
    }
  }
}
// _______GET Section_______
async function loadSectionDetails(selectedClassId) {
  var loadSectionUrl = apiUrl + "/Sections/get_sections_by_class/?class_id=" + selectedClassId;

  const sectionData = await $.ajax({
    type: "GET",
    url: loadSectionUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("tabSection", "sm");
    },
    success: async function (sectionData) {
      var sectionDetailsContainer = $("#tabSection");
      sectionDetailsContainer.empty();
      var dropdown = $("#sectionByClass");
      dropdown.empty();
      if (sectionData.length === 0) {
        sectionDetailsContainer.html('<img src="/assets/img/no_data_found.png" class="no_data_found">');
      } else {
        sectionDetailsContainer.find('.no_data_found').remove();
        for (var i = 0; i < sectionData.length; i++) {
          var section = sectionData[i];
          var sectionHtml =
            '<div class="mt-2" id="section-' + section.section_id + '">' +
            '<div class="col-md-4 bg-light p-2 d-flex justify-content-between align-items-center rounded" id="card2">' +
            '<div class="w-40 text-left text-wrap section3" id="section-name-' + section.section_id + '">' + section.section_name + "</div>" +
            '<div class="d-flex gap-2 actions">' +
            '<a href="#" class="btnSectionEdit" onclick="editSection(this)" data-section-id="' + section.section_id + '">' +
            '<i class="bi bi-pencil-square text-primary"></i>' + "</a>" +
            '<a href="#" class="btnSectionDelete" onclick="deleteSection(this)" data-section-id="' + section.section_id + '">' +
            '<i class="bi bi-trash-fill text-danger"></i>' + "</a>" +
            "</div>" +
            "</div>" +
            "</div>";
          sectionDetailsContainer.append(sectionHtml);
          dropdown.append(`<option value="${section.section_id}">${section.section_name}</option>`);
        }
      }
    },
    error: (error) => {
      raiseErrorAlert(error);
    },
    complete: (e) => {
      removeLoader("tabSection", "sm");
    },
  });
}
// _______ADD/EDIT Section_______
async function addSection() {
  let isUpdate = $("#section_id").val() !== "";
  const data = {
    section_id: $("#section_id").val(),
    section_name: $("#section_name").val(),
    class_id: $("#classes_id").val(),
    is_deleted: false,
  };
  const sectionUrl = isUpdate ? apiUrl + "/Sections/update_section_id/" + data.section_id : apiUrl + "/Sections/create_section/";
  const requestType = isUpdate ? "PUT" : "POST";
  await $.ajax({
    type: requestType,
    url: sectionUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    data: JSON.stringify(data),
    beforeSend: (e) => {
      showLoader("section-form-area", "sm");
    },
    success: async function (data) {
      if (data) {
        $("#section_creation_modal").modal("hide");
        const responseData = data["response"];
        if (isUpdate) {
          raiseSuccessAlert("Section Updated Successfully");
          await loadSectionDetails(responseData.class_id);
          $("#section_id").val("");
        } else {
          raiseSuccessAlert("Section Added Successfully.");
          await loadSectionDetails(responseData.class_id);
        }
        resetFormFields("section");
      }
    },
    error: (error) => {
      raiseErrorAlert(error["responseJSON"]["detail"]);
    },
    complete: (e) => {
      removeLoader("section-form-area", "sm");
    },
  });
}
// _______GET SectionforEdit_______
async function editSection(element) {
  event.preventDefault();
  var sectionId = element.getAttribute("data-section-id");
  $("#section_creation_modal").modal("show");
  $("#section_creation_modal .modal-title").text("Edit Section");
  const editSectionUrl = apiUrl + "/Sections/section_id/?section_id=" + sectionId;
  await $.ajax({
    type: "GET",
    url: editSectionUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("section-form-area", "sm");
    },
    success: (data) => {
      if (data && data.response) {
        var responseData = data.response;
        $("#section_id").val(responseData.section_id);
        $("#section_name").val(responseData.section_name);
      }
    },
    error: (error) => {
      raiseErrorAlert(error["responseJSON"]["detail"]);
    },
    complete: (e) => {
      removeLoader("section-form-area", "sm");
    },
  });
}
// _______DELETE Section_______
async function deleteSection(element) {
  event.preventDefault();
  var sectionId = element.getAttribute("data-section-id");
  const deleteSectionUrl = apiUrl + "/Sections/delete_section_id/" + sectionId;
  const class_Id = $("#classes_id").val();
  Swal.fire({
    title: 'Are you sure, you want to delete this Record?',
    text: 'This can\'t be reverted!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      const data = await $.ajax({
        type: "DELETE",
        url: deleteSectionUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`,
        },
        beforeSend: (e) => {
          showLoader("body", "sm");
        },
        success: async function (data) {
          var parentDiv = $(element).closest(`#section-${sectionId}`);
          parentDiv.remove();
          raiseSuccessAlert("Section Deleted Successfully.");
          await loadSectionDetails(class_Id);
        },
        error: (error) => {
          raiseErrorAlert(error["responseJSON"]["detail"]);
        },
        complete: (e) => {
          removeLoader("body", "sm");
        },
      });
    }
  });
}
// _______GET Section_______
async function loadSubjectDetails(selectedClassId) {
  var loadSubUrl = apiUrl + "/Subjects/get_subjects_by_class/?class_id=" + selectedClassId;
  const subjectData = await $.ajax({
    type: "GET",
    url: loadSubUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("tabSubject", "sm");
    },
    success: async function (subjectData) {
      var subjectContainer = $("#tabSubject");
      subjectContainer.empty();
      var subjectsTable = $("#subData");
      subjectsTable.empty();
      if (subjectData.length === 0) {
        subjectContainer.html('<img src="/assets/img/no_data_found.png" class="no_data_found">');
      } else {
        subjectContainer.find('.no_data_found').remove();
        for (var i = 0; i < subjectData.length; i++) {
          var subject = subjectData[i];
          var subHtml =
            '<div class="mt-2" id="subject-' + subject.subject_id + '">' +
            '<div class="col-md-4 bg-light p-2 d-flex justify-content-between align-items-center rounded" id="card2">' +
            '<div class="w-40 text-left text-wrap section3" id="subject-name-' +
            subject.subject_id + '">' + subject.subject_name + "</div>" +
            '<div class="d-flex gap-2 actions">' +
            '<a href="#" onclick="editSubject(this)" data-subject-id="' + subject.subject_id + '">' +
            '<i class="bi bi-pencil-square text-primary"></i>' + "</a>" +
            '<a href="#" onclick="deleteSubject(this)" data-subject-id="' + subject.subject_id + '">' +
            '<i class="bi bi-trash-fill text-danger"></i>' + "</a>" +
            "</div>" +
            "</div>" +
            "</div>";
          subjectContainer.append(subHtml);

          var newRow = $(`<tr class="subjectRow" id="subRow-${subject.subject_id}">`);
          newRow.append(`<td class="sublabel" id="subjectId" name="subject_id" data-subject-id="${subject.subject_id}" value="${subject.subject_id}">${subject.subject_name}</td>`);
          newRow.append(`<td><input type="text" class="form-control fullMarks" id="subject_Input" value="100" name="full_marks"></td>`);
          newRow.append(`<td><a class="btn btn-sm btn-danger" onclick="removeSubject(this)" data-subjects-id="${subject.subject_id}"><i class="bi bi-trash3"></i></a></td>`);
          subjectsTable.append(newRow);
        }
      }
    },
    error: (error) => {
      raiseErrorAlert(error);
    },
    complete: (e) => {
      removeLoader("tabSubject", "sm");
    },
  });
}
function removeSubject(button) {
  var subjectId = $(button).data("subjects-id");
  $(`#subRow-${subjectId}`).remove();
}
// _______ADD/EDIT Subject_______
async function addSubject() {
  let isEdit = $("#subject_id").val() !== "";
  const data = {
    subject_id: $("#subject_id").val(),
    subject_name: $("#subject_name").val(),
    class_id: $("#classes_id").val(),
    is_deleted: false,
  };
  const subjectUrl = isEdit ? apiUrl + "/Subjects/update_subject_id/" + data.subject_id : apiUrl + "/Subjects/create_subject/";
  const requestsType = isEdit ? "PUT" : "POST";
  await $.ajax({
    type: requestsType,
    url: subjectUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    data: JSON.stringify(data),
    beforeSend: (e) => {
      showLoader("subject-form-area", "sm");
    },
    success: async function (data) {
      if (data) {
        const subjectData = data["response"];
        $("#subject_creation_modal").modal("hide");
        if (isEdit) {
          raiseSuccessAlert("Subject Updated Successfully");
          await loadSubjectDetails(subjectData.class_id);
          $("#subject_id").val("");
        } else {
          raiseSuccessAlert("Subject Added Successfully.");
          await loadSubjectDetails(subjectData.class_id);
        }
        resetFormFields("subject");
      }
    },
    error: (error) => {
      raiseErrorAlert(error["responseJSON"]["detail"]);
    },
    complete: (e) => {
      removeLoader("subject-form-area", "sm");
    },
  });
}
// _______GET SubjectforEdit_______
async function editSubject(element) {
  event.preventDefault();
  var subjectId = element.getAttribute("data-subject-id");
  $("#subject_creation_modal").modal("show");
  $("#subject_creation_modal .modal-title").text("Edit Subject");
  const editSubjectUrl = apiUrl + "/Subjects/subject_id/?subject_id=" + subjectId;
  await $.ajax({
    type: "GET",
    url: editSubjectUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("subject-form-area", "sm");
    },
    success: (data) => {
      if (data && data.response) {
        var responseData = data.response;
        $("#subject_id").val(responseData.subject_id);
        $("#subject_name").val(responseData.subject_name);
      }
    },
    error: (error) => {
      raiseErrorAlert(error["responseJSON"]["detail"]);
    },
    complete: (e) => {
      removeLoader("subject-form-area", "sm");
    },
  });
}
// _______DELETE Subject_______
async function deleteSubject(element) {
  event.preventDefault();
  var subjectId = element.getAttribute("data-subject-id");
  const deleteSubUrl = apiUrl + "/Subjects/delete_subject_id/" + subjectId;
  const classsId = $("#classes_id").val();
  Swal.fire({
    title: 'Are you sure, you want to delete this Record?',
    text: 'This can\'t be reverted!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      const data = await $.ajax({
        type: "DELETE",
        url: deleteSubUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`,
        },
        beforeSend: (e) => {
          showLoader("body", "sm");
        },
        success: async function (data) {
          var parentDiv = $(element).closest(`#subject-${subjectId}`);
          parentDiv.remove();
          raiseSuccessAlert("Subject Deleted Successfully.");
          await loadSubjectDetails(classsId);
        },
        error: (error) => {
          raiseErrorAlert(error["responseJSON"]["detail"]);
        },
        complete: (e) => {
          removeLoader("body", "sm");
        },
      });
    }
  });
}
// _______GET Student_______
async function loadStudentDetails(selectedClassId) {
  var loadStudentUrl = apiUrl + "/Students/get_students_by_field/class_id/" + selectedClassId + "/";
  const studentData = await $.ajax({
    type: "GET",
    url: loadStudentUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("tabStudent", "sm");
    },
    success: async function (studentData) {

      var studentDetailsContainer = $("#tabStudent");
      var studentTableBody = studentDetailsContainer.find("#classStudentTable");
      studentTableBody.empty();

      if (studentData.length === 0) {
        studentDetailsContainer.html(
          '<img src="/assets/img/no_data_found.png" class="no_data_found">'
        );
      } else {
        var studentTableHtml = '<table class="table table-striped table-hover table-sticky table_students" id="classStudent">' +
          '<thead class="thead-dark">' +
          '<tr>' +
          '<th>Photo</th>' +
          '<th>Student Name</th>' +
          '<th>Roll Number</th>' +
          '<th>Class </th>' +
          '<th>Section</th>' +
          '<th>Gender</th>' +
          '<th>Blood Group</th>' +
          '</tr>' +
          '</thead>' +
          '<tbody class="tbl__bdy" id="classStudentTable">';

        for (var i = 0; i < studentData.length; i++) {
          var student = studentData[i];
          var studentHtml =
            '<tr class="tr-student-' + student.student_id + '">' +
            "<td>" + "<img src=" + student.photo + " class='studetImage'>" + "</td>" +
            '<td class="student_name">' + 
           "<a href='/student/" + student.slug + "'>" + student.student_name + "</a>" +
            "</td>" +
            '<td class="roll_number">' + student.roll_number + "</td>" +
            '<td class="class_id">' + student.classes.class_name + "</td>" +
            '<td class="section_id">' + student.sections.section_name + "</td>" +
            '<td class="gender">' + student.gender + "</td>" +
            '<td class="blood_group">' + student.blood_group + "</td>" +
            "</tr>";
          studentTableHtml += studentHtml;
        }
        studentTableHtml += '</tbody></table>';
        studentDetailsContainer.html(studentTableHtml);
        $('#classStudent').DataTable();
      }
    },
    error: (error) => {
      raiseErrorAlert(error);
    },
    complete: (e) => {
      removeLoader("tabStudent", "sm");
    },
  });
}
//_______GET Gradings_______
async function loadGradeDetails(selectedClassId) {
  var loadGradeUrl = apiUrl + "/Grades/get_grade_by_class_id/?class_id=" + selectedClassId;
  const gradeData = await $.ajax({
    type: "GET",
    url: loadGradeUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("tabGrading", "sm");
    },
    success: async function (gradeData) {
      var gradingDetailsContainer = $("#tabGrading");
      gradingDetailsContainer.empty();
      if (gradeData.length === 0) {
        gradingDetailsContainer.html('<img src="/assets/img/no_data_found.png" class="no_data_found">');
      } else {
        gradingDetailsContainer.find('.no_data_found').remove();
        for (var i = 0; i < gradeData.length; i++) {
          var grade = gradeData[i];
          var gradingHtml = `
        <div class="mt-2" id="grade-${grade.grade_id}">
          <div class="col-md-3 bg-light p-2 d-flex justify-content-between align-items-center rounded" id="card2">
            <div class="w-40 text-left section3" id="grade-name-${grade.grade_id}">
              ${grade.percent_from}% - ${grade.percent_upto}%
            </div>
            <div class="line-section"><hr></div>
            <div class="text-left"> ${grade.grade_name} </div>
            <div class="d-flex gap-2 actions">
              <a href="#" onclick="editGrading(this)" data-grade-id="${grade.grade_id}">
                <i class="bi bi-pencil-square text-primary"></i></a>
              <a href="#" onclick="deleteGrading(this)" data-grade-id="${grade.grade_id}">
                <i class="bi bi-trash-fill text-danger"></i></a>
            </div>
          </div>
        </div>`;
          gradingDetailsContainer.append(gradingHtml);
        }
      }
    },
    error: (error) => {
      raiseErrorAlert(error);
    },
    complete: (e) => {
      removeLoader("tabGrading", "sm");
    },
  });
}
// _______ADD/EDIT Grade_______
async function addGrade() {
  let editGrade = $("#grade_id").val() !== "";
  classId =$("#classes_id").val();
  const data = {
    institute_id: instituteId,
    class_id: [classId],
    grade_id: $("#grade_id").val(),
    grade_name: $("#grade_name").val(),
    percent_from: $("#percent_from").val(),
    percent_upto: $("#percent_upto").val(),
    is_deleted: false,
  };
  const gradeUrl = editGrade ? apiUrl + "/Grades/update_grade/?grade_id=" + data.grade_id : apiUrl + "/Grades/create_grade/";
  const requestsType = editGrade ? "PUT" : "POST";
  await $.ajax({
    type: requestsType,
    url: gradeUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    data: JSON.stringify(data),
    beforeSend: (e) => {
      showLoader("grade-form-area", "sm");
    },
    success: async function (data) {
      if (data && data.response) {
        $("#grade_creation_modal").modal("hide");
        const responseData = data.response;
        if (editGrade) {
          raiseSuccessAlert("Grade Updated Successfully");
          await loadGradeDetails(classId);
          $("#grade_id").val("");
        } else {
          raiseSuccessAlert("Grade Added Successfully.");
          await loadGradeDetails(classId);
        }
        resetGradeForm();
      }
    },
    error: (error) => {
      raiseErrorAlert(error["responseJSON"]["detail"]);
    },
    complete: (e) => {
      removeLoader("grade-form-area", "sm");
    },
  });
}
function validateGradeForm() {
  var minPercentage = parseFloat($("#percent_from").val());
  var maxPercentage = parseFloat($("#percent_upto").val());
  var isValid = true;
  const fields = ["percent_from", "percent_upto", "grade_name"];
  for (const field of fields) {
    const element = $(`#${field}`);
    const value = element.val().trim();
    if (value === "") {
      element.focus().addClass("is-invalid");
      isValid = false;
    }else{
      element.focus().removeClass("is-invalid");
    }
  }
  if (!isNaN(minPercentage) && !isNaN(maxPercentage)) {
      if (!(0 <= minPercentage && minPercentage <= 100) || !(0 <= maxPercentage && maxPercentage <= 100)) {
          raiseErrorAlert("Percentage should be between 0 to 100");
          isValid = false;
      }
  } else {
      raiseErrorAlert("Invalid percentage values");
      isValid = false;
  }
  if (parseFloat($("#percent_from").val()) > parseFloat($("#percent_upto").val())) {
    raiseErrorAlert("Minimum Percentage should be less than Maximum Percentage");
    isValid = false;
  }
  return isValid;
}

function resetGradeForm() {
  const fields = ["percent_from", "percent_upto", "grade_name"]
  for (const field of fields) {
    const element = $(`.form-control.${field}`);
    if (element.length > 0) {
      element.val("");
      element.removeClass("is-invalid");
    }
  }
}
// _______GET GradeforEdit_______
async function editGrading(element) {
  event.preventDefault();
  var gradeId = element.getAttribute("data-grade-id");
  $("#grade_creation_modal").modal("show");
  $("#grade_creation_modal .modal-title").text("Edit Grading");
  const editGradeUrl = apiUrl + "/Grades/get_grade_by_id/?grade_id=" + gradeId;
  await $.ajax({
    type: "GET",
    url: editGradeUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("grade-form-area", "sm");
    },
    success: (data) => {
      if (data) {
        var responseData = data;
        $("#grade_id").val(responseData.grade_id);
        $("#percent_from").val(responseData.percent_from);
        $("#percent_upto").val(responseData.percent_upto);
        $("#grade_name").val(responseData.grade_name);
      }
    },
    error: (error) => {
      raiseErrorAlert(error["responseJSON"]["detail"]);
    },
    complete: (e) => {
      removeLoader("grade-form-area", "sm");
    },
  });
}
// _______DELETE Grade_______
async function deleteGrading(element) {
  event.preventDefault();
  var gradeId = element.getAttribute("data-grade-id");
  const deleteGrdUrl = apiUrl + "/Grades/delete_grade/?grade_id=" + gradeId;
  const classsesId = $("#classes_id").val();
  Swal.fire({
    title: 'Are you sure, you want to delete this Record?',
    text: 'This can\'t be reverted!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      const data = await $.ajax({
        type: "DELETE",
        url: deleteGrdUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`,
        },
        beforeSend: (e) => {
          showLoader("body", "sm");
        },
        success: async function (data) {
          raiseSuccessAlert("Grade Deleted Successfully.");
          var parentDiv = $(element).closest(`#grade-${gradeId}`);
          parentDiv.remove();
          await loadGradeDetails(classsesId);
        },
        error: (error) => {
          raiseErrorAlert(error["responseJSON"]["detail"]);
        },
        complete: (e) => {
          removeLoader("body", "sm");
        },
      });
    }
  });
}
//_______GET Calender_______
async function loadCalendarDetails(selectedClassId) {
  try {
    sectionId = $("#sectionByClass").val();
    var loadCalendarUrl = apiUrl + `/Calender/get_calender_by_class&section/?class_id=${selectedClassId}&section_id=${sectionId}`;

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
    });

    var calendarDetailsContainer = $("#tabCalender");
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
  } catch (error) {
    raiseErrorAlert(error);
  } finally {
    removeLoader("tabCalender", "sm");
  }
}

function validateExamForm() {
  var isValid = true;
  const fields = ["start_date", "end_date", "result_date", "parent_exam_name","subject_Input"];
  for (const field of fields) {
    const element = $(`#${field}`);
    const value = element.val().trim();
    if (value === "") {
      element.focus().addClass("is-invalid");
      isValid = false;
    }else{
      element.focus().removeClass("is-invalid");
    }
  }
  const todayDate = new Date().toISOString().split('T')[0];
  if ($("#start_date").val() < todayDate) {
    raiseErrorAlert("Start Date must be greater than today's date");
    isValid = false;
  }
  if ($("#start_date").val() > $("#end_date").val() && $("#result_date")) {
    raiseErrorAlert("Start Date can not be greater than End Date and Result Date");
    isValid = false;
  }
  if ($("#end_date").val() > $("#result_date").val()) {
    raiseErrorAlert("End Date must be less than Result Date");
    isValid = false;
  }
  
  return isValid;
}

function resetExamForm() {
  const fields = ["start_date", "end_date", "result_date", "parent_exam_name"];
  for (const field of fields) {
    const element = $(`.form-control.${field}`);
    if (element.length > 0) {
      element.val("");
      element.removeClass("is-invalid");
    }
  }
}
//_______GET Exams_______
async function loadExams(selectedClassId) {
  var loadExamsUrl = apiUrl + "/ParentExams/get_parent_exam_by_class_id?class_id=" + selectedClassId;
  const examsData = await $.ajax({
    type: "GET",
    url: loadExamsUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("tabExam", "sm");
    },
    success: async function (examsData) {
      var examsContainer = $("#tabExam");
      examsContainer.empty();

      if (examsData.upcoming_parent_exam.length === 0 && examsData.old_parent_exams.length === 0) {
        examsContainer.html('<img src="/assets/img/no_data_found.png" class="no_data_found">');
      } else {
        if (examsData.upcoming_parent_exam.length > 0) {
          var upcomingHtml = '<h5 class="examHeading">Upcoming Exams</h5>' +
            '<table class="table table-striped table-hover table-sticky mt-3 table_students" id="upcomingExam">' +
            '<thead class="thead-dark">' +
            '<tr>' +
            '<th>Exam Date</th>' +
            '<th>Name of Exams</th>' +
            '<th>Result Announced Date</th>'+
            '<th>Action</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody class="tbl__bdy">';

          for (var i = 0; i < examsData.upcoming_parent_exam.length; i++) {
            var exam = examsData.upcoming_parent_exam[i];
            var startDate = new Date(exam.start_date);
            var endDate = new Date(exam.end_date);
            var resultDate = new Date(exam.result_date);
            var formattedStartDate = formatDate(startDate);
            var formattedEndDate = formatDate(endDate);
            var formattedResultDate = formatDate(resultDate);
            var upcomingExamHtml =
              '<tr class="upcomExam" data-exm-id="' + exam.parent_exam_id + '">' +
              '<td>' + formattedStartDate + ' - ' + formattedEndDate + '</td>' +
              '<td>' + exam.parent_exam_name + '</td>' +
              '<td>' + formattedResultDate + '</td>' +
              '<td>' +
              '<a class="btn btn-sm btn-info" onclick="editExam(this)" data-exam-id="' + exam.parent_exam_id + '"><i class="bi bi-pencil-square"></i></a>' +
              '<a class="btn btn-sm btn-danger" onclick="deleteExam(this)" data-exam-id="' + exam.parent_exam_id + '" id="examDelete"><i class="bi bi-trash3"></i></a>' +
              '</td>' +
              '</tr>';

            upcomingHtml += upcomingExamHtml;
          }

          upcomingHtml += '</tbody></table>';
          examsContainer.append(upcomingHtml);
          $('#upcomingExam').DataTable();
        }
        if (examsData.old_parent_exams.length > 0) {
          var pastHtml = '<h5 class="examHeading">Past Exams</h5>' +
            '<table class="table table-striped table-hover table-sticky mt-3 table_students" id="pastExam">' +
            '<thead class="thead-dark">' +
            '<tr>' +
            '<th>Exam Date</th>' +
            '<th>Name of Exams</th>' +
            '<th>Result Announced Date</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody class="tbl__bdy">';

          for (var i = 0; i < examsData.old_parent_exams.length; i++) {
            var exam = examsData.old_parent_exams[i];
            var startDate = new Date(exam.start_date);
            var endDate = new Date(exam.end_date);
            var resultDate = new Date(exam.result_date);
            var formattedStartDate = formatDate(startDate);
            var formattedEndDate = formatDate(endDate);
            var formattedResultDate = formatDate(resultDate);

            var pastExamHtml =
              '<tr>' +
              '<td>' + formattedStartDate + ' - ' + formattedEndDate + '</td>' +
              '<td>' + exam.parent_exam_name + '</td>' +
              '<td>' + formattedResultDate + '</td>' +
              '</tr>';

            pastHtml += pastExamHtml;
          }

          pastHtml += '</tbody></table>';
          examsContainer.append(pastHtml);
          $('#pastExam').DataTable();
        }
      }
    },
    error: (error) => {
      raiseErrorAlert(error);
    },
    complete: (e) => {
      removeLoader("tabExam", "sm");
    },
  });
}

function formatDate(date) {
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  day = day < 10 ? '0' + day : day;
  month = month < 10 ? '0' + month : month;

  return day + '-' + month + '-' + year;
}
async function addExam() {
  let editExam = $("#parent_exam_id").val() !== "";
  classesId = $("#classes_id").val();
  const data = {
    institute_id: instituteId,
    class_id: classesId,
    parent_exam_id: $("#parent_exam_id").val(),
    parent_exam_name: $("#parent_exam_name").val(),
    start_date: $("#start_date").val(),
    end_date: $("#end_date").val(),
    result_date: $("#result_date").val(),
    is_deleted: false,
  };
  const parentExamUrl = editExam ? apiUrl + "/ParentExams/update_parent_exam?parent_exam_id=" + data.parent_exam_id : apiUrl + "/ParentExams/create_parent_exam";
  const requestsType = editExam ? "PUT" : "POST";
  await $.ajax({
    type: requestsType,
    url: parentExamUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("exam-form-area", "sm");
    },
    data: JSON.stringify(data),
    success: async function (data) {
      if (data) {
        $("#exam_creation_modal").modal("hide");
        const responseData = data["response"];
        var startDate = new Date(responseData.start_date);
        var endDate = new Date(responseData.end_date);
        var resultDate = new Date(responseData.result_date);
        var formattedStartDate = formatDate(startDate);
        var formattedEndDate = formatDate(endDate);
        var formattedResultDate = formatDate(resultDate);

        if (editExam) {
          let rows = document.querySelectorAll('.sublabel');
          for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let subjectId = row.dataset.subjectId;
            // var examId = row.querySelector(".fullMarks").getAttribute("data-child-id");
            let examId = localStorage.getItem(`child_exam_id_${subjectId}`);
            let ancestorRow = row.closest('.subjectRow');
            if (ancestorRow) {
              let fullMarksInput = ancestorRow.querySelector(".fullMarks");
              let fullMarksValue = fullMarksInput.value;
              await updateChildExam(examId, responseData.parent_exam_id, subjectId, fullMarksValue);
            }
          }
          const existingRow = $("tr[data-exm-id='" + responseData.parent_exam_id + "']");
          if (existingRow.length) {
            existingRow.find('td:eq(0)').text(formattedStartDate + ' - ' + formattedEndDate);
            existingRow.find('td:eq(1)').text(responseData.parent_exam_name);
            existingRow.find('td:eq(2)').text(formattedResultDate);
          }
          raiseSuccessAlert("Examination Updated Successfully");
          $("#parent_exam_id").val("");
          resetExamForm();
        } else {
          await addChildExam(responseData.parent_exam_id);
          var examsContainer = $("#tabExam");
          var noDataImage = examsContainer.find('.no_data_found');
          if (noDataImage.length > 0) {
            noDataImage.remove();
          }
          var upcomingTable = $("#upcomingExam").DataTable();

          if (!upcomingTable.data().any()) {
              upcomingTable.destroy();
              var upcomingHtml =
                  '<div id="upcomingExamination">' +
                  '<h5 class="examHeading">Upcoming Exams</h5>' +
                  '<table class="table table-striped table-hover table-sticky mt-3 table_students" id="upcomingExam">' +
                  '<thead class="thead-dark">' +
                  '<tr>' +
                  '<th>Exam Date</th>' +
                  '<th>Name of Exams</th>' +
                  '<th>Result Announced Date</th>' +
                  '<th>Action</th>' +
                  '</tr>' +
                  '</thead>' +
                  '<tbody class="tbl__bdy">' +
                  '</tbody>' +
                  '</table>' +
                  '</div>';
              examsContainer.append(upcomingHtml);
              upcomingTable = $("#upcomingExam").DataTable();
          }
  
          var upcomingExamHtml =
              '<tr class="upcomExam" data-exm-id="' + responseData.parent_exam_id + '">' +
              '<td>' + formattedStartDate + ' - ' + formattedEndDate + '</td>' +
              '<td>' + responseData.parent_exam_name + '</td>' +
              '<td>' + formattedResultDate + '</td>' +
              '<td>' +
              '<a class="btn btn-sm btn-info" onclick="editExam(this)" data-exam-id="' + responseData.parent_exam_id + '"><i class="bi bi-pencil-square"></i></a>' +
              '<a class="btn btn-sm btn-danger" onclick="deleteExam(this)" data-exam-id="' + responseData.parent_exam_id + '" id="examDelete"><i class="bi bi-trash3"></i></a>' +
              '</td>' +
              '</tr>';
          upcomingTable.row.add($(upcomingExamHtml)).draw();    
          raiseSuccessAlert("Examination Added Successfully.");
        }
        resetExamForm();
      }
    },
    error: (error) => {
      raiseErrorAlert(error["responseJSON"]["detail"]);
    },
    complete: (e) => {
      removeLoader("exam-form-area", "sm");
    },
  });
}
async function addChildExam(parentExamId){
  const examUrl = apiUrl + "/Exams/create_bulk_exam/";
  let subjects = document.querySelectorAll(".sublabel");
  let fullmarksList = document.querySelectorAll(".fullMarks");
  let subject_data = [];

  subjects.forEach((element, index) => {
    let subjectId = element.dataset.subjectId;
    let fullmarks = fullmarksList[index].value;

    subject_data.push({
      full_marks: fullmarks,
      subject_id: subjectId,
      parent_exam_id: parentExamId,
      is_deleted: false,
    });
  });
  await $.ajax({
    type: "POST",
    url: examUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("exam-form-area", "sm");
    },
    data: JSON.stringify(subject_data),
    success: (examData) => {
      console.log(examData);
    },
    complete: (e) => {
      removeLoader("exam-form-area", "sm");
    },
  });
}

async function updateChildExam(examId, parentExamId, subjectId, fullMarksValue) {
  const editChildExamUrl = apiUrl + "/Exams/update_exam/?exam_id=" + examId;
  const updatedChildExamData = {
    "parent_exam_id": parentExamId,
    "subject_id": subjectId,
    "full_marks": fullMarksValue,
    "is_deleted": false,
  };
   await $.ajax({
      type: "PUT",
      url: editChildExamUrl,
      mode: "cors",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`,
      },
      beforeSend: (e) => {
        showLoader("exam-form-area", "sm");
      },
      data: JSON.stringify(updatedChildExamData),
      success: (childData) => {
        localStorage.removeItem(`child_exam_id_${subjectId}`);
      },
      complete: (e) => {
        removeLoader("exam-form-area", "sm");
      },
    });
}

async function editExam(element) {
  event.preventDefault();
  var parentExamId = element.getAttribute("data-exam-id");
  $("#exam_creation_modal").modal("show");
  $("#exam_creation_modal .modal-title").text("Edit Examination");
  const editExamUrl = apiUrl + "/ParentExams/get_parent_exam_by_parent_exam_id?parent_exam_id=" + parentExamId;
  const editChildExamUrl = apiUrl + "/Exams/get_exam_by_parent_exam_id/?parent_exam_id=" + parentExamId;

  const parentExamData = await $.ajax({
    type: "GET",
    url: editExamUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("exam-form-area", "sm");
    },
    success: async function (parentExamData) {
      if (parentExamData) {
        var responseData = parentExamData.response;
        $("#parent_exam_id").val(responseData.parent_exam_id);
        $("#parent_exam_name").val(responseData.parent_exam_name);
        $("#start_date").val(responseData.start_date);
        $("#end_date").val(responseData.end_date);
        $("#result_date").val(responseData.result_date);
      }

      const childExamsData = await $.ajax({
        type: "GET",
        url: editChildExamUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`,
        },
        success: async function (childExamsData) {
          $("#subData").empty();
          if (childExamsData && childExamsData.response.length > 0) {
            for (var i = 0; i < childExamsData.response.length; i++) {
              var childExam = childExamsData.response[i];
              var newRow = $(`<tr class="subjectRow" id="subRow-${childExam.subject_id}">`);
              newRow.append(`<td class="sublabel" id="subjectId" name="subject_id" data-childExm-id="${childExam.exam_id}" data-subject-id="${childExam.subject_id}" value="${childExam.subject_id}">${childExam.subject.subject_name}</td>`);
              newRow.append(`<td><input type="text" class="form-control fullMarks" id="subject_Input" data-child-id=${childExam.exam_id} value="${childExam.full_marks}" name="full_marks"></td>`);
              newRow.append(`<td><a class="btn btn-sm btn-danger" onclick="removeSubject(this)" data-subjects-id="${childExam.subject_id}"><i class="bi bi-trash3"></i></a></td>`);
              $("#subData").append(newRow);
              localStorage.setItem(`child_exam_id_${childExam.subject_id}`, childExam.exam_id);
            }
          }
        },
        complete: (e) => {
          removeLoader("exam-form-area", "sm");
        },
      });
    },
    error: (error) => {
      raiseErrorAlert(error["responseJSON"]["detail"]);
    },
  });
}

async function deleteExam(element) {
  event.preventDefault();
  var examId = element.getAttribute("data-exam-id");
  const deleteExamUrl = apiUrl + "/ParentExams/delete_parent_exam?parent_exam_id=" + examId;
  Swal.fire({
      title: 'Are you sure, you want to delete this Record?',
      text: 'This can\'t be reverted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
  }).then(async (result) => {
      if (result.isConfirmed) {
          const data = await $.ajax({
              type: "DELETE",
              url: deleteExamUrl,
              mode: "cors",
              crossDomain: true,
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${jwtToken}`,
              },
              beforeSend: (e) => {
                  showLoader("body", "sm");
              },
              success: async function (data) {
                  var parentDiv = $(element).closest(`.upcomExam`);
                  parentDiv.remove();
                  var dataTable = $('#upcomingExam').DataTable();
                  dataTable.row(parentDiv).remove().draw();
                  if (dataTable.rows().count() === 0) {
                      $("#tabExam").html('<img src="/assets/img/no_data_found.png" class="no_data_found">');
                  }
                  raiseSuccessAlert("Examination Deleted Successfully.");
              },
              error: (error) => {
                  raiseErrorAlert(error["responseJSON"]["detail"]);
              },
              complete: (e) => {
                  removeLoader("body", "sm");
              },
          });
      }
  });
}

function showDynamicFee(installment){
  showLoader("installment_table","sm")
  // var installments = {
  //     'Monthly':12,
  //     'Quarterly':4,
  //     'Half Yearly':2,
  //     'Yearly':1
  // }
  var totalInstallmentAmount = $("#install_amount").val();
  var installmentNumber = $("#installment_display").val();
  var installmentAmount =parseInt(totalInstallmentAmount/installmentNumber);
  var installmentTable = $("#feeInstallmentTable");
  installmentTable.empty();
  var noInstallment = parseInt(installment);
  var trList = []
  for (let index = 1; index <= noInstallment; index++) {
    var dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + index);
    var day = String(dueDate.getDate()).padStart(2, '0');
    var month = String(dueDate.getMonth() + 1).padStart(2, '0');
    var year = dueDate.getFullYear();
    var formattedDueDate = `${day}-${month}-${year}`;

      var row = `
          <tr>
              <td>Installment-${index}</td>
              <td>${formattedDueDate}</td>
              <td>${installmentAmount}</td>
          </tr>
      `
      trList.push(row);
  }
  removeLoader("installment_table","sm")
  installmentTable.append(trList);
}
function updateInstallAmount() {
  var totalFee = parseFloat($('#total_fee').val()) || 0;
  var admissionFee = parseFloat($('#fee_admission').val()) || 0;
  var totalInstallAmount = totalFee - admissionFee;

  $('#install_amount').val(totalInstallAmount);
}
function getSelectedOption(dropdownId) {
  var dropdown = document.getElementById(dropdownId);
  var selectedOption = dropdown.options[dropdown.selectedIndex];
  return selectedOption;
}

async function loadFeeDetails(selectedClassId) {
  var loadFeeUrl = apiUrl + "/Fees/get_all_fees_by_class/?class_id=" + selectedClassId;
  const feeData = await $.ajax({
    type: "GET",
    url: loadFeeUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("tabFees", "sm"); 
    },
    success: async function (feeData) {
      var feeInfoContainer = $("#installment_table tbody");
      var dropdown = $("#installment-dropdown");
      
      if (feeData.length === 0) {
        feeInfoContainer.html('<tr><td colspan="3"><img src="/assets/img/no_data_found.png" class="no_data_found"></td></tr>');
        $("#total_fee").val('');
        $("#fee_admission").val('');
        $("#install_amount").val('');
        $("#installment_display").val('');
        dropdown.empty();
      } else {
        feeInfoContainer.empty();
        var fee = feeData[0]; 
        var installments = fee.class_installments;
        dropdown.empty();
        for (var i = 0; i < installments.length; i++) {
          var installment = installments[i];
          dropdown.append(`<option value="${installment.installment_number}" data-install-id=${installment.installment_id} data-install-number=${installment.installment_number}>${installment.installment_name}</option>`);
        }
        var selectedOption = getSelectedOption("installment-dropdown");
        var selectedInstallmentNumber = $(selectedOption).data("install-number");
        
        $("#total_fee").val(fee.fee_total);
        $("#fee_admission").val(fee.fee_admission);
        $("#install_amount").val(fee.total_installments);
        $("#installment_display").val(selectedInstallmentNumber);
        $("#installment-dropdown").val(selectedOption.value);
        showDynamicFee(selectedInstallmentNumber);
      }
    },
  
    error: (error) => {
      raiseErrorAlert(error);
    },
    complete: (e) => {
      removeLoader("tabFees", "sm");
    },
  });
}