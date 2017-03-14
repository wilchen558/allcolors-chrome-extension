// allcolors.js
// https://github.com/bgrins/devtools-snippets
// Print out CSS colors used in elements on the page.

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.settings) {
            execAllCorlors(request.settings)
        } else {
            console.log('Something went wrong');
        }
});


function execAllCorlors(settings) {

    var allColors = {};
    var includeBorderColorsWithZeroWidth = settings.includeBorderColorsWithZeroWidth;
    var props = settings.props;
    var skipColors = settings.skipColors;

    [].forEach.call(document.querySelectorAll("*"), function (node) {
        var nodeColors = {};
        props.forEach(function (prop) {
            var color = window.getComputedStyle(node, null).getPropertyValue(prop),
                thisIsABorderProperty = (prop.indexOf("border") != -1),
                notBorderZero = thisIsABorderProperty ? window.getComputedStyle(node, null).getPropertyValue(prop.replace("color", "width")) !== "0px" : true,
                colorConditionsMet;

            if (includeBorderColorsWithZeroWidth) {
                colorConditionsMet = color && !skipColors[color];
            } else {
                colorConditionsMet = color && !skipColors[color] && notBorderZero;
            }

            if (colorConditionsMet) {
                if (!allColors[color]) {
                    allColors[color] = {
                        count: 0,
                        nodes: []
                    };
                }

                if (!nodeColors[color]) {
                    allColors[color].count++;
                    allColors[color].nodes.push(node);
                }

                nodeColors[color] = true;
            }
        });
    });

    function rgbTextToRgbArray(rgbText) {
        return rgbText.replace(/\s/g, "").match(/\d+,\d+,\d+/)[0].split(",").map(function (num) {
            return parseInt(num, 10);
        });
    }

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(rgbArray) {
        var r = rgbArray[0],
            g = rgbArray[1],
            b = rgbArray[2];
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    var allColorsSorted = [];
    for (var i in allColors) {
        var rgbArray = rgbTextToRgbArray(i);
        var hexValue = rgbToHex(rgbArray);

        allColorsSorted.push({
            key: i,
            value: allColors[i],
            hexValue: hexValue
        });
    }

    allColorsSorted = allColorsSorted.sort(function (a, b) {
        return b.value.count - a.value.count;
    });

    var nameStyle = "font-weight:normal;";
    var countStyle = "font-weight:bold;";
    function colorStyle(color) {
        return "background:" + color + ";color:" + color + ";border:1px solid #333;";
    };

    console.group("Total colors used in elements on the page: " + window.location.href + " are " + allColorsSorted.length);
    allColorsSorted.forEach(function (c) {
        console.groupCollapsed("%c    %c " + c.key + " " + c.hexValue + " %c(" + c.value.count + " times)",
            colorStyle(c.key), nameStyle, countStyle);
        c.value.nodes.forEach(function (node) {
            console.log(node);
        });
        console.groupEnd();
    });
    console.groupEnd("All colors used in elements on the page");

    returnResult(allColorsSorted);

}

function returnResult(res) {
    chrome.runtime.sendMessage({ result: res });
    console.log('result returned');
}