import { Snapshot } from "../models/Snapshot";
import { PongSettings } from "../models/PongSettings";

export interface AIPrediction {
  estimatedBallY: number;
  timestamp: number;
}

/**
 * AIDecisionEngine: Handles AI paddle decision-making with human-like behavior
 * 
 * Key features:
 * - Replicates human behavior (1 decision per second refresh rate)
 * - Predicts ball trajectory bounces
 * - Implements strategic positioning
 * - Uses reaction time delay (0.2-0.5 seconds)
 */
export class AIDecisionEngine {
  private DECISION_REFRESH_RATE = 1000; // smoother, human-like correction cadence
  
  // AI difficulty parameters (can be tuned)
  private predictionAccuracy = 1; // How accurate AI predictions are (0-1)
  private readonly CENTER_BIAS = 0.1; // low recenter tendency to avoid jitter
  private readonly TRACKING_DEAD_ZONE = PongSettings.PADDLE_SIZE * 0.12;
  private readonly TRACKING_HYSTERESIS = PongSettings.PADDLE_SIZE * 0.06;

  private lastDecisionTime: number = 0;
  private nextDecisionAt: number = 0;
  private targetPaddleY: number = PongSettings.MAX_HEIGHT / 2 - PongSettings.PADDLE_SIZE / 2;
  private currentDecision: -1 | 0 | 1 = 0;

  constructor() {
    this.lastDecisionTime = performance.now();
  }

  /**
   * Get the next AI decision for paddle movement
   * Returns movement direction: -1 (up), 0 (stay), 1 (down)
   */
  public getDecision(
    snapshot: Snapshot,
    aiPaddleSide: 0 | 1,
    currentPaddlePosition: number
  ): -1 | 0 | 1 {
    const now = performance.now();

    if (now < this.nextDecisionAt) {
      return this.currentDecision;
    }

    this.lastDecisionTime = now;

    this.nextDecisionAt = now + this.DECISION_REFRESH_RATE;

    // Predict where the ball will be
    const prediction = this.predictBallPosition(snapshot, aiPaddleSide);
    this.targetPaddleY = prediction.estimatedBallY;

    const ballMovingTowardsAI = this.isBallMovingTowardsAI(snapshot.ball, aiPaddleSide);
    const isStraightIncoming = ballMovingTowardsAI && Math.abs(snapshot.ball.direction.y) < 0.08;

    // Add slight inaccuracy only when ball is not a straight incoming threat
    if (!isStraightIncoming && Math.random() > this.predictionAccuracy) {
      this.targetPaddleY += (Math.random() - 0.5) * PongSettings.PADDLE_SIZE;
    }

    // Calculate desired movement
    this.currentDecision = this.calculatePaddleMovement(currentPaddlePosition, snapshot, aiPaddleSide);
    return this.currentDecision;
  }

  private isBallMovingTowardsAI(ball: Snapshot["ball"], aiPaddleSide: 0 | 1): boolean {
    return aiPaddleSide === 0 ? ball.direction.x < 0 : ball.direction.x > 0;
  }

  /**
   * Predict ball position based on current trajectory
   * Simulates human anticipation of bounces and ball behavior
   */
  private predictBallPosition(snapshot: Snapshot, aiPaddleSide: 0 | 1): AIPrediction {
    const ball = snapshot.ball;
    const aiPaddle = snapshot.paddles.find(p => p.side === aiPaddleSide);

    if (!aiPaddle) {
      return {
        estimatedBallY: PongSettings.MAX_HEIGHT / 2,
        timestamp: performance.now(),
      };
    }

    const ballMovingTowardsAI = this.isBallMovingTowardsAI(ball, aiPaddleSide);

    if (!ballMovingTowardsAI) {
      const center = PongSettings.MAX_HEIGHT / 2 - PongSettings.PADDLE_SIZE / 2;
      const weightedCenter = center * (1 - this.CENTER_BIAS) + (ball.position.y * this.CENTER_BIAS);
      return {
        estimatedBallY: Math.max(0, Math.min(PongSettings.MAX_HEIGHT - PongSettings.BALL_SIZE, weightedCenter)),
        timestamp: performance.now(),
      };
    }

    const speed = Math.max(1, Math.min(PongSettings.MAX_VEL, ball.velocity || 1));
    const vx = ball.direction.x * speed;
    const vy = ball.direction.y * speed;

    const interceptX = aiPaddleSide === 0
      ? PongSettings.PADDLE_OFFSET + PongSettings.PADDLE_WIDTH
      : PongSettings.MAX_WIDTH - (PongSettings.PADDLE_OFFSET + PongSettings.PADDLE_WIDTH) - PongSettings.BALL_SIZE;

    if (vx === 0) {
      return {
        estimatedBallY: this.reflectY(ball.position.y),
        timestamp: performance.now(),
      };
    }

    const timeToIntercept = (interceptX - ball.position.x) / vx;
    if (timeToIntercept <= 0) {
      return {
        estimatedBallY: this.reflectY(ball.position.y),
        timestamp: performance.now(),
      };
    }

    const projectedY = ball.position.y + vy * timeToIntercept;
    return {
      estimatedBallY: this.reflectY(projectedY),
      timestamp: performance.now(),
    };
  }

