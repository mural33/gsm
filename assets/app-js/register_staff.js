$(document).ready(() => {
  $("#btnSave").on("click", async (e) => {
    $("#btnSave").removeClass("btn-shake");
    e.preventDefault();
    if (validateStaffForm() === false) {
      $("#btnSave").addClass("btn-shake");
      return false;
    } else {
      await staffSubmitForm();
    }
  });
  // phoneNumber validation
  $("#phone_number").on("input", function () {
    PhoneNumber($(this).attr("id"));
  });
});

let fields = [
  "joining_date",
  "staff_name",
  "date_of_birth",
  "blood_group",
  "gender",
  'staffPhoto',
  // contact Details
  "email",
  "phone_number",
  // professional details
  "specialization",
  "experience",
  // payroll Details
  "employee_type",
  "salary",
  // address Details
  "address",
  "city",
  "state",
  "country",
  "pincode",
];

// staff form validation
function validateStaffForm() {
  var isValid = true;
  for (const field of fields) {
    const element = $(`#${field}`);
    if (element.length === 0) {
      continue;
    }
    const value = element.val().trim();
    if (value === "") {
      element.focus().addClass("is-invalid");
      isValid = false;
    }
  }
  const staffPhone = $("#phone_number").val().trim();
  if (staffPhone.length < 10 || !["6", "7", "8", "9"].includes(staffPhone[0])) {
    $("#phone_number").focus().addClass("is-invalid");
    isValid = false;
  }
  return isValid;
}
// formSubmit
async function staffSubmitForm() {
  const totalAddress = `${$("#address").val()}, ${$("#city").val()}, ${$(
    "#state"
  ).val()}, ${$("#country").val()}, ${$("#pincode").val()}`;
  const staffData = {
    photo: await uploadFile("staffPhoto","staff_profile"),
    institute_id: instituteId,
    staff_name: $("#staff_name").val(),
    role: $("#role").val(),
    address: totalAddress,
    gender: $("#gender").val(),
    experience: $("#experience").val(),
    specialization: $("#specialization").val(),
    phone_number: $("#phone_number").val(),
    email: $("#email").val(),
    blood_group: $("#blood_group").val(),
    date_of_birth: $("#date_of_birth").val(),
    joining_date: $("#joining_date").val(),
    salary: $("#salary").val(),
    slug: "string",
    is_deleted: false,
    employee_id: 0,
  };
  var isEdit = $("#is_edit").val();
  var method = isEdit === "1" ? "PUT" : "POST";
  var staffId = $("#staff_id").val();
  var endPoint =
    isEdit === "1"
      ? `/Staff/update_staff/?staff_id=${staffId}`
      : `/Staff/create_staff/`;
  var staffUrl = `${apiUrl}${endPoint}`;

  await $.ajax({
    type: method,
    url: staffUrl,
    data: JSON.stringify(staffData),
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
    contentType: "application/json",
    dataType: "json",
    beforeSend: (e) => {
      showLoader("staffFormArea", "lg");
    },
    success: (response) => {
      addPayrollStaff(response["response"].staff_id);
    },
    error: (error) => {
      raiseErrorAlert(error.responseJSON.detail);
    },
    complete: (e) => {
      removeLoader("staffFormArea", "lg");
      resetForm(fields);
      if (isEdit === "1") {
        raiseSuccessAlert("Staff Updated Successfully");
        window.location.href = `/app/staffs/`;
      } else {
        raiseSuccessAlert("Staff Created Successfully");
      }
    },
  });
}
// add Payroll Staff
async function addPayrollStaff(staffId) {
  const payrollData = {
    staff_id: staffId,
    payroll_type: $("#employee_type").val(),
    salary_amount: $("#salary").val(),
    payment_mode: "string",
    payroll_details: "string",
  };
  var payrollUrl = `${apiUrl}/StaffPayrole/add_payroll/`;
  await $.ajax({
    type: "POST",
    url: payrollUrl,
    data: JSON.stringify(payrollData),
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
    contentType: "application/json",
    dataType: "json",
    beforeSend: (e) => {
      showLoader("staffFormArea", "lg");
    },
    succes: (response) => {
      raiseSuccessAlert(response.detail);
    },
    error: (error) => {
      raiseErrorAlert(error.responseJSON.detail);
    },
    complete: (e) => {
      removeLoader("staffFormArea", "lg");
      resetForm(fields);
    },
  });
}
