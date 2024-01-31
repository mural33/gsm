let subscribers_id;
$(document).ready(function() {
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
            row.append("<td><span class='badge bg-success'>" + subscription.payment_status + "</span></td>");
            row.append("<td>" + subscription.payment_details + "</td>");
            var status = (index === 0) ? "Current Plan" : "Past Plan";
            var statusColor = (index === 0) ? "badge bg-success" : "badge bg-danger";
            row.append("<td><span class='" + statusColor + "'>" + status + "</span></td>");
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
