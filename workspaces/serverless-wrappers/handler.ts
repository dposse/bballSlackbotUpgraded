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
  message: string,
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
  const sendMessage = (message: string) => { 
    return <LambdaResponse>{} 
  }

  return Promise.resolve({
    getMessage,
    sendMessage
  })
}

const dependenciesReady = initDependencies();

export async function runOrchestrator(dependencies: IRunBotOrchestratorDependencies): Promise<LambdaResponse> {
  const { getMessage, sendMessage } = dependencies;
  
  try {
    const getMessageResponse: LambdaResponse = await getMessage();
    const messageToSend: string = getMessageResponse.message;
    await sendMessage(messageToSend);
  } catch (error) {
    return {
      statusCode: 500,
      message: `${error}`,
    }
  }
  
  return {
    statusCode: 200,
    message: 'runOrchestrator completed successfully',
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