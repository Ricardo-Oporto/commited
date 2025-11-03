"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBranchPrefix = resolveBranchPrefix;
exports.summarizeChanges = summarizeChanges;
exports.formatChangeList = formatChangeList;
exports.formatImpactSection = formatImpactSection;
exports.sanitizeBodyLine = sanitizeBodyLine;
function resolveBranchPrefix(pattern, rawBranchName) {
    const branch = rawBranchName.trim();
    const safeBranch = branch.split(/\s+/u).join("-");
    return pattern.replace("${branch}", safeBranch);
}
function summarizeChanges(changes) {
    if (!changes.length) {
        return "update project files";
    }
    if (changes.length === 1) {
        const [change] = changes;
        return `${verbFor(change.status)} ${basename(change.relativePath)}`;
    }
    const uniqueFolders = new Set(changes
        .map((change) => directoryName(change.relativePath))
        .filter((dir) => dir.length > 0));
    const inSingleFolder = uniqueFolders.size === 1;
    if (inSingleFolder) {
        const [folder] = Array.from(uniqueFolders);
        return `update ${changes.length} files in ${folder}`;
    }
    return `update ${changes.length} files`;
}
function formatChangeList(changes) {
    if (!changes.length) {
        return "- no staged files detected";
    }
    return changes
        .map((change) => `- ${change.status} \`${change.relativePath}\``)
        .join("\n");
}
function formatImpactSection(include) {
    if (!include) {
        return "";
    }
    return ["", "Impact:", "- No breaking changes expected."].join("\n");
}
function sanitizeBodyLine(text) {
    return text.replace(/\s+$/u, "");
}
function verbFor(status) {
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
function basename(path) {
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1] ?? path;
}
function directoryName(path) {
    const parts = path.split(/[\\/]/);
    if (parts.length <= 1) {
        return "";
    }
    return parts.slice(0, -1).join("/");
}
//# sourceMappingURL=templates.js.map