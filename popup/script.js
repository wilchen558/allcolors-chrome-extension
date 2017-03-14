let options;

function initialiseOptions() {
    const defaultOptions = {
        includeBorderColorsWithZeroWidth: false,
        props: ["background-color", "color", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color"],
        skipColors: { "rgb(0, 0, 0)": 1, "rgba(0, 0, 0, 0)": 1, "rgb(255, 255, 255)": 1 }
    }

    options = localStorage.getItem('allColors_options') ? JSON.parse(localStorage.getItem('allColors_options')) : defaultOptions;

    document.getElementById('includeZeroBorders').checked = options.includeBorderColorsWithZeroWidth;

    options.props.forEach(function (element) {
        let ul = document.getElementById("props-list");
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(element));
        ul.appendChild(li);
    });

    Object.keys(options.skipColors).forEach(function (element) {
        let ul = document.getElementById("skipColors-list");
        let li = document.createElement("li");
        let div = document.createElement("div");

        li.appendChild(document.createTextNode(element));
        li.dataset.color = element;
        div.className = "color-block";
        div.style.backgroundColor = element;
        li.appendChild(div);
        ul.appendChild(li);
    });
}

function setOptions() {
    let propsArry = Array.from(document.getElementById('props-list').getElementsByTagName('li'));
    let skipColorsArry = Array.from(document.getElementById('skipColors-list').getElementsByTagName('li'));
    let skipColors = new Object();

    options.props = propsArry.map(function(prop) {
        return prop.innerHTML;
    });

    skipColorsArry.forEach(function (element) {
        skipColors[element.dataset.color] = 1;
    });

    options.skipColors = skipColors;

    options.includeBorderColorsWithZeroWidth = document.getElementById('includeZeroBorders').checked;

    localStorage.setItem('allColors_options', JSON.stringify(options));
}

function removeScript() {
    const code = `
		if (document.getElementById("allColorJS"))
        {
            document.getElementsByTagName("head")[0].removeChild(document.getElementById("allColorJS"));
        }
	`;

    chrome.tabs.executeScript({ code: code });
}

function execAllColor() {
    const file = `/all-colors/allcolors.js`;
    const code = `
        if (document.getElementById("allColorJS"))
        {
            //do nothing
        }
        else {
            var allColorJS = document.createElement("script");
            allColorJS.type = "text/javascript";
            allColorJS.src = chrome.extension.getURL("${file}");
            allColorJS.id = "allColorJS";
            document.getElementsByTagName("head")[0].appendChild(allColorJS);
        }
    `;

    chrome.tabs.executeScript({ code: code });
}

initialiseOptions();

document.getElementById('trigger').addEventListener('click', function () {
    setOptions();
    execAllColor();
})

document.getElementById('reset').addEventListener('click', function () {
    setOptions();
    removeScript();
})