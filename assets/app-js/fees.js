$(document).ready(async function () {
    await loadInstallments();
    await loadClass();
    $('.installment_dropdown').each(function () {
        updatePerInstallmentAmount(this);
      });
      $(document).on('change', '.installment_dropdown', function () {
        updatePerInstallmentAmount(this);
    });

    $('#fee_total, #fee_admission').on('input', await updateInstallAmount);
    $("#btnSaveInstall").click(async function (e) {
        e.preventDefault();
        await addInstallment();
    });

    $("#btnSaveFees").click(async function (e) {
        $("#btnSaveFees").removeClass("btn-shake")
        e.preventDefault();
        if (validateForm(feesFields) === false) {
          $("#btnSaveFees").addClass("btn-shake")
          return false;
        } else {
          await addFees();
          $("#addEditFeesmodal .modal-title").text("Save Grading");
        }
      });
    
      $(document).on("click", ".btnEditFee", async function (e) {
        e.preventDefault();    
        let feeId = $(this).data("fee-id")
        await editFees(feeId);
      });
      $(document).on("click", ".btnDeleteFee", async function (e) {
        e.preventDefault();    
        let feeId = $(this).data("fee-id")
        await deleteFees(feeId);
      });   
});

async function addInstallment() {
    const data = {
        installment_name: $("#installment_name").val(),
        installment_number: $("#installment_number").val(),
    };
    const url = apiUrl + "/Fees/create_installment/";
    await $.ajax({
        type: "POST",
        url: url,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        data: JSON.stringify(data),
        beforeSend: (e) => {
            showLoader("installmentFormArea", "sm");
        },
        success: async function (data) {
            $("#addInstallmentmodal").modal("hide");
            if (data) {
                await loadInstallments();
                raiseSuccessAlert("Installment Added Successfully.");
            }
        },
        error: (error) => {
            raiseErrorAlert(error["responseJSON"]["detail"]);
        },
        complete: (e) => {
            removeLoader("installmentFormArea", "sm");
        },
    });
}

async function loadInstallments() {
    const installmentUrl = apiUrl + "/Fees/get_all_installments/";
    let data;
    data = await $.ajax({
        type: "GET",
        url: installmentUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        data: JSON.stringify(data),
        success: function (responseData) {
            const dropdown = $("#installment_dropdown");
            dropdown.empty();
            dropdown.append("<option value='' hidden>Select one</option>");
            responseData.forEach(option => {
                dropdown.append(`<option value="${option.installment_id}" data-installment-number="${option.installment_number}">${option.installment_name}</option>`);
            });
        }
    });
}

