let subscribers_id;
$(document).ready(function() {
    toggleStatusLabel();
    $("#btnSaveYear").on("click", async (e) => {
        console.log("hiii");
        $("#btnSaveYear").removeClass("btn-shake")
        e.preventDefault();
        if (validateYearForm() === false) {
            $("#btnSaveYear").addClass("btn-shake");
            return false;
        } else {
            await yearSubmitForm();
        }
    });
    $('.education-container').on('click', '.btnYearEdit', async function () {
        const educationYearId = $(this).data("id");
        if (educationYearId) {
            await editYear(educationYearId);
        }
    });
    $('.education-container').on('click', '.dltBtn', async function () {
        var educationId = $(this).attr("data-id");
        await deleteEducationYear(educationId);
    });
    $('#searchButton').on('click', function() {
        var pincode = $('#institute_pincode').val();
        var state = $('#institute_state');
        var city = $('#institute_city');
        var country = $('#institute_country'); 
        fetchDetailsBasedOnPincode(pincode, state, city, country);
    });
    subscribers_id = $("#subscribers_id").val();
    $("#instituteUpdateBtn").on("click", async (e) => {
        instituteUpdate();
    });
    $('#subscriptionModal').on('show.bs.modal', function () {
        fetchingPlanDetails();
    });
    fetchSubscriptionDetails();
    fetchCurrentDetails();
       
});

function toggleStatusLabel() {
    var checkbox = document.getElementById('activeInactiveCheckbox');
    var label = document.getElementById('statusLabel');

    if (checkbox) {
        checkbox.onclick = function () {
            if (checkbox.checked) {
                label.textContent = 'Active';
                label.classList.remove('bg-danger');
                label.classList.add('bg-success');
            } else {
                label.textContent = 'In-Active';
                label.classList.remove('bg-success');
                label.classList.add('bg-danger');
            }
        };
    }
}

async function deleteEducationYear(educationId) {
    const educationCard = $(`#educationCard-${educationId}`);
    console.log("edddd", educationCard);

    // confirm alert
    await Swal.fire({
        title: 'Are you sure, you want to delete this Education Year?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const endpoint = `/EducationYear/delete_education_year/?education_year_id=${educationId}`;
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
                    showLoader("body", "lg");
                },
                success: (response) => {
                    educationCard.remove();
                    console.log("edddd", educationCard);
                    raiseSuccessAlert(response.msg);
                },
                error: (error) => {
                    raiseErrorAlert(error.responseJSON.detail);
                },
                complete: (e) => {
                    removeLoader("body", "lg");
                }
            });
        }
    });
}

let fields = [
    'education_year_name', 'education_year_start_date', 'education_year_end_date'
];

function validateYearForm() {
    let isValid = true;
    for (const field of fields) {
        const element = $(`#${field}`);
        const value = element.val().trim();
        if (value === "") {
            element.focus().addClass("is-invalid");
            isValid = false;
            break;
        }
    }
    try {
        const startDate = new Date($("#education_year_start_date").val());
        const endDate = new Date($("#education_year_end_date").val());

        if (startDate > endDate) {
            raiseErrorAlert("Start Date cannot be greater than End Date");
            isValid = false;
        }
    } catch (error) {
        raiseErrorAlert("Invalid date format");
        isValid = false;
    }
    return isValid;
}

