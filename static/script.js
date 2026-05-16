// load saved chat
window.onload = function () {
    const oldChats = localStorage.getItem("chat_history");

    if (oldChats) {
        document.getElementById("chat-box").innerHTML = oldChats;
        document.body.classList.add("chat-start");
        document.getElementById("empty").style.display = "none";
    }
};


// ================= UI ACTIVATION =================
function activateChatUI() {
    document.body.classList.add("chat-start");
}


// ================= SEND MESSAGE =================
async function sendMessage() {

    const input = document.getElementById("message-input");
    const chatBox = document.getElementById("chat-box");

    const message = input.value.trim();
    if (!message) return;

    // 👉 THIS FIXES YOUR CONFUSION
    activateChatUI();

    // user message
    chatBox.innerHTML += `
        <div class="message user">${message}</div>
    `;

    input.value = "";

    // bot placeholder
    const botId = "bot-" + Date.now();

    chatBox.innerHTML += `
        <div class="message bot" id="${botId}"></div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;

    // API CALL
    const response = await fetch("/chat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ message })
    });

    const data = await response.json();

    typeText(botId, data.reply);
}


// ================= TYPING EFFECT =================
function typeText(id, text) {

    const el = document.getElementById(id);
    el.innerText = "";

    text = text.replace(/\s+/g, " ").trim();

    const words = text.split(" ");
    let i = 0;

    const typing = setInterval(() => {

        if (i < words.length) {
            el.innerText += (i === 0 ? "" : " ") + words[i];
            i++;
        } else {
            clearInterval(typing);
            saveChat();
        }

    }, 60);
}


// ================= SAVE CHAT =================
function saveChat() {
    const chatBox = document.getElementById("chat-box");
    localStorage.setItem("chat_history", chatBox.innerHTML);
}


// ================= CLEAR CHAT =================
function clearChat() {
    localStorage.removeItem("chat_history");
    document.getElementById("chat-box").innerHTML = "";
    document.getElementById("empty").style.display = "flex";
    document.body.classList.remove("chat-start");
}


// ================= ENTER KEY =================
document.getElementById("message-input")
.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
        e.preventDefault();
        sendMessage();
    }
});