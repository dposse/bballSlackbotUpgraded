import { IRunBotOrchestratorDependencies, LambdaResponse } from "../types";

export async function runOrchestrator(
  dependencies: IRunBotOrchestratorDependencies
): Promise<LambdaResponse> {
  const {
    getService: { getMessage },
    sendService: { sendMessage },
  } = dependencies;

  try {
    const messageToSend: string | null = await getMessage();

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
