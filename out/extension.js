"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode_1 = require("vscode");
const generator_1 = require("./commit-message/generator");
function activate(context) {
    const disposable = vscode_1.commands.registerCommand("commitAssistant.generateMessage", async () => {
        const repo = getPrimaryRepository();
        if (!repo) {
            vscode_1.window.showErrorMessage("Commit Assistant could not detect an active Git repository.");
            return;
        }
        const staged = repo.state.indexChanges;
        if (!staged.length) {
            vscode_1.window.showInformationMessage("Stage your changes before generating a commit message.");
            return;
        }
        const commitConfig = vscode_1.workspace.getConfiguration("commitAssistant");
        const includeImpactSection = commitConfig.get("includeImpactSection", true);
        const branchPrefixPattern = commitConfig.get("branchPrefixPattern", "TASK-${branch}");
        const branchName = repo.state.HEAD?.name ?? "detached";
        const changes = staged.map((change) => ({
            relativePath: vscode_1.workspace.asRelativePath(change.uri, true),
            status: statusLabel(change.status),
        }));
        const message = (0, generator_1.generateCommitMessage)({
            branchName,
            branchPrefixPattern,
            includeImpactSection,
            changes,
        });
        repo.inputBox.value = message;
        const selection = await vscode_1.window.showInformationMessage("Commit Assistant prepared a commit message from your staged changes.", "Commit Now", "Dismiss");
        if (selection === "Commit Now") {
            await commitWithMessage(repo, message);
        }
    });
    context.subscriptions.push(disposable);
}
function deactivate() {
    // Nothing to cleanup yet.
}
function getPrimaryRepository() {
    const gitExtension = vscode_1.extensions.getExtension("vscode.git");
    const api = gitExtension?.exports?.getAPI(1);
    if (!api?.repositories.length) {
        return undefined;
    }
    return api.repositories[0];
}
async function commitWithMessage(repository, message) {
    try {
        await repository.commit(message, { all: false });
        vscode_1.window.showInformationMessage("Commit Assistant committed your staged changes.");
    }
    catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        vscode_1.window.showErrorMessage(`Commit Assistant could not commit: ${reason}`);
    }
}
function statusLabel(status) {
    switch (status) {
        case 1 /* GitFileStatus.INDEX_ADDED */:
            return "added";
        case 2 /* GitFileStatus.INDEX_DELETED */:
            return "deleted";
        case 3 /* GitFileStatus.INDEX_RENAMED */:
            return "renamed";
        case 0 /* GitFileStatus.INDEX_MODIFIED */:
        default:
            return "modified";
    }
}
//# sourceMappingURL=extension.js.map