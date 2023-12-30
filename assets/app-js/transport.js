$(document).ready(() => {
    $("#saveBtn").on("click", async (e) => {
        $("#saveBtn").removeClass("btn-shake");
        if (validateForm() === false) {
            $("#saveBtn").addClass("btn-shake");
            return false;
        } else {
            addTransport();
        }
    });
    bindGridButtonEvents();
});

function bindGridButtonEvents() {
    $(".btnEdit").off("click");
    $(".btnEdit").each(function() {
        $(this).click(function() {
            const transportId = $(this).attr("data-id");
            if (transportId) {
                const response = editTransport(transportId, jwtToken);
            }
        });
    });
    $(".btndelete").off("click");
    $('.btndelete').each(function () {
        $(this).click(function () {
            const transportId = $(this).attr("data-id");
            try {
                const response = deleteTransport(transportId, jwtToken);
                if (response.success) {
                    $(this).closest('tr').remove();
                    raiseSuccessAlert("Transport Record Deleted Successfully");
                }
            } catch (error) {
                raiseErrorAlert(error.responseJSON.detail);
            }
        });
    });
}
let fields = [
    'vehicle_number', 'vehicle_details', 'register_date', 'transport_name',
];

function validateForm() {
    var isValid = true;
    for (const field of fields) {
        const element = $(`#${field}`);
        const value = element.val().trim();
        if (value === '') {
            element.focus().addClass('is-invalid');
            isValid = false;
            raiseErrorAlert("Fill the all details");
        }
    }
    return isValid;
}

