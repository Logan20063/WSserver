let ws = undefined;
//let getUsers = undefined;
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

const quit = document.getElementById("quit");

messagesend.onclick = () => {
    if(messageinput.value.trim() != "") {
        const sendmessage = {type: "message", body: messageinput.value};
        ws.send(JSON.stringify(sendmessage));
        messageinput.value = "";
    }
};

messageinput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        messagesend.click();
    }
});

usernameButton.onclick = () => {
    ws.send(JSON.stringify({type: "command", command: "changename", params: [usernameInput.value]}));
}

usernameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        usernameButton.click();
    }
});

roomButton.onclick = () => {
    ws.send(JSON.stringify({type: "command", command: "changeroom", params: [roomInput.value]}));
}

dmbutton.onclick = () => {
    if(dmtext.value.trim() != "") {
        ws.send(JSON.stringify({type: "dm", user: allUsers.value, body: dmtext.value}));
        dmtext.value = "";
    }

}

dmtext.addEventListener("keydown", (e) => {
    if(e.key === "Enter") {
        dmbutton.click();
    }
});

quit.onclick = () => {
    ws.send(JSON.stringify({type: "command", command: "quit"}));
}

connect.onclick = () => {
    try {
        ws = new WebSocket(website.value);
    } catch (error) {
        const entry = document.getElementById("entry");
        const div = document.createElement("div")
        div.textContent = website.value + " could not connect";
        entry.append(div);
        return;
    }

    ws.onopen = () => {
        ws.send(JSON.stringify({type: "command", command: "allrooms"}));
        startdiv.style.display = "none";
        enddiv.style.display = "flex";
        messages.innerHTML += `<div>Connected To Server</div>`
        // getUsers = setInterval(() => {
        //     ws.send(JSON.stringify({type: "command", command: "users"}));
        //     ws.send(JSON.stringify({type: "command", command: "allusers"}));
        // }, 5000)
    };

    ws.onmessage = (event) => {
        const packet = JSON.parse(event.data);
        if(packet.type == "message") {
            const div = document.createElement("div");
            div.textContent = packet.body;
            messages.append(div);
            messages.scrollTop = messages.scrollHeight;
        } else if(packet.type == "dm") {
            const div = document.createElement("div");
            div.textContent = packet.body;
            dms.append(div);
            dms.scrollTop = dms.scrollHeight;
        } else if(packet.type == "users") {
            if(packet.many == "all") {
                let oldUser = allUsers.value;
                allUsers.innerHTML = "";
                for(const user of packet.users) {
                    allUsers.innerHTML += "<option value=\"" + user + "\">" + user + "</option>"
                }
                allUsers.value = oldUser
            } else if(packet.many == "room") {
                console.log(packet);
                roomUsers.innerHTML = "";
                for(const user of packet.users) {
                    roomUsers.innerHTML += "<div>" + user + "</div>";
                }
            } else if(packet.many == "rooms") {
                roomInput.innerHTML = "";
                for(const room of packet.users) {
                    roomInput.innerHTML += "<option value=\"" + room + "\">" + room + "</option>"
                }
            } else if(packet.many == "history") {
                for(const message of packet.users) {
                    const div = document.createElement("div");
                    div.textContent = message;
                    messages.append(div);
                }
            }
        } else if(packet.type == "room") {
            currentroom.innerHTML = "Current Room: " + packet.room;
            messages.innerHTML = "";
            ws.send(JSON.stringify({type: "command", command: "users"}));
        }
    };

    ws.onerror = (event) => {
        const entry = document.getElementById("entry");
        const div = document.createElement("div")
        div.textContent = website.value + " could not connect";
        entry.append(div);
        return;
    };

    ws.onclose = (event) => {
        //clearInterval(getUsers);
        messages.innerHTML += "<div>Disconnected From Server</div>";
        setTimeout(() => {
            startdiv.style.display = "block";
            enddiv.style.display = "none";
        }, 10000)
    }
}

// function checkOrientation() {
//     if (window.innerHeight > window.innerWidth) {
//         document.body.innerHTML =
//             "<h1>Please rotate your device to landscape.</h1>";
//     }
// }

// window.addEventListener("resize", checkOrientation);
// checkOrientation();