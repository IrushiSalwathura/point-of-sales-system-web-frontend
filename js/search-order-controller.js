/*=======================================================================
Global variables and constants
========================================================================*/
var tblSearch = null;
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

/*==========================================================================================
Methods
==========================================================================================*/
function initializeDataTable(callBackFn) {
    if (tblSearch != null) {
        tblSearch.destroy();
    }

    if (callBackFn != undefined) {
        callBackFn();
        if ($("#tbl-search tbody tr").length > 0) {
            $("#tbl-search tfoot").addClass("d-none");
        } else {
            $("#tbl-search tfoot").removeClass("d-none");
        }
    }

    tblSearch = $("#tbl-search").DataTable({
        "pageLength": 5,
        "info": false,
        "responsive": true,
        "autoWidth": false,
        "searching":true,
        "lengthChange": false,
    });
    $("#tbl-search tr .dataTables_empty").remove();
}