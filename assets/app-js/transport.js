
function closetransportForm(event) {
    // event.preventDefault()
    transportForm.style.display = "none";
}

function showtransportForm(event) {
    transportForm.style.display = "block";
}


const URL = "https://gsm-fastapi.azurewebsites.net"
// create and edit
let isEditMode = false;

document.addEventListener("DOMContentLoaded", () => {
    let form = document.getElementById('transport-form')
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
        console.log("inside");
        const formData = new FormData(document.getElementById('transport-form'));
        const data = {
            "institute_id": 1010,
            "id": formData.get("id"),
            "vehicle_number": formData.get("vehicle_number"),
            "vehicle_details": formData.get("vehicle_details"),
            "register_date": formData.get('register_date'),
            "transport_name": formData.get("transport_name"),
        };

        console.log("data from form:", data)
        console.log('jwtToken',jwtToken);
        console.log("created updated check id ", data.id)
        const url = isEditMode ? `${URL}/Transport/update_transport/?transport_id=${data.id}` :
            `${URL}/Transport/create_transport/`;
        const method = isEditMode ? 'PUT' : 'POST'
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(data),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok")
                }
                return response.json();
            })
            .then(data => {
                if (isEditMode) {
                    console.log("inside")
                    const updatedData = data['response']
                    const tr = document.querySelector(`.tr-transport-${updatedData["transport_id"]}`)
                    console.log(tr)
                    Swal.fire({
                        icon: 'success',
                        title: 'transport updated Successfully!',
                        position: 'top-end',
                        toast: true,
                        showConfirmButton: false,
                        timer: 3000,
                        padding: '1rem',
                        customClass: {
                            title: 'small-title',
                        },
                    });
                    for (const key in updatedData) {
                        try {
                            tr.querySelector(`.${key}`).textContent = updatedData[key]
                            closetransportForm()
                            form.reset();
                            isEditMode = true;
                        }
                        catch {

                        }
                    }
                }
                else {
                    const tableBody = document.querySelector('.tbl__bdy');

                    const response = data.response;
                    console.log("response", response)
                    Swal.fire({
                        icon: 'success',
                        title: 'transport added successfully!',
                        position: 'top-end',
                        toast: true,
                        showConfirmButton: false,
                        timer: 3000,
                        padding: '1rem',
                        customClass: {
                            title: 'small-title',
                        },
                    });

                    const newRow = `
                            <tr class="tr-transport-${response.transport_id}">
                                <td>${tableBody.children.length + 1}</td>
                                <td class="vehicle_number">${response.vehicle_number}</td>
                                <td class="vehicle_details">${response.vehicle_details}</td>
                                <td class="register_date">${response.register_date}</td>
                                <td class="transport_name">${response.transport_name}</td>
                                <td>
                                <button class="btn btn-sm btn-dark rounded-pill" onclick="openstopDetails('stopForm','${ response.transport_name }')" data-id="${response.transport_id}">View</button>
                            </td>
                                <td>
                                    <button class="btn btn-sm btn-dark rounded-pill openBtn" onclick="openstudentDetails('student')">View</button>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-dark rounded-pill openBtn" onclick="openstaffDetails('staff')">View</button>
                                </td>
                                <td>
                                    <button type="button" class="btn btn-sm btn-info" onclick="EditButton(this)" data-id="${response.transport_id}">
                                        <i class="bi bi-pencil-square"></i>
                                        <button type="button" class="btn  btn-sm btn-danger" onclick="DeleteButton(this)" data-id="${response.transport_id}"><i class="bi bi-trash3"></i>
                                </td>
                            </tr>
                            `;

                    tableBody.innerHTML += newRow;
                    closetransportForm(event)
                    form.reset();
                    isEditMode = false;
                }
            })
            .catch(error => {
                console.log('Fetch error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops ..',
                    position: 'center',
                    toast: true,
                    showConfirmButton: false,
                    timer: 3000,
                    padding: '1rem',
                    customClass: {
                        title: 'small-title',
                    },
                });


            });
    });

})



function EditButton(element) {
    event.preventDefault();
    const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');

    console.log("inside edit button");

    const id = element.getAttribute('data-id');
    console.log(" each id", id)
    const url = `${URL}/Transport/get_transport_data_by_id/?transport_id=${id}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}` // Include the JWT token here
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            console.log('Data received from API:', data);
            showtransportForm()
            response = data["response"]

            document.getElementById("id").value = response.transport_id;
            document.getElementById("vehicle_number").value = response.vehicle_number;
            document.getElementById("vehicle_details").value = response.vehicle_details;
            document.getElementById("register_date").value = response.register_date;
            document.getElementById("transport_name").value = response.transport_name;
            isEditMode = true;

        })
        .catch(error => {
            console.log('Fetch error:', error);
        });
}



// Define DeleteButton in the global scope

