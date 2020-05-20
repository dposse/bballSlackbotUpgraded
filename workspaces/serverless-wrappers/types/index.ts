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

export type AWSLambdaResponse = {
  StatusCode: number;
  ExecutedVersion: string;
  FunctionError?: string;
  LogResult: string;
  Payload: string;
};

export type GetMessagePayload = {
  message: string | null;
};

export interface IMessageGetter {
  getMessage(): Promise<string | null>;
}

export interface IMessageSender {
  sendMessage(message: string): Promise<void>;
}

export interface IRunBotOrchestratorDependencies {
  getService: IMessageGetter;
  sendService: IMessageSender;
}
