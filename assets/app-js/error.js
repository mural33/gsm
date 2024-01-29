$(document).ready(function () {
    const backToAccountBtn = $('#backToAccountBtn');
    const loader = $('#loader');

    backToAccountBtn.on('click', function () {
        loader.css('display', 'block');
    });

    $(window).on('beforeunload', function () {
        loader.css('display', 'block');
    });
});