async function yearSubmitForm() {
    let isEdit = $("#education_year_id").val() !== "";
    const educationYearId = $("#education_year_id").val();
    const educationYearData = {
        "institute_id": instituteId,
        "education_year_id": educationYearId,
        "education_year_name": $("#education_year_name").val(),
        "education_year_start_date": $("#education_year_start_date").val(),
        "education_year_end_date": $("#education_year_end_date").val(),
    };
    const educationYearEndPoint = isEdit ? `/EducationYear/update_education_year/?education_year_id=${educationYearId}` : `/EducationYear/create_education_year/`;
    const educationYearUrl = `${apiUrl}${educationYearEndPoint}`;
    const method = isEdit ? "PATCH" : "POST";
    $.ajax({
        type: method,
        url: educationYearUrl,
        data: JSON.stringify(educationYearData),
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: () => {
            showLoader("yearFormArea", "sm");
        },
        success: function (data) {
            console.log(data);
            $("#addeditYearModal").modal("hide");
            console.log(educationYearId,"ID ID DI D");
            if (isEdit) {
                // Update existing year card
                const educationYearData = data.response;
                const yearCard = $(`#educationCard-${educationYearData.education_year_id}`);
                yearCard.find(".education_year_name").text(educationYearData.education_year_name);
                yearCard.find(".education_year_start_date").text(educationYearData.education_year_start_date);
                yearCard.find(".education_year_end_date").text(educationYearData.education_year_end_date);
                raiseSuccessAlert(data.msg);
                $("#education_year_id").val("");
            } else {
                // Add new year card to the container
                const responseData = data.response;
                const newYearCard = `
                <div class="col-md-3" id="educationCard-${responseData.education_year_id}">
                <div class="card card-body">
                    <div class="active-label-box position-absolute top-0 start-0 p-1 bg-success text-white"
                        id="statusLabel">
                        Active
                    </div>
                    <div class="d-flex gap-3 align-items-center">
                        <img src="/assets/img/year.gif" alt="Calendar" class="calendar-gif">
                        <div class="flex-grow-1">
                            <h5 class="card-title mb-1 education_year_name">${responseData.education_year_name}</h5>
                            <p class="text-muted mb-0 education_year_start_date">Start Date: ${responseData.education_year_start_date}</p>
                            <p class="text-muted mb-0 education_year_end_date">End Date: ${responseData.education_year_end_date}</p>
                        </div>
                        <div class="d-flex flex-column gap-2">
                            <button type="button" data-id="${responseData.education_year_id}"
                                class="btn btn-sm btn-info btnYearEdit" id="btnYearEdit">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <a href="#" data-id="${responseData.education_year_id}" class="dltBtn btn btn-sm btn-danger">
                                <i class="bi bi-trash3"></i>
                            </a>
                            <input type="checkbox" id="activeInactiveCheckbox"
                                class="form-check-input" onclick="toggleStatusLabel(this)">
                        </div>
                    </div>
                </div>
            </div>`;

                $(".education-container").append(newYearCard);
                raiseSuccessAlert(data.msg);
            }
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: (e) => {
            removeLoader("yearFormArea", "sm");
            resetForm(fields); // You need to define this function to reset form fields
        }
    });
}

async function editYear(educationYearId) {
    const fetchUrl = `${apiUrl}/EducationYear/get_education_year_by_id/?education_year_id=${educationYearId}`;
    $('#addeditYearModal').modal('show');
    $.ajax({
        type: "GET",
        url: fetchUrl,
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        beforeSend: (e) => {
            showLoader("yearFormArea", "lg");
        },
        success: function (data) {
            if (data) {
                const responseData = data.response;
                $("#education_year_id").val(responseData.education_year_id);
                $("#education_year_name").val(responseData.education_year_name);
                $("#education_year_start_date").val(responseData.education_year_start_date);
                $("#education_year_end_date").val(responseData.education_year_end_date);
            }
        },
        error: function (error) {
            raiseErrorAlert('Error fetching grade details.');
        },
        complete: (e) => {
            removeLoader("yearFormArea", "lg");
        }
    })
}


async function instituteUpdate(){
    const instituteData = {
        "institute_name": $("#institute_name").val(),
        "institute_logo": await uploadFile("institute_logo", "institute_logo"),
        "institute_address": $("#institute_address").val(),
        "institute_city": $("#institute_city").val(),
        "institute_state": $("#institute_state").val(),
        "institute_country":$("#institute_country").val(),
        "institute_pincode":$("#institute_pincode").val(),
        "institute_tag_line":$("#institute_tag_line").val(),
        "institute_website":$("#institute_website").val(),
        "point_of_contact":$("#point_of_contact").val(),
        "date_of_registration": $("#date_of_registration").val(),
        "institute_email": $("#institute_email").val(),
        "institute_phone": $("#institute_phone").val(),
    }
    instituteId = $("#institution_id").val();
    localStorage.setItem("institute_logo",instituteData.institute_logo)
    var storedInstituteLogo = localStorage.getItem('institute_logo');
    $("#organization_logo").attr("src", storedInstituteLogo);
    var method = "PATCH";
    var endPoint = `/Institute/update_institute_partial/?institute_id=${instituteId}`;
    var totalUrl = apiUrl + endPoint
    ajaxRequest(method, totalUrl, instituteData, "myAccount", "lg", (response) => {
        if(response){
            raiseSuccessAlert(response.msg);
        }
    });
}  
function fetchingPlanDetails() {
    var method = "GET";
    productId = 2;
    var endPoint = `api/Plans?product_id=${productId}`
    var totalUrl = subscriptionUrl + endPoint
    ajaxRequest(method, totalUrl, {}, "subscriptionModal", "lg", (response) => {
        var plans = response;
        if (Array.isArray(plans)) {
            var modalBody = document.querySelector('.modal-body .container .row');
            modalBody.innerHTML = ''; 
            plans.forEach(plan => {
                if (plan.plan_name !== 'Free Trial') {
                    var card = document.createElement('div');
                    card.className = 'col-lg-4';
                    card.innerHTML = `
                        <div class="card">
                            <h5 class="card-title text-center mb-3 mt-3">${plan.plan_name}</h5>
                            <table class="table mb-3">
                                <tbody>
                                    <tr>
                                        <td>Duration:</td>
                                        <td>${plan.duration_in_days} days</td>
                                    </tr>
                                    <tr>
                                        <td>Amount:</td>
                                        <td>${plan.amount}/-</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="text-center">
                                <button class="btn btn-success mb-3 mt-1" data-plan="${plan.plan_id}" data-amount="${plan.amount}" onclick="generateOrderId(this)">Select</button>
                            </div>
                        </div>
                    `;
                    modalBody.appendChild(card);
                }
            });
        } else {
            html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`);
        }
    });
}


function fetchSubscriptionDetails() {
    var method = "GET";
    var endPoint = `api/SubcrptionHistory?subscriber_id=${subscribers_id}`
    var totalUrl = subscriptionUrl + endPoint
    ajaxRequest(method, totalUrl, {}, "subscriptionDetails", "lg", (response) => {
        var tableBody = $("#subscriptionDetails");
        tableBody.empty();
        response.forEach((subscription, index) => {
            var row = $("<tr>");
            row.append("<td>" + formatDate(subscription.date_of_transations) + "</td>");
            row.append("<td>" + subscription.plan_name + "</td>");
            row.append("<td>" + formatDate(subscription.valid_till) + "</td>");
            row.append("<td>" + subscription.amount_paid + "</td>");
            row.append("<td class='text-success'>" + subscription.payment_status + "</td>");
            row.append("<td>" + subscription.payment_details + "</td>");
            var status = (index === 0) ? "Current Plan" : "Past Plan";
            var statusColor = (index === 0) ? "text-success" : "text-danger";
            row.append("<td class='" + statusColor + "'>" + status + "</td>");
            tableBody.append(row);
           
        });
        $("#subscriptionTable").DataTable({"order":[]});
    });
}
function formatDate(inputDate) {
    var date = new Date(inputDate);
    var day = date.getDate().toString().padStart(2, '0');
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var year = date.getFullYear();
    return `${day}-${month}-${year}`;
}
function fetchCurrentDetails(){
    var method = "GET";
    var endPoint = `api/AccountValidation?subscriber_id=${subscribers_id}`
    var totalUrl = subscriptionUrl + endPoint
    $.ajax({
        type: method,
        url: totalUrl,
        success: function(response) {
            if (Array.isArray(response) && response.length > 0) {
                var planName = response[0].PlanName;
                $(".current-plan-text").text(planName + " Package");
            }
        },
        error: function(error) {
            console.error("Error:", error);
        }
    });
    
}
// RazorPay Integration
var rzp1 = null; 
let amount = 0;
function upgradePlan(planId, amount) {
    const data = {
      "subscriber_id": subscribers_id,
      "plan_id": planId,
      "payment_details": "Credit Card",
      "payment_status": "Paid",
      "remarks": "Upgraded",
      "amount_paid": amount,
      "currency": "INR",
      "is_active": true
    };
    var endPoint = "api/RenewProduct"
    const url = subscriptionUrl + endPoint;
    $.ajax({
      url: url,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function (data) {
        window.location.href = "/app/success/";
      },
      error: function (error) {
        window.location.href = "/app/error/";
      }
    });
};
function generateOrderId (element) {
    amount = element.getAttribute("data-amount");
    const planId = element.getAttribute("data-plan");
    $.ajax({
        type: "GET",
        url: "/app/create_order/",
        data: { 
            "amount": amount * 100,
        },
        success: (response) => {
            const orderId = response.order_id;
            const options = {
                "key": "rzp_test_zHYLFNKQEQRRrc",
                "amount": amount * 100,
                "currency": "INR",
                "name": "Gurukul",
                "description": "Purchase",
                "image": "https://img.freepik.com/free-vector/people-using-mobile-bank-remittance-money_74855-6617.jpg?size=626&ext=jpg&ga=GA1.1.632798143.1705363200&semt=ais",
                "order_id": orderId,
                "handler": function (response){
                    upgradePlan(planId,amount)  
                    localStorage.setItem('razorpay_order_id', response.razorpay_order_id);
                    localStorage.setItem('razorpay_payment_id', response.razorpay_payment_id);
                    localStorage.setItem('amount', amount)
                },
                    "theme": {
                        "color": "#3399cc"
                    }
            };
            var rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                if (response.error) {
                    window.location.href = "/app/settings/";
                } else {
                    console.log("No error in response");
                }
            });
            if (rzp1 !== null) {
                rzp1 = null; 
            }
            rzp1 = new Razorpay(options);
            rzp1.open();
        },
        error: (error) => {
            console.log(error);
        }
    });
}
