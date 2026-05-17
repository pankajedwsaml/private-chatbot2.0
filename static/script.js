let chats = {};
let currentChat = null;

/* LOAD */
window.onload = function () {

    const saved = localStorage.getItem("all_chats");
    if (saved) chats = JSON.parse(saved);

    renderSidebar();

    const first = Object.keys(chats)[0];
    if (first) loadChat(first);

    document.getElementById("message-input")
    .addEventListener("keydown", function(e){
        if(e.key === "Enter"){
            e.preventDefault();
            sendMessage();
        }
    });
};

/* NEW CHAT */
function newChat(){

    const id = "chat_" + Date.now();

    chats[id] = {
        title:"New Chat",
        messages:[],
        pinned:false
    };

    currentChat = id;

    save();
    renderSidebar();
    loadChat(id);
}

/* LOAD CHAT */
function loadChat(id){

    currentChat = id;

    const box = document.getElementById("chat-box");
    box.innerHTML = "";

    document.getElementById("empty").style.display = "none";

    chats[id].messages.forEach(m=>{
        addMessage(m.role, m.text);
    });
    document.getElementById("sidebar")
    .classList.remove("open");
}

/* SEND MESSAGE */
async function sendMessage(){

    const input = document.getElementById("message-input");
    const text = input.value.trim();
    if(!text || !currentChat) return;

    input.value = "";

    addMessage("user", text);

    const botId = "bot_" + Date.now();
    addMessage("bot", "...", botId);

    const res = await fetch("/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({message:text})
    });

    const data = await res.json();

    typeText(botId, data.reply);

    chats[currentChat].messages.push({role:"user",text});
    chats[currentChat].messages.push({role:"bot",text:data.reply});

    save();
}

/* ADD MESSAGE */
function addMessage(role,text,id=null){

    const box = document.getElementById("chat-box");

    const div = document.createElement("div");
    div.className = "message "+role;
    div.id = id || "";

    div.innerText = text;

    box.appendChild(div);

    box.scrollTop = box.scrollHeight;
}

/* TYPE EFFECT */
function typeText(id,text){

    const el = document.getElementById(id);
    if(!el) return;

    el.innerText = "";

    let words = text.split(" ");
    let i = 0;

    let interval = setInterval(()=>{

        if(i < words.length){
            el.innerText += (i===0?"":" ") + words[i];
            i++;
        } else {
            clearInterval(interval);
        }

    },40);
}

/* RENDER SIDEBAR */
function renderSidebar(){

    const sidebar = document.getElementById("sidebar");
    sidebar.innerHTML = "";

    Object.keys(chats).forEach(id=>{

        const div = document.createElement("div");
        div.className = "chat-item";

        div.innerHTML = `
            <div class="chat-title"
                 onclick="loadChat('${id}')">

                 ${chats[id].pinned ? "📌 " : ""}
                 ${chats[id].title}

            </div>

            <button class="dots-btn"
                    onclick="toggleMenu(event,'${id}')">
                ⋮
            </button>

            <div class="chat-menu"
                 id="menu-${id}">

                <div onclick="renameChat('${id}')">
                    Rename
                </div>

                <div onclick="pinChat('${id}')">
                    Pin
                </div>

                <div onclick="deleteChat('${id}')">
                    Delete
                </div>

            </div>
        `;

        sidebar.appendChild(div);
    });
}
/* RENAME */
function renameChat(id){
    let name = prompt("Rename chat:");
    if(name) chats[id].title = name;
    save();
    renderSidebar();
}

/* PIN */
function pinChat(id){
    chats[id].pinned = !chats[id].pinned;
    save();
    renderSidebar();
}

/* DELETE */
function deleteChat(id){
    delete chats[id];
    save();
    renderSidebar();
}

/* SAVE */
function save(){
    localStorage.setItem("all_chats", JSON.stringify(chats));
}
function toggleSidebar(){
    document.getElementById("sidebar").classList.toggle("open");

    let overlay = document.getElementById("overlay");

    if(!overlay){
        overlay = document.createElement("div");
        overlay.id = "overlay";
        overlay.className = "overlay";
        document.body.appendChild(overlay);

        overlay.onclick = toggleSidebar;
    }

    overlay.classList.toggle("show");
}
function toggleMenu(event,id){

    event.stopPropagation();

    // close all menus first
    document.querySelectorAll(".chat-menu").forEach(menu=>{
        menu.style.display = "none";
    });

    const menu = document.getElementById("menu-" + id);

    if(menu.style.display === "block"){
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }
}
function toggleSidebar(){

    const sidebar =
        document.getElementById("sidebar");

    sidebar.classList.toggle("open");
}
document.addEventListener("click", function(){

    document
    .querySelectorAll(".chat-menu")
    .forEach(menu=>{

        menu.style.display = "none";

    });

});
document
.getElementById("chat-box")

.addEventListener(

    "click",

    function(){

        document
        .getElementById("sidebar")
        .classList.remove("open");

    }

);