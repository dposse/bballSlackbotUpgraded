import { runOrchestrator } from "../handler";
import {
  IMessageGetter,
  IMessageSender,
  IRunBotOrchestratorDependencies,
  LambdaResponse,
} from "../types";

describe("canary tests", () => {
  test("is true true?", () => {
    expect(true).toBe(true);
  });

  test("true should not be false", () => {
    expect(true).not.toBe(false);
  });
});

// don't need to explicitly test arguments and return values, covered by typescript
describe("runOrchestrator unit tests with mocks", () => {
  describe("happy path", () => {
    test("all dependencies run successfully", async () => {
      // mock dependencies
      class GetMessageTest implements IMessageGetter {
        getMessage() {
          return Promise.resolve("test getMessage");
        }
      }
      class SendMessageTest implements IMessageSender {
        sendMessage(_message: string) {
          return Promise.resolve();
        }
      }
      function initDependencies(): Promise<IRunBotOrchestratorDependencies> {
        const getService = new GetMessageTest();
        const sendService = new SendMessageTest();

        return Promise.resolve({ getService, sendService });
      }
      const dependenciesReady = initDependencies();
      const dependencies = await dependenciesReady;

      //run orchestrator with mocked dependencies
      const result: LambdaResponse = await runOrchestrator(dependencies);
      expect(result).toBeDefined();
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe("runOrchestrator completed successfully");
    });
  });

  describe("sad path", () => {
    test("dependency getMessage throws error", async () => {
      // mock dependencies
      class GetMessageTest implements IMessageGetter {
        getMessage() {
          return Promise.reject(new Error("mlbService failed"));
        }
      }
      class SendMessageTest implements IMessageSender {
        sendMessage(_message: string) {
          return Promise.resolve();
        }
      }
      function initDependencies(): Promise<IRunBotOrchestratorDependencies> {
        const getService = new GetMessageTest();
        const sendService = new SendMessageTest();

        return Promise.resolve({ getService, sendService });
      }
      const dependenciesReady = initDependencies();
      const dependencies = await dependenciesReady;

      //run orchestrator with mocked dependencies
      const result: LambdaResponse = await runOrchestrator(dependencies);
      expect(result).toBeDefined();
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe("Error: mlbService failed");
    });

    test("dependency sendMessage throws error", async () => {
      // mock dependencies
      class GetMessageTest implements IMessageGetter {
        getMessage() {
          return Promise.resolve("test getMessage");
        }
      }
      class SendMessageTest implements IMessageSender {
        sendMessage(_message: string) {
          return Promise.reject(new Error("slackService failed"));
        }
      }
      function initDependencies(): Promise<IRunBotOrchestratorDependencies> {
        const getService = new GetMessageTest();
        const sendService = new SendMessageTest();

        return Promise.resolve({ getService, sendService });
      }
      const dependenciesReady = initDependencies();
      const dependencies = await dependenciesReady;

      //run orchestrator with mocked dependencies
      const result: LambdaResponse = await runOrchestrator(dependencies);
      expect(result).toBeDefined();
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe("Error: slackService failed");
    });
  });
});
