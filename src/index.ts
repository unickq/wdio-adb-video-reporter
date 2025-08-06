import WDIOReporter from "@wdio/reporter";
import { spawn, execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";

export interface WdioAdbVideoReporterOptions {
  /**
   * Output directory for saved videos
   * @default "./videos"
   */
  outputDir?: string;

  /**
   * Save all videos regardless of test results
   * @default false
   */
  saveAllVideos?: boolean;

  /**
   * Disable video recording completely
   * @default false
   */
  disabled?: boolean;

  /**
   * Add timestamp to video filenames
   * @default true
   */
  timestamp?: boolean;

  /**
   * Enable logging output
   * @default false
   */
  logs?: boolean;
}

/**
 * WebDriverIO reporter for recording Android device screens using ADB
 *
 * Features:
 * - Conditional recording based on ADB_VIDEO environment variable
 * - Smart saving (only save on test failures or when configured)
 * - Timestamp support for unique filenames
 * - Complete disable option
 *
 */
export default class WdioAdbVideoReporter extends WDIOReporter {
  private recordProcess: ReturnType<typeof spawn> | null = null;
  private hasFailedTests = false;
  private readonly outputDir: string;
  private readonly saveAllVideos: boolean;
  private readonly disabled: boolean;
  private readonly timestamp: boolean;
  private readonly logs: boolean;
  private readonly tempFilename = "wdio-screen-record.mp4";
  private currentSpecFile = "unknown";

  private createLog(enabled: boolean) {
    const logWithLevel =
      (level: string, consoleFn: (...args: any[]) => void) =>
      (message: string, ...args: any[]) => {
        if (enabled) {
          const timestamp = new Date().toISOString();
          consoleFn(
            `${timestamp} ${level} WdioAdbVideoReporter: ${message}`,
            ...args
          );
        }
      };

    return {
      info: logWithLevel("INFO", console.log),
      warn: logWithLevel("WARN", console.warn),
      error: logWithLevel("ERROR", console.error),
      debug: logWithLevel("DEBUG", console.debug),
    };
  }

  private log: ReturnType<typeof this.createLog>;

  constructor(options: WdioAdbVideoReporterOptions = {}) {
    const outputDir = options.outputDir || "./videos";
    if (!existsSync(outputDir)) {
      try {
        mkdirSync(outputDir, { recursive: true });
      } catch (error) {
        console.warn(`Failed to create output directory: ${error}`);
      }
    }

    const reporterOptions = {
      ...options,
      logFile: false, // Disable log file creation
      stdout: true, // Log to console instead
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(reporterOptions as any);
    this.outputDir = outputDir;
    this.saveAllVideos = options.saveAllVideos || false;
    this.disabled = options.disabled || false;
    this.timestamp = options.timestamp !== false;
    this.logs = options.logs || false;

    this.log = this.createLog(this.logs);

    if (this.disabled) {
      this.log.info("ADB Video Reporter is disabled");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRunnerStart(runner: any) {
    if (this.disabled) {
      this.log.debug("Skipping video recording - reporter is disabled");
      return;
    }

    if (runner.specs && runner.specs.length > 0) {
      this.currentSpecFile =
        runner.specs[0].split("/").pop()?.replace(".ts", "") || "unknown";
    }
    this.ensureOutputDirExists();
    this.startRecording();
  }

  onRunnerEnd() {
    if (this.disabled) {
      this.log.debug("Skipping video handling - reporter is disabled");
      return;
    }

    const shouldSave = this.saveAllVideos || this.hasFailedTests;

    if (shouldSave) {
      let filename: string;
      if (this.timestamp) {
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, 19);
        filename = `${timestamp}_${this.currentSpecFile}.mp4`;
      } else {
        filename = `${this.currentSpecFile}.mp4`;
      }
      const savePath = `${this.outputDir}/${filename}`;
      this.stopRecording(savePath);
    } else {
      this.stopRecording();
    }
  }

  onTestFail() {
    if (this.disabled) {
      return;
    }
    this.hasFailedTests = true;
  }

  private startRecording(): void {
    this.log.info("Starting screen record...");
    this.recordProcess = spawn(
      "adb",
      ["shell", "screenrecord", `/sdcard/${this.tempFilename}`],
      {
        detached: true,
        stdio: "ignore",
      }
    );

    this.recordProcess.unref();
  }

  private stopRecording(savePath?: string): void {
    this.killRecordProcess();

    if (savePath) {
      this.saveVideo(savePath);
    } else {
      this.log.info("Video discarded");
    }

    this.cleanupTempFile();
  }

  private killRecordProcess(): void {
    if (this.recordProcess && !this.recordProcess.killed) {
      this.log.info("Stopping screen record...");
      try {
        if (this.recordProcess.pid !== undefined) {
          process.kill(-this.recordProcess.pid);
        } else {
          this.log.warn("Cannot kill screen record process: pid is undefined.");
        }
      } catch (error) {
        this.log.error("Failed to kill screen record process:", error);
      }
    }
  }

  private saveVideo(savePath: string): void {
    this.ensureOutputDirExists();

    try {
      execSync(`adb pull /sdcard/${this.tempFilename} ${savePath}`, {
        stdio: "inherit",
      });
      this.log.info(`Video saved as ${savePath}`);
    } catch (error) {
      this.log.error("Failed to pull video:", error);
    }
  }

  private ensureOutputDirExists(): void {
    if (!existsSync(this.outputDir)) {
      this.log.info(`Creating output directory: ${this.outputDir}`);
      try {
        mkdirSync(this.outputDir, { recursive: true });
      } catch (error) {
        this.log.error(`Failed to create output directory: ${error}`);
      }
    }
  }

  private cleanupTempFile(): void {
    try {
      execSync(`adb shell rm /sdcard/${this.tempFilename}`, {
        stdio: "ignore",
      });
    } catch (error) {
      this.log.warn("Failed to cleanup temp file:", error);
    }
  }
}
