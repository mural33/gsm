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
        if (validateAccountsForm() === false) {
            $("#btnSaveAccounts").addClass("btn-shake");
            return false;
        } else {
        await accountsSubmitForm();
        }
    });
});

let fields = [
    'transaction_type', 'payment_type', 'transaction_date', 'transaction_id', 'description', 'net_balance', 'transaction_amount', 'payment_mode', 'particular_name', 'transaction_reference',
];

//validate grade form
async function validateAccountsForm() {
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