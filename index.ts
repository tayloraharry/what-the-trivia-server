import { Server } from "socket.io";
import express from "express";
import path from "path";
import cors from "cors";
import { createServer } from "http";
import { RoomObject } from "what-the-trivia-types";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
} from "./types/socket-types";
import { getQuestions } from "./api/trivia";

const port = process.env.PORT || 5000;

const app = express();
app.set("port", port);
app.use(cors());

const http = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents
>(http, {
  cors: {
    origin: "*",
  },
});

app.use(express.static(path.resolve(__dirname, "./client/build")));

let rooms: Array<RoomObject> = [];

io.on("connection", (socket) => {
  getQuestions().then((questions) => {
    const newRoom = new RoomObject(socket.id, questions);
    rooms.push(newRoom);
    socket.emit("gameUpdate", newRoom);
  });

  //TODO add error handling when trivia api fails

  socket.on("verifyRoom", (roomCode, cb) => {
    cb(
      rooms.filter((r) => r.code === roomCode && r.started === false).length ===
        1
    );
  });

  socket.on("joinRoom", (joinRoomObject, cb) => {
    const { roomCode, name } = joinRoomObject;
    const room = rooms.filter((r) => r.code === roomCode)[0];
    try {
      socket.join(room.id);
      const userJoined = room.joinGame(name);
      if (userJoined) {
        const user = room.getNewestUser();
        cb(true, user, room);
        socket.to(room.id).emit("gameUpdate", room);
      } else {
        cb(false, null, null);
      }
    } catch (error) {
      console.error(`${name} could not join ${room.code}`);
      cb(false, null, null);
    }
  });

  socket.on("startGame", (roomCode, cb) => {
    const room = rooms.filter((r) => r.code === roomCode)[0];
    room.startGame();
    io.in(room.id).emit("gameUpdate", room);
    cb(room);
  });

  socket.on("startNextQuestion", (roomId) => {
    const room = rooms.filter((r) => r.id === roomId)[0];
    room.setNextQuestion();
    io.in(room.id).emit("gameUpdate", room);
  });

  socket.on("answerSubmitted", (roomId, userId, answer) => {
    const room = rooms.filter((r) => r.id === roomId)[0];
    room.submitAnswer(userId, answer);
    io.in(room.id).emit("gameUpdate", room);
  });
  
  socket.on("expireCurrentQuestion", (roomId) => {
    const room = rooms.filter((r) => r.id === roomId)[0];
    room.expireCurrentQuestion();
    io.in(room.id).emit("gameUpdate", room);
  });
  
});

http.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
