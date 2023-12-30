$("document").ready(function(){
    $('#staffTable').on('click', '.dltBtn', async function() {
        var staffId = $(this).attr("data-id");
        await deleteStaff(staffId);
    });
})

async function deleteStaff(staffId) {
    const staffRow = `.tr-staff-${staffId}`;
    // confirm alert
    Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
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
