import { Handler, ScheduledEvent, Context } from 'aws-lambda';
import 'source-map-support/register';

// in aws this lambda is named bball-slackbot-upgraded-[dev/prod]-runBot
export const runBot: Handler = async (event: ScheduledEvent, _context: Context) => {
  console.log(`in runBot`);
  console.log(`Event: \n${JSON.stringify(event, null, 2)}`);
  return _context.logStreamName;
}

export const checkMLBGamesLambda: Handler = async (event, _context: Context) => {
  console.log(`in checkMLBGamesLambda`);
  console.log(`Event: \n${JSON.stringify(event, null, 2)}`);
  return _context.logStreamName;
}