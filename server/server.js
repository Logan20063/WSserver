import WebSocket, { WebSocketServer } from "ws";
import { Temporal } from "@js-temporal/polyfill";

const sockets = new Set();
const bannedUsers = new Set();
const rooms = ["A", "B", "C", "D"];

const server = new WebSocketServer({ port: 8000, host: "0.0.0.0"}, () => {
    console.log(getTime() + "Server Started");
});

server.on("connection", (socket) => {
    console.log(getTime() + "User Connected")

    sockets.add(socket);

    socket.name = undefined;
    socket.room = undefined;

    socket.send(JSON.stringify({type: "message", body: "Pick a username and room\r\n"}));

    socket.on("message", (data) => {
        data = JSON.parse(data.toString())

        if(data.type == "message") {
            if(socket.name == undefined) {
                socket.send(JSON.stringify({type: "message", body: "You must pick a name before chatting\r\n"}));
                return;
            }
            if(socket.room == undefined) {
                socket.send(JSON.stringify({type: "message", body: "You must pick a room before chatting\r\n"}));
                return;
            }
            data = data.body.trim()
            let text = socket.name + ": " + data;
            console.log(getTime() + "[" + socket.room + "]" + text);
            sockets.forEach((endingSocket) => {
                if(socket.room == endingSocket.room) {
                    endingSocket.send(JSON.stringify({type: "message", body: text + "\r\n"}));
                }
            })
            return;
        } else if(data.type == "dm") {
            let user = findUser(data.user);
            if(user == undefined) {
                socket.send(JSON.stringify({type: "dm", body: "User Doesn't Exist"}));
                return;
            }
            user.send(JSON.stringify({type: "dm", body: socket.name + ": " + data.body.trim() + "\r\n"}));
            console.log(getTime() + socket.name + "(To " + data.user + "):" + data.body.trim());
            return;
        } else if(data.type == "command") {
            switch(data.command) {
                case "changename":
                    let potentialName = data.params[0];
                    if(potentialName == "") {
                        socket.send(JSON.stringify({type: "message", body: "You Must Pick A Name\r\n"}));
                        return;
                    }
                    if(bannedUsers.has(potentialName)) {
                        socket.send(JSON.stringify({type: "message", body: "You have been banned\r\n"}));
                        socket.terminate();
                    }
                    if(potentialName.includes(" ")) {
                        socket.send(JSON.stringify({type: "message", body: "Name cannot have spaces\r\n"}));
                        return;
                    }
                    let user = findUser(potentialName);
                    if(user != undefined) {
                        socket.send(JSON.stringify({type: "message", body: "Username already in use\r\n"}));
                        return;
                    }
                    if(socket.name == undefined) {
                        socket.name = potentialName;
                        console.log(getTime() + socket.name + " Joined");
                        socket.send(JSON.stringify({type: "message", body: "Welcome " + socket.name}));
                    } else {
                        socket.send(JSON.stringify({type: "message", body: "Name Sucesfully Changed\r\n"}));
                        console.log(getTime() + socket.name + " Changed names to " + potentialName);
                        socket.name = potentialName;
                    }                
                    break;
                case "changeroom":
                    if(rooms.includes(data.params[0])) {
                        socket.room = data.params[0]
                        socket.send(JSON.stringify({type: "room", room: socket.room}));
                        socket.send(JSON.stringify({type: "message", body: "Welcome " + socket.name + "\r\n"}))
                        console.log(getTime() + socket.name, "joined room", socket.room);
                    } else {
                        socket.send(JSON.stringify({type: "message", body: "Invalid Room\r\n"}))
                    }
                    break;
                case "users":
                    socket.send(JSON.stringify({type: "users", many: "room", users: users(socket.room)}));
                    break;
                case "allusers":
                    socket.send(JSON.stringify({type: "users", many: "all", users: users()}));
                    break;
                case "quit":
                    socket.send(JSON.stringify({type: "message", body: "Goodbye\r\n"}), () => {
                        socket.close();
                    });
                    break;
                case "allrooms":
                    socket.send(JSON.stringify({type: "users", many: "rooms", users: listRooms()}));
                    break;
            }
        }
    });

    socket.on("end", () => {
        console.log(getTime() + socket.name + " ended connection");
    });

    socket.on("close", () => {
        //Deletes user from set
        sockets.delete(socket);
        console.log(getTime() + socket.name + " Disconnected");
    });

    socket.on("error", (err) => {
        console.log(getTime() + socket.name + " Socket Error:", err.message);
    })
})

server.on('error', (err) => {
    console.error("Server error:", err.message);
});

process.stdin.on("data", (data) => {
    data = data.toString().trim()
    let arr = data.split(" ")
    if(data == "/users") {
        console.log(getTime() + users());
        return;
    } else if(arr[0] === "/kick" || arr[0] === "/ban") {
        if(arr.length != 2) {
            console.log("Must include exactly one person to kick")
        }
        for(const socket of sockets) {
            if(socket.name === arr[1]) {
                if(arr[0] === "/ban") {
                    bannedUsers.add(arr[1]);
                    socket.send(JSON.stringify({type: "message", body: "You have been banned"}));
                } else {
                    socket.send(JSON.stringify({type: "message", body: "You have been kicked"}));
                }
                socket.terminate();
                if(arr[0] === "/ban") {
                    bannedUsers.add(arr[1]);
                }
                return;
            }
        }
        console.log("No user found with that username");
        return;
    } else if(arr[0] == "/close") {
        console.log(getTime() + "Closing the server")
        for(const socket of sockets) {
            socket.send(JSON.stringify({type: "message", body: "Server Closed"}), () => {
                socket.close();
            })
        }
        process.stdin.pause();
        server.close();
        return;
    }
    const msg = "SERVER: " + data;

    sockets.forEach((socket) => {
        socket.send(JSON.stringify({type: "message", body: msg}));
    });
});

function users(room = undefined) {
    let ret = [];
    sockets.forEach((socket) => {
        if(room == undefined || socket.room == room) {
            ret.push(socket.name);
        }
    })
    return ret;
}

function getTime() {
    const time = Temporal.Now.plainTimeISO();
    return "[" + time.hour + ":" + time.minute + ":" + time.second + "]";
}

function findUser(username) {
    let ret = undefined;
    sockets.forEach((user) => {
        if(user.name === username) {
            ret = user;
        }
    })
    return ret
}

function listRooms() {
    let text = [];
    for(let i=0; i < rooms.length; i++) {
        text.push(rooms[i]);
    }
    return text;
}