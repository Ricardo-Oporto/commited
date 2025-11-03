import {
  formatChangeList,
  formatImpactSection,
  resolveBranchPrefix,
  sanitizeBodyLine,
  summarizeChanges,
} from "./templates";

export type GitChangeStatus = "added" | "modified" | "deleted" | "renamed";

export interface GitChangeInfo {
  relativePath: string;
  status: GitChangeStatus;
}

export interface GenerateCommitMessageOptions {
  branchName: string;
  branchPrefixPattern: string;
  includeImpactSection: boolean;
  changes: GitChangeInfo[];
}

export function generateCommitMessage(
  options: GenerateCommitMessageOptions
): string {
  const title = buildTitle(options);
  const body = buildBody(options);
  return [title, body].filter((section) => section.length > 0).join("\n\n");
}

function buildTitle({
  branchName,
  branchPrefixPattern,
  changes,
}: GenerateCommitMessageOptions): string {
  const summary = summarizeChanges(changes);
  const prefix = resolveBranchPrefix(branchPrefixPattern, branchName);
  const normalizedPrefix = prefix.length ? `${prefix} ` : "";
  return `${normalizedPrefix}feat: ${summary}`.trim();
}

function buildBody({
  changes,
  includeImpactSection,
}: GenerateCommitMessageOptions): string {
  const summaryLine = sanitizeBodyLine(
    `- ${capitalizeFirst(summarizeChanges(changes))}.`
  );
  const changeList = formatChangeList(changes);
  const impactSection = formatImpactSection(includeImpactSection);

  return ["Summary:", summaryLine, "", "Changes:", changeList, impactSection]
    .filter((section, index, arr) => {
      if (!section) {
        return false;
      }

      // Avoid emitting duplicate blank lines from the composition above.
      if (section === "" && arr[index - 1] === "") {
        return false;
      }

      return true;
    })
    .join("\n");
}

function capitalizeFirst(input: string): string {
  if (!input.length) {
    return input;
  }

  return input[0]?.toUpperCase() + input.slice(1);
}
