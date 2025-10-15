import { randomInt } from "crypto";
import { Snapshot } from "../models/Snapshot";
import { BallChange } from "../models/BallChange";
import { PaddleChange } from "../models/PaddleChange";

const MAX_VEL = 5;

export class MatchService {
  public static updatePaddle(snapshot: Snapshot, paddle: number, key: string) {
    let change = 1;
    if (key === "w") {
      change = -1;
    } else if (key !== "s") { return; }

    snapshot.paddles[paddle].position += (change * 10);
  }

  private static isWithinPaddle(ball: BallChange, paddle: PaddleChange): boolean {
    const paddleSize = 100;
    
    const topRange = ball.position.y - paddle.position;
    if (topRange < 0) { return false; }
    
    const bottomRange = (paddle.position + paddleSize) - ball.position.y;
    if (bottomRange < 0) { return false; }
    
    return true;
  }

  public static updateBall(snapshot: Snapshot) {
    if (snapshot.ball.position.x < 10 && this.isWithinPaddle(snapshot.ball, snapshot.paddles[0])) {
      snapshot.ball.position.x = 10;
      snapshot.ball.direction.x = 1;
      snapshot.ball.velocity = Math.min(snapshot.ball.velocity + 1, MAX_VEL);
    } else if (snapshot.ball.position.x > 490 && this.isWithinPaddle(snapshot.ball, snapshot.paddles[1])) {
      snapshot.ball.position.x = 490;
      snapshot.ball.direction.x = -1;
      snapshot.ball.velocity = Math.min(snapshot.ball.velocity + 1, MAX_VEL);
    }

    if (snapshot.ball.position.y < 0) {
      snapshot.ball.position.y = 0;
      snapshot.ball.direction.y = 1;
      snapshot.ball.velocity = Math.min(snapshot.ball.velocity + 1, MAX_VEL);
    } else if (snapshot.ball.position.y > 500) {
      snapshot.ball.position.y = 500;
      snapshot.ball.direction.y = -1;
      snapshot.ball.velocity = Math.min(snapshot.ball.velocity + 1, MAX_VEL);
    }

    snapshot.ball.position.x += (snapshot.ball.direction.x * snapshot.ball.velocity);
    snapshot.ball.position.y += (snapshot.ball.direction.y * snapshot.ball.velocity);
  }

  public static checkGoal(snapshot: Snapshot) {
    if (snapshot.ball.position.x >= 500) {
      snapshot.score[0]++;
    } else if (snapshot.ball.position.x <= 0) {
      snapshot.score[1]++;
    } else {
      return;
    }

    snapshot.ball.position.x = 250;
    snapshot.ball.position.y = 250;
    const dx = ((randomInt(5) / 10) * 2) - 1;
    const dy = ((randomInt(5) / 10) * 2) - 1;
    const magnitude = Math.sqrt(dx*dx + dy*dy);

    snapshot.ball.direction.x = dx / magnitude;
    snapshot.ball.direction.y = dy / magnitude;
    snapshot.ball.velocity = 10;
  }

  public static checkEndState(snapshot: Snapshot, maxScore: number): boolean {
    if (snapshot.score[0] === maxScore || snapshot.score[1] === maxScore) {
      return true;
    }

    return false;
  }
}
