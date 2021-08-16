function unhideElements({id, className}) {
    if (className != null) {
        const hiddenElements = document.getElementsByClassName(className);

        for (let index in new Array(hiddenElements.length).fill()) {
            let element = hiddenElements[index];
            element.classList.remove("hidden");
            element.classList.add("visible");
        }
    } else {
        const hiddenElement = document.getElementById(id);

        hiddenElement.classList.remove("hidden");
        hiddenElement.classList.add("visible");
    }
}

function hideElements({id, className}) {
    if (className != null) {
        const hiddenElements = document.getElementsByClassName(className);

        for (let index in new Array(hiddenElements.length).fill()) {
            let element = hiddenElements[index];
            element.classList.remove("visible");
            element.classList.add("hidden");
        }
    } else {
        const hiddenElement = document.getElementById(id);

        hiddenElement.classList.remove("visible");
        hiddenElement.classList.add("hidden");
        
    }
}

function enterScene() {
    hideElements({id: "loadEnterText"});
    unhideElements({id: "nameContainer"});
}

export {unhideElements, hideElements, enterScene}