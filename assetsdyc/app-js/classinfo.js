function closeForm(formClass) {
    console.log("Closing form for class: " + formClass);
    var formSection = document.querySelector("." + formClass);
    console.log("Form section:", formSection);
    if (formSection) {
        formSection.classList.remove("form-show");
        // document.body.style.overflow = "auto"; 

    } else {
        console.log("Form section not found");
    }
}

function openForms(formClass) {
    console.log("Opening form for class: " + formClass);
    var formSection = document.querySelector("." + formClass);
    console.log("Form section:", formSection);
    if (formSection) {
        formSection.classList.add("form-show");
        // document.body.style.overflow = "hidden"; 
    } else {
        console.log("Form section not found");
    }
}

var API_ENDPOINT = "https://gsm-fastapi.azurewebsites.net/"

// ____Add/Edit Section___
let isEditMode = false;

document.addEventListener("DOMContentLoaded",()=>{
    let form = document.getElementById('AddSection')        
    form.addEventListener('submit', function (event) {
event.preventDefault();
const jwtTokens = document.querySelector('#jwt_cards').getAttribute('data-jwt-token');
console.log(jwtTokens,"fff");
const formData = new FormData(document.getElementById('AddSection'));
const data = {
    "institute_id":1, 
    "section_id" : formData.get("section_id"),
    "section_name" : formData.get("section_name"),
    "class_id": formData.get("class_id"),
    "is_deleted":false,
};

console.log("data from form:", data);


console.log("create update check id",data.section_id)
const url = isEditMode ? `${API_ENDPOINT}Sections/update_section_id/${data.section_id}` : `${API_ENDPOINT}Sections/create_section/`;
console.log(url)
const method = isEditMode ? 'PUT' : 'POST';
console.log(method)
fetch(url, {
    method: method,
   
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtTokens}`

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
            // Update the existing card dynamically
            const updateData = data["response"];
            const updatedCard = document.querySelector(`#section-${updateData.section_id}`);
            updatedCard.querySelector('.section3').textContent = updateData.section_name;

        Swal.fire({
            icon: 'success',
            title: 'Section Updated Successfully!',
            position: 'top-end',
            toast: true,
            showConfirmButton: false,
            timer: 4000,
            padding: '1rem',
            customClass: {
                title: 'small-title',
            },
        });
        closeForm('formSection');
        document.getElementById('AddSection').reset();
        isEditMode = false;
    }
    else {
        const newSectionData = data["response"];
        
        Swal.fire({
            icon: 'success',
            title: 'Section added successfully!',
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
       
       var newCard= `
       <div class="row mt-2" id="section-${newSectionData.section_id}">
       <div class="col-md-4 bg-white p-2 rounded mt-2">
         <div class="d-flex justify-content-between align-items-center mt-2">
           <div class="font-size-rem w-50 text-left section3" id="section-name-${newSectionData.section_id}">
             ${newSectionData.section_name}
           </div>
           <div class="actions d-flex gap-2">
             <a href="#" onclick="EditSection(this)" data-section-id=${newSectionData.section_id}>
                 <i class="bi bi-pencil-square text-primary"></i>
             </a>
             <a href="#" onclick="DeleteSection(this)" data-section-id=${newSectionData.section_id}>
                 <i class="bi bi-trash-fill text-danger"></i>                            
             </a>
           </div>
         </div>
       </div>
     </div>
        `;

        // Append the new card to the main-content container
        $("#TabSection").append(newCard);
        document.getElementById('AddSection').reset();
        closeForm('formSection');
        isEditMode = false;
    }
})
.catch(error => {
    console.log('Upgrade error:', error); 
    
});
});
});

// ____Get Section for Edit____

