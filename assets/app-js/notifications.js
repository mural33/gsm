
$(document).ready(function() {
    $("#instituteUpdateBtn").on("click", async (e) => {
        instituteUpdate();
    }); 
});
function getNotifications(){
    
    var method = "GET";
    var totalUrl = `// https://subscription-management-api.azurewebsites.net/api/Notifications?product_id=2&subscriber_id=123`
    ajaxRequest(method, totalUrl, "", "", "", (response) => {
        console.log("response", response);
    });
}