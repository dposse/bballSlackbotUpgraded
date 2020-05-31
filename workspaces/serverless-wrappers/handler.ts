import { LambdaResponse, GetMessagePayload } from "./types/index";
import { Handler, ScheduledEvent, Context } from "aws-lambda";
import { initDependencies } from "./src/LambdaService";
import { runOrchestrator } from "./src/orchestrator";
import "source-map-support/register";
const { getYesterdayResultMessage } = require("mlb-api");
const { postToSlack } = require("slack-api");

const dependenciesReady = initDependencies();

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
  const { teamCode } = event;
  console.log(`received ${teamCode} from orchestrator`);
  const returnMessage = await getYesterdayResultMessage(teamCode);
  console.log(`sending message ${returnMessage}`);
  const payload: GetMessagePayload = { message: returnMessage };
  return payload;
};

// in aws this lambda is named bball-slackbot-upgraded-[dev/test/prod]-sendSlackMessageLambda
export const sendSlackMessageLambda: Handler = async (
  event,
  _context: Context
) => {
  console.log(`event:`, event);
  const { message } = event;
  const channel = process.env.SLACK_CHANNEL;
  const targetUser = process.env.TARGET_USER;
  return await postToSlack(message, channel, targetUser);
};
