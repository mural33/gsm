$(document).ready(function(){
    $("#btnShow").click(function(){
        SaveStaff();
    })    
})

function SaveStaff(){
    var name = $("#txtName").val();
    alert("Hello, "+name);
}