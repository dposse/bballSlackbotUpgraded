import { getAllGamesOnDate, _getAllGamesOnDate } from '../src/index';
import { IMLBApi } from '../src/types/index';
import mlbGamesTestData from '../src/mlbGamesTestData';

// remove the .skip to make sure package is working
describe.skip('dependencies tests', () => {
  test('make sure mlbgames is still working as expected', () => {
    const Mlbgames = require('mlbgames');
    const options = {
      path: 'year_2011/month_07/day_23/',
    };

    const mlbgames = new Mlbgames(options);
    mlbgames.get((err: any, games: any) => {
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

    test('accepts api (dependency injection) and date object as arguments', () => {
      // arrange
      const api: IMLBApi = {
        get: function(_date: Date): Promise<any[]> {
          return new Promise((resolve, _reject) => {
            resolve([]);
          });
        },
      };
      const today: Date = new Date();
      const results = _getAllGamesOnDate(api)(today);
      expect(results).toBeTruthy();
    });

    describe('happy path', () => {
      test('get empty array with mocked api', async () => {
        // arrange
        const api: IMLBApi = {
          get: function(_date: Date): Promise<any[]> {
            return new Promise((resolve, _reject) => {
              resolve([]);
            });
          },
        };

        // act
        const now = new Date();
        const results = await _getAllGamesOnDate(api)(now);

        // assert
        expect(results).toStrictEqual([]);
      });
    });

    describe('sad path', () => {
      //below is a bad test maybe? it passes with no changes. since _getAllGamesOnDate
      // returns a promise, api.get throwing an error works without a code change
      // I guess still useful for testing refactors?
      test('mocked api promise rejects', async () => {
        // arrange
        const api: IMLBApi = {
          get: function(_date: Date): Promise<any[]> {
            return new Promise((_resolve, _reject) => {
              throw new Error('oh no it broke');
            });
          },
        };

        // act
        const now = new Date();
        try {
          await _getAllGamesOnDate(api)(now);
        } catch (error) {
          // assert
          expect(error).toBeDefined();
          expect(error).toEqual(new Error('oh no it broke'));
        }
      });
    });
  });

  describe('getAllGamesOnDate() integration tests', () => {
    test('exists', () => {
      expect(getAllGamesOnDate).toBeDefined();
    });

    test('gets games from 07/23/2011 (date used in mlbGames npm package readme)', async () => {
      // arrange
      const expectedResult = mlbGamesTestData;

      // act
      // testDate is from mlbGames npm package readme
      const testDate = new Date('July 23, 2011');
      const result = await getAllGamesOnDate(testDate);

      // assert
      expect(result.length).toEqual(expectedResult.length); // comparing actual results can get messy
      // since many nested objects
    });

    test('gets games from 05/13/2019 (date used because it only has 7 games)', async () => {
      // arrange
      const notExpectedResult = mlbGamesTestData;

      // act
      // testDate is a random date that does not have 15 games played
      const testDate = new Date('May 13, 2019');
      const result = await getAllGamesOnDate(testDate);

      // assert
      expect(result.length).not.toEqual(notExpectedResult.length); // comparing actual results can get messy
      // since many nested objects
      expect(result).toHaveLength(7);
    });
  });
});

describe("create 'paths' based on date", () => {});
