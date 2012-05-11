function displayError(text) {
    $("#modal").text(text);
    $("#modal").dialog({
        title: "Error",
        buttons: {"OK": function() { $(this).dialog("close"); }}
    });
}
$(document).ready(function () {
    $.ajax("/api/nodes", {
        dataType: "json",
        error: function(jqxhr, textStatus, errorThrown) {
            displayError("Failed to fetch list of nodes (" + textStatus + ")");
        },
        success: function(data, textStatus, jqxhr) {
            $.each(data, function(idx, elem) {
                $("#content").append("<div class='node'>" + elem + "</div>");
            });
            $(".node").draggable();
        }
    });
});
