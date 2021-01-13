/*======================================================================================
Global variables and constants
========================================================================================*/

var tblCustomers = null;
var selectedRow = null;

/*======================================================================================
Document.ready() and window.load()
=========================================================================================*/

//Equivalent to $(document).ready
$(function () {
    initializeDataTable(loadAllCustomers);
});

/*=========================================================================================
Event Handlers
==========================================================================================*/

$("#btn-save").click(saveOrUpdateCustomer);
$("#btn-clear").click(deSelectAllCustomers);
$("#tbl-customers tbody").on("click", "tr", selectCustomer);
$("#tbl-customers tbody").on("click", "tr .bin", deleteCustomer);
$("#txt-id,#txt-name,#txt-address").keypress(validationListener);


/*==========================================================================================
Methods
==========================================================================================*/

function initializeDataTable(callbackFn) {
    if (tblCustomers != null) {
        tblCustomers.destroy();
    }
    if (callbackFn != undefined) {
        callbackFn();
        if ($("#tbl-customers tbody tr").length > 0) {
            $("#tbl-customers tfoot").addClass("d-none");
        } else {
            $("#tbl-customers tfoot").removeClass("d-none");
        }
    }

    tblCustomers = $("#tbl-customers").DataTable({
        "pageLength": 5,
        "info": false,
        "responsive": true,
        "autoWidth": false,
        /*"searching":true,*/
        "lengthChange": false,
    });
    //To remove built in empty message in data table
    $("#tbl-customers tr .dataTables_empty").remove();

}

function loadAllCustomers() {
    $.ajax({
        method: 'GET',
        url: 'http://localhost:8080/myapp/api/v1/customers'
        /*url: 'http://localhost:8080/myapp/customers'*/
    }).done(function (customers) { //JSON array
        for (var i = 0; i < customers.length; i++) {
            var id = customers[i].id;
            var name = customers[i].name;
            var address = customers[i].address;

            var rowHtml = "<tr>\n" +
                "<td>" + id + "</td>\n" +
                "<td>" + name + "</td>\n" +
                "<td>" + address + "</td>\n" +
                "<td class='bin'><i class=\"fas fa-trash\"></i></td>\n" +
                "</tr>";

            initializeDataTable(function () {
                $("#tbl-customers tbody").append(rowHtml); //Functional programming - Higher order function ==> when a function can be given as an argument
                $("#btn-clear").click();
            });
        }
    }).fail(function () {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Failed to get all customers'
        })
    })
}

function saveOrUpdateCustomer() {
    var id = $("#txt-id").val();
    var name = $("#txt-name").val();
    var address = $("#txt-address").val();

    var validated = true;
    var selectors = [];

    if (address.trim().length < 3) {
        $("#txt-address").select();
        $("#txt-address").addClass("is-invalid");
        validated = false;
    }
    if (!/[A-Za-z ]{3,}/.test(name)) {
        $("#txt-name").select();
        $("#txt-name").addClass("is-invalid");
        validated = false;
    }
    if (!/^C\d{3}$/.test(id)) {
        $("#txt-id").select();
        $("#txt-id").addClass("is-invalid");
        validated = false;
    }

    if (!validated) {
        $("form .is-invalid").tooltip('show');
        return;
    }

    if ($("#btn-save").text() === "Update") {
        $.ajax({
            method: 'PUT',
            url: 'http://localhost:8080/myapp/api/v1/customers/' +selectedRow.find("td:first-child").text(),
            data: $("form").serialize()
        }).done(function (){
            selectedRow.find("td:nth-child(2)").text(name);
            selectedRow.find("td:nth-child(3)").text(address);
            $("#btn-clear").click();
        }).fail(function (){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Failed to update the customer',
            });
        })
        return;
    }


    $.ajax({
        method: 'POST',
        url: 'http://localhost:8080/myapp/api/v1/customers',
        data: $("form").serialize()
    }).done(function () {
        var rowHtml = "<tr>\n" +
            "<td>" + id + "</td>\n" +
            "<td>" + name + "</td>\n" +
            "<td>" + address + "</td>\n" +
            "<td class='bin'><i class=\"fas fa-trash\"></i></td>\n" +
            "</tr>";

        initializeDataTable(function () {
            $("#tbl-customers tbody").append(rowHtml); //Functional programming - Higher order function ==> when a function can be given as an argument
            $("#btn-clear").click();
        });
    }).fail(function () {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Failed to save the customer'
        });
        $("#txt-id").select();
    })
    /* Asynchronous call
        /!*1 - Create a XMLHTTPRequest Object*!/
        var http = new XMLHttpRequest();

        /!*2 - Async callback function*!/
        http.onreadystatechange = function (){
            /!*console.log("Response has arrived"); //This returns 4 times*!/
            if(http.readyState === 4){
                if(http.status === 201){
                    var rowHtml = "<tr>\n" +
                        "<td>" + id + "</td>\n" +
                        "<td>" + name + "</td>\n" +
                        "<td>" + address + "</td>\n" +
                        "<td class='bin'><i class=\"fas fa-trash\"></i></td>\n" +
                        "</tr>";

                    initializeDataTable(function () {
                        $("#tbl-customers tbody").append(rowHtml); //Functional programming - Higher order function ==> when a function can be given as an argument
                        $("#btn-clear").click();
                    });
                }else{
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong!',
                        footer: '<a href>Why do I have this issue?</a>'
                    });
                    $("#txt-id").select();
                }
            }
        }

        /!*3 - It's time to open the request*!/
        http.open('POST','http://localhost:8080/myapp/customers',true);

        /!*4 - Let's set some headers for the request*!/
        http.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

        var queryString = 'id=' +id+'&name='+name+ '&address=' +address;

        /!*5 - Let's send the request*!/
        http.send(queryString);*/

}

function selectCustomer() {
    deSelectAllCustomers();
    $(this).addClass("selected-row");

    selectedRow = $(this);
    $("#txt-id").val(selectedRow.find("td:first-child").text());
    $("#txt-name").val(selectedRow.find("td:nth-child(2)").text());
    $("#txt-address").val(selectedRow.find("td:nth-child(3)").text());
    $("#btn-save").text("Update");
    $("#txt-id").attr("disabled", true);
}

function deSelectAllCustomers() {
    $("#tbl-customers tbody tr").removeClass("selected-row");
    $("#btn-save").text("Save");
    selectedRow = null;
    $("#txt-id").attr("disabled", false);
}

function deleteCustomer() {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                method: 'DELETE',
                url: 'http://localhost:8080/myapp/api/v1/customers/' + selectedRow.find("td:first-child").text()
            }).done(function () {
                selectedRow.fadeOut(500, function () {
                    initializeDataTable(function () {
                        selectedRow.remove();
                        $("#btn-clear").click();
                        Swal.fire(
                            'Deleted!',
                            'Customer has been deleted successfully.',
                            'success'
                        )
                    });
                });
            }).fail(function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong! Failed to delete the customer',
                    footer: '<a href>Why do I have this issue?</a>'
                })
            })
        }
    })
}

        function validationListener() {
            $(this).removeClass("is-invalid");
            $(this).tooltip('hide');
        }

        function removeAllValidations() {
            $("#txt-id, #txt-name, #txt-address").removeClass("is-invalid");
            $("#txt-id, #txt-name, #txt-address").tooltip('hide');
        }
