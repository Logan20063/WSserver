const ws = new WebSocket("wss://purchase-camping-arts-exports.trycloudflare.com");

const messages = document.getElementById("messages");
const messageinput = document.getElementById("messageinput");
const messagesend = document.getElementById("messagesend");

ws.onopen = () => {
    messages.innerHTML += `<div>Connected To Server</div>`
};

ws.onmessage = (event) => {
    messages.innerHTML += `<div>${event.data}</div>`;
};

messagesend.onclick = () => {
    ws.send(messageinput.value);
    messageinput.value = "";
};

messageinput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        messagesend.click();
    }
});