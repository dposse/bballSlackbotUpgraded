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
      expect(games.length).toEqual(15);
    });
  });
});

describe("create 'paths' based on date", () => {});
