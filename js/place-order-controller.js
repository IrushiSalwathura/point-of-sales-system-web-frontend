/*=======================================================================
Global variables and constants
========================================================================*/
var tblOrders = null;
var selectedRow = null;
/*======================================================================================
Document.ready() and window.load()
=========================================================================================*/
$(function () {
    initializeDataTable();
});
/*=========================================================================================
Event Handlers
==========================================================================================*/
$("#btn-save").click(insertOrderToTable);
$("#btn-clear").click(deSelectAllOrders);
$("#tbl-orders tbody").on("click", "tr", selectOrder);
$("#tbl-orders tbody").on("click", "td:last-child", deleteOrder);
$("#txt-qty").keypress(validationListener);
/*==========================================================================================
Methods
==========================================================================================*/
function initializeDataTable(callBackFn) {
    if (tblOrders != null) {
        tblOrders.destroy();
    }

    if (callBackFn != undefined) {
        callBackFn();
        if ($("#tbl-orders tbody tr").length > 0) {
            $("#tbl-orders tfoot").addClass("d-none");
        } else {
            $("#tbl-orders tfoot").removeClass("d-none");
        }
    }

    tblOrders = $("#tbl-orders").DataTable({
        "pageLength": 5,
        "info": false,
        "responsive": true,
        "autoWidth": false,
        /*"searching":true,*/
        "lengthChange": false,
    });
    $("#tbl-orders tr .dataTables_empty").remove();
}
function saveOrder(){
    var orderId = $("#txt-id").val();
    var orderDate = $("#txt-date").val();
    var customerId = $("#cmb-customerId").val();

    var validated = true;
    var orderDetails = [];

    var noOfRows = $("#tbl-orders tbody tr");
    for (var i = 0; i < noOfRows.length ; i++) {
        var code;
    }
}
function insertOrderToTable() {
    var orderId = $("#txt-id").val();
    var orderDate = $("#txt-date").val();
    var customerId = $("#cmb-customerId").val();
    var itemCode = $(" #cmb-itemCode").val();
    var description = $("#txt-description").val();
    var qty = $("#txt-qty").val();
    var unitPrice = $("#txt-unitPrice").val();
    var total = qty * unitPrice;

    var validated = true;

    if (!/\d/.test(qty)) {
        $("#txt-qty").select();
        $("#txt-qty").addClass("is-invalid");
    }

    if (!validated) {
        $("form .is-invalid").tooltip('show');
        return;
    }

    var rowHtml = "<tr>\n" +
        "<td>"+itemCode+"</td>\n" +
        "<td>"+description+"</td>\n" +
        "<td>"+qty+"</td>\n" +
        "<td>"+unitPrice+"</td>\n" +
        "<td>"+total+"</td>\n" +
        "<td><i class=\"fas fa-trash\"></i></td>\n" +
        "\</tr>";

    initializeDataTable(function (){
        $("#tbl-orders tbody").append(rowHtml);
        $("#btn-clear").click();
    });
}
function selectOrder() {
    deSelectAllOrders();
    $(this).addClass("selected-row");

    selectedRow = $(this);
    $("#txt-code").val(selectedRow.find("td:first-child").text());
    $("#txt-description").val(selectedRow.find("td:nth-child(2)").text());
    $("#txt-qty").val(selectedRow.find("td:nth-child(3)").text());
    $("#txt-unitPrice").val(selectedRow.find("td:nth-child(4)").text());
    $("#txt-code").attr("disabled", true);
}
function deSelectAllOrders() {
    $("#tbl-orders tbody tr").removeClass("selected-row");
    $("#btn-save").text("Save");
    selectedRow = null;
    $("#txt-code").attr("disabled", false);
}

function deleteOrder() {
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
            selectedRow.fadeOut(500, function () {
                initializeDataTable(function () {
                    selectedRow.remove();
                    $("#btn-clear").click();
                    Swal.fire(
                        'Deleted!',
                        'Your file has been deleted successfully.',
                        'success'
                    )
                })
            });
        }
    })
}

function validationListener() {
    $(this).removeClass("is-invalid");
    $(this).tooltip('hide');
}

function removeAllValidations() {
    $("#txt-qty").removeClass("is-invalid");
    $("#txt-qty").tooltip('hide');
}