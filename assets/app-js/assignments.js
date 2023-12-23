function closeForm() {
    assignmentForm.style.display = "none";
}
function openForm() {
    assignmentForm.style.display = "block";
}


function openAssignmentDetails(formId, assignmentName) {
    // Set the content dynamically
    document.getElementById("assignmentDetailsContent").innerHTML = `<p>${assignmentName}</p>`;
    
    // Display the form
    document.getElementById(formId).style.display = "block";
}

function closeAssignmentDetails() {
    // Hide the form
    document.getElementById('assignmentviewForm').style.display = "none";
}


// create and edit
const URL="https://gsm-fastapi.azurewebsites.net"

let isEditMode = false;

document.addEventListener("DOMContentLoaded", () => {
    let form = document.getElementById('assignment-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
        console.log('jwtToken inside create',jwtToken);
        const formData = new FormData(form);
        const data = {
            "institute_id": 1010,
            "id":formData.get("id"),
            "assignment_title": formData.get("assignment_title"),
            "class_id": formData.get("class_id"),
            "section_id": formData.get("section_id"),
            "assignment_Date": formData.get('assignment_Date'),
            "assignment_due_date": formData.get("assignment_due_date"),
            "assignment_details": formData.get("assignment_details"),
        };

        console.log("data from form:", data);
        
        console.log('updated id', data);

        const url = isEditMode ? `${URL}/Assignment/update_assignment/?assignment_id=${data.id}` : `${URL}/Assignment/create_assignment/`;
        const method = isEditMode ? 'PUT' : 'POST';
        console.log(url);

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
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                if (isEditMode) {
                    console.log("inside");
                    const updatedData = data['response'];
                    const tr = document.querySelector(`.tr-assign-${updatedData["id"]}`);
                    console.log(tr);
                    Swal.fire({
                        icon: 'success',
                        title: 'Assignment updated Successfully!',
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
                            tr.querySelector(`.${key}`).textContent = updatedData[key];
                            closeForm();
                            form.reset();
                            isEditMode = true;
                        } catch {

                        }
                    }
                } else {
                    const tableBody = document.querySelector('.tbl__bdy');

                    const response = data.response;
                    console.log("response", response);
                    Swal.fire({
                        icon: 'success',
                        title: 'Assignment added successfully!',
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
                        <tr class="tr-assign-${response.id}">
                            <td>${tableBody.children.length + 1}</td>
                            <td class="assignment_title">${response.assignment_title}</td>
                            <td class="class_id">${response.class_id}-${response.section_id}</td>
                            <td class="assignment_Date">${response.assignment_Date}</td>
                            <td class="assignment_due_date">${response.assignment_due_date}</td>
                            <td>
                            <button class="btn btn-sm btn-dark rounded-pill openBtn" onclick="openAssignmentDetails('assignmentviewForm', '${response.assignment_details}')">View </button>
                            </td>
                            <td>
                            <button type="button" class="btn  btn-sm btn-info  rounded-pill" onclick="EditButton(this)" data-id="${response.id}">
                            <i class="bi bi-pencil-square"></i>
                                <button type="button" class="btn btn-sm btn-danger" onclick="DeleteButton(this)" data-id="${response.id}">
                                <i class="bi bi-trash3"></i>
                            </button>
                            </td>
                        </tr>
                    `;

                    tableBody.innerHTML += newRow;
                  
                    closeForm();
                    form.reset();
                    isEditMode = false;
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops..',
                    position: 'center',
                    toast: true,
                    showConfirmButton: false,
                    timer: 4000,
                    padding: '1rem',
                    customClass: {
                        title: 'small-title',
                    },
                });
            });
    });

    

    console.log("Indoe JSSSSSsss");
    const classSelect = document.querySelector("#class_id");
    const sectionSelect = document.querySelector("#section_id");
    

    function fetchSectionsByClass(classId) {
        const url = `${URL}/Sections/get_sections_by_class/?class_id=` + classId;
        const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
        console.log(jwtToken)

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            // Clear previous sections
            sectionSelect.innerHTML = "";

            // Populate sections dropdown with fetched data
            for (const item of data) {
                const option = document.createElement("option");
                option.value = item["section_id"];
                option.innerText = item["section_name"];
                sectionSelect.appendChild(option);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    const url2 = `${URL}/Classes/get_classes_by_institute/?institite_id=1010`;
    const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
    console.log(jwtToken)

    fetch(url2, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`, // Include the JWT token in the Authorization header
        }
    })
    .then(response => response.json())
    .then(classes => {

        for (const item of classes) {
            const option = document.createElement("option");
            option.value = item["class_id"];
            option.innerText = item["class_name"];
            classSelect.appendChild(option);
        }

        classSelect.addEventListener("change", (event) => {
            const selectedClassId = event.target.value;
            fetchSectionsByClass(selectedClassId);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
});



function EditButton(element) {
    event.preventDefault();
    const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');

    console.log("inside edit button");

    const assignment_id = element.getAttribute('data-id');
    console.log("each id", assignment_id);
    const url = `https://gsm-fastapi.azurewebsites.net/Assignment/get_assignment_by_id/?assignment_id=${assignment_id}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
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
            openForm();

            // Assuming the response is the assignment data itself
            const assignmentData = data;


            console.log("response", assignmentData);
            document.getElementById("id").value = assignmentData.id;
            document.getElementById("assignment_Date").value=assignmentData.assignment_Date;
            document.getElementById("assignment_title").value = assignmentData.assignment_title;
            document.getElementById("class_id").value = assignmentData.class_id;
            document.getElementById("section_id").value = assignmentData.section_id;
            document.getElementById("assignment_due_date").value = assignmentData.assignment_due_date;
            document.getElementById("assignment_details").value = assignmentData.assignment_details;
            isEditMode = true;
        })
        .catch(error => {
            console.log('Fetch error:', error);
        });
}





// delete functionality

function DeleteButton(element) {
    event.preventDefault();
    const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');

    Swal.fire({
        title: 'Are you sure you want to delete this assignments?',
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
            console.log(" each id", id);
            const url = `${URL}/Assignment/delete_assignment/?assignment_id=${id}`;

            fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}` 
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
                    const DeleteRow = document.querySelector(`.tr-assign-${id}`);
                    if (DeleteRow) {
                         
                        DeleteRow.remove();
                    } else {
                        console.log('Row not found in the table');
                    }
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'Assignments Deleted Successfully',
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


