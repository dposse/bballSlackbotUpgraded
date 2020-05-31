# Serverless Slacking

## Intent

- serverless call of the [@slack/web-api](https://www.npmjs.com/package/@slack/web-api) to send messages based on a CRON schedule or POST request.

## Prerequisites

- You have created a Slack App, with necessary OAuth of:
  - chat:write
  - chat:write:public
- You have a SLACK_TOKEN variable added to your local .env and AWS lambda environment variables
- If the channel you are posting to is private, you will need to add your slackbot to said channel. 
  - This can be done with `/invite <slackbotName>`
