const Mlbgames = require('mlbgames');
const options = {
  path: 'year_2011/month_07/day_23/',
};

const mlbgames = new Mlbgames(options);
mlbgames.get((err: any, games: any) => {
  console.log(`err: `, err);
  console.log(`games: `);
  console.dir(games, { depth: null });
  console.log(games.length);
});