function EditSection(element){
    event.preventDefault();
    const jwtTokens = document.querySelector('#jwt_cards').getAttribute('data-jwt-token');
    console.log(jwtTokens,"fff");
    const sectionId = element.getAttribute('data-section-id');
    console.log(" each id", sectionId)
    const url = `${API_ENDPOINT}Sections/section_id/?section_id=${sectionId}`;

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
        openForms('formSection');
        response = data["response"]
        
        document.getElementById("section_id").value = response.section_id;
        document.getElementById("section_name").value = response.section_name;

        isEditMode = true;
    })
    .catch(error => {
        console.log('Fetch error:', error);
    });
}

// _____Delete Section_____

function DeleteSection(element) {
    event.preventDefault();

    const section_id = element.getAttribute('data-section-id');
    const jwtTokens = document.querySelector('#jwt_cards').getAttribute('data-jwt-token');
    console.log(jwtTokens,"fff");
    // Show confirmation dialog using SweetAlert
    Swal.fire({
        title: 'Are you sure you want to delete this Section?',
        text: "This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete'
    }).then((result) => {
        if (result.isConfirmed) {
            // User confirmed, proceed with deletion
            const url = `${API_ENDPOINT}Sections/delete_section_id/${section_id}`;

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

                    const DeleteCard = document.getElementById(`section-${section_id}`);
                    if (DeleteCard) {
                        // Remove the deleted card from the DOM
                        DeleteCard.remove();
                        // Show success message using SweetAlert
                        Swal.fire({
                            position: 'top-end',
                            icon: 'success',
                            title: 'Section Deleted Successfully',
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


// __________Add/Edit Subject_________

let isEditModes = false;

document.addEventListener("DOMContentLoaded",()=>{
    let form = document.getElementById('AddSubject')        
    form.addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(document.getElementById('AddSubject'));
    const jwt_Tokens = document.querySelector('#jwt_cards').getAttribute('data-jwt-token');
    console.log(jwt_Tokens,"fff");
    const data = {
        "institute_id":1, 
        "subject_id" : formData.get("subject_id"),
        "subject_name" : formData.get("subject_name"),
        "class_id": formData.get("class_id"),
        "is_deleted":false,
    };

    console.log("data from form:", data);
   
    
    console.log("create update check id",data.subject_id)
    const url = isEditModes ? `${API_ENDPOINT}Subjects/update_subject_id/${data.subject_id}` : `${API_ENDPOINT}Subjects/create_subject/`;
    console.log(url)
    const method = isEditModes ? 'PUT' : 'POST';
    console.log(method)
    fetch(url, {
        method: method,
       
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt_Tokens}`

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
       
        if (isEditModes) { 
                // Update the existing card dynamically
                const updateData = data["response"];
                const updatedCards = document.querySelector(`#subject-${updateData.subject_id}`);
                updatedCards.querySelector('.section3').textContent = updateData.subject_name;

            Swal.fire({
                icon: 'success',
                title: 'Subject Updated Successfully!',
                position: 'top-end',
                toast: true,
                showConfirmButton: false,
                timer: 4000,
                padding: '1rem',
                customClass: {
                    title: 'small-title',
                },
            });
            closeForm('formSubject');
            document.getElementById('AddSubject').reset();
            isEditModes = false;
        }
        else {
            const newSubjectData = data["response"];
            
            Swal.fire({
                icon: 'success',
                title: 'Subject added successfully!',
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
           
           var newDiv= `
           <div class="row mt-2" id="subject-${newSubjectData.subject_id}">
           <div class="col-md-4 bg-white p-2 rounded mt-2">
             <div class="d-flex justify-content-between align-items-center mt-2">
               <div class="font-size-rem w-50 text-left section3" id="subject-name-${newSubjectData.subject_id}">
                 ${newSubjectData.subject_name}
               </div>
               <div class="actions d-flex gap-2">
                 <a href="#" onclick="EditSubject(this)" data-subject-id=${newSubjectData.subject_id}>
                     <i class="bi bi-pencil-square text-primary"></i>
                 </a>
                 <a href="#" onclick="DeleteSubject(this)" data-subject-id=${newSubjectData.subject_id}>
                     <i class="bi bi-trash-fill text-danger"></i>                            
                 </a>
               </div>
             </div>
           </div>
         </div>
            `;
    
            // Append the new card to the main-content container
            $("#TabSubjects").append(newDiv);
            document.getElementById('AddSubject').reset();
            closeForm('formSubject');
            isEditModes = false;
        }
    })
    .catch(error => {
        console.log('Upgrade error:', error); 
        
    });
    }); 
});

// ________Get Subject for Edit________
function EditSubject(element){
    event.preventDefault();
    const jwt_Tokens = document.querySelector('#jwt_cards').getAttribute('data-jwt-token');
    console.log(jwt_Tokens,"fff");
    const subjectId = element.getAttribute('data-subject-id');
    console.log(" each id", subjectId)
    const url = `${API_ENDPOINT}Subjects/subject_id/?subject_id=${subjectId}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt_Tokens}`

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
        openForms('formSubject');
        response = data["response"]
        
        document.getElementById("subject_id").value = response.subject_id;
        document.getElementById("subject_name").value = response.subject_name;

        isEditModes = true;
    })
    .catch(error => {
        console.log('Fetch error:', error);
    });
}

//_________Delete Subject________
function DeleteSubject(element) {
    event.preventDefault();
    const jwt_Tokens = document.querySelector('#jwt_cards').getAttribute('data-jwt-token');
    console.log(jwt_Tokens,"fff");
    const subject_Id = element.getAttribute('data-subject-id');
    
    // Show confirmation dialog using SweetAlert
    Swal.fire({
        title: 'Are you sure you want to delete this Subject?',
        text: "This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete'
    }).then((result) => {
        if (result.isConfirmed) {
            // User confirmed, proceed with deletion
            const url = `${API_ENDPOINT}Subjects/delete_subject_id/${subject_Id}`;

            fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt_Tokens}`
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

                    const DeleteCard = document.getElementById(`subject-${subject_Id}`);
                    if (DeleteCard) {
                        // Remove the deleted card from the DOM
                        DeleteCard.remove();
                        // Show success message using SweetAlert
                        Swal.fire({
                            position: 'top-end',
                            icon: 'success',
                            title: 'Subject Deleted Successfully',
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


// _____Get section in Student_____
$(document).ready(function () {
    $('#sectionDropdown').on('change', function () {
        var sectionId = $(this).find(':selected').data('sections-id');
        console.log("Selected section ID:", sectionId);
         var classesId=$(this).data('class-id');
         console.log(classesId);
        const jwt_Tokens = document.querySelector('#jwt_cards').getAttribute('data-jwt-token');
        console.log(jwt_Tokens, "tokens");

        // Modify the URL construction based on whether sectionId is defined
        var url = sectionId ? `${API_ENDPOINT}Students/get_students_by_field/section_id/${sectionId}/` : `${API_ENDPOINT}Students/get_students_by_field/class_id/${classesId}/`;

        // Call the API to get student data based on the selected section or all students
        $.ajax({
            url: url,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt_Tokens}`
            },
            success: function (data) {
                // Update the table with the fetched data
                updateTable(data);
            },
            error: function (error) {
                console.log(error);
            }
        });
    });
});

// Function to update the table with the fetched data
function updateTable(data) {
    var tableBody = $('#studentTableBody');
    tableBody.empty(); // Clear existing rows

    // Iterate through the data and append rows to the table
    for (var i = 0; i < data.length; i++) {
        var stud = data[i];
        var row = '<tr>' +
            '<td>' + (i + 1) + '</td>' +
            '<td>' + stud.student_name + '</td>' +
            '<td>' + stud.roll_number + '</td>' +
            '<td>' + stud.class_id + '</td>' +
            '<td>' + stud.section_id + '</td>' +
            '<td>' + stud.gender + '</td>' +
            '<td>' + stud.blood_group + '</td>' +
            '</tr>';
        tableBody.append(row);
    }
}
