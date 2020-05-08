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

  test('on test date 03/28/2018, no games played by anyone', async () => {
    // arrange
    const testDate: Date = new Date('March 28, 2018');
    const teamCode: TeamKey = 'nya';

    // act
    const resultMessage: string = await _getResultMessage(testDate, teamCode);

    // assert
    expect(resultMessage).toBe('');
  });

  test('getYesterdayResultMessage', async () => {
    // arrange
    const teamCode: TeamKey = 'ana'; //doesn't matter, first team in json

    // act
    const resultMessage: string | null = await getYesterdayResultMessage(
      teamCode
    );

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

  test('single game, target team draws', () => {
    // arrange
    const gameResults: GameResult[] = [
      {
        targetTeamCode: 'chn',
        otherTeamCode: 'ana',
        status: 'draw',
        scoreDifference: 1,
      },
    ];
    const expectedMessage: string = trashTalkJSON.givenTeamDraw
      .replace('TEAMNAME', mlbTeamsJSON[gameResults[0].targetTeamCode])
      .replace('OTHERTEAM', mlbTeamsJSON[gameResults[0].otherTeamCode]);

    // act
    const message: string = createMessage(gameResults);

    // assert
    expect(message).toBe(expectedMessage);
  });

  test('double header, won both', () => {
    // arrange
    const gameResults: GameResult[] = [
      {
        targetTeamCode: 'was',
        otherTeamCode: 'sea',
        status: 'won',
        scoreDifference: 2,
      },
      {
        targetTeamCode: 'was',
        otherTeamCode: 'sea',
        status: 'won',
        scoreDifference: 5,
      },
    ];
    const expectedMessage: string = trashTalkJSON.givenTeamDoubleWin
      .replace('TEAMNAME', mlbTeamsJSON[gameResults[0].targetTeamCode])
      .replace('OTHERTEAM', mlbTeamsJSON[gameResults[0].otherTeamCode]);

    // act
    const resultMessage: string = createMessage(gameResults);

    // assert
    expect(resultMessage).toBe(expectedMessage);
  });

  test('double header, won one, lost one', () => {
    // arrange
    const gameResults: GameResult[] = [
      {
        targetTeamCode: 'ari',
        otherTeamCode: 'pit',
        status: 'won',
        scoreDifference: 2,
      },
      {
        targetTeamCode: 'ari',
        otherTeamCode: 'pit',
        status: 'lost',
        scoreDifference: 5,
      },
    ];
    const expectedMessage: string = trashTalkJSON.givenTeamWonAndLost
      .replace('TEAMNAME', mlbTeamsJSON[gameResults[0].targetTeamCode])
      .replace('OTHERTEAM', mlbTeamsJSON[gameResults[0].otherTeamCode]);

    // act
    const resultMessage: string = createMessage(gameResults);

    // assert
    expect(resultMessage).toBe(expectedMessage);
  });

  test('double header, lost both', () => {
    // arrange
    const gameResults: GameResult[] = [
      {
        targetTeamCode: 'bos',
        otherTeamCode: 'mil',
        status: 'lost',
        scoreDifference: 2,
      },
      {
        targetTeamCode: 'bos',
        otherTeamCode: 'mil',
        status: 'lost',
        scoreDifference: 5,
      },
    ];
    const expectedMessage: string = trashTalkJSON.givenTeamDoubleLoss
      .replace('TEAMNAME', mlbTeamsJSON[gameResults[0].targetTeamCode])
      .replace('OTHERTEAM', mlbTeamsJSON[gameResults[0].otherTeamCode]);

    // act
    const resultMessage: string = createMessage(gameResults);

    // assert
    expect(resultMessage).toBe(expectedMessage);
  });

  test('double header, double draw or any draw/lost combination', () => {
    // arrange
    const gameResults: GameResult[] = [
      {
        targetTeamCode: 'bos',
        otherTeamCode: 'mil',
        status: 'draw',
        scoreDifference: 2,
      },
      {
        targetTeamCode: 'bos',
        otherTeamCode: 'mil',
        status: 'draw',
        scoreDifference: 5,
      },
    ];
    const expectedMessage: string = trashTalkJSON.givenTeamDoubleDraw
      .replace('TEAMNAME', mlbTeamsJSON[gameResults[0].targetTeamCode])
      .replace('OTHERTEAM', mlbTeamsJSON[gameResults[0].otherTeamCode]);

    // act
    const resultMessage: string = createMessage(gameResults);

    // assert
    expect(resultMessage).toBe(expectedMessage);
  });
});
