Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const tslib_1 = require("tslib");
const core = tslib_1.__importStar(require("@actions/core"));
const downloader_1 = require("./downloader");
const installer_1 = require("./installer");
const builder_1 = require("./builder");
async function run() {
    try {
        await (0, installer_1.installDeps)();
        const paths = await (0, downloader_1.downloadOpenCV)();
        await (0, builder_1.buildAndInstallOpenCV)(paths);
    }
    catch (error) {
        core.error(error);
        if (error instanceof Error)
            core.setFailed(error.message);
    }
}
//# sourceMappingURL=index.js.map
