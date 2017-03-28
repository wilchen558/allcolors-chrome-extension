// allcolors.js
// https://github.com/bgrins/devtools-snippets
// Print out CSS colors used in elements on the page.
// Modifications by Tobias Wilchen (https://github.com/wilchen558)

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.settings) {
            execAllCorlors(request.settings)
        } else {
            console.log('Something went wrong');
        }
    });

function execAllCorlors(settings) {

    let allColors = {};
    let logToConsole = settings.logToConsole;
    let includeBorderColorsWithZeroWidth = settings.includeBorderColorsWithZeroWidth;
    let props = settings.props;
    let skipColors = settings.skipColors;

    [].forEach.call(document.querySelectorAll("*"), function (node) {
        let nodeColors = {};
        props.forEach(function (prop) {
            let color = window.getComputedStyle(node, null).getPropertyValue(prop),
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
        let hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(rgbArray) {
        let r = rgbArray[0],
            g = rgbArray[1],
            b = rgbArray[2];
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    let allColorsSorted = [];
    for (let i in allColors) {
        let rgbArray = rgbTextToRgbArray(i);
        let hexValue = rgbToHex(rgbArray);

        allColorsSorted.push({
            key: i,
            value: allColors[i],
            hexValue: hexValue
        });
    }

    allColorsSorted = allColorsSorted.sort(function (a, b) {
        return b.value.count - a.value.count;
    });

    let nameStyle = "font-weight:normal;";
    let countStyle = "font-weight:bold;";
    function colorStyle(color) {
        return "background:" + color + ";color:" + color + ";border:1px solid #333;";
    };

    if (logToConsole) {
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
    }

    returnResult(allColorsSorted);

}

function returnResult(result) {
    chrome.runtime.sendMessage({ result: result });
}