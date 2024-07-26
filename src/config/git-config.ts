import { simpleGit, SimpleGit, SimpleGitOptions } from "simple-git";

const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  binary: "git",
  maxConcurrentProcesses: 4,
  trimmed: false,
};

const git: SimpleGit = simpleGit(options);

export default git;
