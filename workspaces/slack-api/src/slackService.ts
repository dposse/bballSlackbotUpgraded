import { WebClient, ErrorCode } from '@slack/web-api';
require('dotenv').config();

type PostToSlackReturn = {
  success: boolean;
  error?: string;
};

export async function postToSlack(_message: string, _channel: string, _targetUser: string): Promise<PostToSlackReturn> {
  // Initialize
  const slackClient = new WebClient();
  const messageText = 'back to donuts';
  const conversationId = 'secret-channel';

  try {
    // Or read a token from the environment variables
    const token = process.env.SLACK_TOKEN;
    // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
    // Post a message to the channel, and await the result.
    await slackClient.chat.postMessage({
      token,
      text: messageText,
      channel: conversationId,
      as_user: true,
    });
  } catch (error) {
    let errMsg;
    // Check the code property, and when its a PlatformError, log the whole response.
    if (error.code === ErrorCode.PlatformError) {
      errMsg = `Slack error: ${error.data.error}`;
    } else {
      // Some other error!
      errMsg = `Possible non Slack error: ${error}`;
    }

    return {
      success: false,
      error: errMsg,
    };
  }

  // return a success response
  const response: PostToSlackReturn = {
    success: true,
  };

  return response;
}
