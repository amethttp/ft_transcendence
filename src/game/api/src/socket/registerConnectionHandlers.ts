import { Server } from "socket.io";
import { AuthenticatedSocket } from "../match/models/AuthenticatedSocket";
import { RoomService } from "../match/services/RoomService";
import { PlayerState } from "../match/models/PlayerState";

export function registerConnectionHandlers(io: Server, roomService: RoomService) {
  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`\nClient: ${socket.username} connected`);

    socket.on("joinMatch", async (token) => {
      try {
        let gameRoom = roomService.getRoom(token);
        if (gameRoom) {
          await roomService.syncRoomExpectedUsers(socket.cookie, gameRoom);
          if (!gameRoom.hasExpectedUser(socket.userId)) {
            console.warn(`joinMatch rejected: user ${socket.username}(${socket.userId}) is not part of match ${token}`);
            throw "User is not part of this match";
          }
          gameRoom.joinPlayer(socket);
          const modePlayerAdded = roomService.ensureModePlayers(gameRoom);
          if (modePlayerAdded) {
            io.to(socket.id).emit("reset");
          }
          roomService.cancelDisconnectTimeout(gameRoom.token);
          gameRoom.resetPlayersState();
          socket.broadcast.to(gameRoom.token).emit("reset");
          console.log("Players connected successfully:", gameRoom.players);
        } else {
          gameRoom = await roomService.newRoom(socket.cookie, token);
          if (!gameRoom.hasExpectedUser(socket.userId)) {
            console.warn(`joinMatch rejected: user ${socket.username}(${socket.userId}) is not part of match ${token}`);
            throw "User is not part of this match";
          }
          gameRoom.addHumanPlayer(socket);
          const modePlayerAdded = roomService.ensureModePlayers(gameRoom);
          if (modePlayerAdded) {
            io.to(socket.id).emit("reset");
          }
          console.log(`Player ${socket.username} is waiting for a match.`);
        }
        if (gameRoom.gameEnded()) {
          io.to(socket.id).emit("end", gameRoom.matchScore);
          gameRoom.deletePlayer(socket.id);
          throw "Game already ended";
        }
      } catch (error) {
        console.log(error);
        if (error === "User is not part of this match") {
          io.to(socket.id).emit("message", "You are not part of this match.");
        } else if (error instanceof Error) {
          io.to(socket.id).emit("message", "Could not join match.");
        }
        socket.disconnect();
      }
    });

    socket.on("ready", (token) => {
      const room = roomService.getRoom(token);
      if (!room || room.gameEnded()) {
        return;
      }
      
      // In ONLINE mode, need 2 players. In LOCAL/AI mode, 1 human + 1 AI/LOCAL is enough
      const isOnlineMode = room.mode === 1; // MatchMode.ONLINE
      if (isOnlineMode && room.playersAmount() === 1) {
        return;
      }
      
      const player = room.getPlayer(socket.id);
      if (!player) {
        return;
      }
      if (player.state === PlayerState.READY) {
        return;
      }

      player.state = PlayerState.READY;
      io.to(socket.id).emit("ready");
      socket.broadcast.to(room.token).emit("message", `${socket.username} is ready to play!`);
      if (room.allPlayersReady()) {
        console.log("Starting match...");
        roomService.startMatch(socket, room);
      }
    });

    socket.on("paddleChange", (data) => {
      const room = roomService.getRoom(data.token);
      if (!room) {
        return;
      }
      room.setPaddleChange(socket, data.key, data.isPressed);
    });

    socket.on("disconnecting", async (reason: string) => {
      console.log(`Client: ${socket.id} is disconnecting | ${reason}`);
      const activeRooms = socket.rooms;
      for (const token of activeRooms.values()) {
        const room = roomService.getRoom(token);
        if (room) {
          roomService.playerDisconnect(socket, room);
        } else {
          socket.leave(token);
        }
      }
    });

    socket.on("disconnect", (reason: string) => {
      socket._cleanup();
      socket.disconnect(true);
      console.log(`Client: ${socket.id} disconnected | ${reason}`);
    });
  });
}
