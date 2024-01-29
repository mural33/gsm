$(document).ready(function () {
    console.log("inside js");
    const backToAccountBtn = $('#backToAccountBtn');
    const loader = $('#loader');

    backToAccountBtn.on('click', function () {
        loader.css('display', 'block');
    });

    $(window).on('beforeunload', function () {
        loader.css('display', 'block');
    });

    const orderId = localStorage.getItem('razorpay_order_id');
    const paymentId = localStorage.getItem('razorpay_payment_id');
    const amount = localStorage.getItem('amount');
    if (orderId && paymentId) {
        $('#orderID').text(orderId);
        $('#paymentID').text(paymentId);
        $('#amount').text(amount);
        localStorage.removeItem('razorpay_order_id');
        localStorage.removeItem('razorpay_payment_id');
        localStorage.removeItem('amount');
        RenewProductEmail();
    }
});
function RenewProductEmail(){
    $.ajax({
        url: '/app/renewProduct/',
        type: 'GET',
        success: function (data) {
            console.log(' successfully');
        },
        error: function (error) {
            console.error('Error senting email', error);
        }
    });
}
