import {
  IRunBotOrchestratorDependencies,
  InvokeLambdaParams,
  LambdaResponse,
} from "./types/index";
import { Handler, ScheduledEvent, Context } from "aws-lambda";
import "source-map-support/register";

const { getYesterdayResultMessage } = require("mlb-api");

// need aws-sdk to invoke lambdas
const AWS = require("aws-sdk");
const lambda = new AWS.Lambda({ region: "us-east-1" });

// dependency injection :O
function initDependencies(): Promise<IRunBotOrchestratorDependencies> {
  const getMessage = () => {
    const mlbLambdaParams: InvokeLambdaParams = {
      FunctionName: <string>process.env.GET_MESSAGE_LAMBDA,
      InvocationType: "RequestResponse",
      LogType: "Tail",
      Payload: JSON.stringify({ teamCode: process.env.TARGET_TEAMCODE }),
    };

    return lambda.invoke(mlbLambdaParams).promise();
  };

  const sendMessage = (message: string) => {
    const slackLambdaParams: InvokeLambdaParams = {
      FunctionName: <string>process.env.SEND_MESSAGE_LAMBDA,
      InvocationType: "RequestResponse",
      LogType: "Tail",
      Payload: JSON.stringify({ message: message }),
    };

    return lambda.invoke(slackLambdaParams).promise();
  };

  return Promise.resolve({
    getMessage,
    sendMessage,
  });
}

const dependenciesReady = initDependencies();

export async function runOrchestrator(
  dependencies: IRunBotOrchestratorDependencies
): Promise<LambdaResponse> {
  const { getMessage, sendMessage } = dependencies;

  try {
    const getMessageResponse: any = await getMessage();
    console.log(`getMessageResponse: `, getMessageResponse);

    //below shows typescript error - not sure how best to fix this
    const payload = JSON.parse(getMessageResponse.Payload);
    console.log(`getMessageResponse.Payload: `, payload);
    const messageToSend: string | null = payload.message;

    if (messageToSend == null) {
      // === doesn't work, not sure why. above log shows { "message": null } in json and { message: null } after parsing
      return {
        statusCode: 200,
        message:
          "runOrchestrator completed successfully - no games played yesterday",
      };
    }

    await sendMessage(messageToSend);
  } catch (error) {
    return {
      statusCode: 500,
      message: `${error}`,
    };
  }

  return {
    statusCode: 200,
    message: "runOrchestrator completed successfully",
  };
}

// in aws this lambda is named bball-slackbot-upgraded-[dev/test/prod]-runBot
// leaving as generic Handler type as ScheduledHandler is defined as Handler<ScheduledEvent, void>
//   if confirmed never using context, change
export const runBot: Handler<ScheduledEvent, LambdaResponse> = async (
  _event: ScheduledEvent,
  _context: Context
): Promise<LambdaResponse> => {
  console.log(`version .9`);
  const dependencies = await dependenciesReady;
  return await runOrchestrator(dependencies);
};

// in aws this lambda is named bball-slackbot-upgraded-[dev/test/prod]-checkMLBGamesLambda
export const checkMLBGamesLambda: Handler = async (
  event,
  _context: Context
) => {
  console.log(`in checkMLBGamesLambda`);
  console.log(`Event: \n${JSON.stringify(event, null, 2)}`);
  const { teamCode } = event;
  const returnMessage = await getYesterdayResultMessage(teamCode);
  return { message: returnMessage };
};

// in aws this lambda is named bball-slackbot-upgraded-[dev/test/prod]-sendSlackMessageLambda
export const sendSlackMessageLambda: Handler = async (
  event,
  _context: Context
) => {
  console.log(`in sendSlackMessageLambda`);
  console.log(`Event: \n${JSON.stringify(event, null, 2)}`);
  return "test run";
};
