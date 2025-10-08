import { Socket } from "socket.io";

export interface AuthenticatedSocket extends Socket {
  username?: string;
}