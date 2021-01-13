/*=======================================================================
Global variables and constants
========================================================================*/
var tblItems = null;
var selectedRow = null;
/*======================================================================================
Document.ready() and window.load()
=========================================================================================*/
$(function () {
    initializeDataTable(loadAllItems);
});
/*=========================================================================================
Event Handlers
==========================================================================================*/
$("#btn-save").click(saveOrUpdateItem);
$("#btn-clear").click(deSelectAllItems);
$("#tbl-items tbody").on("click", "tr", selectItem);
$("#tbl-items tbody").on("click", "td:last-child", deleteItem);
$("#txt-code,#txt-description,#txt-quantityOnHand,#txt-unitPrice").keypress(validationListener);

/*==========================================================================================
Methods
==========================================================================================*/
function initializeDataTable(callBackFn) {
    if (tblItems != null) {
        tblItems.destroy();
    }

    if (callBackFn != undefined) {
        callBackFn();
        if ($("#tbl-items tbody tr").length > 0) {
            $("#tbl-items tfoot").addClass("d-none");
        } else {
            $("#tbl-items tfoot").removeClass("d-none");
        }
    }

    tblItems = $("#tbl-items").DataTable({
        "pageLength": 5,
        "info": false,
        "responsive": true,
        "autoWidth": false,
        /*"searching":true,*/
        "lengthChange": false,
    });
    $("#tbl-items tr .dataTables_empty").remove();
}

function loadAllItems() {
    $.ajax({
        method: 'GET',
        url: 'http://localhost:8080/myapp/api/v1/items'
    }).done(function (items) {
        for (var i = 0; i < items.length; i++) {
            var code = items[i].code;
            var description = items[i].description;
            var qtyOnHand = items[i].qtyOnHand;
            var unitPrice = items[i].unitPrice;

            var rowHtml = "<tr>\n" +
                "<td>" + code + "</td>\n" +
                "<td>" + description + "</td>\n" +
                "<td>" + qtyOnHand + "</td>\n" +
                "<td>" + unitPrice + "</td>\n" +
                "<td><i class=\"fas fa-trash\"></i></td>\n" +
                "\</tr>";

            initializeDataTable(function () {
                $("#tbl-items tbody").append(rowHtml);
                $("#btn-clear").click();
            });
        }
    }).fail(function () {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Failed to get all items'
        })
    })
}

function saveOrUpdateItem() {
    var code = $("#txt-code").val();
    var description = $("#txt-description").val();
    var qtyOnHand = $("#txt-quantityOnHand").val();
    var unitPrice = $("#txt-unitPrice").val();

    var validated = true;

    if (!/\d/.test(unitPrice)) {
        $("#txt-unitPrice").select();
        $("#txt-unitPrice").addClass("is-invalid");
    }
    if (!/\d/.test(qtyOnHand)) {
        $("#txt-quantityOnHand").select();
        $("#txt-quantityOnHand").addClass("is-invalid");
        validated = false;
    }
    if (!/[A-Za-z ]{3,}/.test(description)) {
        $("#txt-description").select();
        $("#txt-description").addClass("is-invalid");
        validated = false;
    }
    if (!/^I\d{3}$/.test(code)) {
        $("#txt-code").select();
        $("#txt-code").addClass("is-invalid");
        validated = false;
    }

    if (!validated) {
        $("form .is-invalid").tooltip('show');
        return;
    }

    if ($("#btn-save").text() === "Update") {
        $.ajax({
            method: 'PUT',
            url: 'http://localhost:8080/myapp/api/v1/items/'+selectedRow.find("td:first-child").text(),
            data: $("form").serialize()
        }).done(function () {
            selectedRow.find("td:nth-child(2)").text(description);
            selectedRow.find("td:nth-child(3)").text(qtyOnHand);
            selectedRow.find("td:nth-child(4)").text(unitPrice);
            $("#btn-clear").click();
        }).fail(function () {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Failed to update the item'
            });
        })
        return;
    }

    $.ajax({
        method: 'POST',
        url: 'http://localhost:8080/myapp/api/v1/items',
        data: $("form").serialize()
    }).done(function () {
        var rowHtml = "<tr>\n" +
            "<td>" + code + "</td>\n" +
            "<td>" + description + "</td>\n" +
            "<td>" + qtyOnHand + "</td>\n" +
            "<td>" + unitPrice + "</td>\n" +
            "<td><i class=\"fas fa-trash\"></i></td>\n" +
            "\</tr>";

        initializeDataTable(function () {
            $("#tbl-items tbody").append(rowHtml);
            $("#btn-clear").click();
        });
    }).fail(function () {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Failed to save the items'
        });
        $("#txt-code").select();
    })
}

function selectItem() {
    deSelectAllItems();
    $(this).addClass("selected-row");

    selectedRow = $(this);
    $("#txt-code").val(selectedRow.find("td:first-child").text());
    $("#txt-description").val(selectedRow.find("td:nth-child(2)").text());
    $("#txt-quantityOnHand").val(selectedRow.find("td:nth-child(3)").text());
    $("#txt-unitPrice").val(selectedRow.find("td:nth-child(4)").text());
    $("#btn-save").text("Update");
    $("#txt-code").attr("disabled", true);
}

function deSelectAllItems() {
    $("#tbl-items tbody tr").removeClass("selected-row");
    $("#btn-save").text("Save");
    selectedRow = null;
    $("#txt-code").attr("disabled", false);
}

function deleteItem() {
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
                url: 'http://localhost:8080/myapp/api/v1/items/' + selectedRow.find("td:first-child").text()
            }).done(function () {
                selectedRow.fadeOut(500, function () {
                    initializeDataTable(function () {
                        selectedRow.remove();
                        $("#btn-clear").click();
                        Swal.fire(
                            'Deleted!',
                            'The item has been deleted successfully.',
                            'success'
                        )
                    })
                });
            }).fail(function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong! Failed to delete the item'
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
    $("#txt-code,#txt-description,#txt-quantityOnHand,#txt-unitPrice").removeClass("is-invalid");
    $("#txt-code,#txt-description,#txt-quantityOnHand,#txt-unitPrice").tooltip('hide');
}