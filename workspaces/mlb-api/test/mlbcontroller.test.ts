import {
  _getResultMessage,
  getYesterdayResultMessage,
  createMessage,
} from '../src/mlbController';
import { GameResult, TeamKey } from 'types';
import trashTalkJSON from '../src/trashTalk.json';
import mlbTeamsJSON from '../src/mlbTeams.json';

describe('tests controller exposed to lambdas', () => {
  test('_getResultMessage takes in a date and string, returns string', async () => {
    // arrange
    const testDate: Date = new Date();
    const teamCode: TeamKey = 'ana'; //doesn't matter, first team in json

    // act
    const resultMessage: string = await _getResultMessage(testDate, teamCode);

    // assert
    expect(resultMessage).toBeDefined();
  });

  test('on test date 07/23/2011, input team nya, nya loses to oak', async () => {
    // arrange
    const testDate: Date = new Date('July 23, 2011');
    const teamCode: TeamKey = 'nya';
    const expectedResult: string = trashTalkJSON.givenTeamLost
      .replace('TEAMNAME', 'New York Yankees')
      .replace('OTHERTEAM', 'Oakland Athletics');

    // act
    const resultMessage: string = await _getResultMessage(testDate, teamCode);

    // assert
    expect(resultMessage).toBe(expectedResult);
  });

  test('getYesterdayResultMessage', async () => {
    // arrange
    const teamCode: TeamKey = 'ana'; //doesn't matter, first team in json

    // act
    const resultMessage: string = await getYesterdayResultMessage(teamCode);

    // assert
    expect(resultMessage).toBeDefined();
  });
});

describe('createMessage() helper function unit tests', () => {
  test('handles single game played, target team won', () => {
    // arrange
    const gameResults: GameResult[] = [
      {
        targetTeamCode: 'chn',
        otherTeamCode: 'ana',
        status: 'won',
        scoreDifference: 1,
      },
    ];
    const expectedMessage: string = trashTalkJSON.givenTeamWon
      .replace('TEAMNAME', mlbTeamsJSON[gameResults[0].targetTeamCode])
      .replace('OTHERTEAM', mlbTeamsJSON[gameResults[0].otherTeamCode]);

    // act
    const message: string = createMessage(gameResults);

    // assert
    expect(message).toBe(expectedMessage);
  });

  test('single game, target team lost', () => {
    // arrange
    const gameResults: GameResult[] = [
      {
        targetTeamCode: 'chn',
        otherTeamCode: 'ana',
        status: 'lost',
        scoreDifference: 1,
      },
    ];
    const expectedMessage: string = trashTalkJSON.givenTeamLost
      .replace('TEAMNAME', mlbTeamsJSON[gameResults[0].targetTeamCode])
      .replace('OTHERTEAM', mlbTeamsJSON[gameResults[0].otherTeamCode]);

    // act
    const message: string = createMessage(gameResults);

    // assert
    expect(message).toBe(expectedMessage);
  });
});
