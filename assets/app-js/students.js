$("document").ready(function(){
    $('#studentsTable').on('click', '.btnStudentDelete', async function() {
    await Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
            title: 'swal-title',
            content: 'swal-text',
            confirmButton: 'swal-confirm-button',
            cancelButton: 'swal-cancel-button',
        },
        }).then((result) => {
        if (result.isConfirmed) {
            var studentId = $(this).attr("data-student-id");
            deleteStudent(studentId);
            Swal.fire({
            title: 'Deleted!',
            text: 'Your file has been deleted.',
            icon: 'success',
            customClass: {
                title: 'swal-title',
                content: 'swal-text',
                confirmButton: 'swal-confirm-button',
            },
            });
        }
        });
    });
})

async function deleteStudent(studentId){
    var studentRow = `tr-student-${studentId}`
    $(`.${studentRow}`).remove()
    var endpoint = `/Students/delete_student/?student_id=${studentId}`
    const url = `${apiUrl}${endpoint}`
    var response = await $.ajax({
        type: "DELETE",
        url: url,
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: (e) => {
        },
        succes:(response) => {
            console.log(response);
            raiseSuccessAlert(response.detail);
        },
        error:(error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete:(e) => {
            
        }
    })
}