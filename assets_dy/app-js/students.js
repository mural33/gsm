$("document").ready(function(){
    $('#studentsTable').on('click', '.btnStudentDelete', async function() {
    await Swal.fire({
        title: 'Are you sure, you want to delete this Record?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
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
            raiseSuccessAlert(response.detail);
        },
        error:(error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete:(e) => {
            if($("#studentsTable tr").length == 0){
                $("#studentsTable").html(
                    `<tr class="">
                        <td colspan="8" class="text-center">
                        <img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">
                        </td>
                    </tr>`
                )
            }
        }
    })
}