import {
  commands,
  extensions,
  window,
  workspace,
  type ExtensionContext,
  type Uri,
} from "vscode";
import {
  generateCommitMessage,
  type GitChangeInfo,
} from "./commit-message/generator";

interface GitExtension {
  getAPI(version: number): GitAPI;
}

interface GitAPI {
  repositories: Repository[];
}

interface Repository {
  rootUri: Uri;
  inputBox: {
    value: string;
  };
  state: RepositoryState;
  commit(
    message: string,
    opts?: { all?: boolean; commitMessage?: string }
  ): Promise<void>;
}

interface RepositoryState {
  HEAD?: {
    name?: string;
  };
  indexChanges: Change[];
}

interface Change {
  uri: Uri;
  status: GitFileStatus;
}

const enum GitFileStatus {
  INDEX_MODIFIED = 0,
  INDEX_ADDED = 1,
  INDEX_DELETED = 2,
  INDEX_RENAMED = 3,
  INDEX_COPIED = 4,
  MODIFIED = 5,
  DELETED = 6,
  UNTRACKED = 7,
  IGNORED = 8,
  INTENT_TO_ADD = 9,
  ADDED_BY_US = 10,
  ADDED_BY_THEM = 11,
  DELETED_BY_US = 12,
  DELETED_BY_THEM = 13,
  BOTH_ADDED = 14,
  BOTH_DELETED = 15,
  BOTH_MODIFIED = 16,
}

export function activate(context: ExtensionContext): void {
  const disposable = commands.registerCommand(
    "commitAssistant.generateMessage",
    async () => {
      const repo = getPrimaryRepository();

      if (!repo) {
        window.showErrorMessage(
          "Commit Assistant could not detect an active Git repository."
        );
        return;
      }

      const staged = repo.state.indexChanges;
      if (!staged.length) {
        window.showInformationMessage(
          "Stage your changes before generating a commit message."
        );
        return;
      }

      const commitConfig = workspace.getConfiguration("commitAssistant");
      const includeImpactSection = commitConfig.get<boolean>(
        "includeImpactSection",
        true
      );
      const branchPrefixPattern = commitConfig.get<string>(
        "branchPrefixPattern",
        "TASK-${branch}"
      );

      const branchName = repo.state.HEAD?.name ?? "detached";
      const changes: GitChangeInfo[] = staged.map((change) => ({
        relativePath: workspace.asRelativePath(change.uri, true),
        status: statusLabel(change.status),
      }));

      const message = generateCommitMessage({
        branchName,
        branchPrefixPattern,
        includeImpactSection,
        changes,
      });

      repo.inputBox.value = message;

      const selection = await window.showInformationMessage(
        "Commit Assistant prepared a commit message from your staged changes.",
        "Commit Now",
        "Dismiss"
      );

      if (selection === "Commit Now") {
        await commitWithMessage(repo, message);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate(): void {
  // Nothing to cleanup yet.
}

function getPrimaryRepository(): Repository | undefined {
  const gitExtension = extensions.getExtension<GitExtension>("vscode.git");
  const api = gitExtension?.exports?.getAPI(1);

  if (!api?.repositories.length) {
    return undefined;
  }

  return api.repositories[0];
}

async function commitWithMessage(
  repository: Repository,
  message: string
): Promise<void> {
  try {
    await repository.commit(message, { all: false });
    window.showInformationMessage(
      "Commit Assistant committed your staged changes."
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    window.showErrorMessage(`Commit Assistant could not commit: ${reason}`);
  }
}

function statusLabel(status: GitFileStatus): GitChangeInfo["status"] {
  switch (status) {
    case GitFileStatus.INDEX_ADDED:
      return "added";
    case GitFileStatus.INDEX_DELETED:
      return "deleted";
    case GitFileStatus.INDEX_RENAMED:
      return "renamed";
    case GitFileStatus.INDEX_MODIFIED:
    default:
      return "modified";
  }
}
