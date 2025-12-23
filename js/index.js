// GLOBALS
let dialogueTree;
let state = {
    userName: "",
    duckName: "",
    currentNodeID: ""
};

// IDS
const head = "start";
const textElementID = "text";
const imageElementID = "character_img";
const inputElementID = "text_input";

// get dialogue from JSON
const getDialogue = async () => {
    const response = await fetch("dialogue.json");
    dialogueTree = await response.json();
    console.log("Dialogue Tree:", dialogueTree);
}

// helper function to update elements
const updateElement = (elementID, value, property) => {
    const element = document.getElementById(elementID);
    element.style.display = value ? "block" : "none";
    if (value && property) element[property] = value;
}

// helper function to resolve text
const resolveText = (template, state) => {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
        return state[key] ?? `{${key}}`;
    });
}

// render node
const renderNode = nodeID => {
    // update state
    state.currentNodeID = nodeID;
    console.log("State: ", state);

    const currentNode = dialogueTree[nodeID];
    console.log("Current Node: ", nodeID, currentNode);

    // render text
    if (currentNode.text) updateElement(textElementID, `<h1>${resolveText(currentNode.text, state)}</h1>`, "innerHTML");
    else updateElement(textElementID);
    // if (currentNode.insertName) document.getElementById("insert_name").innerText = username;
    
    // render image
    if (currentNode.image) updateElement(imageElementID, `assets/imgs/${currentNode.image}.png`, "src");
    else updateElement(imageElementID);

    // render input
    if (currentNode.input) updateElement(inputElementID, currentNode.input, "placeholder");
    else updateElement(inputElementID);
    
    // render buttons
    const button_container = document.getElementById("button_container");
    button_container.innerHTML = "";
    if (currentNode.responses) {
        currentNode.responses.forEach((button, index) => {
            const buttonElement = document.createElement("button");
            buttonElement.id = `button${index+1}`;
            buttonElement.innerHTML = resolveText(button.label, state);
            buttonElement.addEventListener("click", () => renderNode(button.next));
            button_container.appendChild(buttonElement);
        });
    }

    // set timed nodes
    if (currentNode.timeout) setTimeout(() => renderNode(currentNode.next), currentNode.timeout);

    // update state
    if (currentNode.set) {
        for (const key in currentNode.set) state[key] = currentNode.set[key];
    }

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
    console.log("State: ", state);
});

// on input submit
document.getElementById(inputElementID).addEventListener("keydown", ({ key, target }) => {
    if (key === "Enter" && target.value) {
        if (dialogueTree[state.currentNodeID].input === "Your Name") state.userName = target.value;
        else if (dialogueTree[state.currentNodeID].input === "Duck's Name") state.duckName = target.value;
        target.value = "";
        renderNode(dialogueTree[state.currentNodeID].next);
    }
});
