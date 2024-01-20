$(document).ready(function () {
    var dataTable = $('#accountsTable').DataTable({ order: [] });
    $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`)
    updateSummaryCards();
    applyTransactionTypeColor();
    $("#exportButton").on("click", function () {
        exportTableToExcel('accountsTable', 'accounts_data');
    });

    $("#applyFilterBtn").on("click", function () {
        applyFilter();
    });

    $('#addAccountsModal').on('shown.bs.modal', function () {
        fetchLastNetBalance();
    });

    $("#transaction_type").on("change", function () {
        const transactionType = $(this).val();
        let netBalance = parseFloat($("#accountsTable tbody tr:first-child .net_balance").text()) || 0;
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

let fields = [
    'transaction_date', 'payment_type', 'particular_name', 'description', 'transaction_amount', 'transaction_amount', 'transaction_type', 'net_balance', 'payment_mode',
    'transaction_reference',
];

//validate form
async function validateAccountsForm() {
    var isValid = true;
    for (const field of fields) {
        try {
            const element = $(`#${field}`);
            const value = element.val().trim();
            if (value === "") {
                element.addClass("is-invalid");
                isValid = false;
            }
            else {
                element.removeClass("is-invalid");
            }
        }
        catch {
            raiseErrorAlert(`Please fill all the fields ${field}`)
            return false;
        }
    }
    return isValid;
}

async function fetchLastNetBalance() {
    const lastNetBalance = parseFloat($("#accountsTable tbody tr:first-child .net_balance").text()) || 0;
    $("#net_balance").val(lastNetBalance.toFixed(2));
}

async function updateSummaryCards() {
    const latestNetBalance = parseFloat($("#accountsTable tbody tr:first-child .net_balance").text()) || 0;
    $("#netBalanceCard").text(latestNetBalance.toFixed(1));
}

async function calculateUpdatedSummary(paymentType, newAmount) {
    var cardId = {
        'Fee Collections': 'feeCollectionsCard',
        'Salary': 'salaryCard',
        'Expenditure': 'expenditureCard',
        'Other Credits': 'otherCreditsCard',
        'Other Debits': 'otherDebitsCard',
    };
    var currentAmount = parseFloat($(`#${cardId[paymentType]}`).text()) || 0;
    var newAmount = parseFloat(newAmount)
    if (!Number.isNaN(currentAmount) && !Number.isNaN(newAmount)) {
        $(`#${cardId[paymentType]}`).text((currentAmount + newAmount).toFixed(2));
    } else {
    }
}

async function applyTransactionTypeColor() {
    $("#accountsTable tbody tr").each(function () {
        var transactionTypeCell = $(this).find(".transaction_type");
        var transactionType = transactionTypeCell.text().trim();
        if (transactionType === "Credit") {
            transactionTypeCell.css("color", "#53bb53");
        } else if (transactionType === "Debit") {
            transactionTypeCell.css("color", "red");
        }
    });
}

async function exportTableToExcel(tableId, filename) {
    const table = document.getElementById(tableId);
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, filename + '.xlsx');
}

async function accountsSubmitForm() {
    const accountsId = $("#account_id").val();
    const accountsData = {
        "institution_id": instituteId,
        "account_id": accountsId,
        "transaction_type": $('#transaction_type').val(),
        "payment_type": $('#payment_type').val(),
        "transaction_date": $('#transaction_date').val(),
        "description": $('#description').val(),
        "net_balance": $('#net_balance').val(),
        "transaction_amount": $('#transaction_amount').val(),
        "payment_mode": $('#payment_mode').val(),
        "particular_name": $('#particular_name').val(),
        "transaction_reference": $('#transaction_reference').val(),
    };
    const accountsEndPoint = `/Accounts/create_transaction/`;
    const accountsUrl = `${apiUrl}${accountsEndPoint}`;
    await $.ajax({
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
                    <td class="">${responseData.payment_mode}<br>${responseData.transaction_reference}</td>
                    <td class="transaction_amount">${responseData.transaction_amount}</td>
                    <td class="transaction_type">${responseData.transaction_type}</td>
                    <td class="net_balance">${responseData.net_balance}</td>
                </tr>`;
            $(newAccountsRow).prependTo("#accountsTable tbody");
            dataTable.row.add($(newAccountsRow)).draw();
            calculateUpdatedSummary(accountsData["payment_type"], accountsData["transaction_amount"])
            raiseSuccessAlert(data.msg);
        },
        error: function (error) {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: function (e) {
            removeLoader("accountsFormArea", "sm");
            updateSummaryCards();
            applyTransactionTypeColor();
            resetForm(fields);
            $("#accounts_details").find(".no_data_found-tr").remove();
        }
    });
}

async function applyFilter() {
    const paymentType = $("#paymentTypeFilter").val();
    const fromDate = $("#fromDateFilter").val();
    const toDate = $("#toDateFilter").val();
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

});