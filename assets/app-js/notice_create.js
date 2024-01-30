let editorInstance;
$(document).ready(() => {
    // Create CKEditor instance when the page loads
    ClassicEditor
        .create(document.querySelector('#editor'))
        .then(editor => {
            editorInstance = editor;
        })
        .catch(error => {
        });
    $("#btnSaveNotice").on("click", async (e) => {
        $("#btnSaveNotice").removeClass("btn-shake")
        e.preventDefault();
        if (validateNoticeForm() === false) {
            $("#btnSaveNotice").addClass("btn-shake");
            return false;
        } else {
            await noticeSubmitForm();
        }
    });
});

let fields = [
    'notice_title', 'notice_date', 'due_date', 'notice_description', 'recipient', 'notice_announced_by'
];
// Notice validation
function validateNoticeForm() {
    var isValid = true;
    for (const field of fields) {
        const element = $(`#${field}`);
        if (element.length === 0) {
            continue;
        }
        try{
            const value = element.val();
            if (value === '') {
                element.focus().addClass('is-invalid');
                isValid = false;
            }
        }
        catch(e){
        }
    }
    var content = $(".ck-content").html();
    if (content === '') {
        isValid = false;
    }
    return isValid;
}

// formSubmit
async function noticeSubmitForm() {
    const noticeData = {
        "institute_id": instituteId,
        "notice_title": $("#notice_title").val(),
        "notice_date": $("#notice_date").val(),
        "due_date": $("#due_date").val(),
        "notice_description": editorInstance.getData(),
        "recipient": $("#recipient").val(),
        "notice_announced_by": $("#notice_announced_by").val(),
        "is_deleted": false,
    }; 
    var isEdit = $("#is_edit").val();
    var method = isEdit === "1" ? "PUT" : "POST";
    var noticeId = $("#notice_id").val();  
    var noticeEndPoint = isEdit === "1" ? `/Notice/update_notice    /?notice_id=${noticeId}` : `/Notice/create_notice/`;
    var noticeUrl = `${apiUrl}${noticeEndPoint}`;

    $.ajax({
        type: method,
        url: noticeUrl,
        data: JSON.stringify(noticeData),
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: (e) => {
            showLoader("noticeFormArea", "sm");
        },
        success: (response) => {
            raiseSuccessAlert("Notice Announced Successfully");
            resetForm(fields);
            editorInstance.setData('');
            removeLoader("noticeFormArea", "sm");
            if (isEdit === "1") {
                raiseSuccessAlert("Notice Updated Successfully");
                resetForm(fields);
                editorInstance.setData('');
                
                window.location.href = `/app/notice/`;
            } else {
                
            }
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
            removeLoader("noticeFormArea", "sm");
        },
    });
}

