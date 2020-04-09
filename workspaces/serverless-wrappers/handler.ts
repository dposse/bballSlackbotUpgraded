import { Handler, ScheduledEvent, Context } from 'aws-lambda';
import 'source-map-support/register';

// need aws-sdk to invoke lambdas
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda({ region: 'us-east-1' });

interface InvokeLambdaParams {
  FunctionName: string,
  InvocationType: string,
  LogType: string,
  Payload: string
}

// in aws this lambda is named bball-slackbot-upgraded-[dev/test/prod]-runBot
export const runBot: Handler = async (event: ScheduledEvent, _context: Context) => {
  const mlbLambdaParams: InvokeLambdaParams = {
    FunctionName: 'bball-slackbot-upgraded-dev-checkMLBGamesLambda',
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify({ test: 'test' })
  }

  try {
    const mlbResponse = await lambda.invoke(mlbLambdaParams).promise();
    console.log(`mlbResponse: `, mlbResponse);
  } catch (error) {
    console.error(error);
  }

  return _context.logStreamName;
}

// in aws this lambda is named bball-slackbot-upgraded-[dev/test/prod]-checkMLBGamesLambda
export const checkMLBGamesLambda: Handler = async (event, _context: Context) => {
  console.log(`in checkMLBGamesLambda`);
  console.log(`Event: \n${JSON.stringify(event, null, 2)}`);
  return _context.logStreamName;
}