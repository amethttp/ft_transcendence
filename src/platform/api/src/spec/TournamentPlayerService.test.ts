import { TournamentPlayerService } from '../application/services/TournamentPlayerService';
import { TournamentPlayer } from '../domain/entities/TournamentPlayer';
import { Tournament } from '../domain/entities/Tournament';
import { MatchPlayerService } from '../application/services/MatchPlayerService';

// Mock del repository
const mockRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findLastAmountByUser: jest.fn(),
  findAllByUser: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  deleteAllByUser: jest.fn(),
  findAll: jest.fn(),
  dbBegin: jest.fn(),
  dbCommit: jest.fn(),
  dbRollback: jest.fn(),
  findByUserAndMatch: jest.fn(),
  findAllUserMatchesInfo: jest.fn(),
  findAllByMatch: jest.fn(),
};

describe('TournamentPlayerService', () => {
  let service: TournamentPlayerService;

  beforeEach(() => {
    service = new TournamentPlayerService(mockRepository);
  });

  describe('_calculatePlacement', () => {
    it('should return 1 for winner (isWinner = true)', () => {
      // Tournament with n players
      const tournament = new Tournament();
      tournament.playersAmount = 8;

      // Player is winner and in the final round
      const player = new TournamentPlayer(tournament);
      player.isWinner = true;
      player.round = Math.log2(tournament.playersAmount);

      // Should have 1st placement
      const placement = (service as any)._calculatePlacement(player);
      expect(placement).toBe(1);
    });

    // Tests for different tournament sizes and positions
    const testCases = [
      { n: 4, maxRound: 2, cases: [
        { round: 2, expected: 1, isWinner: true, desc: 'Winner' },
        { round: 2, expected: 2, isWinner: false, desc: 'Final loser' },
        { round: 1, expected: 4, isWinner: false, desc: 'Semifinal loser' },
      ]},
      { n: 8, maxRound: 3, cases: [
        { round: 3, expected: 1, isWinner: true, desc: 'Winner' },
        { round: 3, expected: 2, isWinner: false, desc: 'Final loser' },
        { round: 2, expected: 4, isWinner: false, desc: 'Semifinal loser' },
        { round: 1, expected: 8, isWinner: false, desc: 'Quarterfinal loser' },
      ]},
      { n: 16, maxRound: 4, cases: [
        { round: 4, expected: 1, isWinner: true, desc: 'Winner' },
        { round: 4, expected: 2, isWinner: false, desc: 'Final loser' },
        { round: 3, expected: 4, isWinner: false, desc: 'Semifinal loser' },
        { round: 2, expected: 8, isWinner: false, desc: 'Quarterfinal loser' },
        { round: 1, expected: 16, isWinner: false, desc: 'Round of 8 loser' },
      ]},
      { n: 32, maxRound: 5, cases: [
        { round: 5, expected: 1, isWinner: true, desc: 'Winner' },
        { round: 5, expected: 2, isWinner: false, desc: 'Final loser' },
        { round: 4, expected: 4, isWinner: false, desc: 'Semi-final loser' },
        { round: 3, expected: 8, isWinner: false, desc: 'Quarterfinal loser' },
        { round: 2, expected: 16, isWinner: false, desc: 'Round of 8 loser' },
        { round: 1, expected: 32, isWinner: false, desc: 'Round of 16 loser' },
      ]},
      { n: 64, maxRound: 6, cases: [
        { round: 6, expected: 1, isWinner: true, desc: 'Winner' },
        { round: 6, expected: 2, isWinner: false, desc: 'Final loser' },
        { round: 5, expected: 4, isWinner: false, desc: 'Semi-final loser' },
        { round: 4, expected: 8, isWinner: false, desc: 'Quarterfinal loser' },
        { round: 3, expected: 16, isWinner: false, desc: 'Round of 8 loser' },
        { round: 2, expected: 32, isWinner: false, desc: 'Round of 16 loser' },
        { round: 1, expected: 64, isWinner: false, desc: 'Round of 32 loser' },
      ]},
    ];

    testCases.forEach(({ n, cases }) => {
      describe(`Tournament with ${n} players`, () => {
        cases.forEach(({ round, expected, isWinner, desc }) => {
          it(`should return ${expected} for ${desc} (round=${round})`, () => {
            // Create tournament and player for the test case
            const tournament = new Tournament();
            tournament.playersAmount = n;

            // Player with specified round and winner status
            const player = new TournamentPlayer(tournament);
            player.isWinner = isWinner;
            player.round = round;

            // Calculate placement and assert
            const placement = (service as any)._calculatePlacement(player);
            expect(placement).toBe(expected);
          });
        });
      });
    });

    it('should return 0 if the user did not played the tournament', () => {
      const tournament = new Tournament();
      tournament.playersAmount = 8;

      const player = new TournamentPlayer(tournament);
      player.isWinner = false;
      player.round = 0;

      const placement = (service as any)._calculatePlacement(player);
      expect(placement).toBe(0);
    });
  });

  describe('calculateAvgPlacement', () => {
    it('should calculate average placement correctly', () => {
      const finishTime = "2023-01-01T00:00:00Z";
      const tournaments = [
        { placement: 1, finishTime: finishTime } as any,
        { placement: 2, finishTime: finishTime } as any,
        { placement: 4, finishTime: finishTime } as any,
      ];
      const expectedAvg = (1 + 2 + 4) / 3;

      const avg = service.calculateAvgPlacement(tournaments);
      expect(avg).toBe(expectedAvg);
    });

    it('should return 0 if there are no valid tournaments', () => {
      const tournaments = [
        { placement: 1, finishTime: "Aborted" } as any,
        { placement: 2 } as any,
      ];
  
      const avg = service.calculateAvgPlacement(tournaments);
      expect(avg).toBe(0);
    });

    it('should ignore tournaments with no finish time or aborted', () => {
      const tournaments = [
        { placement: 1, finishTime: "2023-01-01T00:00:00Z" } as any,
        { placement: 4, finishTime: "2023-01-01T00:00:00Z" } as any,
        { placement: 2, finishTime: "Aborted" } as any,
        { placement: 4 } as any,
      ];
      const expectedAvg = (1 + 4) / 2;
      
      const avg = service.calculateAvgPlacement(tournaments);
      expect(avg).toBe(expectedAvg);
    });
  });
});

