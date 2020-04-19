import { Handler, ScheduledEvent, Context } from 'aws-lambda';
import 'source-map-support/register';

/////////////////////////////////////////////////////////////////////////
/**
 * Types and Interfaces
 *  leaving in file as these are only used in lambdas
 */
type InvokeLambdaParams = {
  FunctionName: string,
  InvocationType: string,
  LogType: string,
  Payload: string
}

export type LambdaResponse = {
  statusCode: number,
  body: {
    message: string,
    logStreamName: string
  }
}

export interface IRunBotOrchestratorDependencies {
  getMessage(): LambdaResponse,
  sendMessage(message: string): LambdaResponse,
}
/////////////////////////////////////////////////////////////////////////

// need aws-sdk to invoke lambdas
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda({ region: 'us-east-1' });

// dependency injection :O
function initDependencies(): Promise<IRunBotOrchestratorDependencies> {
  const mlbLambdaParams: InvokeLambdaParams = {
    FunctionName: 'bball-slackbot-upgraded-dev-checkMLBGamesLambda',
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify({ test: 'test' })
  }
  
  const getMessage = () => {
    return lambda.invoke(mlbLambdaParams).promise();
  }

  //add slack lambda when it is complete
  const sendMessage = (message: string) => { return <LambdaResponse>{} }

  return Promise.resolve({
    getMessage,
    sendMessage
  })
}

const dependenciesReady = initDependencies();

export async function runOrchestrator(dependencies: IRunBotOrchestratorDependencies): Promise<LambdaResponse> {
  const { getMessage, sendMessage } = dependencies;
  
  try {
    const slackMessage = await getMessage()
  } catch (error) {
    return {
      statusCode: 500,
      body: {
        message: `error: ${error}`,
        logStreamName: 'dev logstreamname'
      }
    }
  }
  
  return {
    statusCode: 200,
    body: {
      message: 'runOrchestrator completed successfully',
      logStreamName: 'dev logstreamname'
    }
  }
}

// in aws this lambda is named bball-slackbot-upgraded-[dev/test/prod]-runBot
// leaving as generic Handler type as ScheduledHandler is defined as Handler<ScheduledEvent, void>
//   if confirmed never using context, change
export const runBot: Handler<ScheduledEvent, LambdaResponse> = async (_event: ScheduledEvent, _context: Context): Promise<LambdaResponse> => {
  const dependencies = await dependenciesReady;
  return await runOrchestrator(dependencies);
}

// in aws this lambda is named bball-slackbot-upgraded-[dev/test/prod]-checkMLBGamesLambda
export const checkMLBGamesLambda: Handler = async (event, _context: Context) => {
  console.log(`in checkMLBGamesLambda`);
  console.log(`Event: \n${JSON.stringify(event, null, 2)}`);
  return _context.logStreamName;
}