import { postToSlack } from '../src';

jest.unmock('@slack/web-api');

describe('postToSlack integration tests', () => {
  test('sends message to slack, no target user', async () => {
    // arrange
    const message = 'test message no target user';
    const channel = 'secret-channel'; // CHANGE THIS TO A REAL CHANNEL
    const targetUser = ''; // CHANGE THIS TO TEST DIFFERENT USERS

    // act
    const result = await postToSlack(message, channel, targetUser);

    // assert
    expect(result).toEqual({ success: true });
  });

  test('sends message to slack, target user', async () => {
    // arrange
    const message = 'test message target user';
    const channel = 'secret-channel'; // CHANGE THIS TO A REAL CHANNEL
    const targetUser = 'UMHJGSTCK'; // CHANGE THIS TO TEST DIFFERENT USERS

    // act
    const result = await postToSlack(message, channel, targetUser);

    // assert
    expect(result).toEqual({ success: true });
  });

  test('errors, invalid channel name', async () => {
    // arrange
    const message = 'test message';
    const channel = 'this should not be a real channel name';
    const targetUser = ''; // CHANGE THIS TO TEST DIFFERENT USERS

    // act
    const result = await postToSlack(message, channel, targetUser);

    // assert
    expect(result).toEqual({ success: false, error: 'Slack error: "channel_not_found"' });
  });
});
