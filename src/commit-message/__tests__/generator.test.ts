import { describe, expect, it } from "vitest";
import { generateCommitMessage } from "../generator";
import type { GitChangeInfo } from "../generator";

describe("generateCommitMessage", () => {
  const baseChanges: GitChangeInfo[] = [
    { relativePath: "src/index.ts", status: "modified" },
    { relativePath: "README.md", status: "modified" },
  ];

  it("builds a title with the branch prefix pattern applied", () => {
    const message = generateCommitMessage({
      branchName: "feature/amazing",
      branchPrefixPattern: "TASK-${branch}",
      includeImpactSection: true,
      changes: baseChanges,
    });

    expect(message.startsWith("TASK-feature/amazing feat:")).toBe(true);
  });

  it("omits the impact section when disabled", () => {
    const message = generateCommitMessage({
      branchName: "main",
      branchPrefixPattern: "",
      includeImpactSection: false,
      changes: baseChanges,
    });

    expect(message).not.toContain("Impact:");
  });

  it("falls back to a generic summary when no changes are provided", () => {
    const message = generateCommitMessage({
      branchName: "hotfix/no-files",
      branchPrefixPattern: "TASK-${branch}",
      includeImpactSection: true,
      changes: [],
    });

    expect(message).toContain("update project files");
  });
});
