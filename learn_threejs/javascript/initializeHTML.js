const sleep = 800;
function unhideElements(id, immediate = false) {
    let element = document.getElementById(id);
    $("#"+id).fadeToggle(immediate ? 0 : sleep);
}

function hideElements(id, immediate = false) {
    $("#"+id).fadeToggle(immediate ? 0 : sleep);
}

export {unhideElements, hideElements, }