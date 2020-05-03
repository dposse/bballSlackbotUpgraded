const { WebClient, ErrorCode } = require('@slack/web-api');
// Initialize
const web = new WebClient();
let result = 'base message';

exports.postToSlack = async (event) => {

  let slackToken = null;
  let messageText = "Let's get donuts!?";
  let conversationId = "secret-channel";
  const eventBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body

  if (eventBody && eventBody.slackToken) {
    slackToken = eventBody.slackToken;
    messageText = eventBody.messageText;
    conversationId = eventBody.conversationId;
  }

  try {
    // Or read a token from the environment variables
    const token = slackToken ? slackToken : process.env.SLACK_TOKEN;
    // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
    // Post a message to the channel, and await the result.
    result = await web.chat.postMessage({
      token,
      text: messageText,
      channel: conversationId,
    });
  } catch (error) {

    // Check the code property, and when its a PlatformError, log the whole response.
    if (error.code === ErrorCode.PlatformError) {
      let errMsg = `Slack error: ${error.data.error}`;
      if (typeof token !== 'string') {
        errMsg += '\n Must provide a \'slackToken\' as either a body param or SLACK_TOKEN env variable';
        return {
          statusCode: 401,
          headers: { 'Content-Type': 'text/plain' },
          body: errMsg,
        };
      }
    } else {
      // Some other error!
      console.log('Well, that was unexpected.');
    }
  }

  // return a 200 response
  const response =
  {
    statusCode: 200,
    body: JSON.stringify({
      message: `Successfully sent your message in conversation ${conversationId}`,
    }),
  }

  return response;
};