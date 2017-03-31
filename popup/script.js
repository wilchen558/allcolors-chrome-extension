let options, result;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.result) {
        handleResult(request.result);
    }
});

function init() {
    result = localStorage.getItem('allColors_result') ? JSON.parse(localStorage.getItem('allColors_result')) : false;
    handleResult(result);
    initialiseOptions();
}

function initialiseOptions() {
    const defaultOptions = {
        logToConsole: false,
        includeBorderColorsWithZeroWidth: false,
        props: ["background-color", "color", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color"],
        skipColors: { "rgb(0, 0, 0)": 1, "rgba(0, 0, 0, 0)": 1, "rgb(255, 255, 255)": 1 }
    }

    options = localStorage.getItem('allColors_options') ? JSON.parse(localStorage.getItem('allColors_options')) : defaultOptions;

    document.getElementById('logToConsole').checked = options.logToConsole;
    document.getElementById('includeZeroBorders').checked = options.includeBorderColorsWithZeroWidth;
    options.props.forEach(function (property) {
        addProperty(property);
    });
    Object.keys(options.skipColors).forEach(function (color) {
        addSkipColor(color);
    });
}

function setOptions() {
    let propsArry = Array.from(document.getElementById('props-list').getElementsByTagName('li'));
    let skipColorsArry = Array.from(document.getElementById('skipColors-list').getElementsByTagName('li'));
    let skipColors = new Object();

    options.props = propsArry.map(function (prop) {
        return prop.innerHTML;
    });

    skipColorsArry.forEach(function (element) {
        skipColors[element.dataset.color] = 1;
    });

    options.skipColors = skipColors;
    options.includeBorderColorsWithZeroWidth = document.getElementById('includeZeroBorders').checked;
    options.logToConsole = document.getElementById('logToConsole').checked;
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

function handleResult(res) {
    if (res) {
        let container = document.getElementById("result-container");
        
        let label = document.createElement("label");
        label.innerText = "Result";

        let ul = document.createElement("ul");
        ul.className = "result-list";
        
        container.appendChild(label);

        res.forEach(function (c) {
            let li = document.createElement("li");
            let div = document.createElement("div");
            let p = document.createElement("p");

            div.className = "color-block";
            div.style.backgroundColor = c.key;
            p.innerHTML = c.key + " " + c.hexValue + " <b>(" + c.value.count + " Times)</b>";

            li.appendChild(div);
            li.appendChild(p);
            ul.appendChild(li);
        });

        let li = document.createElement("li");
        li.className = "total-colors";
        li.innerText = "Total colors used: " + res.length;
        
        ul.appendChild(li);
        container.appendChild(ul);

        localStorage.setItem('allColors_result', JSON.stringify(res));
    }
}

function addProperty(property) {
    let ul = document.getElementById("props-list");
    let li = document.createElement("li");

    li.onclick = function () {
        this.parentElement.removeChild(this);
    };
    li.title = "Click to remove";
    li.appendChild(document.createTextNode(property));
    ul.appendChild(li);
}

function addSkipColor(color) {
    let ul = document.getElementById("skipColors-list");
    let li = document.createElement("li");
    let div = document.createElement("div");

    li.onclick = function () {
        this.parentElement.removeChild(this);
    };
    li.title = "Click to remove";
    li.dataset.color = color;
    div.className = "color-block";
    div.style.backgroundColor = color;

    li.appendChild(div);
    li.appendChild(document.createTextNode(color));
    ul.appendChild(li);
}

function removeChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function reset() {
    let resultContainer = document.getElementById("result-container");
    let skipColorsList = document.getElementById("skipColors-list");
    let propsList = document.getElementById("props-list");

    removeChildren(resultContainer);
    removeChildren(skipColorsList);
    removeChildren(propsList);

    localStorage.removeItem('allColors_options');
    localStorage.removeItem('allColors_result');

    removeScript();
}

document.getElementById('trigger').addEventListener('click', function () {
    setOptions();
    let resultContainer = document.getElementById("result-container");
    removeChildren(resultContainer);

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { settings: options }, function (response) {

        });
    });
})

document.getElementById('reset').addEventListener('click', function () {
    reset();
    init();
})

document.getElementById('add-color').addEventListener('click', function () {
    let colorInput = document.getElementById('skipColors');
    addSkipColor(colorInput.value);
    colorInput.value = "";
    setOptions();
})

document.getElementById('add-property').addEventListener('click', function () {
    let propsInput = document.getElementById('props');
    addProperty(propsInput.value);
    propsInput.value = "";
    setOptions();
})

init();