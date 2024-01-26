window.onload = function() {
    setTimeout(function() {
        html2canvas(document.body, { useCORS: true }).then(function(canvas) {
            var dataURL = canvas.toDataURL('image/png');
            var downloadLink = document.createElement('a');
            downloadLink.href = dataURL;
            downloadLink.download = 'Virtual_ID_Card.png';
            downloadLink.click();
        });
    },1000);
};