async function loadClass() {
    const getClassUrl = apiUrl + "/Classes/get_classes_by_institute/?institite_id=" + instituteId;
    let data;
    data = await $.ajax({
        type: "GET",
        url: getClassUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        data: JSON.stringify(data),
        success: function (responseData) {
            const classDropdown = $("#getClassId");
            classDropdown.empty();
            classDropdown.append("<option value='' hidden>Select Class</option>");
            responseData.forEach(option => {
                classDropdown.append(`<option value="${option.class_id}">${option.class_name}</option>`);
            });
        }
    });
}
let feesFields=['fee_total','fee_admission','installment_dropdown','getClassId','installment_display','install_amount']
async function addFees() {
    let editFees = $("#fee_id").val() !== "";
    classId = $("#getClassId").val();
    const data = {
        institution_id: instituteId,
        class_id: classId,
        fee_id: $("#fee_id").val(),
        fee_total: $("#fee_total").val(),
        fee_admission: $("#fee_admission").val(),
        installment_id: $("#installment_dropdown").val(),
        total_installments: $("#install_amount").val(),
    };
    console.log(data);
    const feeUrl = editFees ? apiUrl + "/Fees/update_fees/?fee_id=" + data.fee_id : apiUrl + "/Fees/create_fees/";
    const requestsType = editFees ? "PUT" : "POST";
    await $.ajax({
        type: requestsType,
        url: feeUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        data: JSON.stringify(data),
        beforeSend: (e) => {
            showLoader("feeFormArea", "sm");
        },
        success: async function (data) {
            if (data && data.response) {
                $("#addEditFeesmodal").modal("hide");
                const responseData = data.response[0];
                console.log(responseData);
                if (editFees) {
                    var installmentHTML = "";
                    responseData.class_installments.forEach(installment => {
                        installmentHTML += `<option value="${installment.installment_id}" data-installment-id="${installment.installment_number}">${installment.installment_name}</option>`;
                    });
                    const existingRow = $("tr[id='feeId-" + responseData.fee_id + "']");
                    if (existingRow.length) {
                      existingRow.find('td:eq(0)').text(responseData.class_fees.class_name);
                      existingRow.find('td:eq(1)').text(responseData.fee_total);
                      existingRow.find('td:eq(2)').text(responseData.fee_admission);
                      existingRow.find('td:eq(3)').text(responseData.total_installments);
                      existingRow.find('td:eq(4)').html(`<select class="installment_dropdown" data-fee-id="${responseData.fee_id}">${installmentHTML}</select>`);
                      existingRow.find('td:eq(5)').text();
                    }
                    updatePerInstallmentAmount($(`#feeId-${responseData.fee_id} .installment_dropdown`));               
                    raiseSuccessAlert("Fees Updated Successfully");
                    $("#fee_id").val("");
                } else {
                    var tableBody = $("#feesdetails");
                    var noDataImage = tableBody.find('.no_data_found-tr');
                    if (noDataImage.length > 0) {
                      noDataImage.remove();
                    }
                    var installmentHTML = "";
                    responseData.class_installments.forEach(installment => {
                        installmentHTML += `<option value="${installment.installment_id}" data-installment-id="${installment.installment_number}">${installment.installment_name}</option>`;
                    });
                    
                    var newRow = `
                    <tr id="feeId-${responseData.fee_id}">
                        <td>${responseData.class_fees.class_name}</td>
                        <td>${responseData.fee_total}</td>
                        <td>${responseData.fee_admission}</td>
                        <td>${responseData.total_installments}</td>
                        <td>
                            <select class="installment_dropdown" data-fee-id="${responseData.fee_id}">
                                ${installmentHTML}
                            </select>
                        </td>
                        <td class="per-installment-amount"></td>
                        <td>
                            <a href="#" data-fee-id="${responseData.fee_id}" class="btn btn-sm btn-info btnEditFee"><i class="bi bi-pencil-square"></i></a>
                            <a href="#" data-fee-id="${responseData.fee_id}" class="btn btn-sm btn-danger btnDeleteFee"><i class="bi bi-trash3"></i></a>
                        </td>
                    </tr>`;               
                    $('#feeTable').DataTable().row.add($(newRow)).draw();  
                    updatePerInstallmentAmount($(`#feeId-${responseData.fee_id} .installment_dropdown`));               
                    raiseSuccessAlert("Fees Added Successfully.");
                }
            }
            resetForm(feesFields);
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: (e) => {
            removeLoader("feeFormArea", "sm");
        },
    });
}

async function updateInstallAmount() {
    var totalFee = parseFloat($('#fee_total').val()) || 0;
    var admissionFee = parseFloat($('#fee_admission').val()) || 0;
    var totalInstallAmount = totalFee - admissionFee;
    $('#install_amount').val(totalInstallAmount);
} 

async function editFees(feeId){
    $("#addEditFeesmodal").modal("show");
    $("#addEditFeesmodal .modal-title").text("Edit Fees");
    const editFeeUrl = apiUrl + "/Fees/get_fee_by_id/?fee_id=" + feeId;
    await $.ajax({
      type: "GET",
      url: editFeeUrl,
      mode: "cors",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`,
      },
      beforeSend: (e) => {
        showLoader("feeFormArea", "sm");
      },
      success: (data) => {
        if (data && data.response) {
          var responseData = data.response[0];
          $("#fee_id").val(responseData.fee_id);
          $("#fee_total").val(responseData.fee_total);
          $("#fee_admission").val(responseData.fee_admission);
          $("#install_amount").val(responseData.total_installments),
          $("#getClassId").val(responseData.class_id);
          $("#installment_dropdown").val([]);
          responseData.class_installments.forEach(installment => {
              $("#installment_dropdown option[value='" + installment.installment_id + "']").prop("selected", true);
          });          
        }
      },
      error: (error) => {
        raiseErrorAlert(error["responseJSON"]["detail"]);
      },
      complete: (e) => {
        removeLoader("feeFormArea", "sm");
      },
    });
}

async function deleteFees(feeId) {
    const deleteFeeUrl = apiUrl + "/Fees/delete_fees/?fee_id=" + feeId;
    
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
            const data = await $.ajax({
                type: "DELETE",
                url: deleteFeeUrl,
                mode: "cors",
                crossDomain: true,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwtToken}`,
                },
                beforeSend: (e) => {
                    showLoader("body", "sm");
                },
                success: async function (data) {
                    const dataTable = $('#feeTable').DataTable();
                    const deletedRow = dataTable.row(`#feeId-${feeId}`);
                    
                    if (deletedRow) {
                        deletedRow.remove().draw();
                        
                        if (dataTable.rows().count() === 0) {
                            $('#feesdetails').html(`
                                <tr class="no_data_found-tr">
                                    <td colspan="7" class="text-center">
                                        <img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">
                                    </td>
                                </tr>
                            `);
                        }
                        raiseSuccessAlert(data.msg);
                    } else {
                        raiseErrorAlert("Row not found in DataTable.");
                    }
                },
                error: (error) => {
                    raiseErrorAlert(error["responseJSON"]["detail"]);
                },
                complete: (e) => {
                    removeLoader("body", "sm");
                },
            });
        }
    });
}
function updatePerInstallmentAmount(element) {
    var installmentNumber = $(element).find('option:selected').data('installment-id');
    var totalInstallmentAmount = $(element).closest('tr').find('td:eq(3)').text();
    var perInstallmentAmount = totalInstallmentAmount / installmentNumber;
    $(element).closest('tr').find('.per-installment-amount').text(perInstallmentAmount);
  }