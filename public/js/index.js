$(document).ready(function () {
    $.ajax("/api/nodes", {
        dataType: "json",
        error: function(jqxhr, textStatus, errorThrown) {
            
        },
        success: function(data, textStatus, jqxhr) {
            $.each(data, function(idx, elem) {
                $("#content").append("<div class='node'>" + elem + "</div>");
            });
            $(".node").draggable();
        }
    });
});
