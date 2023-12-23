function closeNav() {
    console.log("done");
    document.querySelector(".form_section").classList.remove("form-show");
    // document.body.style.overflow = "auto"; 
}

// Function to open the form section
function openForm() {
    document.querySelector(".form_section").classList.add("form-show");
    // document.body.style.overflow = "hidden"; 

}


// ____Add/Edit Class____
var API_ENDPOINT = "https://gsm-fastapi.azurewebsites.net/";

let isEditMode = false;

document.addEventListener("DOMContentLoaded", () => {
    let form = document.getElementById('AddClass');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const jwtToken = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
        console.log(jwtToken, "fff");

        const formData = new FormData(document.getElementById('AddClass'));
        const data = {
            "institute_id": 1010,
            "class_id": formData.get("class_id"),
            "class_name": formData.get("class_name"),
            "is_deleted": false,
        };

        console.log("data from form:", data);

        console.log("jwtToken", jwtToken)
        console.log("create update check id", data.class_id)
        const url = isEditMode ? `${API_ENDPOINT}Classes/${data.class_id}` : `${API_ENDPOINT}Classes/create_class/`;
        console.log(url)
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
                    const updateData = data["response"];
                    const updatedCard = document.querySelector(`#class-id-${updateData.class_id}`);
                    // Update the class name in the existing card
                    updatedCard.querySelector('.card-text a').textContent = updateData.class_name;
                    Swal.fire({
                        icon: 'success',
                        title: 'Class Updated Successfully!',
                        position: 'top-end',
                        toast: true,
                        showConfirmButton: false,
                        timer: 4000,
                        padding: '1rem',
                        customClass: {
                            title: 'small-title',
                        },
                    });
                    closeNav();
                    document.getElementById('AddClass').reset();
                    isEditMode = false;
                } else {
                    const newClassData = data["response"];
                    console.log(newClassData);
                    Swal.fire({
                        icon: 'success',
                        title: 'Class added successfully!',
                        position: 'top-end',
                        toast: true,
                        showConfirmButton: false,
                        timer: 4000,
                        padding: '1rem',
                        customClass: {
                            title: 'small-title',
                        },
                    });
                    // Create a new card with the class details
                    var newCard = document.createElement('div');
                    newCard.classList.add('card', 'bg-gradient-danger', 'card-img-holder', 'text-white');
                    newCard.id = `class-id-${newClassData.class_id}`;
                    newCard.innerHTML = `
                        <div class="card-body">
                            <div class="lframe-child1"></div>
                            <div class="lframe-item1"></div>
                            <p class="card-text"><a href="#">${newClassData.class_name}</a></p>
                            <img src="/assets/img/open-book.png" class="card-img-top" alt="...">
                            <div class="action-btn d-flex gap-3">
                                <a onclick="EditClass(this)" data-class-id="${newClassData.class_id}"><i class="bi bi-pencil-square text-primary"></i></a>
                                <a onclick="DeleteClass(this)" data-class-id="${newClassData.class_id}"><i class="bi bi-trash-fill text-danger"></i></a>              
                            </div> 
                        </div>
                    `;

                    $("#TabClass").append(newCard);

                    closeNav();
                    document.getElementById('AddClass').reset();
                    isEditMode = false;

                    // After adding a new class, create a default section
                    const sectionData = {
                        "class_id": newClassData.class_id,
                        "section_name": "Section A",
                        // Add other necessary properties for the section
                    };

                    fetch(`${API_ENDPOINT}Sections/create_section/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${jwtToken}`
                        },
                        body: JSON.stringify(sectionData),
                    })
                        .then(response => response.json())
                        .then(sectionResponse => {
                            console.log('Default section created:', sectionResponse);
                        })
                        .catch(sectionError => {
                            console.error('Error creating default section:', sectionError);
                        });
                }
            })
            .catch(error => {
                console.log('Upgrade error:', error);

            });
    });
});


// _____Get Class for Edit____
function EditClass(element){
    event.preventDefault();
    const jwtTokens = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
    console.log(jwtTokens,"fff");
    const classId = element.getAttribute('data-class-id');
    console.log(" each id", classId)
    const url = `${API_ENDPOINT}Classes/class_id/?class_id=${classId}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtTokens}`
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
        response = data["response"]
        
        document.getElementById("class_id").value = response.class_id;
        document.getElementById("class_name").value = response.class_name;

        isEditMode = true;
    })
    .catch(error => {
        console.log('Fetch error:', error);
    });
}

// _____Delete Class_____
function DeleteClass(element) {
    event.preventDefault();
    const jwtTokens = document.querySelector('#jwt_card').getAttribute('data-jwt-tokens');
    console.log(jwtTokens,"fff");
    const class_Id = element.getAttribute('data-class-id');
    
    // Show confirmation dialog using SweetAlert
    Swal.fire({
        title: 'Are you sure you want to delete this Class?',
        text: "This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete'
    }).then((result) => {
        if (result.isConfirmed) {
            // User confirmed, proceed with deletion
            const url = `${API_ENDPOINT}Classes/${class_Id}`;

            fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtTokens}`
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

                    const DeleteCard = document.querySelector(`#class-id-${class_Id}`);
                    if (DeleteCard) {
                        // Remove the deleted card from the DOM
                        DeleteCard.remove();

                        // Show success message using SweetAlert
                        Swal.fire({
                            position: 'top-end',
                            icon: 'success',
                            title: 'Class Deleted Successfully',
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
                        
                    } else {
                        console.log('Card not found!');
                    }

                })
                .catch(error => {
                    console.log('Fetch error:', error);
                });
        }
    });
}