$(document).ready(function () {
 
    $("#applyFilterBtn").on("click", function () {
        applyFilter();
    });
 
    function fetchLastNetBalance() {
        const lastNetBalance = parseFloat($("#accountsTable tbody tr:last-child .net_balance").text()) || 0;
        $("#net_balance").val(lastNetBalance.toFixed(2));
    }
 
    $('#addAccountsModal').on('shown.bs.modal', function () {
        fetchLastNetBalance();
    });
 
    $("#transaction_type").on("change", function () {
        const transactionType = $(this).val();
        let netBalance = parseFloat($("#accountsTable tbody tr:last-child .net_balance").text()) || 0;
        const transactionAmount = parseFloat($("#transaction_amount").val()) || 0;
        if (transactionType === "Credit") {
            netBalance += transactionAmount;
        } else if (transactionType === "Debit") {
            netBalance -= transactionAmount;
        }
        $("#net_balance").val(netBalance.toFixed(2));
    });
 
    $("#btnSaveAccounts").on("click", async (e) => {
        $("#btnSaveAccounts").removeClass("btn-shake")
        e.preventDefault();
        var isValidForm = validateAccountsForm();
        if (isValidForm === false) {
            $("#btnSaveAccounts").addClass("btn-shake");
            return false;
        } else {
            await accountsSubmitForm();
        }
    });
});
 
let fields = [
    'transaction_date','payment_type','particular_name','description','transaction_amount','transaction_amount','transaction_type','net_balance','payment_mode',
    'transaction_id','transaction_reference',
];
 
//validate grade form
function validateAccountsForm() {
    var isValid = true;
    for (const field of fields) {
        try{
            const element = $(`#${field}`);
            const value = element.val().trim();
            if (value === "") {
                element.addClass("is-invalid");
                isValid = false;
            }
            else{
                    // Remove "is-invalid" class if the field is not empty
                    element.removeClass("is-invalid");
                }
        }
        catch{
            raiseErrorAlert(`Please fill all the fields ${field}`)
            return false;
        }
    }    
    return isValid;
}

async function accountsSubmitForm() {
    const accountsId = $("#account_id").val();  
    const accountsData = {
        "institution_id": instituteId,
        "account_id": accountsId,
        "transaction_type": $('#transaction_type').val(),
        "payment_type": $('#payment_type').val(),
        "transaction_date": $('#transaction_date').val(),
        "transaction_id": $('#transaction_id').val(),
        "description": $('#description').val(),
        "net_balance": $('#net_balance').val(),
        "transaction_amount": $('#transaction_amount').val(),
        "payment_mode": $('#payment_mode').val(),
        "particular_name": $('#particular_name').val(),
        "transaction_reference": $('#transaction_reference').val(),
    };
    const accountsEndPoint = `/Accounts/create_transaction/`;
    const accountsUrl = `${apiUrl}${accountsEndPoint}`;
    $.ajax({
            type: 'POST',
            url: accountsUrl,
            data: JSON.stringify(accountsData),
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            contentType: 'application/json',
            dataType: "json",
            beforeSend: (e) => {
                showLoader("accountsFormArea", "sm");
        },
       
        success: function (data) {
            $("#addAccountsModal").modal("hide");
            const responseData = data.response;
            const newAccountsRow = `
                <tr class="tr-accounts-${responseData.account_id}">
                    <td class="transaction_date">${responseData.transaction_date}</td>
                    <td class="payment_type">${responseData.payment_type}</td>
                    <td class="particular_name">${responseData.particular_name}</td>
                    <td class="description">${responseData.description}</td>
                    <td class="transaction_id">${responseData.transaction_id}</td>
                    <td class="">${responseData.payment_mode}<br>${responseData.transaction_reference}</td>
                    <td class="transaction_type">${responseData.transaction_type}</td>
                    <td class="net_balance">${responseData.net_balance}</td>
                </tr>`;
            $("#accounts_details").append(newAccountsRow);
            raiseSuccessAlert("Transaction Added Successfully");
        },
        error: function (error) {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: function (e) {
            removeLoader("accountsFormArea", "sm");
            resetForm(fields);
            $("#accounts_details").find(".no_data_found-tr").remove();
        }    
    });
}
function applyFilter() {
    const paymentType = $("#paymentTypeFilter").val();
    const fromDate = $("#fromDateFilter").val();
    const toDate = $("#toDateFilter").val();
 
    // Loop through table rows and show/hide based on the filter criteria
    $("#accountsTable tbody tr").each(function () {
        const row = $(this);
        const rowPaymentType = row.find(".payment_type").text();
        const rowTransactionDate = row.find(".transaction_date").text();
 
        const showRow = (paymentType === '' || rowPaymentType === paymentType) &&
            (!fromDate || new Date(rowTransactionDate) >= new Date(fromDate)) &&
            (!toDate || new Date(rowTransactionDate) <= new Date(toDate));
 
        row.toggle(showRow);
    });
}
