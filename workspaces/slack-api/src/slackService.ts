import { WebClient, ErrorCode } from '@slack/web-api';
require('dotenv').config();

type PostToSlackReturn = {
  success: boolean;
  error?: string;
};

// Initialize
const slackClient = new WebClient();

export async function postToSlack(message: string, channel: string, targetUser: string): Promise<PostToSlackReturn> {
  try {
    const messageWithTarget = !targetUser ? message : `<@${targetUser}> ${message}`;
    // Or read a token from the environment variables
    const token = process.env.SLACK_TOKEN;
    // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
    // Post a message to the channel, and await the result.
    await slackClient.chat.postMessage({
      token,
      text: messageWithTarget,
      channel: channel,
      as_user: true,
    });
  } catch (error) {
    let errMsg;
    // Check the code property, and when its a PlatformError, log the whole response.
    if (error.code === ErrorCode.PlatformError) {
      errMsg = `Slack error: ${JSON.stringify(error.data.error)}`;
    } else {
      // Some other error!
      errMsg = `Possible non Slack error: ${JSON.stringify(error)}`;
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

// async function main() {
//   console.log(await postToSlack('enter a message', 'enter a channel', 'enter a target'));
// }

// main();
