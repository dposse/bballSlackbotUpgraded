import { IMLBApi } from 'types';
import mlbTeamsJSON from './mlbTeams.json';

// dependency - if you need to change the 3rd party api used, do it here
class MLBApi implements IMLBApi {
  Mlbgames = require('mlbgames');

  get(date: Date): Promise<any[]> {
    return new Promise((resolve, _reject) => {
      const options = {
        path: convertDateToString(date),
      };

      const mlbgames = new this.Mlbgames(options);
      mlbgames.get((err: any, games: any) => {
        if (err) {
          throw new Error(err);
        }

        if (games === undefined) {
          resolve([]);
        }

        resolve(games);
      });
    });
  }
}

// returned format is 'year_YYYY/month_MM/day_DD/' change if using another api
export function convertDateToString(date: Date): string {
  const month: number = date.getMonth() + 1;
  const day: number = date.getDate();

  const yearString: string = `${date.getFullYear()}`;
  const monthString: string = month < 10 ? `0${month}` : `${month}`;
  const dayString: string = day < 10 ? `0${day}` : `${day}`;

  return `year_${yearString}/month_${monthString}/day_${dayString}/`;
}

// internal curried functions for dependency injection
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

export const _getGamesPlayed = (api: IMLBApi) => (
  teamCode: string,
  date: Date
): Promise<any[]> => {
  return new Promise((resolve, _reject) => {
    //validate input
    // teamCodes can only be the keys in mlbTeamsJSON
    if (!mlbTeamsJSON.hasOwnProperty(teamCode)) {
      throw new Error(`Invalid team code '${teamCode}'`);
    }

    try {
      api.get(date).then(results => {
        // find team code in results
        const gamesPlayedByTeam = results.filter(gameObject => {
          if (
            gameObject.home_code === teamCode ||
            gameObject.away_code === teamCode
          ) {
            return true;
          }

          return false;
        });

        resolve(gamesPlayedByTeam);
      });
    } catch (error) {
      throw new Error(error);
    }
  });
};

// expose functions with dependency already injected
const mlbApi = new MLBApi();
export const getAllGamesOnDate = _getAllGamesOnDate(mlbApi);
export const getGamesPlayed = _getGamesPlayed(mlbApi);

// async function main() {
//   // const results = await _getAllGamesOnDate(mlbApi)(new Date('May 07, 2020'));
//   // console.log(results);
//   console.log(await _getGamesPlayed(mlbApi)('ana', new Date('May 07, 2020')));
// }

// main();
