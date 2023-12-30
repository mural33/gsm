$(document).ready(function(){

    $("#btnCreateStudent").click(function(){
        CreateStudent();
    });

    $("#btnGetStudent").click(function(){
        GetStudents();
    });

    $("#btnUpdateStudent").click(function(){
        UpdateStudent();
    });

    $("#btnDeleteStudent").click(function(){
        DeleteStudent();
    });

    $("#btnCommon").click(function(){
        SweetAlert("Student","Student Success Message");
    });
})

function CreateStudent(){
    alert("Created Student Called ! "+API_ENDPOINT);
}

function GetStudents(){
    alert("Get Student Called ! "+API_ENDPOINT);
}

function UpdateStudent(){
    alert("Update Student Called ! "+API_ENDPOINT);
}

function DeleteStudent(){
    alert("Delete Student Called ! "+API_ENDPOINT);
}