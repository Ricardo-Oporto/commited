import type { GitChangeInfo } from "./generator";

export function resolveBranchPrefix(
  pattern: string,
  rawBranchName: string
): string {
  const branch = rawBranchName.trim();
  const safeBranch = branch.split(/\s+/u).join("-");
  return pattern.replace("${branch}", safeBranch);
}

export function summarizeChanges(changes: GitChangeInfo[]): string {
  if (!changes.length) {
    return "update project files";
  }

  if (changes.length === 1) {
    const [change] = changes;
    return `${verbFor(change.status)} ${basename(change.relativePath)}`;
  }

  const uniqueFolders = new Set(
    changes
      .map((change) => directoryName(change.relativePath))
      .filter((dir) => dir.length > 0)
  );
  const inSingleFolder = uniqueFolders.size === 1;

  if (inSingleFolder) {
    const [folder] = Array.from(uniqueFolders);
    return `update ${changes.length} files in ${folder}`;
  }

  return `update ${changes.length} files`;
}

export function formatChangeList(changes: GitChangeInfo[]): string {
  if (!changes.length) {
    return "- no staged files detected";
  }

  return changes
    .map((change) => `- ${change.status} \`${change.relativePath}\``)
    .join("\n");
}

export function formatImpactSection(include: boolean): string {
  if (!include) {
    return "";
  }

  return ["", "Impact:", "- No breaking changes expected."].join("\n");
}

export function sanitizeBodyLine(text: string): string {
  return text.replace(/\s+$/u, "");
}

function verbFor(status: GitChangeInfo["status"]): string {
  switch (status) {
    case "added":
      return "add";
    case "deleted":
      return "remove";
    case "renamed":
      return "rename";
    case "modified":
    default:
      return "update";
  }
}

function basename(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] ?? path;
}

function directoryName(path: string): string {
  const parts = path.split(/[\\/]/);
  if (parts.length <= 1) {
    return "";
  }

  return parts.slice(0, -1).join("/");
}
