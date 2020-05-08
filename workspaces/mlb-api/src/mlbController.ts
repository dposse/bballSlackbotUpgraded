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
        // check if they won or not - needs to handle multiple games
        const gameResults = resolvedResults.map(gameObject => {
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

          // I don't know about baseball, so I'm leaving the target team and other team
          // in each object in the array. If someone wants to confirm that teams only play
          // single games and double headers against the same team, GameResult could change to
          // something like { targetTeam, otherTeam, games: [{status, scoreDifferent}] }
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

  if (gameResults[0].status === 'lost') {
    returnMessage = trashTalkJSON.givenTeamLost;
  } else if (gameResults[0].status === 'won') {
    returnMessage = trashTalkJSON.givenTeamWon;
  } else {
    //draw
    returnMessage = '';
  }

  return returnMessage
    .replace('TEAMNAME', targetTeamName)
    .replace('OTHERTEAM', otherTeamName);
}

export function getYesterdayResultMessage(teamCode: string): string {
  return teamCode;
}

// async function main() {
//   const testDate = new Date('April 20, 2019');
//   const team = 'atl';
//   console.log(await _getResultMessage(testDate, team));
// }

// main();

//first game object in mlbGamesTestData
// home_code 'nya'
// away_code 'oak'
// linescore: {
//   inning: [
//     { home: '0', away: '0' },
//     { home: '1', away: '0' },
//     { home: '0', away: '2' },
//     { home: '0', away: '0' },
//     { home: '0', away: '0' },
//     { home: '1', away: '1' },
//     { home: '0', away: '1' },
//     { home: '0', away: '0' },
//     { home: '1', away: '0' },
//   ],
//   r: { home: '3', away: '4', diff: '1' },
//   h: { home: '9', away: '10' },
//   e: { home: '0', away: '0' },
//   hr: { home: '1', away: '2' },
//   sb: { home: '0', away: '0' },
//   so: { home: '0', away: '0' },
// }

//6th game object in test data
// home_code 'pit'
// away_code 'sln'
// linescore: {
//   inning: [
//     { home: '0', away: '0' },
//     { home: '1', away: '2' },
//     { home: '0', away: '0' },
//     { home: '0', away: '0' },
//     { home: '0', away: '5' },
//     { home: '0', away: '0' },
//     { home: '0', away: '0' },
//     { home: '0', away: '0' },
//     { home: '0', away: '2' },
//   ],
//   r: { home: '1', away: '9', diff: '8' },
//   h: { home: '8', away: '12' },
//   e: { home: '0', away: '0' },
//   hr: { home: '8', away: '6' },
//   sb: { home: '0', away: '0' },
//   so: { home: '0', away: '0' },
// }
