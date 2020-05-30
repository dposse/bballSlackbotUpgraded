import { postToSlack } from '../src';
import { MockedWebClient, MockWebClient } from '@slack-wrench/jest-mock-web-client';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// require('@slack/web-api');

describe('slack-api tests', () => {
  describe('postToSlack unit tests', () => {
    // let client: WebClient;
    let client: MockWebClient;

    beforeEach(() => {
      client = MockedWebClient.mock.instances[0];
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
      expect(client.chat.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          text: message,
          channel: channel,
          as_user: true,
        }),
      );
      expect(result).toEqual({ success: true });
    });

    test('errors with mock slack', async () => {
      // arrange
      const message = 'test message';
      const channel = 'test channel';
      const targetUser = 'test userid';
      client.chat.postMessage.mockRejectedValue({
        ok: false,
        error: 'too_many_attachments',
      });

      // act
      const result = await postToSlack(message, channel, targetUser);

      // assert
      expect(result).toEqual(
        expect.objectContaining({
          success: false,
        }),
      );
    });
  });
});
