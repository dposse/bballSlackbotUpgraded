import { Handler, ScheduledEvent, Context } from 'aws-lambda';
import 'source-map-support/register';

export const runBot: Handler = async (event: ScheduledEvent, _context: Context) => {
  console.log(`let's see how this goes`);
  console.log(`Event: \n${JSON.stringify(event, null, 2)}`);
  return _context.logStreamName;
}