function DeleteButton(element) {
    event.preventDefault();
    const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
    Swal.fire({
        title: 'Are you sure you want to delete this transportation?',
        text: "This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete'
    }).then((result) => {
        if (result.isConfirmed) {
            // User clicked the confirm button
            const id = element.getAttribute('data-id');
            console.log(" each id", id)
            const url = `${URL}/Transport/delete_transport/?transport_id=${id}`;

            fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}` // Include the JWT token here
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok.');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Data Deleted from API:', data);

                    const DeleteRow = document.querySelector(`.tr-transport-${id}`);
                    if (DeleteRow) {
                        DeleteRow.remove();
                    } else {
                        console.log('Row not found in the table');
                    }
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'Transport Deleted Successfully',
                        toast: true,
                        showConfirmButton: false,
                        timer: 4000,
                        timerProgressBar: true,
                        customClass: {
                            popup: 'small-sweetalert',
                            title: 'small-sweetalert-title',
                            content: 'small-sweetalert-content'
                        }
                    });

                    isEditMode = true;
                })
                .catch(error => {
                    console.log('Fetch error:', error);
                });
        }
    });
}

// stopages

function openstopDetails(formId, transportName,transport_id) {

    document.getElementById("transportNameContent").innerHTML = `<h3>${transportName}</h3>`;
    document.getElementById(formId).style.display = "block";
    document.querySelector("#add-stopage-btn").value = transport_id
    displayStopages(transport_id)
}

function closestopDetails() {
    document.getElementById('stopForm').style.display = "none";
}


function addMore(element) {
    const stopageInput = document.getElementById('stopage');
    const stopageName = stopageInput.value.trim();
    const stop = document.getElementById('stopage');
    const transport_id=document.querySelector('#add-stopage-btn').value
    console.log("transport",transport_id)

    if (stopageName !== '') {
        // const transport_id = 38;
        const requestBody = {
            'stop_name': stopageName,
            'transport_id': transport_id,
        };
        
         const url=`${URL}/Stops/create_stopage/`
         const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}` // Include the JWT token here
            },
            body: JSON.stringify(requestBody),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                let stopdata = data["response"]
                const stoppageContainer = document.getElementById('stopagesList');
                    console.log(stopdata);
                    const stop = `<div class="col-md-12 d-flex align-items-center" id="stopage_id_${stopdata['stop_id']}">
                                <input type="text" class="form-control" value="${stopdata["stop_name"]}">
                                <a href="#" onclick="deleteStoppage(this)" data-stop-id="${stopdata['stop_id']}"><i class="bi bi-trash3" style="color: red;"></i></a>
                    </div>`
                    stoppageContainer.innerHTML += stop;
                    stopageInput.value = ""
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        alert('Please enter a stoppage name.');
    }
}



function displayStopages(transport_id) {
    const url=`${URL}/Stops/get_all_stopages_by_transport/?transport_id=${transport_id}`
    const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}` // Include the JWT token here
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            const stoppageContainer = document.getElementById('stopagesList');
            stoppageContainer.innerHTML = '';

            data.forEach(stopdata => {
                console.log(stopdata);
                const stop = `<div class="col-md-12 d-flex align-items-center" id="stopage_id_${stopdata['stop_id']}">
                            <input type="text" class="form-control" value="${stopdata["stop_name"]}">
                            <a href="#" onclick="deleteStoppage(this)" data-stop-id="${stopdata['stop_id']}"><i class="bi bi-trash3" style="color: red;"></i></a>
                </div>`
                stoppageContainer.innerHTML += stop;
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Call the function to display stoppages on page load
displayStopages();




function deleteStoppage(element) {
    event.preventDefault();
    const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
    console.log("deleted");
    const id = element.getAttribute('data-stop-id');
    console.log("each id", id);
    const url = `${URL}/Stops/delete_stop/?stop_id=${id}`;

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}` // Include the JWT token here
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log("Stoppage deleted successfully:", data);
            const DeletedStopage = document.querySelector(`#stopage_id_${id}`);
            console.log("id", DeletedStopage);
            if (DeletedStopage) {
                DeletedStopage.remove();
            } else {
                console.log("Stoppage row not deleted");
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Function to fetch student details
function fetchStudentDetails() {
    var rollNumber = document.getElementById('roll_number').value;
    var endpoint = `https://gsm-fastapi.azurewebsites.net/Students/get_students_by_field/roll_number/${rollNumber}/`;

    // Use fetch to make the API call
    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            // Display the retrieved student details in the table
            var tableBody = document.getElementById('assignedStudents');
            tableBody.innerHTML = ""; // Clear previous data

            if (data.length > 0) {
                data.forEach(student => {
                    var row = tableBody.insertRow();
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    cell1.textContent = student.roll_number;
                    cell2.textContent = student.student_name;
                });

                // Store the assigned students in local storage
                var assignedStudents = data.map(student => ({ roll_number: student.roll_number, student_name: student.student_name }));
                localStorage.setItem('assignedStudents', JSON.stringify(assignedStudents));
            } else {
                // Handle case when no student is found
                // Display a message or take appropriate action
                console.log('No student found with the given roll number.');
            }
        })
        .catch(error => console.error('Error fetching student details:', error));
}

// Function to retrieve assigned students from local storage on page load
window.onload = function () {
    var storedStudents = localStorage.getItem('assignedStudents');
    if (storedStudents) {
        var parsedStudents = JSON.parse(storedStudents);
        var tableBody = document.getElementById('assignedStudents');

        parsedStudents.forEach(student => {
            var row = tableBody.insertRow();
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            cell1.textContent = student.roll_number;
            cell2.textContent = student.student_name;
        });
    }
}

// Function to open and close student details form
function closeStudentDetails() {
    document.getElementById('studentdetailsForm').style.display = "none";
}

function showStudentDetails() {
    document.getElementById('studentdetailsForm').style.display = "block";
}
