let userName = "";
let duckName = "";
let dialogueTree;
const head = "start";

// get dialogue from JSON
const getDialogue = async () => {
    const response = await fetch("dialogue.json");
    dialogueTree = await response.json();
    console.log(dialogueTree);
}

// helper function to update elements
const updateElement = (elementID, value, property) => {
    const element = document.getElementById(elementID);
    element.style.display = value ? "block" : "hidden";
    if (value && property) element[property] = value;
}

// render current node
const renderNode = nodeID => {
    const currentNode = dialogueTree[nodeID];
    console.log("Current Node: ", nodeID, currentNode);

    // render text
    // updateElement("text", currentNode.text, "innerHTML");
    const dialogueElement = document.getElementById("text");
    if (currentNode.text) {
        dialogueElement.innerHTML = `<h1>${currentNode.text}</h1>`;
        dialogueElement.style.display = "block";
    } else dialogueElement.style.display = "none";
    // if (currentNode.insertName) document.getElementById("insert_name").innerText = username;
    
    // render image
    // updateElement("character_img", `assets/imgs/${currentNode.image}.png`, "src");
    const imageElement = document.getElementById("character_img");
    if (currentNode.image) {
        imageElement.src = `assets/imgs/${currentNode.image}.png`;
        imageElement.style.display = "block";
    } else imageElement.style.display = "none";

    // render buttons
    const button_container = document.getElementById("button_container");
    button_container.innerHTML = "";
    if (currentNode.responses) {
        currentNode.responses.forEach((button, index) => {
            const buttonElement = document.createElement("button");
            buttonElement.id = `button${index+1}`;
            buttonElement.innerHTML = button.label;
            buttonElement.addEventListener("click", () => renderNode(button.next));
            button_container.appendChild(buttonElement);
        });
    }

    // input
    // updateElement("input_container", currentNode.input);
    const inputElement = document.getElementById("input_container");
    const textInput = document.getElementById("text_input");
    if (currentNode.input) {
        inputElement.style.display = "flex";
        textInput.addEventListener("keydown", event => {
            if (event.key === "Enter" && textInput.value) {
                if (currentNode.input === "userName") userName = `${textInput.value}`;
                else if (currentNode.input === "duckName") duckName = `${textInput.value}`;
                textInput.value = "";
                renderNode(currentNode.next);
            }
        }, { once: true });
    } else inputElement.style.display = "none";

    // set timed nodes
    if (currentNode.timeout) setTimeout(() => renderNode(currentNode.next), currentNode.timeout);

    // card
    // updateElement("card", currentNode.card);
    // document.getElementById("card_name").innerText = username;
    // if (currentNode.card) document.getElementById("character_container").style.display = "none";
    // else document.getElementById("character_container").style.display = "flex";
}

// on page load
document.addEventListener("DOMContentLoaded", async () => {
    await getDialogue();
    
    // click anywhere to start
    document.body.addEventListener("click", () => renderNode(head), { once: true });

    document.body.style.display = "block";
    console.log("Page loaded");
});
