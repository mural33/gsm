$(document).ready(function () {
    applyDefaultFilter();
    updateNetBalanceCard();
    updateSummaryCards();
    applyTransactionTypeColor();
    var dataTable = $('#accountsTable').DataTable({
        ordering: false,
    });

    $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`)

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
            await accountsSubmitForm(dataTable);
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

    async function updateNetBalanceCard() {
        const latestNetBalance = parseFloat($("#accountsTable tbody tr:first-child .net_balance").text()) || 0;
        $("#netBalanceCard").text(latestNetBalance.toFixed(2));
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
        var updatedAmount = currentAmount + newAmount;
        $(`#${cardId[paymentType]}`).text(updatedAmount.toFixed(2));
    }

    async function updateSummaryCards() {
        resetSummaryCards(); // Reset summary cards before updating
        $("#accountsTable tbody tr:visible").each(function () {
            const row = $(this);
            const rowPaymentType = row.find(".payment_type").text();
            const rowAmount = parseFloat(row.find(".transaction_amount").text()) || 0;
            if (!Number.isNaN(rowAmount)) {
                calculateUpdatedSummary(rowPaymentType, rowAmount);
            }
        });
    }

    async function resetSummaryCards() {
        var cardId = {
            'Fee Collections': 'feeCollectionsCard',
            'Salary': 'salaryCard',
            'Expenditure': 'expenditureCard',
            'Other Credits': 'otherCreditsCard',
            'Other Debits': 'otherDebitsCard',
        };
        Object.values(cardId).forEach(id => $(`#${id}`).text('0.00'));
    }

    async function applyFilter() {
        const paymentType = $("#paymentTypeFilter").val();
        const fromDate = $("#fromDateFilter").val();
        const toDate = $("#toDateFilter").val();
        resetSummaryCards();
        $("#accountsTable tbody tr").each(function () {
            const row = $(this);
            const rowPaymentType = row.find(".payment_type").text();
            const rowTransactionDate = row.find(".transaction_date").text();
            const showRow = (paymentType === '' || rowPaymentType === paymentType) &&
                (!fromDate || new Date(rowTransactionDate) >= new Date(fromDate)) &&
                (!toDate || new Date(rowTransactionDate) <= new Date(toDate));
            row.toggle(showRow);
            if (showRow) {
                const rowAmount = parseFloat(row.find(".transaction_amount").text()) || 0;
                calculateUpdatedSummary(rowPaymentType, rowAmount);
            }
        });
    }

    async function applyDefaultFilter() {
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const adjustedFirstDay = new Date(firstDayOfMonth.getTime() - firstDayOfMonth.getTimezoneOffset() * 60000);
        const adjustedLastDay = new Date(lastDayOfMonth.getTime() - lastDayOfMonth.getTimezoneOffset() * 60000);

        const formattedFirstDay = adjustedFirstDay.toISOString().split('T')[0];
        const formattedLastDay = adjustedLastDay.toISOString().split('T')[0];

        $("#fromDateFilter").val(formattedFirstDay);
        $("#toDateFilter").val(formattedLastDay);

        applyFilter();
        updateSummaryCards();
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
                const formattedTransactionAmount = parseFloat(responseData.transaction_amount).toFixed(2);
                const formattedNetBalance = parseFloat(responseData.net_balance).toFixed(2);
                const newAccountsRow = `
                <tr class="tr-accounts-${responseData.account_id}">
                    <td class="transaction_date">${responseData.transaction_date}</td>
                    <td class="payment_type">${responseData.payment_type}</td>
                    <td class="particular_name">${responseData.particular_name}</td>
                    <td class="description">${responseData.description}</td>
                    <td class="">${responseData.payment_mode}<br>${responseData.transaction_reference}</td>
                    <td class="transaction_amount">${formattedTransactionAmount}</td>
                    <td class="transaction_type">${responseData.transaction_type}</td>
                    <td class="net_balance">${formattedNetBalance}</td>
                </tr>`;
                $("#accountsTable tbody").prepend(newAccountsRow);
                dataTable.clear().rows.add($("#accountsTable tbody tr")).draw();
                calculateUpdatedSummary(accountsData["payment_type"], accountsData["transaction_amount"]);
                raiseSuccessAlert(data.msg);
            },
            error: function (error) {
                raiseErrorAlert(error.responseJSON.detail);
            },
            complete: function (e) {
                removeLoader("accountsFormArea", "sm");
                updateNetBalanceCard();
                updateSummaryCards();
                applyTransactionTypeColor();
                resetForm(fields);
                $("#accounts_details").find(".no_data_found-tr").remove();
            }
        });
    }
});