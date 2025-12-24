// GLOBALS
let dialogueTree;
let state = {
    userName: "",
    duckName: "",
    currentNodeID: ""
};

// IDS
const head = "start";
// const head = "news";
const textElementID = "text";
const characterElementID = "character_img";
const imageElementID = "newspaper_img";
const inputElementID = "text_input";

// get dialogue from JSON
const getDialogue = async () => {
    const response = await fetch("dialogue.json");
    dialogueTree = await response.json();
    console.log("Dialogue Tree:", dialogueTree);
}

/** UPDATE ELEMENT
 * update html element property with value
 * if value is null, element will be hidden
 * if property is null, element will only be shown
 * @param {string} elementID id of html element to be updated
 * @param {*} value data to be used to update element property
 * @param {string} property html element property to be changed (e.g. "src", "innerHTML")
 */
const updateElement = (elementID, value, property) => {
    const element = document.getElementById(elementID);
    element.style.display = value ? "block" : "none";
    if (value && property) element[property] = value;
}

/** FORMAT TEXT
 * format text from dialogue tree and state into update-ready format
 * string inside {braces} is replaced with state[braces]
 * string inside [brackets] is highlighted
 * @param {string} input input string
 * @param {Object} state current state
 * @returns {string} formatted text for element updating
 */
const formatText = (input, state) => {
    return input.replaceAll('[', "<span class=\"highlight\">")
    .replaceAll(']', "</span>")
    .replace(/\{(\w+)\}/g, (_, key) => {
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
    if (currentNode.text) updateElement(textElementID, `<h1>${formatText(currentNode.text, state)}</h1>`, "innerHTML");
    else updateElement(textElementID);
    
    // render character
    if (currentNode.character) updateElement(characterElementID, `assets/imgs/${currentNode.character}.png`, "src");
    else updateElement(characterElementID);
    
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
            buttonElement.innerHTML = formatText(button.label, state);
            buttonElement.addEventListener("click", () => renderNode(button.next));
            button_container.appendChild(buttonElement);
        });
    }

    // set timed nodes
    if (currentNode.timeout) setTimeout(() => renderNode(currentNode.next), currentNode.timeout);

    // click anywhere to continue
    if (currentNode.continue) {
        // set timeout to prevent button click bubbling
        setTimeout(() => document.body.addEventListener("click", () => renderNode(currentNode.next), { once: true }), 0);
    }

    // update state
    if (currentNode.set) {
        for (const key in currentNode.set) state[key] = currentNode.set[key];
    }
}

// on page load
document.addEventListener("DOMContentLoaded", async () => {
    await getDialogue();
    document.body.style.display = "block";
    console.log("Page loaded"); 
    console.log("State: ", state);
    renderNode(head);
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
