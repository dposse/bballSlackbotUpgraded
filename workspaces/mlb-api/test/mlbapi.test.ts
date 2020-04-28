import { getAllGamesOnDate, _getAllGamesOnDate } from '../src/index';

describe('dependencies tests', () => {
  test('make sure mlbgames is still working as expected', () => {
    const Mlbgames = require('mlbgames');
    const options = {
      path: 'year_2011/month_07/day_23/',
    };

    const mlbgames = new Mlbgames(options);
    mlbgames.get((err: any, games: any) => {
      console.log(`games: `, games);
      expect(err).toBeNull();
      expect(games).toBeDefined();
      // if you look at the data and check the games online, you'll notice that only 14 games were played on 07/23/2011
      //  mlbgames counts postponed games as well
      expect(games.length).toEqual(15);
    });
  });
});

describe('mlbapi tests', () => {
  describe('_getAllGamesOnDate() unit tests', () => {
    test('exists', () => {
      expect(_getAllGamesOnDate).toBeDefined();
    });

    test('accepts date object as argument', () => {
      const today: Date = new Date();
      const results = _getAllGamesOnDate(today);
      expect(results).toBeTruthy();
    });
  });

  describe('getAllGamesOnDate() integration tests', () => {
    test('exists', () => {
      expect(getAllGamesOnDate).toBeDefined();
    });
  });
});

describe("create 'paths' based on date", () => {});