function addTransport() {
    let isUpdate = $("#id").val() !== "";
    const transportId = $("#id").val();
    const TransportData = {
        "institute_id": instituteId,
        "id": transportId,
        "vehicle_number": $("#vehicle_number").val(),
        "vehicle_details": $("#vehicle_details").val(),
        "register_date": $("#register_date").val(),
        "transport_name": $("#transport_name").val(),
    };
    const transportEndPoint = isUpdate ? `/Transports/update_transport/?transport_id=${transportId}` : "/Transports/create_transport/";
    const transportUrl = `${apiUrl}${transportEndPoint}`;
    const requestType = isUpdate ? 'PUT' : 'POST';
    return $.ajax({
        type: requestType,
        url: transportUrl,
        data: JSON.stringify(TransportData),
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: (e) => {
            showLoader("transport", "lg");
        },
        success: function (data) {
            $("#editModal").modal("hide")
            if (data) {
                const responseData = data["response"];
                if (isUpdate) {
                    const tr = document.querySelector(`.tr-transport-${responseData.transport_id}`);
                    for (const key in responseData) {
                        try {
                            tr.querySelector(`.${key}`).textContent = responseData[key];
                        } catch (error) {
                            raiseErrorAlert("error")
                        }
                    }
                    $('#editModal').addClass("model fade");
                    raiseSuccessAlert("Transport Record Updated Successfully");
                } else {
                    const newRow = `
                        <tr class="tr-transport-${responseData.transport_id}">
                            <td>${$("#transport_details tr").length + 1}</td>
                            <td class="vehicle_number">${responseData.vehicle_number}</td>
                            <td class="vehicle_details">${responseData.vehicle_details}</td>
                            <td class="register_date">${responseData.register_date}</td>
                            <td class="transport_name">${responseData.transport_name}</td>
                            <td>
                                <button class="btn btn-sm btn-dark rounded-pill" onclick="openstopDetails('stopForm','${responseData.transport_name}','${responseData.transport_id}')" data-id="${responseData.transport_id}"  data-bs-toggle="modal"
                                data-bs-target="#stopFormModal">View</button>
                            </td>
                            <td>
                            <button class="btn btn-sm btn-dark rounded-pill" data-bs-toggle="modal"  data-bs-target="#studentModal" onclick="showStudentDetails(this)" data-trans-id="${responseData.transport_id}">View</button>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-dark rounded-pill" data-bs-toggle="modal"  data-bs-target="#staffModal" onclick="showStaffDetails(this)" data-trans-id="${responseData.transport_id}">View</button>
                                </td>
                            <td>
                            <button type="button" class="btn  btn-sm btn-info btnEdit" id="btnEdit" data-id="${responseData.transport_id}">
                                <i class="bi bi-pencil-square"></i></button>
                            <button type="button" class="btn btn-sm btn-danger btndelete" id="deleteButton" data-id="${responseData.transport_id}">
                                <i class="bi bi-trash3"></i></button>
                        </td>
                        </tr>
                    `;
                    $("#transport_details").append(newRow)
                    bindGridButtonEvents();
                    raiseSuccessAlert("Transport Record Added Successfully");
                }
            }
        },
        error: function (xhr, status, error) {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: (e) => {
            removeLoader("transport", "lg");
            resetForm(fields)
        }
    });
}

async function deleteTransport(recordId, jwtToken) {
    const deleteEndpoint = `/Transports/delete_transport/?transport_id=${recordId}`;
    const deleteUrl = `${apiUrl}${deleteEndpoint}`;
    try {
        const confirmation = await Swal.fire({
            title: 'Are you sure you want to delete this Transport?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Delete'
        });
        if (confirmation.isConfirmed) {
            const response = await $.ajax({
                type: "DELETE",
                url: deleteUrl,
                headers: {
                    "Authorization": `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                },
                contentType: "application/json",
                dataType: "json",
                beforeSend: (e) => {
                    showLoader("body", "lg");
                },
            });
            const deleteRow = document.querySelector(`.tr-transport-${recordId}`);
            if (deleteRow) {
                deleteRow.remove();
                removeLoader("body", "lg")
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Transport data deleted Successfully',
                });
            } return response;
        } else {
           raiseErrorAlert("Deleted Cancelled")
        }
    } catch (error) {
        raiseErrorAlert("error")
    }

}

function editTransport(transportId) {
    const fetchUrl = `${apiUrl}/Transports/get_transport_data_by_id/?transport_id=${transportId}`;
    return $.ajax({
        type: "GET",
        url: fetchUrl,
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json"
    })
        .then((data) => {
            if (data && data.response) {
                var responseData = data.response;
                $("#id").val(responseData.transport_id);
                $("#vehicle_number").val(responseData.vehicle_number);
                $("#vehicle_details").val(responseData.vehicle_details);
                $("#register_date").val(responseData.register_date);
                $("#transport_name").val(responseData.transport_name);
                $('#editModal').modal('show');
                return responseData;
            }
        })
        .catch((xhr, status, error) => {
            raiseErrorAlert(error.responseJSON.detail);
            throw error;
        });
}
function openstopDetails(formId, transportName, transport_id) {
    $("#transportNameContent").html(`<h3>${transportName}</h3>`);
    $("#" + formId).css("display", "block");
    $("#add-stopage-btn").val(transport_id);
    displayStopages(transport_id);
}
function closestopDetails() {
    $("#stopForm").css("display", "none");
}
function addMore(element) {
    const stopageInput = $('#stopage');
    const stopageName = stopageInput.val().trim();
    const transport_id = $('#add-stopage-btn').val();
    if (stopageName !== '') {
        const requestBody = {
            'stop_name': stopageName,
            'transport_id': transport_id,
        };
        const url = `${apiUrl}/Stops/create_stopage/`;
        $.ajax({
            type: 'POST',
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            data: JSON.stringify(requestBody),
            beforeSend: (e) => {
                showLoader("stopFormModalBody", "sm");
            },
            success: function (data) {
                let stopdata = data["response"];
                const stoppageContainer = $('#stopagesList');
                const stop = `<div class="mt-2 d-flex align-items-center" id="stopage_id_${stopdata['stop_id']}">
                                <input type="text" class="form-control" value="${stopdata["stop_name"]}">
                                <a href="#" onclick="deleteStoppage(this)" data-stop-id="${stopdata['stop_id']}">
                                    <i class="bi bi-trash3" style="color: red; padding: 16px;"></i>
                                </a>
                            </div>`;
                stoppageContainer.append(stop);
                stopageInput.val('');
                raiseSuccessAlert("Stop Added Successfully");
            },
            error: function (error) {
                raiseErrorAlert("error")
            },
            complete: (e) => {
                removeLoader("stopFormModalBody", "sm");
            }
        });
    } else {
        raiseErrorAlert(" Enter the stop name")
    }
}
function displayStopages(transport_id) {
    const url = `${apiUrl}/Stops/get_all_stopages_by_transport/?transport_id=${transport_id}`;
    $.ajax({
        type: 'GET',
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        beforeSend: (e) => {
            showLoader("stopFormModalBody", "sm");
        },
        success: function (data) {
            const stoppageContainer = $('#stopagesList');
            stoppageContainer.empty();
            data.forEach(stopdata => {
                const stop = `<div class="mt-2 d-flex align-items-center" id="stopage_id_${stopdata['stop_id']}">
                            <input type="text" class="form-control" value="${stopdata["stop_name"]}">
                            <a href="#" onclick="deleteStoppage(this)" data-stop-id="${stopdata['stop_id']}">
                                <i class="bi bi-trash3" style="color: red; padding: 16px;"></i>
                            </a>
                        </div>`;
                stoppageContainer.append(stop);
            });
        },
        error: function (error) {
            raiseErrorAlert('Error:');
        },
        complete: (e) => {
            removeLoader("stopFormModalBody", "sm");
        }
    });
}
function deleteStoppage(element) {
    event.preventDefault();
    const id = $(element).data('stop-id');
    const url = `${apiUrl}/Stops/delete_stop/?stop_id=${id}`;
    $.ajax({
        type: 'DELETE',
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        beforeSend: (e) => {
            showLoader("stopFormModalBody", "sm");
        },
        success: function (data) {
            const deletedStopage = $(`#stopage_id_${id}`);
            if (deletedStopage.length) {
                deletedStopage.remove();
                raiseSuccessAlert("Stop deleted Successfully");
            } else {
                raiseErrorAlert("Stoppage row not deleted");
            }
        },
        error: function (error) {
            raiseErrorAlert("error")
        },
        complete: (e) => {
            removeLoader("stopFormModalBody", "sm");
        }
    });
}
function showStudentDetails(button) {
    var assignButton = $('#trns-std-id');
    var id = $(button).attr("data-trans-id");
    assignButton.attr('data-transport-id', id);
    $('#studentModal').css("display", "block");
    displayAssignedStudents(id)
}
function closeStudentDetails() {
    $('#studentModal').css("display", "none");
}
function fetchStudentDetails() {
    var rollNumber = $('#roll_number').val();
    var transportId = $('#trns-std-id').attr('data-transport-id');
    var endpoint = `${apiUrl}/Transports/assign_transport_to_student/?student_roll_number=${rollNumber}&transport_id=${transportId}`;
    $.ajax({
        url: endpoint,
        type: 'PUT',
        headers: {
            'accept': 'application/json ',
            'Authorization': `Bearer ${jwtToken}`
        },
        beforeSend: (e) => {
            showLoader("studentformModal", "sm")
        },
        success: function (data) {
            var tableBody = $('#assignedStudents');
            if (data && data.status_code === 200 && data.response && data.response.roll_number && data.response.student_name) {
                var row = $('<tr data-roll-number="' + data.response.roll_number + '">');
                var cell1 = $('<td>').text(data.response.roll_number);
                var cell2 = $('<td>').text(data.response.student_name);
                var deleteButton = $('<td>').html('<button class="btn btn-danger btn-sm" onclick="deleteStudent(this)" data-student-id=" ' + data.response.roll_number + '">Delete</button>');
                row.append(cell1, cell2, deleteButton);
                tableBody.append(row);
                localStorage.setItem('assignedStudents', JSON.stringify([{ roll_number: data.response.roll_number, student_name: data.response.student_name }]));
                $('#roll_number').val('');
                raiseSuccessAlert("Student Added Successfully");
            } else {
                raiseErrorAlert('No student found with the given roll number.');
            }
        },
        error: function (error) {
            raiseErrorAlert(" Enter the student roll number")
        },
        complete: (e) => {
            removeLoader("studentformModal", "sm")  
        }
    });
}
function displayAssignedStudents(transportId) {
    var url = `${apiUrl}/Transports/get_all_students_by_transport_id/?transport_id=${transportId}`;
    var tableBody = $('#assignedStudents'); 
    if (tableBody.length === 0) {
        raiseErrorAlert('Table body not found.');
        return;
    }
    $.ajax({
        url: url,
        type: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        beforeSend: (e) => {
            showLoader("studentformModal", "sm");
        },
        success: function (data) {
            tableBody.empty(); 
            if (data && data.status_code === 200 && data.response && data.response.length > 0) {
                data.response.forEach(function (student) {
                    var row = $('<tr data-roll-number="' + student.roll_number + '">');
                    var cell1 = $('<td>').text(student.roll_number);
                    var cell2 = $('<td>').text(student.student_name);
                    var deleteButton = $('<td>').html('<button class="btn btn-danger btn-sm" onclick="deleteStudent(this)" data-student-id=" ' + student.roll_number + '" >Delete</button>');
                    row.append(cell1, cell2, deleteButton);
                    tableBody.append(row);
                });
                localStorage.setItem('assignedStudents', JSON.stringify(data.response));
            } else {
                raiseErrorAlert('No students found for the given transport ID.');
            }
        },
        error: function (error) {
            raiseErrorAlert('Error fetching assigned students:', error);
        },
        complete: (e) => {
            removeLoader("studentformModal", "sm");
        }
    });
}
function deleteStudent(button) {
    var roll_number = $(button).attr('data-student-id').trim();
    var endpoint =`${apiUrl}/Transports/unassign_transport_to_student/?student_roll_number=${roll_number}`;
    $.ajax({
        url: endpoint,
        type: 'PUT',
        headers: {
            'accept': 'application/json ',
            'Authorization': `Bearer ${jwtToken}`
        },
        beforeSend: (e) => {
            showLoader("studentformModal", "sm")
        },
        success: function (data) {
            $('tr[data-roll-number="' + roll_number + '"]').remove();
            raiseSuccessAlert("Student deleted Successfully");

        },
        error: function (error) {
            raiseErrorAlert('Error deleting student:');
        },
        complete: (e) => {
            removeLoader("studentformModal", "sm")
        }
    });
}

function showStaffDetails(button) {
    var assignButton = $('#trns-staff-id');
    var id = $(button).attr("data-trans-id");
    assignButton.attr('data-transport-id', id);
    $('#staffModal').css("display", "block");
    displayAssignedStaff(id);
}
function closeStaffDetails() {
    $('#staffModal').css("display", "none");
}
function fetchStaffDetails() {
    var employee_id = $('#employee_id').val();
    var transportId = $('#trns-staff-id').attr('data-transport-id');
    var endpoint = `${apiUrl}/Transports/assign_transport_to_staff/?employee_id=${employee_id}&transport_id=${transportId}`;
    $.ajax({
        url: endpoint,
        type: 'PUT',
        headers: {
            'accept': 'application/json ',
            'Authorization': `Bearer ${jwtToken}`
        },
        beforeSend: (e) => {
            showLoader("staffformModal", "sm");
        },
        success: function (data) {
            var tableBody = $('#assignedStaff');
            if (data && data.status_code === 200 && data.response && data.response.employee_id && data.response.staff_name) {
                var row = $('<tr data-employee_id="' + data.response.employee_id + '">');
                var cell1 = $('<td>').text(data.response.employee_id);
                var cell2 = $('<td>').text(data.response.staff_name);
                var deleteButton = $('<td>').html('<button class="btn btn-danger btn-sm" onclick="deleteStaff(this)" data-employee-id="' + data.response.employee_id + '">Delete</button>');
                row.append(cell1, cell2, deleteButton);
                tableBody.append(row);
                localStorage.setItem('assignedStaff', JSON.stringify([{ employee_id: data.response.employee_id, staff_name: data.response.staff_name }]));
                $('#employee_id').val('');
                raiseSuccessAlert("Staff Added Successfully");
            } else {
                raiseErrorAlert('No staff found with the given employee number.');
            }
        },
        error: function (error) {
            raiseErrorAlert("Enter the Staff Id ")
        },
        complete: (e) => {
            removeLoader("staffformModal", "sm");
        }
    });
}

function displayAssignedStaff(transportId) {
    var url = `${apiUrl}/Transports/get_all_staffs_by_transport_id/?transport_id=${transportId}`;
    var tableBody = $('#assignedStaff');
    if(tableBody.length===0){
        return;
    }
    $.ajax({
        url: url,
        type: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        beforeSend: (e) => {
            showLoader("staffformModal", "sm");
        },
        success: function (data) {
            tableBody.empty()
            if (data && data.status_code === 200 && data.response && data.response.length > 0) {
                data.response.forEach(function (staff) {
                    var row = $('<tr data-employee_id="' + staff.employee_id + '">');;
                    var cell1 = $('<td>').text(staff.employee_id);
                    var cell2 = $('<td>').text(staff.staff_name);
                    var deleteButton = $('<td>').html('<button class="btn btn-danger btn-sm" onclick="deleteStaff(this)" data-employee-id="' + staff.employee_id + '">Delete</button>');
                    row.append(cell1, cell2, deleteButton);
                    tableBody.append(row);
                });
                localStorage.setItem('assignedStaff', JSON.stringify(data.response));
            } else {
                raiseErrorAlert('No staff found for the given transport ID.');
            }
        },
        error: function (error) {
            raiseErrorAlert('Error fetching assigned staff:', error);
        },
        complete: (e) => {
            removeLoader("staffformModal", "sm");
        }
    });
}
function deleteStaff(button) {
    var employee_id = $(button).attr('data-employee-id').trim();
    var url =`${apiUrl}/Transports/unassign_transport_to_staff/?employee_id=${employee_id}`;
    $.ajax({
        url: url,
        type: 'PUT',
        headers: {
            'accept': 'application/json ',
            'Authorization': `Bearer ${jwtToken}`
        },
        beforeSend: (e) => {
            showLoader("staffformModal", "sm");
        },
        success: function (data) {
            $('tr[data-employee_id="' + employee_id + '"]').remove();
            raiseSuccessAlert("Staff deleted Successfully");
        },
        error: function (error) {
            raiseErrorAlert('Error deleting staff:');
        },
        complete: (e) => {
            removeLoader("staffformModal", "sm")
        }
    });
}




















