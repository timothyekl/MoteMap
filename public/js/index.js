REFRESH_RATE = 10000; // refresh every 10 seconds. TODO parameterize this somehow
var REFRESH_TIMER_ID;

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
function updateNodes(create) {
    $.ajax("/api/nodes/data", {
        dataType: "json",
        error: function(jqxhr, textStatus, errorThrown) {
            displayError("Failed to load node data (" + textStatus + ")");
        },
        success: function(data, textStatus, jqxhr) {
            for(var nodeid in data) {
                if(create) {
                    // Create the node's HTML representation
                    $("body").append(nodeDivHTML(nodeid));

                    // Make the node draggable
                    $(".node#node-" + nodeid).draggable({
                        stop: function(n) {
                            return function(event, ui) {
                                var e = $(".node#node-" + n);
                                setLastPosition(n, e.css('left').replace("px", ""), e.css('top').replace("px", ""));
                            }
                        }(nodeid)
                    });

                    // Add the node to the toggleable list
                    $("#control-panel").append("<br /><input type='checkbox' checked='checked' id='checkbox-" + nodeid + "'/> " + nodeid);

                    // Register the new toggling checkbox to the node's visibility
                    $("#checkbox-" + nodeid).click(function(n) {
                        return function(event) {
                            var e = $(".node#node-" + n);
                            var c = $("#checkbox-" + n);

                            if(c.prop("checked")) {
                                e.css("display", "block");
                            } else {
                                e.css("display", "none");
                            }

                            setLastPosition(n, undefined, undefined, c.prop("checked") ? 1 : 0);
                        }
                    }(nodeid));
                }

                // Populate the visual data for the node
                var nodedata = data[nodeid];
                var temp = parseInt(nodedata["temp"]);
                var light = parseInt(nodedata["light"]);
                var ts = Date.parse(nodedata["result_time"]);
                colorTemperatureFromADC(nodeid, temp);
                colorLightFromADC(nodeid, light);
                colorBorderFromTimestamp(nodeid, ts);
                setTooltipFromTemperatureLightADC(nodeid, temp, light);
            }

            // Update positions of nodes on screen
            if(create) {
                updatePositionsFromMetadata();
            }
        }
    });

}

/**
 * Fetch the last known position of the given node from server metadata
 * and update its absolute position on the page to match.
 */
function updatePositionsFromMetadata() {
    $.ajax("/api/nodes/metadata", {
        dataType: "json",
        error: function(jqxhr, textStatus, errorThrown) {
            displayError("Could not retrieve metadata");
        },
        success: function(data, textStatus, jqxhr) {
            if(typeof(data["error"]) != "undefined") {
                displayError("Server returned error when fetching metadata for node " + nodeid);
                return;
            }
            
            for(var nodeid in data) {
                nodedata = data[nodeid];

                if(typeof(nodedata["visible"] != "undefined")) {
                    var visible = nodedata["visible"];
                    if(visible) {
                        $("#checkbox-" + nodeid).prop("checked", true);
                        $(".node#node-" + nodeid).css("display", "block");
                    } else {
                        $("#checkbox-" + nodeid).prop("checked", false);
                        $(".node#node-" + nodeid).css("display", "none");
                    }
                }

                if(typeof(nodedata["x"]) != "undefined") {
                    var xpos = parseInt(nodedata["x"]);
                    if(xpos != -1) {
                        var e = $(".node#node-" + nodeid).first();
                        e.css("left", xpos + "px");
                    }
                }

                if(typeof(nodedata["y"]) != "undefined") {
                    var ypos = parseInt(nodedata["y"]);
                    if(ypos != -1) {
                        var e = $(".node#node-" + nodeid).first();
                        e.css("top", ypos + "px");
                    }
                }
            }
        }
    });
}

/**
 * Set the last known position of the given node in server metadata.
 */
function setLastPosition(nodeid, x, y, visible) {
    data = {};

    if(typeof(x) != "undefined") { data.x = x };
    if(typeof(y) != "undefined") { data.y = y };
    if(typeof(visible) != "undefined") { data.visible = visible };

    $.ajax("/api/node/" + nodeid + "/metadata", {
        data: data,
        dataType: "json",
        error: function(jqxhr, textStatus, errorThrown) {
            displayError("Could not set metadata for node " + nodeid + " (" + textStatus + ")");
        },
        success: function(data, textStatus, jqxhr) {
            if(typeof(data["error"]) != "undefined") {
                displayError("Server returned error setting metadata: " + data["error"]);
            }
        },
        type: "PUT"
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
    var lightColor = zero_pad((Math.floor((adc / 1023) * 255)).toString(16), 2);
    $(".node#node-" + nodeid + " .light").css("background-color", "#" + lightColor + lightColor + "00");
}

/**
 * Color the border of the node with the given ID for the given timestamp of the most recent result.
 *
 * Timestamp values are interpreted linearly from now (black) to 30 minutes ago (red).
 */
function colorBorderFromTimestamp(nodeid, timestamp) {
    var tdiff = Date.now() - timestamp;
    var maxdiff = 30 * 60 * 1000;
    var htmlColor;
    if(tdiff > maxdiff) {
        htmlColor = "#ff0000";
    } else {
        htmlColor = "#" + zero_pad((Math.floor((tdiff / maxdiff) * 255)).toString(16), 2) + "0000";
    }
    $(".node#node-" + nodeid).css("border", "2px solid " + htmlColor);
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
    updateNodes(true);

    // Set up timer for node refresh
    REFRESH_TIMER_ID = setInterval('updateNodes(false);', REFRESH_RATE);
    $("#update-interval").change(function(event) {
        clearInterval(REFRESH_TIMER_ID);
        REFRESH_RATE = parseInt($("#update-interval").val());
        REFRESH_TIMER_ID = setInterval('updateNodes(false);', REFRESH_RATE);
    });
});
