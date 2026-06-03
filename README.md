Website: https://logan20063.github.io/WSserver

# A homemade chatroom made to somewhat resemble pictochat made with HTML, CSS, and JS to a JS server via WebSockets

# Frontend Features:
- Real-time messaging
- Multiple chatrooms
- Dynamic userlist for rooms and server
- Username validation
- Direct Messages
- Message Validation

# Backend Features:
- Connection through WebSockets
- Internal Protocol
- Serverside Commands and Broadcasting

# UI:
<img width="2896" height="1446" alt="image" src="https://github.com/user-attachments/assets/0e20205d-de28-4580-b263-6575e57842c3" />

# Serverside:
<img width="442" height="376" alt="image" src="https://github.com/user-attachments/assets/3af33ccb-d22c-4eef-9c74-56a492fd50e6" />


# How to use client:
1. Go to logan20063.github.io/WSsever
2. Ask for a WebSockets link
3. Enter the link
4. Pick a username and room
5. Enjoy!

# How to run Server:
1. `git clone https://github.com/Logan20063/WSserver.git`
2. `cd WSserver`
3. `npm install`
4. `node server/server.js`
5. (In a different terminal) `cloudflared tunnel --url http://localhost:8000`
6. Send out the URL you get from the quick tunnel replacing https with wss

# Architecture
Client (HTML/CSS/JS) <-> Quick Cloudflare Tunnel <-> WebSockets <-> Server(JS)

# Future Improvements
- Username Colors
- Nicknames
- Replies
- Separate DM's/DM History

# What I Learned
- How to run a server
- How to have separate programs interact with each other
- How to create a protocol through JSON
- Event-Driven Programming
