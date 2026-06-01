import WebSocket, { WebSocketServer } from "ws";
import { Temporal } from "@js-temporal/polyfill";

const sockets = new Set();
const bannedUsers = new Set();
const rooms = ["A", "B", "C", "D"];

const server = new WebSocketServer({ port: 8000, host: "0.0.0.0"});

server.on("connection", (socket) => {
    console.log(getTime() + "User Connected")

    sockets.add(socket);

    socket.name = undefined;
    socket.room = undefined;

    socket.send("Pick a username:\r\n")

    socket.on("message", (data) => {
        if(socket.name == undefined){
            let potentialName = data.toString().trim()
            if(potentialName == "") {
                socket.send("You Must Pick A Name\r\n");
                return;
            }
            if(bannedUsers.has(potentialName)) {
                socket.send("You have been banned\r\n");
                socket.terminate();
            }
            if(potentialName.includes(" ")) {
                socket.send("Name cannot have spaces\r\n");
                return;
            }
            let user = findUser(potentialName);
            if(user != undefined) {
                socket.send("Username already in use\r\n");
                return;
            }
            //Setting Name
            socket.name = data.toString().trim();
            console.log(getTime() + socket.name + " Joined");
            socket.send("Pick a room\r\n");
            socket.send("Available Rooms are:" + listRooms() + "\r\n");
        } else if(socket.room == undefined) {
            if(rooms.includes(data.toString().trim())) {
                socket.room = data.toString().trim()
                socket.send("Welcome " + socket.name + "\r\n");
                console.log(getTime() + socket.name, "joined room", socket.room);
            } else {
                socket.send("Invalid Room\r\n")
            }
        } else {
            data =  data.toString().trim()
            
            //Commands
            if(data.charAt(0) == '/')
            {
                const args = data.split(' ');

                switch(args[0]) {
                    case "/users":
                        console.log(getTime() + socket.name + " Checked Room Users")
                        socket.send(users(socket.room) + "\r\n");
                        break;
                    case "/allusers":
                        console.log(getTime() + socket.name + " Checked Users")
                        socket.send(users() + "\r\n");
                        break;
                    case "/quit":
                        socket.send("Goodbye\r\n", () => {
                            socket.close();
                        });
                        break;
                    case "/changename":
                        if(args.size == 1) {
                            socket.send("You must pick a new name\r\n");
                        } else {
                            if(bannedUsers.has(args[1])) {
                                socket.send("Invalid Name\r\n");
                                break;
                            }
                            let validUser = findUser(args[1]);
                            if(validUser != undefined) {
                                socket.send("Invalid Name\r\n");
                            } else {
                                socket.send("Name Sucesfully Changed\r\n");
                                console.log(getTime() + socket.name + " Changed names to " + args[1]);
                                socket.name = args[1];
                            }
                        }
                        break;
                    case "/dm":
                        if(args.size < 3) {
                            socket.send("You need a message and user\r\n");
                            break;
                        }
                        let user = findUser(args[1]);
                        if(user == undefined) {
                            socket.send("User Doesn't Exist");
                            break;
                        }
                        let message = parseArray(args);
                        user.send("<Private>" + socket.name + ":" + message + "\r\n");
                        console.log(getTime() + socket.name + "(To " + args[1] + "):" + message);
                        break;
                    case "/changeroom":
                        if(args.size == 1) {
                            socket.send("You must add a room to join\r\n");
                        } else if(rooms.includes(args[1])) {
                            socket.room = args[1];
                            console.log(socket.name, "moved to", socket.room);
                            socket.send("You moved to " + socket.room + "\r\n");
                        } else {
                            socket.send("You must move to a valid room\r\n");
                            socket.send("Available Rooms are:" + listRooms() + "\r\n");
                        }
                        break;
                    default:
                        socket.send("Unknown Command: " + args[0] + "\r\n");
                }  
                return;
            }

            //Regular Messages
            let text = socket.name + ":" + data;
            console.log(getTime() + "[" + socket.room + "]" + text);
            sockets.forEach((endingSocket) => {
                if(socket.room == endingSocket.room) {
                    endingSocket.send(text + "\r\n");
                }
            })
            //Server Ack(Too much clutter rn)
            //socket.send("The server has recieved and sent out the message\r\n");
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
                    socket.send("You have been banned");
                } else {
                    socket.send("You have been kicked");
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
            socket.send("Server Closed", () => {
                socket.close();
            })
        }
        process.stdin.pause();
        server.close();
        return;
    }
    const msg = "SERVER: " + data;

    sockets.forEach((socket) => {
        socket.send(msg);
    });
});

function users(room = undefined) {
    if(sockets.size == 0) {
        return "No Online Users";
    }
    let ret = "Current Users: ";
    sockets.forEach((socket) => {
        if(room == undefined || socket.room == room) {
            ret += socket.name;
            ret += ", ";
        }
    })
    ret = ret.slice(0,-2);
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

function parseArray(arr) {
    let text = "";
    for(let i=2; i < arr.length; i++) {
        text += arr[i];
        text += " ";
    }
    return text.slice(0, -1);
}

function listRooms() {
    let text = "";
    for(let i=0; i < rooms.length; i++) {
        text += rooms[i];
        text += ", ";
    }
    text = text.slice(0, -2);
    return text;
}