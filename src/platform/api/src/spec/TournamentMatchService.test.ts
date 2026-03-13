import { MatchState } from "../domain/entities/Match";
import { TournamentMatchService } from "../application/services/TournamentMatchService";

describe("TournamentMatchService", () => {
  it("creates next round when current match just finished in stale round snapshot", async () => {
    const tournamentRepository = {
      findByToken: jest.fn(),
      update: jest.fn(),
    };

    const tournamentPlayerRepository = {
      update: jest.fn(),
    };

    const tournamentRoundService = {
      createNext: jest.fn(),
    };

    const service = new TournamentMatchService(
      tournamentRepository as any,
      tournamentPlayerRepository as any,
      tournamentRoundService as any,
    );

    const winnerUserId = 101;
    const loserUserId = 202;

    const tournament: any = {
      id: 1,
      token: "tour-1",
      round: 1,
      rounds: [
        {
          top: "4",
          matches: [
            { token: "match-a", state: MatchState.FINISHED },
            { token: "match-b", state: MatchState.IN_PROGRESS },
          ],
        },
      ],
      players: [
        { id: 11, round: 1, isAlive: true, user: { id: winnerUserId } },
        { id: 22, round: 1, isAlive: true, user: { id: loserUserId } },
      ],
    };

    const match: any = {
      token: "match-b",
      tournamentRound: { tournament: { token: "tour-1" } },
      players: [
        { user: { id: winnerUserId } },
        { user: { id: loserUserId } },
      ],
    };

    const matchResult: any = { score: [10, 7] };

    tournamentRepository.findByToken.mockResolvedValue(tournament);
    tournamentPlayerRepository.update.mockResolvedValue(1);
    tournamentRoundService.createNext.mockResolvedValue(undefined);

    await service.updateMatchScore(matchResult, match);

    expect(tournamentRoundService.createNext).toHaveBeenCalledTimes(1);
    expect(tournamentRoundService.createNext).toHaveBeenCalledWith(tournament);
    expect(tournament.rounds[0].matches[1].state).toBe(MatchState.FINISHED);
  });
});
