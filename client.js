let ws;
//const ws = new WebSocket("wss://purchase-camping-arts-exports.trycloudflare.com");

const startdiv = document.getElementById("entry");
const enddiv = document.getElementById("chatroom");
const website = document.getElementById("website");
const connect = document.getElementById("connect");

const messages = document.getElementById("messages");
const messageinput = document.getElementById("messageinput");
const messagesend = document.getElementById("messagesend");

messagesend.onclick = () => {
    ws.send(messageinput.value);
    messageinput.value = "";
};

messageinput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        messagesend.click();
    }
});

connect.onclick = () => {
    ws = new WebSocket(website.value);

    ws.onopen = () => {
        startdiv.style.display = "none";
        enddiv.style.display = "flex";
        messages.innerHTML += `<div>Connected To Server</div>`
    };

    ws.onmessage = (event) => {
        messages.innerHTML += `<div>${event.data}</div>`;
    };
}