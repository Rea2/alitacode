// Copyright 2023 EPAM Systems
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const vscode = require("vscode");
const { workspaceService, alitaService } = require("./services");
const { COMMAND, EXTERNAL_PROMPTS_PROVIDERS } = require("./constants/index");
const {
  addContext,
  addExample,
  createPrompt,
  predict,
  addGoodPrediction,
  initAlita,
  syncPrompts,
  onConfigChange
} = require("./commands");

function showInputBox(options, placeHolder) {
  return vscode.window.showQuickPick(options, { placeHolder });
}

const splitSign = " --- ";
function createListOfFunctions(providerItems) {
  return providerItems.map(item => {
    let key = Object.keys(item)[0];
    let value = item[key];
    return `${value}${splitSign}[${key}]`
  })
}

async function activate(context) {
  await vscode.commands.executeCommand("setContext", "alitacode.ExtentablePlatforms", EXTERNAL_PROMPTS_PROVIDERS);
  try {
    await onConfigChange();
  } catch (error) {
    console.error(error);
  }
  

  vscode.workspace.onDidChangeConfiguration(async (e) => {
    await onConfigChange();
  });

  const predictSub = vscode.commands.registerCommand(
    COMMAND.PREDICT,
    predict.bind(null)
  );


  const initAlitaSub = vscode.commands.registerCommand(
    COMMAND.INIT_ALITA,
    initAlita
  );
  
  const syncPromptsSub = vscode.commands.registerCommand(
    COMMAND.SYNC_PROMPTS,
    syncPrompts
  );

  const createPromptSub = vscode.commands.registerCommand(
    COMMAND.CREATE_PROMPT,
    createPrompt.bind(null, workspaceService.promptsList)
  );

  const addContextSub = vscode.commands.registerCommand(
    COMMAND.ADD_CONTEXT,
    addContext.bind(null, workspaceService.promptsList)
  );

  const addExampleSub = vscode.commands.registerCommand(
    COMMAND.ADD_EXAMPLE,
    addExample.bind(null, workspaceService.promptsList)
  );

  const addGoodPredictionSub = vscode.commands.registerCommand(
    COMMAND.ADD_GOOD_PREDICTION,
    addGoodPrediction
  );


  const getAvailableModelsSub = vscode.commands.registerCommand("alitacode.getAvailableAIModels", async () => {
    let avaiableModels = createListOfFunctions(await alitaService.getAIModelNames());
    let selectedModel = await showInputBox(avaiableModels, "Please select a LLM provider:");
    if (selectedModel) {
      const configuration = vscode.workspace.getConfiguration();
      configuration.update("alitacode.modelName", selectedModel.split(splitSign)[0], vscode.ConfigurationTarget.Global);
      configuration.update("alitacode.modelGroupName",
        selectedModel.split(splitSign)[1],
        vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(`You selected: ${selectedModel}`);
    } else {
      vscode.window.showInformationMessage("Operation cancelled.");
    }
  });

  const displayCurrentModel = vscode.commands.registerCommand("alitacode.displayCurrentAIModel", async () => {
    const configuration = vscode.workspace.getConfiguration().get("alitacode.modelName");
    if (configuration === undefined || configuration === "" || configuration === null) {
      return "provider not defined yet"
    }
    return configuration;
  });

  context.subscriptions.push(predictSub);
  context.subscriptions.push(createPromptSub);
  context.subscriptions.push(addContextSub);
  context.subscriptions.push(addExampleSub);
  context.subscriptions.push(addGoodPredictionSub);
  context.subscriptions.push(initAlitaSub);
  context.subscriptions.push(syncPromptsSub);
  context.subscriptions.push(getAvailableModelsSub);
  context.subscriptions.push(displayCurrentModel);

  const api = {
    alitaService,
    workspaceService
  }
  return api
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
