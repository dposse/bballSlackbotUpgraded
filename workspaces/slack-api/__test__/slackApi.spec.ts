import { postToSlack } from '../src';

describe('slack-api tests', () => {
  describe('postToSlack unit tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('exists', () => {
      // arrange
      // act
      // assert
      expect(postToSlack).toBeDefined();
    });
    test('sends message with mock slack', async () => {
      // arrange
      const message = 'test message';
      const channel = 'test channel';
      const targetUser = 'test userid';

      // act
      const result = await postToSlack(message, channel, targetUser);

      // assert
      expect(result).toBe({ success: true });
    });
  });
});
