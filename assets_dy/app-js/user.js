// ____Add/Edit User____

// var API_ENDPOINT = "https://gsm-fastapi.azurewebsites.net/"

let isEditMode = false;
document.addEventListener("DOMContentLoaded", () => {

    let form = document.getElementById('user-form')
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        console.log("inside");
        const formData = new FormData(document.getElementById('user-form'));
        const data = {
            "institute_id": 1010,
            "user_id": formData.get("id"),
            "user_name": formData.get("user_name"),
            "user_role": formData.get("user_role"),
            "user_photo_url": "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png",
            "user_email": formData.get("user_email"),
            "user_password": formData.get("user_password"),
            "user_phone_number": formData.get("user_phone_number"),
            "is_deleted": false,
        };

        console.log("data from form:", data);
        const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
        console.log("jwtToken", jwtToken)
        console.log("create update check id", data.user_id)
        console.log('updated id', data);
        const url = isEditMode ? `https://gsm-fastapi.azurewebsites.net/Users/update_user/?user_id=${data.user_id}` : `https://gsm-fastapi.azurewebsites.net/Users/create_user/`;
        console.log(url);
        const method = isEditMode ? 'PUT' : 'POST';
        console.log(method)
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
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(data => {
                if (isEditMode) {
                    console.log("inside");
                    const updatedData = data['response'];
                    console.log("updatedData", updatedData);
                    const tr = document.querySelector(`.tr-user-${updatedData.user_id}`);

                    console.log(tr);
                    for (const key in updatedData) {
                        try {
                            tr.querySelector(`.${key}`).textContent = updatedData[key];
                            closeForm(event, 'userForm')
                            document.getElementById('user-form').reset();
                            isEditMode = false;
                        } catch {

                        }
                    }
                    Swal.fire({
                        icon: 'success',
                        title: 'User updated Successfully!',
                        position: 'top-end',
                        toast: true,
                        showConfirmButton: false,
                        timer: 3000,
                        padding: '1rem',
                        customClass: {
                            title: 'small-title',
                        },
                    });
                } else {
                    const tableBody = document.querySelector('.tbl__bdy');

                    const response = data.response;
                    console.log("response", response);

                    const newRow = `
                    
                    <td class="user_name">${response.user_name}</td>
                    <td class="user_email">${response.user_email}</td>
                    <td class="user_phone_number">${response.user_phone_number}</td>
                    <td class="user_role">${response.user_role}</td>
                    <td>
                <button type="button" class="btn btn-sm btn-info" onclick="EditButton(this,event)" data-id="${response.user_id}">
                    <i class="bi bi-pencil-square"></i>
                <button type="button" class="btn  btn-sm btn-danger" onclick="DeleteButton(this)" data-id="${response.user_id}">
                    <i class="bi bi-trash3"></i>
            </td>
                  </tr>   
                    `;

                    tableBody.innerHTML += newRow;
                    Swal.fire({
                        icon: 'success',
                        title: 'User added successfully!',
                        position: 'top-end',
                        toast: true,
                        showConfirmButton: false,
                        timer: 3000,
                        padding: '1rem',
                        customClass: {
                            title: 'small-title',
                        },
                    });
                    closeForm(event, 'userForm')
                    document.getElementById('user-form').reset();
                    isEditMode = false;
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    });
});

// Delete operation

function DeleteButton(element) {
    event.preventDefault();
    const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
    console.log(jwtToken, "fff");
    Swal.fire({
        title: 'Are you sure, you want to delete this Record?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            const id = element.getAttribute('data-id');
            console.log(" each id", id)
            const url = `https://gsm-fastapi.azurewebsites.net/Users/delete_user/?user_id=${id}`;


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

                    const DeleteRow = document.querySelector(`.tr-user-${id}`);
                    if (DeleteRow) {
                        DeleteRow.remove();
                    } else {
                        console.log('Row not found in the table');
                    }
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'User Deleted Successfully',
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


                })
                .catch(error => {
                    console.log('Fetch error:', error);
                });
        }
    });
}
// Edit operation

function EditButton(element, event) {
    document.getElementById("id").value = "";
    document.getElementById("user_name").value = "";
    document.getElementById("user_email").value = "";
    document.getElementById("user_phone").value = "";
    document.getElementById("user_role").value = "Admin";

    const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
    const id = element.getAttribute('data-id');
    const url = `https://gsm-fastapi.azurewebsites.net/Users/get_user_by_id/?user_id=${id}`;

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
            response = data;
            document.getElementById("id").value = response.user_id;
            document.getElementById("user_name").value = response.user_name;
            document.getElementById("user_email").value = response.user_email;
            document.getElementById("user_phone").value = response.user_phone_number;
            document.getElementById("user_role").value = response.user_role;
            isEditMode = true;

        })
        .catch(error => {
            console.log('Fetch error:', error);
        });
}
