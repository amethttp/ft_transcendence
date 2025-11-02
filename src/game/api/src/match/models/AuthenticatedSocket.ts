import { Socket } from "socket.io";

export interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
  cookie?: string;
}