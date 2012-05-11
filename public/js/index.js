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
    result = "<div class='node' id='node-" + nodeid + "'>";
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
        $("body").append(nodeDivHTML(elem));
    });

    $(".node").draggable();

    $.each(idList, function(idx, elem) {
        $.ajax("/api/node/" + elem + "/data", {
            dataType: "json",
            error: function(jqxhr, textStatus, errorThrown) {
                displayError("Failed to get temperature data for node " + elem + " (" + textStatus + ")");
            },
            success: function(data, textStatus, jqxhr) {
                var temp = parseInt(data["temp"]);
                var light = parseInt(data["light"]);
                colorTemperatureFromADC(elem, temp);
                colorLightFromADC(elem, light);
                setTooltipFromTemperatureLightADC(elem, temp, light);
            }
        });
    });
}

/**
 * Color the node with the given ID for the temperature represented by the given ADC value.
 *
 * Uses the following ranges:
 *  - < 0 C: HTML blue (#0000ff)
 *  - 0-25 C: scaled blue, dark to light
 *  - 25-50 C: scaled red, light to dark
 *  - > 50 C: HTML red (#ff0000)
 */
function colorTemperatureFromADC(nodeid, adc) {
    var temp = adc_to_celsius(adc);
    var tempString;
    if (temp < 0) {
        tempString = "#0000ff";
    } else if (temp < 25) {
        var color = zero_pad((Math.floor((temp / 25) * 255)).toString(16), 2);
        tempString = "#" + color + color + "ff";
    } else if (temp < 50) {
        var color = zero_pad((Math.floor(((temp - 25) / 25) * 255)).toString(16), 2);
        tempString = "#ff" + color + color;
    } else {
        tempString = "#ff0000";
    }
    $(".node#node-" + nodeid + " .temp").css("background-color", tempString);
}

/**
 * Color the node with the given ID for the light % represented by the given ADC value.
 *
 * Light values are interpreted linearly from 0 to 1023, and shade HTML yellow with black as appropriate.
 */
function colorLightFromADC(nodeid, adc) {
    var lightColor = (Math.floor((adc / 1023) * 255)).toString(16);
    $(".node#node-" + nodeid + " .light").css("background-color", "#" + lightColor + lightColor + "00");
}

/**
 * Set the node div's title attribute (mouseover tooltip) with the actual values of the light and
 * temperature data for that node (in degrees Celsius and light %, respectively).
 */
function setTooltipFromTemperatureLightADC(nodeid, temp_adc, light_adc) {
    var temp = adc_to_celsius(temp_adc);
    $(".node#node-" + nodeid).attr("title", temp + "C\n" + (light_adc / 1023) * 100 + "% light");
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
