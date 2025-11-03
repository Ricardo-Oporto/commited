"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCommitMessage = generateCommitMessage;
const templates_1 = require("./templates");
function generateCommitMessage(options) {
    const title = buildTitle(options);
    const body = buildBody(options);
    return [title, body].filter((section) => section.length > 0).join("\n\n");
}
function buildTitle({ branchName, branchPrefixPattern, changes, }) {
    const summary = (0, templates_1.summarizeChanges)(changes);
    const prefix = (0, templates_1.resolveBranchPrefix)(branchPrefixPattern, branchName);
    const normalizedPrefix = prefix.length ? `${prefix} ` : "";
    return `${normalizedPrefix}feat: ${summary}`.trim();
}
function buildBody({ changes, includeImpactSection, }) {
    const summaryLine = (0, templates_1.sanitizeBodyLine)(`- ${capitalizeFirst((0, templates_1.summarizeChanges)(changes))}.`);
    const changeList = (0, templates_1.formatChangeList)(changes);
    const impactSection = (0, templates_1.formatImpactSection)(includeImpactSection);
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
function capitalizeFirst(input) {
    if (!input.length) {
        return input;
    }
    return input[0]?.toUpperCase() + input.slice(1);
}
//# sourceMappingURL=generator.js.map