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


const { alitaService } = require("../services");
const vscode = require("vscode");
const SPLITTER = " --- ";

module.exports = async function () {
  const avaiableModels = createArrayOfAIProviders(await alitaService.getAIModelNames());
  const selectedModel = await showInputBox(avaiableModels, "Please select a LLM provider:");
  if (selectedModel) {
    const configuration = vscode.workspace.getConfiguration();
    configuration.update("alitacode.modelName", selectedModel.split(SPLITTER)[0], vscode.ConfigurationTarget.Global);
    const uid = await alitaService.getAIModelUid(selectedModel.split(SPLITTER)[1]);
    configuration.update("alitacode.integrationUid", uid.toString(), vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`You selected: ${selectedModel}`);
  } else {
    vscode.window.showInformationMessage("Operation cancelled.");
  }
};

function createArrayOfAIProviders(providerItems) {
  return providerItems.map(item => {
    let key = Object.keys(item)[0];
    let value = item[key];
    return `${value}${SPLITTER}${key}`
  })
}

function showInputBox(options, placeHolder) {
  return vscode.window.showQuickPick(options, { placeHolder });
}