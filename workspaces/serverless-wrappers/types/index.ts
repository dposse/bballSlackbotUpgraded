export type InvokeLambdaParams = {
  FunctionName: string;
  InvocationType: string;
  LogType: string;
  Payload: string;
};

export type LambdaResponse = {
  statusCode: number;
  message: string;
};

export interface IRunBotOrchestratorDependencies {
  getMessage(): LambdaResponse;
  sendMessage(message: string): LambdaResponse;
}
