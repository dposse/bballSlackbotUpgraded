import { runBot, LambdaResponse } from '../handler';

// create mock events to pass to lamdbas
//  don't think __mocks__ is necessary for this
//  copied from aws test event
import { ScheduledEvent, Context, Callback } from 'aws-lambda';
const mockScheduledEvent: ScheduledEvent = {
  "id": "cdc73f9d-aea9-11e3-9d5a-835b769c0d9c",
  "detail-type": "Scheduled Event",
  "source": "aws.events",
  "account": "{{{account-id}}}",
  "time": "1970-01-01T00:00:00Z",
  "region": "us-east-1",
  "resources": [
    "arn:aws:events:us-east-1:123456789012:rule/ExampleRule"
  ],
  "detail": {}
}

const mockContext: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'testFunction',
  functionVersion: '1.0.0',
  invokedFunctionArn: 'someARN',
  memoryLimitInMB: '1024',
  awsRequestId: 'someID',
  logGroupName: 'logGroupName',
  logStreamName: 'logStreamName',
  getRemainingTimeInMillis: () => 1,
  done: () => {},
  fail: () => {},
  succeed: () => {},
}

const mockCallback: Callback = () => {}

describe('canary tests', () => {
  test('is true true?', () => {
    expect(true).toBe(true);
  })

  test('true should not be false', () => {
    expect(true).not.toBe(false)
  })
})

describe('handler.runBot unit tests with mocks', () => {
  describe('happy path', () => {
    test('Matches LambdaResponse type, statusCode 200', async () => {
      const runBotResponse: LambdaResponse = await <Promise<LambdaResponse>>runBot(mockScheduledEvent, mockContext, mockCallback);
      expect(runBotResponse).toBeDefined();
      expect(runBotResponse.statusCode).toBe(200);
    })
  })

  describe('sad path', () => {
    test('Matches LambdaResponse type, statusCode 500', async () => {
      const runBotResponse: LambdaResponse = await <Promise<LambdaResponse>>runBot(mockScheduledEvent, mockContext, mockCallback);
      expect(runBotResponse).toBeDefined();
      expect(runBotResponse.statusCode).toBe(500);
    })
  })
})