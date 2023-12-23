   
    function closeStudentForm(event) {
        // e.preventDefault();
        studentForm.style.display = "none";
    }
 
    function showStudentForm(event) {
        // e.preventDefault();
        studentForm.style.display = "block";
    }
    let isEditMode = false;

    document.getElementById('notice-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
        console.log("jwtToken", jwtToken);
        const formData = new FormData(document.getElementById('notice-form'));
    
        const data = {
            "institute_id": 1010,
            'id': formData.get('id'),
            "notice_title": formData.get("notice_title"),
            "notice_date": formData.get("notice_date"),
            "due_date": formData.get("due_date"),
            "notice_description": formData.get('notice_description'),
            "recipient": formData.get("recipient"),
            "notice_announced_by": formData.get("notice_announced_by"),
            "is_deleted": false,
        };
    
        const url = isEditMode ? `https://gsm-fastapi.azurewebsites.net/Notice/update_notice/?notice_id=${data.id}` : `https://gsm-fastapi.azurewebsites.net/Notice/create_notice/`;
        const method = isEditMode ? 'PUT' : 'POST';
    
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
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
                    const updatedData = data['response'];
                    const tr = document.querySelector(`.tr-notice-${updatedData["notice_id"]}`);
                    for (const key in updatedData) {
                        try {
                            tr.querySelector(`.${key}`).textContent = updatedData[key];
                            closeStudentForm();
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
    
                    const newRow = `
                        <tr class="tr-notice-${response.notice_id}">
                            <td>${tableBody.children.length + 1}</td>
                            <td class="notice_title">${response.notice_title}</td>
                            <td class="notice_date">${response.notice_date}</td>
                            <td class="due_date">${response.due_date}</td>
                            <td>    
                                <button class="btn  btn-sm rounded-pill btn-dark  openBtn">View</button>
                            </td>
                            <td class="recipient">${response.recipient}</td>
                            <td class="notice_announced_by">${response.notice_announced_by}</td>
                           
                            <td>
                                <button type="button" class="btn btn-sm btn-info" onclick="EditButton(this)" data-id="${response.notice_id}">edit</button>
                                <button type="button" class="btn  btn-sm btn-danger" onclick="DeleteButton(this)" data-id="${response.notice_id}">Delete</button>
                            </td>
                        </tr>
                    `;
    
                    tableBody.innerHTML += newRow;
                    closeStudentForm();
                    form.reset();
                    isEditMode = false;
    
                    // Display a success alert using SweetAlert
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Your operation was successful!',
                    });
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
    
                // Display an error alert using SweetAlert
                
            });
    });
    




function EditButton(element) {
    event.preventDefault();
    const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
    console.log(jwtToken)

    console.log("inside edit button");

    const id = element.getAttribute('data-id');
    console.log(" each id", id)
    const url = `https://gsm-fastapi.azurewebsites.net/Notice/get_notice_by_id/?notice_id=${id}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
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
            showStudentForm()
            response = data

            document.getElementById("id").value = response.notice_id;
            document.getElementById("notice_date").value = response.notice_date;
            document.getElementById("notice_title").value = response.notice_title;
            document.getElementById("recipient").value = response.recipient;
            document.getElementById("due_date").value = response.due_date;
            document.getElementById("notice_description").value = response.notice_description;
            document.getElementById("notice_announced_by").value = response.notice_announced_by;
            isEditMode = true;
 
        })
        .catch(error => {
            console.log('Fetch error:', error);
        });
}
	