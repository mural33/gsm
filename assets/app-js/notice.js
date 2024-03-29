$(document).ready(function () {
    $('#noticeTable').DataTable({
        'order': [],
    })
    $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`)
    $('#noticeTable').on('click', '.openBtn', function () {
        var noticeId = $(this).data('id');
        var noticeTitle = $(this).data('title');
        var noticeDescription = $(this).data('description');        
        $('#notice-view-modal .modal-title').text(noticeTitle);
        $('#notice-view-modal #notice-view-body').html(`${noticeDescription}`);
        $('#notice-view-modal').modal('show');
    });
    dataTable.on('draw', function () {
    });
    $('#btnFilterNotice').on('click',filterNotice);
});

{
    $('#noticeTable').on('click', '.dltBtn', async function() {
        var noticeId = $(this).attr("data-id");
        await deleteNotice(noticeId);
    });
}

async function deleteNotice(noticeId) {
    const noticeRow = `.tr-notice-${noticeId}`;
    const rowIndex = $(noticeRow).index();
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
                    $(noticeRow).remove();
                    $('.tbl__bdy tr').each(function(index) {
                        $(this).find('.serial-number').text(index + 1);
                    });

                    raiseSuccessAlert('Notice Deleted Successfully');
                    removeLoader("noticeTable", "sm");
                    checkNoRecords();
                },
                error: (error) => {
                    raiseErrorAlert(error.responseJSON.detail);
                },
                complete: (e) => {
                    checkNoRecords();
                }
            });
        }
    });
}

function checkNoRecords() {
    var rowCount = $('#notice_details tr').length;
    if (rowCount <= 0 ) {
        $('#notice_details').html(
            `<tr class="">
                <td colspan="8" class="text-center ">
                    <img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">
                </td>
            </tr>`
        )
    } else {
        $('.no_data_found-tr').hide();
    }
}

async function filterNotice() {
    const noticeTable = $('#noticeTable').DataTable();
    var noticeDate = $('#noticeDate').val();
    var dueDate = $('#dueDate').val();
    var recipient = $('#recipient').val();
    console.log(noticeDate, dueDate, recipient)

    DataTable.ext.search = [];

    DataTable.ext.search.push(function (settings, data, dataIndex) {
        var filterNoticeDate = new Date(noticeDate).getTime();
        var filterDueDate = new Date(dueDate).getTime();
        var filterRecipient = recipient;
        console.log(filterDueDate, filterRecipient, filterNoticeDate)

        let row = noticeTable.row(dataIndex).nodes().to$();
        let NoticeDate = new Date(row.find('.notice_date').data('notice-date')).getTime();
        let DueDate = new Date(row.find('.due_date').data('due-date')).getTime();
        let Recipient = row.find('.recipient').data('recipient');
        console.log(NoticeDate, DueDate, Recipient)

        if (
            (filterRecipient === Recipient || filterRecipient === '' || filterRecipient === undefined) &&
            (isNaN(filterDueDate) || filterDueDate === undefined) &&
            (isNaN(filterNoticeDate) || NoticeDate >= filterNoticeDate)
        ) {
            console.log("if");
            return true;
        } else if (
            (filterRecipient === Recipient || filterRecipient === '' || filterRecipient === undefined) &&
            (isNaN(filterNoticeDate) || NoticeDate >= filterNoticeDate) &&
            (isNaN(filterDueDate) || DueDate <= filterDueDate)
        ) {
            console.log("else if 1");
            return true;
        } else {
            console.log("else");
            return false;
        }
    });

    noticeTable.draw();
    $("#noticeFilter").modal("hide");
}




