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
  private reactionTimeMin = 200; // milliseconds
  private reactionTimeMax = 500; // milliseconds
  private readonly DECISION_REFRESH_RATE = 1000; // 1 second (same as human)
  
  // AI difficulty parameters (can be tuned)
  private predictionAccuracy = 0.85; // How accurate AI predictions are (0-1)
  private readonly CENTER_BIAS = 0.6; // Tendency to hover near center (0-1)
  private readonly ANTICIPATION_DEPTH = 3; // How many bounces to predict ahead

  private lastDecisionTime: number = 0;
  private lastReactionTime: number = 0;
  private targetPaddleY: number = PongSettings.MAX_HEIGHT / 2 - PongSettings.PADDLE_SIZE / 2;

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

    // Check if enough time has passed for next decision (1 second refresh)
    if (now - this.lastDecisionTime < this.DECISION_REFRESH_RATE) {
      return 0;
    }

    this.lastDecisionTime = now;

    // Apply reaction time only after a new decision
    if (now - this.lastReactionTime < this.getReactionTime()) {
      return 0;
    }

    this.lastReactionTime = now;

    // Predict where the ball will be
    const prediction = this.predictBallPosition(snapshot, aiPaddleSide);
    this.targetPaddleY = prediction.estimatedBallY;

    // Add slight inaccuracy based on difficulty
    if (Math.random() > this.predictionAccuracy) {
      this.targetPaddleY += (Math.random() - 0.5) * PongSettings.PADDLE_SIZE;
    }

    // Calculate desired movement
    return this.calculatePaddleMovement(currentPaddlePosition);
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

    // Simulate ball trajectory
    let simulatedX = ball.position.x;
    let simulatedY = ball.position.y;
    let dirX = ball.direction.x;
    let dirY = ball.direction.y;
    let bounceCount = 0;

    // Simulate forward in time until ball reaches AI paddle side
    const maxIterations = 10000;
    let iteration = 0;

    while (iteration < maxIterations && bounceCount < this.ANTICIPATION_DEPTH) {
      // Check if ball reached AI's side
      const paddleSideBoundary = aiPaddleSide === 0
        ? PongSettings.PADDLE_OFFSET + PongSettings.PADDLE_WIDTH
        : PongSettings.MAX_WIDTH - (PongSettings.PADDLE_OFFSET + PongSettings.PADDLE_WIDTH);

      if (aiPaddleSide === 0 && simulatedX <= paddleSideBoundary) {
        // Ball reached left side
        return {
          estimatedBallY: Math.max(0, Math.min(PongSettings.MAX_HEIGHT - PongSettings.BALL_SIZE, simulatedY)),
          timestamp: performance.now(),
        };
      }

      if (aiPaddleSide === 1 && simulatedX >= paddleSideBoundary - PongSettings.BALL_SIZE) {
        // Ball reached right side
        return {
          estimatedBallY: Math.max(0, Math.min(PongSettings.MAX_HEIGHT - PongSettings.BALL_SIZE, simulatedY)),
          timestamp: performance.now(),
        };
      }

      // Update ball position
      simulatedX += dirX * 2;
      simulatedY += dirY * 2;

      // Handle wall bounces
      if (simulatedY < 0) {
        simulatedY = -simulatedY;
        dirY = -dirY;
        bounceCount++;
      } else if (simulatedY + PongSettings.BALL_SIZE > PongSettings.MAX_HEIGHT) {
        simulatedY = PongSettings.MAX_HEIGHT - PongSettings.BALL_SIZE - (simulatedY + PongSettings.BALL_SIZE - PongSettings.MAX_HEIGHT);
        dirY = -dirY;
        bounceCount++;
      }

      iteration++;
    }

    // Fallback: estimate based on ball direction
    return {
      estimatedBallY: Math.max(0, Math.min(PongSettings.MAX_HEIGHT - PongSettings.BALL_SIZE, simulatedY)),
      timestamp: performance.now(),
    };
  }

  /**
   * Calculate paddle movement based on target position
   */
  private calculatePaddleMovement(currentPaddlePosition: number): -1 | 0 | 1 {
    const paddleCenter = currentPaddlePosition + PongSettings.PADDLE_SIZE / 2;
    const targetCenter = this.targetPaddleY + PongSettings.PADDLE_SIZE / 2;
    const difference = targetCenter - paddleCenter;

    // Dynamic threshold based on difficulty - harder AI has smaller threshold
    const baseThreshold = PongSettings.PADDLE_SIZE * 0.1;
    const difficulty = (this.predictionAccuracy - 0.6) / 0.38; // Reverse-calculate difficulty from accuracy
    const threshold = baseThreshold * (1 - difficulty * 0.7); // Scale threshold with difficulty

    if (difference < -threshold) {
      return -1; // Move up
    } else if (difference > threshold) {
      return 1; // Move down
    } else {
      // Apply center bias when close to target
      if (Math.random() < this.CENTER_BIAS) {
        const centerY = (PongSettings.MAX_HEIGHT / 2) - (PongSettings.PADDLE_SIZE / 2);
        const centerDiff = centerY - paddleCenter;

        if (Math.abs(centerDiff) > threshold) {
          return centerDiff < 0 ? -1 : 1;
        }
      }
      return 0; // Stay
    }
  }

  /**
   * Get a random reaction time between min and max
   */
  private getReactionTime(): number {
    return this.reactionTimeMin + Math.random() * (this.reactionTimeMax - this.reactionTimeMin);
  }

  /**
   * Reset the AI decision engine (on match reset)
   */
  public reset(): void {
    this.lastDecisionTime = performance.now();
    this.lastReactionTime = performance.now();
    this.targetPaddleY = PongSettings.MAX_HEIGHT / 2 - PongSettings.PADDLE_SIZE / 2;
  }

  /**
   * Update difficulty level (0 = easy, 1 = hard)
   */
  public setDifficulty(difficulty: number): void {
    const normalized = Math.max(0, Math.min(1, difficulty));
    // Much tighter prediction accuracy for higher difficulty
    this.predictionAccuracy = 0.6 + normalized * 0.38; // 0.6 - 0.98 (improved from 0.65-0.95)
    // Much faster reaction times for higher difficulty
    this.reactionTimeMin = 500 - normalized * 450; // 500ms - 50ms (faster from 500ms-200ms)
    this.reactionTimeMax = 800 - normalized * 450; // 800ms - 350ms (faster from 800ms-500ms)
  }
}
