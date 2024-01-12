$("document").ready(function(){
    $('#staffsTable').DataTable();
    $('#staffTable').on('click', '.dltBtn', async function() {
        var staffId = $(this).attr("data-id");
        await deleteStaff(staffId);
    });
})

async function deleteStaff(staffId) {
    const staffRow = `.tr-staff-${staffId}`;
    // confirm alert
    Swal.fire({
        title: 'Are you sure, you want to delete this Record?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            $(staffRow).remove(); 
            const endpoint = `/Staff/delete_staff/?staff_id=${staffId}`;
            const url = `${apiUrl}${endpoint}`;
            const response = await $.ajax({
                type: 'DELETE',
                url: url,
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
                contentType: 'application/json',
                dataType: 'json',
                beforeSend: (e) => {
                },
                success: (response) => {
                    raiseSuccessAlert(response.detail);
                    if($("#staffTable tr").length == 0){
                        $("#staffsTable").html(
                            `<div class="col-md-12 text-center">
                                <img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">
                            </div>`
                        )
                    }
                },
                error: (error) => {
                    raiseErrorAlert(error.responseJSON.detail);
                },
                complete: (e) => {
                    
                }
            });
        }
    });
}
