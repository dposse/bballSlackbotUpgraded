import {
  IMessageGetter,
  InvokeLambdaParams,
  AWSLambdaResponse,
  GetMessagePayload,
  IMessageSender,
  IRunBotOrchestratorDependencies,
} from "../types";
const AWS = require("aws-sdk");
const lambda = new AWS.Lambda({ region: "us-east-1" });

class GetMessageLambda implements IMessageGetter {
  async getMessage() {
    const mlbLambdaParams: InvokeLambdaParams = {
      FunctionName: <string>process.env.GET_MESSAGE_LAMBDA,
      InvocationType: "RequestResponse",
      LogType: "Tail",
      Payload: JSON.stringify({ teamCode: process.env.TARGET_TEAMCODE }),
    };

    const lambdaResponse: AWSLambdaResponse = await lambda
      .invoke(mlbLambdaParams)
      .promise();
    const payload: GetMessagePayload = JSON.parse(lambdaResponse.Payload);

    return payload.message;
  }
}

class SendMessageLambda implements IMessageSender {
  sendMessage = (message: string) => {
    const slackLambdaParams: InvokeLambdaParams = {
      FunctionName: <string>process.env.SEND_MESSAGE_LAMBDA,
      InvocationType: "RequestResponse",
      LogType: "Tail",
      Payload: JSON.stringify({ message: message }),
    };

    return lambda.invoke(slackLambdaParams).promise();
  };
}

export function initDependencies(): Promise<IRunBotOrchestratorDependencies> {
  const getService = new GetMessageLambda();
  const sendService = new SendMessageLambda();

  return Promise.resolve({
    getService,
    sendService,
  });
}
