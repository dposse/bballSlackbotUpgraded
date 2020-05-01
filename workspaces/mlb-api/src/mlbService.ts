import { IMLBApi } from 'types';

// dependency - if you need to change the 3rd party api used, do it here
class MLBApi implements IMLBApi {
  Mlbgames = require('mlbgames');

  get(_date: Date): Promise<any[]> {
    return new Promise((resolve, _reject) => {
      const options = {
        path: 'year_2011/month_07/day_23/',
      };

      const mlbgames = new this.Mlbgames(options);
      mlbgames.get((err: any, games: any) => {
        if (err) {
          throw new Error(err);
        }

        resolve(games);
      });
    });
  }
}

// internal curried function for dependency injection
export const _getAllGamesOnDate = (api: IMLBApi) => (
  date: Date
): Promise<any[]> => {
  return new Promise((resolve, _reject) => {
    try {
      const results = api.get(date);
      resolve(results);
    } catch (error) {
      throw new Error(error);
    }
  });
};

// expose a function with dependency already injected
const mlbApi = new MLBApi();
export const getAllGamesOnDate = _getAllGamesOnDate(mlbApi);

async function main() {
  const results = await _getAllGamesOnDate(mlbApi)(new Date());
  console.log(results.length);
}

main();
