let username = "";
let panels;
let panelIndex = -1;

// get panels from JSON
const loadPanels = async () => {
    const response = await fetch("template.json");
    panels = await response.json();
    console.log(panels);
}

// helper function to update elements
const updateElement = (elementID, value, property) => {
    const element = document.getElementById(elementID);
    element.style.display = value ? "block" : "none";
    if (value && property) element[property] = value;
}

// advance a panel
const advance = () => {
    panelIndex++;
    const currentPanel = panels[panelIndex];
    console.log("Panel: ", panelIndex, currentPanel);
    
    // buttonless panel
    if (panelIndex === 0) document.body.addEventListener("click", advance);
    else document.body.removeEventListener("click", advance);

    // timed panels
    if (panelIndex === 7 || panelIndex === 8 || panelIndex === 9 || panelIndex === 14) setTimeout(advance, 2500);

    // image
    updateElement("image", currentPanel.image, "src");

    // dialogue
    updateElement("dialogue", currentPanel.dialogue, "innerHTML");
    if (currentPanel.insertName) document.getElementById("insert_name").innerText = username;

    // buttons
    const buttons = document.getElementById("buttons");
    buttons.innerHTML = "";
    if (currentPanel.buttons) {
        currentPanel.buttons.forEach((button, index) => {
            const buttonElement = document.createElement(button.type);
            buttonElement.id = `button${index+1}`;
            buttonElement.innerHTML = button.value;
            buttonElement.addEventListener("click", advance);
            buttons.appendChild(buttonElement);
        });
    }

    // input
    updateElement("input", currentPanel.input);

    // card
    updateElement("card", currentPanel.card);
    document.getElementById("card_name").innerText = username;
    if (currentPanel.card) document.getElementById("image_container").style.display = "none";
    else document.getElementById("image_container").style.display = "flex";
}

// on page load
document.addEventListener("DOMContentLoaded", async () => {
    await loadPanels();
    document.body.style.display = "block";
    console.log("Page loaded");
    advance();
});

// on input
const usernameInput = document.getElementById("username_input");
usernameInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && usernameInput.value) {
        username = usernameInput.value;
        advance();
    }
});
