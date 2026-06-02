let ws = undefined;
let getUsers = undefined;
//const ws = new WebSocket("wss://purchase-camping-arts-exports.trycloudflare.com");

const startdiv = document.getElementById("entry");
const enddiv = document.getElementById("chatroom");
const website = document.getElementById("website");
const connect = document.getElementById("connect");

const messages = document.getElementById("messages");
const messageinput = document.getElementById("messageinput");
const messagesend = document.getElementById("messagesend");

const dms = document.getElementById("dmmessages");

const roomUsers = document.getElementById("currentusers");
const allUsers = document.getElementById("pickuser");

const usernameInput = document.getElementById("changename");
const usernameButton = document.getElementById("changeNameButton");

const roomInput = document.getElementById("changeroom");
const roomButton = document.getElementById("changeRoomButton");

const dmtext = document.getElementById("dminput");
const dmbutton = document.getElementById("sendDmButton");

const currentroom = document.getElementById("currentroom");

messagesend.onclick = () => {
    const sendmessage = {type: "message", body: messageinput.value};
    ws.send(JSON.stringify(sendmessage));
    messageinput.value = "";
};

messageinput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        messagesend.click();
    }
});

usernameButton.onclick = () => {
    ws.send(JSON.stringify({type: "command", command: "changename", params: [usernameInput.value]}));
}

roomButton.onclick = () => {
    ws.send(JSON.stringify({type: "command", command: "changeroom", params: [roomInput.value]}));
}

dmbutton.onclick = () => {
    ws.send(JSON.stringify({type: "dm", user: allUsers.value, body: dmtext.value}));
}

connect.onclick = () => {
    ws = new WebSocket(website.value);

    ws.onopen = () => {
        ws.send(JSON.stringify({type: "command", command: "allrooms"}));
        startdiv.style.display = "none";
        enddiv.style.display = "flex";
        messages.innerHTML += `<div>Connected To Server</div>`
        getUsers = setInterval(() => {
            ws.send(JSON.stringify({type: "command", command: "users"}));
            ws.send(JSON.stringify({type: "command", command: "allusers"}));
        }, 5000)
    };

    ws.onmessage = (event) => {
        const packet = JSON.parse(event.data);
        if(packet.type == "message") {
            messages.innerHTML += `<div>${packet.body}</div>`;
            //messages.scrollTop = messages.scrollHeight;
        } else if(packet.type == "dm") {
            dms.innerHTML += `<div>${packet.body}</div>`;
            console.log(packet);
        } else if(packet.type == "users") {
            if(packet.many == "all") {
                allUsers.innerHTML = "";
                for(const user of packet.users) {
                    allUsers.innerHTML += "<option value=\"" + user + "\">" + user + "</option>"
                }
            } else if(packet.many == "room") {
                roomUsers.innerHTML = "";
                for(const user of packet.users) {
                    roomUsers.innerHTML += "<div>" + user + "</div>";
                }
            } else if(packet.many == "rooms") {
                roomInput.innerHTML = "";
                for(const room of packet.users) {
                    roomInput.innerHTML += "<option value=\"" + room + "\">" + room + "</option>"
                }
            }
        } else if(packet.type == "room") {
            currentroom.innerHTML = "Current Room: " + packet.room;
            messages.innerHTML = "";
            ws.send(JSON.stringify({type: "command", command: "users"}));
        }
    };

    ws.onclose = (event) => {
        clearInterval(getUsers);
        messages.innerHTML += "<div>Disconnected From Server</div>";
    }
}