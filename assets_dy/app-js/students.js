

function closeForm(event, form_id) {
    event.preventDefault();
    document.getElementById(form_id).style.display = "none"; 
}

function openForm(event, form_id) {
    event.preventDefault();
    document.getElementById(form_id).style.display = "block"; 
}

const URL = "https://gsm-fastapi.azurewebsites.net";
let isEditMode = false;

// Function for fetching sections by class
function fetchSectionsByClass(classId,sectionId) {
const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
const sectionSelect = document.querySelector("#section_id");
const url = `${URL}/Sections/get_sections_by_class/?class_id=${classId}`

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
        if (sectionId && sectionId === item["section_id"]) {
            option.selected = true;
        }
        option.innerText = item["section_name"];
        sectionSelect.appendChild(option);
    }
})
.catch(error => {
    Swal.fire({
        icon: 'error',
        title: `${error}`,
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
}

// Function for fetching transport names by transport id

function fetchTransportNamesByTransportId() {
const url = `https://gsm-fastapi.azurewebsites.net/Transport/get_all_transports/`;
const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
const transportSelect = document.querySelector("#transport_id");
const vehicleNumberInput = document.querySelector("#vehicle_number");

console.log("transportSelect",transportSelect);
console.log("vehicleNumberInput",vehicleNumberInput);

fetch(url, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
    }
})
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
})
.then(transports => {
    transportSelect.innerHTML = '';

    if (Array.isArray(transports)) {
        const option = document.createElement("option");
        option.value = "";
        option.innerText = 'Select Transport';
        option.disabled = true;
        option.selected = true;
        transportSelect.appendChild(option);
        for (const transport of transports) {
            const option = document.createElement("option");
            option.value = transport["transport_id"];
            option.innerText = transport["transport_name"];
            transportSelect.appendChild(option);
        }
    } else {
        console.error("Expected an array of transports, but received:", transports);
    }

    // Event listener for dropdown change
    transportSelect.addEventListener('change', (event) => {
        const selectedTransportId = event.target.value;
        console.log("selectedTransportId", selectedTransportId); 
    
        
        const selectedTransport = transports.find(transport => String(transport["transport_id"]) === String(selectedTransportId));
        console.log("selectedTransport", selectedTransport); 
    
        
        if (selectedTransport) {
            vehicleNumberInput.value = selectedTransport["vehicle_number"] || '';
        } else {
            vehicleNumberInput.value = '';
        }
    });
    
})
.catch(error => {
    Swal.fire({
        icon: 'error',
        title: `${error}`,
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
}


document.addEventListener("DOMContentLoaded", () => {
console.log("Inside DOM content");

// Call the function to fetch transport names
fetchTransportNamesByTransportId();


function fetchAllClasses(){
    const classSelect = document.querySelector("#class_id");
    const sectionSelect = document.querySelector("#section_id");
    const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
    const url2 = `${URL}/Classes/get_classes_by_institute/?institite_id=1010`;

    fetch(url2, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        }
    })
    .then(response => response.json())
    .then(classes => {
        const option = document.createElement("option");
        option.value = "";
        option.innerText = 'Select Class';
        option.disabled = true;
        option.selected = true;
        classSelect.appendChild(option);
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
        Swal.fire({
            icon: 'error',
            title: `${error}`,
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
    }

    fetchAllClasses();
        
        

       





document.getElementById('student-form').addEventListener('submit', function (event) {
event.preventDefault();
const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
console.log("insde jssssssssss")

const formData = new FormData(document.getElementById('student-form'));
const studentData =  {
        "institute_id": 1010,
        "student_id" : formData.get("id"),
        "student_name": formData.get("student_name"),
        "gender": formData.get("gender"),
        "date_of_birth": formData.get("date_of_birth"),
        "blood_group": formData.get("blood_group"),
        "address": formData.get("address"),
        "phone_number": formData.get("phone_number"),
        "email": formData.get("email"),
        "admission_date": formData.get("admission_date"),
        "roll_number": '1010',
        "photo": "url",
        "slug": formData.get("student_name"),
        "class_id": formData.get("class_id"),
        "section_id": formData.get("section_id"),
        "transport_id": formData.get("transport_id"),
};

console.log("data from 1st api", studentData);

// For Checking Student Create or Update based on Student_id
const url = isEditMode ? `${URL}/Students/update_student/${studentData.student_id}` : `${URL}/Students/create_student/`;
const method = isEditMode ? 'PUT' : 'POST';

fetch(url, {
    method: method,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
    },
    body: JSON.stringify(studentData),
})
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok.');
    }
    return response.json();
})
.then(createdStudentData => {
    // For Student & Parent Updating Details
    if (isEditMode) {
        const updatedParentData = {
                    "parent_phone": formData.get("parent_phone"),
                    "parent_gender": "string",
                    "relation_with_student": formData.get("relation_with_student"),
                    "parent_profession": "string",
                    "student_id": formData.get("id"), 
                    "parent_profile": "string",
                    "parent_name": formData.get("parent_name"),
                    "parent_email": formData.get("parent_email"),
                    "parent_age": "string",
                    "parent_address": "string",
                    "photo": "string"
        };
        fetch(`${URL}/Parents/update/${studentData.student_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(updatedParentData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(updatedParentResponse => {
            console.log('Updated Parent Data:', updatedParentResponse);
            
            const updateData = createdStudentData["response"];
            const tr = document.querySelector(`.tr-student-${updateData["student_id"]}`);
            Swal.fire({
                icon: 'success',
                title: 'Student Updated Successfully!',
                position: 'top-end',
                toast: true,
                showConfirmButton: false,
                timer: 3000,
                padding: '1rem',
                customClass: {
                    title: 'small-title',
                },
            });
            for (const key in updateData) {
                try {
                    tr.querySelector(`.${key}`).textContent = updateData[key];

                    closeForm(event,'studentForm')
                    document.getElementById('student-form').reset();
                } catch (error) {
                    // Handle error if any
                }
            }
            
           


            
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: `${error}`,
                position: 'Center',
                toast: true,
                showConfirmButton: false,
                timer: 4000,
                padding: '1rem',
                customClass: {
                    title: 'small-title',
                },
            });
        });
    }
        else {
            console.log("Students data Successful");
            console.log('Response from creating student:', createdStudentData);

            const response = createdStudentData.response; 
            console.log("response",response);
            const tableBody = document.querySelector('.tbl__bdy');
            // const newRow = document.createElement('tr');

            Swal.fire({
                icon: 'success',
                title: 'Student Created Successfully!',
                position: 'top-end',
                toast: true,
                showConfirmButton: false,
                timer: 3000,
                padding: '1rem',
                customClass: {
                    title: 'small-title',
                },
            });
            newRow = `
            <tr class="tr-student-${response.student_id}">
                <td>${tableBody.children.length + 1}</td>
                <td class="student_name">${response.student_name}</td>
                <td class="roll_number">${response.roll_number}</td>
                <td class="class_id">${response.class_id}</td>
                <td class="section_id">${response.section_id}</td>
                <td class="gender">${response.gender}</td>
                <td class="blood_group">${response.blood_group}</td>
                <td>
                    <a href="#" onclick="EditButton(this, event)" data-id="${response.student_id}" class="btn btn-sm btn-primary">Edit</a>
                    <a href="#" onclick="DeleteButton(this, event)" data-id="${response.student_id}" class="btn btn-sm btn-danger">Delete</a>
                </td>
            </tr>
            `;

            
            tableBody.innerHTML += newRow;
    
                // Parentssssssss
                const createdStudentId = createdStudentData.response.student_id;
                console.log('Created Student ID:', createdStudentId);

                    // Use the created student_id in the payload for creating a parent
                    const parentData =  {
                        "parent_phone": formData.get("parent_phone"),
                        "parent_gender": "string",
                        "relation_with_student": formData.get("relation_with_student"),
                        "parent_profession": "string",
                        "student_id": createdStudentId, 
                        "parent_profile": "string",
                        "parent_name": formData.get("parent_name"),
                        "parent_email": formData.get("parent_email"),
                        "parent_age": "string",
                        "parent_address": "string",
                        "photo": "string"
                    }; 

                    console.log("Parents data",parentData);
                    // Make POST request to create a parent associated with the student
                    fetch(`${URL}/Parents/add_parent/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${jwtToken}`
                        },
                        body: JSON.stringify(parentData),
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok.');
                        }
                        return response.json();
                    })
                    .then(createdParentData => {
                        console.log('Created Parent Data:', createdParentData);
                        // Further handling of created parent data

                        
                        })
                    .catch(error => {
                        Swal.fire({
                            icon: 'error',
                            title: `${error}`,
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
                    
            
            isEditMode = false;
            closeForm(event,'studentForm')
            document.getElementById('student-form').reset();
            
        
        }

                
            
        })
    .catch(error => {
        
                    Swal.fire({
                        icon: 'error',
                        title: `${error}`,
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

});



// ###############           For Getting data into the Form             ##############
function EditButton(element,event) {
event.preventDefault();
const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
console.log("inside edit button");

const id = element.getAttribute('data-id');
console.log("each id", id)

const studentUrl = `${URL}/Students/get_student/?student_id=${id}`;

fetch(studentUrl, {
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
        console.log('Student Data received from API:', data);
        openForm(event,'studentForm')
        const studentResponse = data["response"];

        fetchSectionsByClass(studentResponse.class_id,studentResponse.section_id)
        
        document.getElementById("id").value = studentResponse.student_id;
        document.getElementById("student_name").value = studentResponse.student_name;
        document.getElementById("gender").value = studentResponse.gender;
        document.getElementById("date_of_birth").value = studentResponse.date_of_birth;
        document.getElementById("blood_group").value = studentResponse.blood_group;
        document.getElementById("admission_date").value = studentResponse.admission_date;
        document.getElementById("email").value = studentResponse.email;
        document.getElementById("phone_number").value = studentResponse.phone_number;
        document.getElementById("address").value = studentResponse.address;
        document.getElementById("class_id").value = studentResponse.class_id;
        document.getElementById("section_id").value = studentResponse.section_id;
        document.getElementById("transport_id").value = studentResponse.transport_id;
        const student_id = studentResponse.student_id; 
        console.log("student_id",student_id);
        const parentUrl = `${URL}/Parents/parent/student_id?student_id=${student_id}`;

        
        fetch(parentUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            })
            .then(parentResponse => {
                if (!parentResponse.ok) {
                    throw new Error('Network response for parent was not ok.');
                }
                return parentResponse.json();
            })
            .then(parentData => {
                console.log('Parent Data received from API:', parentData);
                const parentResponse = parentData["response"];

                
                document.getElementById("parent_name").value = parentResponse.parent_name;
                document.getElementById("relation_with_student").value = parentResponse.relation_with_student;
                document.getElementById("parent_email").value = parentResponse.parent_email;
                document.getElementById("parent_phone").value = parentResponse.parent_phone;
                
            })
            .catch(parentError => {
                console.log('Fetch error for parent:', parentError);
            });

        isEditMode = true;
    })
    .catch(error => {
        console.log('Fetch error for student:', error);
    });
}

// #################   For Deleting Student Data   #####################

function DeleteButton(element){
event.preventDefault();
const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
    Swal.fire({
    title: 'Are you sure?',
    text: 'You are about to delete this student data.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
}).then((result) => {
    if (result.isConfirmed) {

    

    console.log("inside Delete button");
   
    const id = element.getAttribute('data-id');
    console.log(" each id", id)
    const url = `${URL}/Students/delete_student/?student_id=${id}`;

    
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
       
        const DeleteRow = document.querySelector(`.tr-student-${id}`);
        if (DeleteRow) {
            DeleteRow.remove();
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Student data deleted Successfully',
            });
        } else {
            console.log('Row not found in the table');
        }
   
        
    })
    .catch(error => {
        console.log('Fetch error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong while deleting.',
        });
    });
}
})
};


