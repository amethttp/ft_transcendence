import { randomInt } from "crypto";
import { Snapshot } from "../models/Snapshot";

export class MatchService {
  public static updateBall(snapshot: Snapshot) {
    if (snapshot.ball.position.x < 0) {
      snapshot.ball.direction.x = 1;
      snapshot.ball.velocity += 1;
    } else if (snapshot.ball.position.x > 400) {
      snapshot.ball.direction.x = -1;
      snapshot.ball.velocity += 1;
    }

    if (snapshot.ball.position.y < 0) {
      snapshot.ball.direction.y = 1;
      snapshot.ball.velocity += 1;
    } else if (snapshot.ball.position.y > 400) {
      snapshot.ball.direction.y = -1;
      snapshot.ball.velocity += 1;
    }

    snapshot.ball.position.x += (snapshot.ball.direction.x * snapshot.ball.velocity);
    snapshot.ball.position.y += (snapshot.ball.direction.y * snapshot.ball.velocity);
  }

  public static checkGoal(snapshot: Snapshot) {
    if (snapshot.ball.position.x >= 400) {
      snapshot.score[0]++;
    } else if (snapshot.ball.position.x <= 0) {
      snapshot.score[1]++;
    } else {
      return;
    }

    snapshot.ball.position.x = 200;
    snapshot.ball.position.y = 50;
    snapshot.ball.direction.x = ((randomInt(5) / 10) * 2) - 1;
    snapshot.ball.direction.y = ((randomInt(5) / 10) * 2) - 1;
    snapshot.ball.velocity = 10;
  }

  public static checkEndState(snapshot: Snapshot, maxScore: number): boolean {
    if (snapshot.score[0] === maxScore || snapshot.score[1] === maxScore) {
      return true;
    }

    return false;
  }
}
