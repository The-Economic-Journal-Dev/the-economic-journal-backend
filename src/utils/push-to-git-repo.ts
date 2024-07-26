import git from "../config/git-config";

// Repo name
const repo = "dummy"; //Repo name
// User name and password of your GitHub
const userName = "username";
const password = "password";
// Set up GitHub url like this so no manual entry of user pass needed
const gitHubUrl = `https://${userName}:${password}@github.com/${userName}/${repo}`;

// add local git config like username and email
git.addConfig("user.email", "balvinder294@gmail.com");
git.addConfig("user.name", "Balvinder Singh");

// Add remore repo url as origin to repo
git.addRemote("origin", gitHubUrl);
// Add all files for commit
git.add(".").then(
  (addSuccess) => {
    console.log(addSuccess);
  },
  (failedAdd) => {
    console.log("adding files failed");
  },
);
// Commit files as Initial Commit
git.commit("Intial commit by simplegit").then(
  (successCommit) => {
    console.log(successCommit);
  },
  (failed) => {
    console.log("failed commmit");
  },
);
// Finally push to online repository
git.push("origin", "master").then(
  (success) => {
    console.log("repo successfully pushed");
  },
  (failed) => {
    console.log("repo push failed");
  },
);
