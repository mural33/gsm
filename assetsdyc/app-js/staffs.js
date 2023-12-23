
function closeForm(event, form_id) {
    event.preventDefault();
    document.getElementById(form_id).style.display = "none"; 
}

function openForm(event, form_id) {
    event.preventDefault();
    document.getElementById(form_id).style.display = "block"; 
}



const URL = "https://gsm-fastapi.azurewebsites.net"
let transports_data = {}





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

// Create & Update For staff
let isEditMode = false;




    document.addEventListener("DOMContentLoaded",()=>{

        
        fetchTransportNamesByTransportId();


        let form = document.getElementById('staff-form')        
        form.addEventListener('submit', function (event) {
    event.preventDefault();
    const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');

    console.log("inside jss")
    const formData = new FormData(document.getElementById('staff-form'));
    const staffData = {
        "institute_id": 1010,
        "staff_id": formData.get("id"), 
        "employee_id": 10101,
        "staff_name": formData.get("staff_name"),
        "photo": "url",
        "role": formData.get("role"),
        "address": formData.get("address"),
        "gender": formData.get("gender"),
        "experience": formData.get("experience"),
        "specialization": formData.get("specialization"),
        "phone_number": formData.get("phone_number"),
        "email": formData.get("email"),
        "blood_group": formData.get("blood_group"),
        "date_of_birth": formData.get("date_of_birth"),
        "joining_date": formData.get("joining_date"),
        "salary": formData.get("salary"),
        "slug": "Sai-6",
        "is_deleted": false,
        "transport_id": formData.get("transport_id"),
    } 
    console.log("formData", staffData);
    console.log("jwtToken", jwtToken)
    const url = isEditMode ? `${URL}/StaffS/update_staff/?staff_id=${staffData.staff_id}` : `${URL}/StaffS/create_staff/`;
    const method = isEditMode ? 'PUT' : 'POST';
    console.log("url", url)
    console.log("method", method)
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(staffData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    })
    .then(createdStaffData => {
        // For Student & Parent Updating Details
        if (isEditMode) {
            const updatedPayroll = {
                            "staff_id": formData.get("id"),
                            "payroll_type": formData.get("payroll_type"),
                            "salary_amount": formData.get("salary"),
                            "payment_date": "2023-12-13",
                            "payment_mode": "string",
                            "payroll_details": "string"
                        }; 
            fetch(`${URL}/StaffPayrole/update_payroll/?staff_id=${staffData.staff_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify(updatedPayroll),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(updatedPayrollResponse => {
                console.log('Updated Payroll Data:', updatedPayrollResponse);
                
                const updateData = createdStaffData["response"];
                console.log("updateData",updateData);
                
                const tr = document.querySelector(`.tr-staff-${updateData["staff_id"]}`);
                
                console.log("tr",updateData["staff_id"]);

                Swal.fire({
                    icon: 'success',
                    title: 'Staff Updated Successfully!',
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
                        document.getElementById('staff-form').reset();
                    } catch (error) {
                        
                    }
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
            else {
                console.log("staffs data Successful");
                console.log('Response from creating staff:', createdStaffData);

                const response = createdStaffData.response; 
                console.log("response",response);
                const tableBody = document.querySelector('.tbl__bdy');
                // const newRow = document.createElement('tr');
                
                
                
                newRow = `
                <tr class="tr-staff-${response.staff_id}">
                    <td>${tableBody.children.length + 1}</td>
                    <td class="staff_name">${response.staff_name}</td>
                    <td class="employee_id">${response.employee_id}</td>
                    <td class="role">${response.role}</td>
                    <td class="phone_number">${response.phone_number}</td>
                    <td class="joining_date">${response.joining_date}</td>
                    <td class="gender">${response.gender}</td>
                    <td class="blood_group">${response.blood_group}</td>
                    <td>
                        <a href="#" onclick="EditButton(this, event)" data-id="${response.staff_id}" class="btn btn-sm btn-primary">Edit</a>
                        <a href="#" onclick="DeleteButton(this, event)" data-id="${response.staff_id}" class="btn btn-sm btn-danger">Delete</a>
                    </td>
                
                </tr>
                `;
                tableBody.innerHTML += newRow;
                
                
        
                    //  Staff Payroll
                    const createdStaffId = createdStaffData.response.staff_id;
                    console.log('Created Staff ID:', createdStaffId);

                        
                        const payrollData = {
                            "staff_id": createdStaffId,
                            "payroll_type": formData.get("payroll_type"),
                            "salary_amount": formData.get("salary"),
                            "payment_date": "2023-12-13",
                            "payment_mode": "string",
                            "payroll_details": "string"
                        };
                        Swal.fire({
                    icon: 'success',
                    title: 'Staff Created Successfully!',
                    position: 'top-end',
                    toast: true,
                    showConfirmButton: false,
                    timer: 3000,
                    padding: '1rem',
                    customClass: {
                        title: 'small-title',
                    },
                });
                        console.log("Payroll data",payrollData);
                        // Make POST request to create a parent associated with the student
                        fetch(`${URL}/StaffPayrole/add_payroll/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${jwtToken}`

                            },
                            body: JSON.stringify(payrollData),
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok.');
                            }
                            return response.json();
                        })
                        .then(createdPayrollData => {
                            console.log('Created Payroll Data:', createdPayrollData);
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
                document.getElementById('staff-form').reset();
                
            
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



function EditButton(element, event) {
    event.preventDefault();
    const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
    console.log("jwtToken", jwtToken);
    console.log("inside edit button");
    
    const id = element.getAttribute('data-id');
    console.log("each id", id)

    const staffUrl = `${URL}/StaffS/get_staff_by_id/?staff_id=${id}`;

    fetch(staffUrl, {
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
            console.log('Staff Data received from API:', data);
            
            openForm(event, 'studentForm');
            
            const staffResponse = data["response"];

            console.log("staffResponse",staffResponse)
            console.log("staffResponse.id",staffResponse.staff_id)
            
            document.getElementById("id").value = staffResponse.staff_id;
            document.getElementById("staff_name").value = staffResponse.staff_name;
            document.getElementById("role").value = staffResponse.role;
            document.getElementById("address").value = staffResponse.address;
            document.getElementById("gender").value = staffResponse.gender;
            document.getElementById("experience").value = staffResponse.experience;
            document.getElementById("specialization").value = staffResponse.specialization;
            document.getElementById("phone_number").value = staffResponse.phone_number;
            document.getElementById("email").value = staffResponse.email;
            document.getElementById("blood_group").value = staffResponse.blood_group;
            document.getElementById("date_of_birth").value = staffResponse.date_of_birth;
            document.getElementById("joining_date").value = staffResponse.joining_date;
            document.getElementById("salary").value = staffResponse.salary;
            document.getElementById("transport_id").value = staffResponse.transport_id; 

            const staff_id = staffResponse.staff_id; 
            console.log("staff_id",staff_id);
            const payrollUrl = `${URL}/StaffPayrole/get_payroll_data/?staff_id=${staff_id}`;

            
            fetch(payrollUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwtToken}`
                    }
                })
                .then(payrollResponse => {
                    if (!payrollResponse.ok) {
                        throw new Error('Network response for parent was not ok.');
                    }
                    return payrollResponse.json();
                })
                .then(payrollData => {
                    console.log('Payroll Data received from API:', payrollData);
                    const payrollResponse = payrollData["response"];

                    
                    document.getElementById("salary").value = payrollResponse.salary_amount;
                    document.getElementById("payroll_type").value = payrollResponse.payroll_type;
                    
                    
                })
                .catch(payrollError => {
                    console.log('Fetch error for payroll:', payrollError);
                });

            isEditMode = true;
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







function DeleteButton(element){
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
        event.preventDefault();
        const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
   
        console.log("inside Delete button");
       
        const id = element.getAttribute('data-id');
        console.log(" each id", id)
        const url = `${URL}/StaffS/delete_staff/?staff_id=${id}`;
 
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
           
            const DeleteRow = document.querySelector(`.tr-staff-${id}`);
            if (DeleteRow) {
                DeleteRow.remove();
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Staff data deleted Successfully',
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
});
    };
