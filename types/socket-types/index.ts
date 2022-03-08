import {
  IRoomObject,
} from "what-the-trivia-types";

interface IJoinRoomObject {
  roomCode: string;
  name: string;
}

interface IUserJoinedObject {
  successful: boolean;
  room: IRoomObject;
}

export interface ServerToClientEvents {
  userJoined: (userJoiendObject: IUserJoinedObject) => void;
  gameStarted: (room: IRoomObject) => void;
  gameUpdate: (room: IRoomObject) => void;
}

export interface ClientToServerEvents {
  verifyRoom: (roomCode: string, cb: Function) => void;
  joinRoom: (joinRoomObject: IJoinRoomObject, cb: Function) => void;
  startGame: (roomId: string, cb: Function) => void;
  startNextQuestion: (roomId: string) => void;
  answerSubmitted: (roomId: string, userId: number, answer: string) => void;
  expireCurrentQuestion: (roomId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}
