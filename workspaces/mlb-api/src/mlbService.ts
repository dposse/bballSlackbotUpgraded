// internal curry function for dependency injection
export function _getAllGamesOnDate(date: Date) {
  return [date];
}

// expose a function with dependency already injected
export const getAllGamesOnDate = _getAllGamesOnDate;

// const Mlbgames = require('mlbgames');
// const options = {
//   path: 'year_2011/month_07/day_23/',
// };

// const mlbgames = new Mlbgames(options);
// mlbgames.get((err: any, games: any) => {
//   console.log(`err: `, err);
//   console.log(`games: `);
//   console.dir(games, { depth: null });
//   console.log(games.length);
// });