  private reflectY(y: number): number {
    const minY = 0;
    const maxY = PongSettings.MAX_HEIGHT - PongSettings.BALL_SIZE;
    const height = maxY - minY;

    if (height <= 0) {
      return minY;
    }

    const period = height * 2;
    let normalized = ((y - minY) % period + period) % period;
    if (normalized > height) {
      normalized = period - normalized;
    }

    return minY + normalized;
  }

  /**
   * Calculate paddle movement based on target position
   */
  private calculatePaddleMovement(
    currentPaddlePosition: number,
    snapshot: Snapshot,
    aiPaddleSide: 0 | 1
  ): -1 | 0 | 1 {
    const paddleCenter = currentPaddlePosition + PongSettings.PADDLE_SIZE / 2;
    const targetCenter = this.targetPaddleY + PongSettings.BALL_SIZE / 2;
    const difference = targetCenter - paddleCenter;

    // Dynamic threshold based on difficulty - harder AI has smaller threshold
    const baseThreshold = PongSettings.PADDLE_SIZE * 0.1;
    const difficulty = (this.predictionAccuracy - 0.6) / 0.38; // Reverse-calculate difficulty from accuracy
    const threshold = baseThreshold * (1 - difficulty * 0.7); // Scale threshold with difficulty

    const isStraightIncoming =
      this.isBallMovingTowardsAI(snapshot.ball, aiPaddleSide)
      && Math.abs(snapshot.ball.direction.y) < 0.08;
    const straightIncomingBonus = isStraightIncoming ? PongSettings.PADDLE_SIZE * 0.08 : 0;

    const movementThreshold = Math.max(threshold, this.TRACKING_DEAD_ZONE) + straightIncomingBonus;
    const startThreshold = movementThreshold + this.TRACKING_HYSTERESIS;
    const stopThreshold = movementThreshold;
    const flipThreshold = isStraightIncoming
      ? startThreshold + (PongSettings.PADDLE_SIZE * 0.12)
      : startThreshold;

    if (Math.abs(difference) <= stopThreshold) {
      return 0;
    }

    if (this.currentDecision === -1) {
      if (difference < -stopThreshold) { return -1; }
      if (difference > flipThreshold) { return 1; }
      return -1;
    }

    if (this.currentDecision === 1) {
      if (difference > stopThreshold) { return 1; }
      if (difference < -flipThreshold) { return -1; }
      return 1;
    }

    if (difference < -startThreshold) { return -1; }
    if (difference > startThreshold) { return 1; }
    return 0;
  }

  /**
   * Reset the AI decision engine (on match reset)
   */
  public reset(): void {
    this.lastDecisionTime = performance.now();
    this.nextDecisionAt = this.lastDecisionTime;
    this.targetPaddleY = PongSettings.MAX_HEIGHT / 2 - PongSettings.PADDLE_SIZE / 2;
    this.currentDecision = 0;
  }

  /**
   * Update difficulty level (0 = easy, 1 = hard)
   */
  public setDifficulty(difficulty: number): void {
    const normalized = Math.max(0, Math.min(1, difficulty));
    // Much tighter prediction accuracy for higher difficulty
    this.predictionAccuracy = 0.6 + normalized * 0.38; // 0.6 - 0.98 (improved from 0.65-0.95)
    this.DECISION_REFRESH_RATE = Math.max(80, 260 - normalized * 180); // 260ms -> 80ms
  }
}