describe('MatchPlayerService', () => {
  let service: MatchPlayerService

  beforeEach(() => {
    service = new MatchPlayerService(mockRepository);
  });

  describe('countWins', () => {
    it('should count wins correctly', () => {
      const finishTime = "2023-01-01T00:00:00Z";

      const matches = [
        { isWinner: true, finishTime: finishTime } as any,
        { isWinner: false, finishTime: finishTime } as any,
        { isWinner: true, finishTime: finishTime } as any,
        { isWinner: true, finishTime: finishTime } as any,
        { isWinner: false, finishTime: finishTime } as any,
      ];
      const expectedWins = 3;
      
      const wins = service.countWins(matches);
      expect(wins).toBe(expectedWins);
    });

    it('should not count wins for matches with no finish time or aborted', () => {
      const matches = [
        { isWinner: true, finishTime: "2023-01-01T00:00:00Z" } as any,
        { isWinner: true } as any,
        { isWinner: true, finishTime: "Aborted" } as any,
        { isWinner: true, finishTime: "2023-01-01T00:00:00Z" } as any,
      ];
      const expectedWins = 2;
      
      const wins = service.countWins(matches);
      expect(wins).toBe(expectedWins);
    });

    it('should return 0 if there are no wins', () => {
      const matches = [
        { isWinner: false, finishTime: "2023-01-01T00:00:00Z" } as any,
        { isWinner: true } as any,
        { isWinner: true, finishTime: "Aborted" } as any,
      ];
      
      const wins = service.countWins(matches);
      expect(wins).toBe(0);
    });
  });
});