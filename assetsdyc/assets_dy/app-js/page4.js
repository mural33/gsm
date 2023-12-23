

$(document).ready(function(){
    $("#txtName").blur(function(){
        ShowMagic();
    })    
})

function ShowMagic(){
    var name = $("#txtName").val();
    if(name == "haritha"){
        $(".girgit_div").css("background-color","yellow");
    }
    else  if(name == "lipika"){
        $(".girgit_div").css("background-color","green");
    }
}