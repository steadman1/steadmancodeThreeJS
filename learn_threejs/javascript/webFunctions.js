const sleep = 800;
function unhideElements(id, immediate = false, sleep_ = sleep) {
    $("#"+id).fadeIn(immediate ? 0 : sleep);
}

function hideElements(id, immediate = false) {
    $("#"+id).fadeOut(immediate ? 0 : sleep);
}

function spaceText() {
    const nameHeight = 593;
    const nameText = document.getElementsByClassName("nameText")[0];
    const body = document.querySelector("body");
    let nameLetterSpacing = (window.innerHeight - nameHeight - parseFloat(window.getComputedStyle(body).margin) * 2) / nameText.textContent.length;
    let nameLetterSpacingOverflow = (window.innerHeight - (nameHeight / 2) - parseFloat(window.getComputedStyle(body).margin) * 2) / (nameText.textContent.length / 2);
    $(nameText).css({
        "letter-spacing": nameLetterSpacing > 2 ? nameLetterSpacing : nameLetterSpacingOverflow,
        "margin-top": nameLetterSpacing > 2 ? -10 : -40,
    });
}

export {unhideElements, hideElements, spaceText }