$(document).ready(function () {
    $('.openBtn').on('click', function () {
        var noticeId = $(this).data('id');
        var noticeTitle = $(this).data('title');
        var noticeDescription = $(this).data('description')
        // Update modal content based on the clicked button's data
        $('#notice-view-modal .modal-title').text(noticeTitle);
        $('#notice-view-modal #notice-view-body').html(`${noticeDescription}`);
        // Show the modal
        $('#notice-view-modal').modal('show');
    });
});

{
    $('#noticeTable').on('click', '.dltBtn', async function() {
        var noticeId = $(this).attr("data-id");
        await deleteNotice(noticeId);
    });
}

async function deleteNotice(noticeId) {
    const noticeRow = `.tr-notice-${noticeId}`;
    // confirm alert
    Swal.fire({
        title: 'Are you sure, you want to delete this Notice?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            $(noticeRow).remove();
            const endpoint = `/Notice/delete_notice/?notice_id=${noticeId}`;
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
                    showLoader("noticeTable", "sm");
                },
                success: (response) => {
                    raiseSuccessAlert('Notice Deleted Successfully');
                    removeLoader("noticeTable", "sm");
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