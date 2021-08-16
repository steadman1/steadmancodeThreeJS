export function spaceText() {
    const nameHeight = 593;
    const nameText = document.getElementsByClassName("nameText")[0];
    const nameContainer = document.getElementsByClassName("nameContainer")[0];
    const body = document.querySelector("body");
    let nameLetterSpacing = (window.innerHeight - nameHeight - parseFloat(window.getComputedStyle(body).margin) * 2) / nameText.textContent.length;
    let nameLetterSpacingOverflow = (window.innerHeight - (nameHeight / 2) - parseFloat(window.getComputedStyle(body).margin) * 2) / (nameText.textContent.length / 2);
    $(nameText).css({
        "letter-spacing": nameLetterSpacing > 5 ? nameLetterSpacing : nameLetterSpacingOverflow,
        "margin-top": nameLetterSpacing > 5 ? -10 : -40,
    });
}