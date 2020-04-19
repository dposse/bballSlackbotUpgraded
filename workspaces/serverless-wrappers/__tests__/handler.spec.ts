import { runOrchestrator, LambdaResponse, IRunBotOrchestratorDependencies } from '../handler';

describe('canary tests', () => {
  test('is true true?', () => {
    expect(true).toBe(true);
  })

  test('true should not be false', () => {
    expect(true).not.toBe(false)
  })
})

// don't need to explicitly test arguments and return values, covered by typescript
describe('runOrchestrator unit tests with mocks', () => {
  describe('happy path', () => {
    test('all dependencies run successfully', async () => {
      // mock dependencies
      const dependencies: IRunBotOrchestratorDependencies = {
        getMessage: function(): LambdaResponse {
          return {
            statusCode: 200,
            body: {
              message: 'test getMessage',
              logStreamName: 'test logstreamname'
            }
          }
        },
        sendMessage: function(message: string): LambdaResponse {
          return {
            statusCode: 200,
            body: {
              message: `test sendMessage, received ${message}`,
              logStreamName: 'test logstreamname'
            }
          }
        }
      }

      //run orchestrator with mocked dependencies
      const result: LambdaResponse = await runOrchestrator(dependencies);
      expect(result).toBeDefined();
      expect(result.statusCode).toBe(200);
    })
  })

  describe('sad path', () => {
    test('dependency getMessage throws error', async () => {
      // mock dependencies
      const dependencies: IRunBotOrchestratorDependencies = {
        getMessage: function(): LambdaResponse {
          throw new Error('mlbService failed');
        },
        sendMessage: function(message: string): LambdaResponse {
          return {
            statusCode: 200,
            body: {
              message: `test sendMessage, received ${message}`,
              logStreamName: 'test logstreamname'
            }
          }
        }
      }

      //run orchestrator with mocked dependencies
      const result: LambdaResponse = await runOrchestrator(dependencies);
      expect(result).toBeDefined();
      expect(result.statusCode).toBe(500);
    })

    test('dependency sendMessage throws error', async () => {
      // mock dependencies
      const dependencies: IRunBotOrchestratorDependencies = {
        getMessage: function(): LambdaResponse {
          return {
            statusCode: 200,
            body: {
              message: 'test getMessage',
              logStreamName: 'test logstreamname'
            }
          }
        },
        sendMessage: function(message: string): LambdaResponse {
          throw new Error('slackService failed');
        }
      }

      //run orchestrator with mocked dependencies
      const result: LambdaResponse = await runOrchestrator(dependencies);
      expect(result).toBeDefined();
      expect(result.statusCode).toBe(500);
    })
  })
})