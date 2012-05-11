/**
 * Show a dialog box with with the given error text
 */
function displayError(text) {
    $("#modal").text(text);
    $("#modal").dialog({
        title: "Error",
        buttons: {"OK": function() { $(this).dialog("close"); }}
    });
}

/**
 * Generate the HTML snippet for a new node div with the given ID.
 */
function nodeDivHTML(nodeid) {
    result = "<div class='node' id-'node-'" + nodeid + "'>";
    result += "<div class='temp'>&nbsp;</div>";
    result += "<div class='light'>&nbsp;</div>";
    result += nodeid + "</div>";
    return result;
}

/**
 * Create a collection of node divs in the page, one for each node ID in the argument.
 */
function createNodes(idList) {
    $.each(idList, function(idx, elem) {
        $("#content").append(nodeDivHTML(elem));
    });

    $(".node").draggable();

    $.each(idList, function(idx, elem) {
        $.ajax("/api/node/" + elem + "/data/temp", {
            dataType: "json",
            error: function(jqxhr, textStatus, errorThrown) {
                displayError("Failed to get temperature data for node " + elem + " (" + textStatus + ")");
            },
            success: function(data, textStatus, jqxhr) {
                colorTemperatureFromADC(elem, data);
            }
        });
    });
}

/**
 * Color the node with the given ID for the temperature represented by the given ADC value.
 */
function colorTemperatureFromADC(nodeid, adc) {
    var temp = adc_to_celsius(adc);
    // TODO this should show temperature by color, not tooltip
    $(".node#node-" + nodeid).attr("title", temp + "C");
}

// Ready!
$(document).ready(function () {
    $.ajax("/api/nodes", {
        dataType: "json",
        error: function(jqxhr, textStatus, errorThrown) {
            displayError("Failed to fetch list of nodes (" + textStatus + ")");
        },
        success: function(data, textStatus, jqxhr) {
            createNodes(data);
        }
    });
});
