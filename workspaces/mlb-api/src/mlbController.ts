import { getGamesPlayed } from './mlbService';
import { GameResult, TeamKey } from 'types';
import mlbTeamsJSON from './mlbTeams.json';
import trashTalkJSON from './trashTalk.json';

// dependency injection with date for unit testing
// could also inject the functions from mlbService?
export const _getResultMessage = (
  date: Date,
  teamCode: TeamKey
): Promise<string> => {
  return new Promise((resolve, _reject) => {
    try {
      // get games played by team on date
      getGamesPlayed(teamCode, date).then(resolvedResults => {
        // remove postponed games
        const nonPostponedGames = resolvedResults.filter(
          game => game.status.status !== 'Postponed'
        );
        // just return empty string if no games played on given date
        if (nonPostponedGames.length === 0) {
          resolve('');
          return;
        }

        // check if they won or not - needs to handle multiple games
        const gameResults = nonPostponedGames.map(gameObject => {
          // make sure gameObject still the same shape
          // could be done in typescript, didn't think it was worth it
          if (!gameObject.linescore.r) {
            throw new Error('API has changed');
          }

          // team might be listed as home or away
          // using this as an object key
          const givenTeamHomeOrAway: string =
            gameObject.home_code === teamCode ? 'home' : 'away';
          const otherTeamHomeOrAway: string =
            givenTeamHomeOrAway === 'home' ? 'away' : 'home';

          // right now only comparing final scores, but the linescore object has more detail
          // like hits, home runs, errors (I think, they are represented as h, hr, e)
          let status: 'won' | 'lost' | 'draw';
          if (
            gameObject.linescore.r[givenTeamHomeOrAway] >
            gameObject.linescore.r[otherTeamHomeOrAway]
          ) {
            status = 'won';
          } else if (
            gameObject.linescore.r[givenTeamHomeOrAway] <
            gameObject.linescore.r[otherTeamHomeOrAway]
          ) {
            status = 'lost';
          } else {
            status = 'draw';
          }

          const scoreDifference = gameObject.linescore.r.diff;

          const gameResult: GameResult = {
            targetTeamCode: teamCode,
            otherTeamCode:
              otherTeamHomeOrAway === 'home'
                ? gameObject.home_code
                : gameObject.away_code,
            status,
            scoreDifference,
          };

          return gameResult;
        });

        // create result string
        const resultMessage: string = createMessage(gameResults);

        resolve(resultMessage);
      });
    } catch (error) {
      throw new Error(error);
    }
  });
};

// customize messages here
// can also add logic for different messages based on how much a team won/lost by
export function createMessage(gameResults: GameResult[]): string {
  // get team name from mlbTeams.json
  const mlbTeams: Record<TeamKey, string> = mlbTeamsJSON;
  const targetTeamName: string = mlbTeams[gameResults[0].targetTeamCode];
  const otherTeamName: string = mlbTeams[gameResults[0].otherTeamCode];
  let returnMessage: string;

  if (gameResults.length === 1) {
    if (gameResults[0].status === 'lost') {
      returnMessage = trashTalkJSON.givenTeamLost;
    } else if (gameResults[0].status === 'won') {
      returnMessage = trashTalkJSON.givenTeamWon;
    } else {
      //draw
      returnMessage = trashTalkJSON.givenTeamDraw;
    }
  } else {
    //double header, using array methods for better extensibility
    if (gameResults.every(game => game.status === 'won')) {
      returnMessage = trashTalkJSON.givenTeamDoubleWin;
    } else if (gameResults.every(game => game.status === 'lost')) {
      returnMessage = trashTalkJSON.givenTeamDoubleLoss;
    } else if (gameResults.find(gameObject => gameObject.status === 'won')) {
      returnMessage = trashTalkJSON.givenTeamWonAndLost;
    } else {
      returnMessage = trashTalkJSON.givenTeamDoubleDraw;
    }
  }

  return returnMessage
    .replace('TEAMNAME', targetTeamName)
    .replace('OTHERTEAM', otherTeamName);
}

//wrap in promise, if result messasge is '' return null, else return result message
export function getYesterdayResultMessage(
  teamCode: TeamKey
): Promise<string | null> {
  return new Promise((resolve, _reject) => {
    let yesterday: Date = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    _getResultMessage(yesterday, teamCode).then(resultMessage => {
      if (resultMessage === '') {
        resolve(null);
      } else {
        resolve(resultMessage);
      }
    });
  });
}

// async function main() {
//   console.log(await getYesterdayResultMessage('ana'));
// }

// main();
