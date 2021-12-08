require("dotenv").config();
const { writeFile } = require("fs/promises");
const { graphql } = require("@octokit/graphql");

const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
  GITHUB_REPOSITORY_NAME = process.env.GITHUB_REPOSITORY_NAME,
  GITHUB_USERNAME = process.env.GITHUB_USERNAME;

const issuesQuery = `
query allIssues($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    issues(first: 100) {
      nodes {
        body
        bodyHTML
        closed
        closedAt
        createdAt
        title
        titleHTML
        url
      }
    }
  }
}


`;

const pullRequestsQuery = `
query allPullRequests($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    pullRequests(first: 100, orderBy: {field: CREATED_AT, direction: DESC}, states: MERGED) {
      nodes {
        body
        bodyHTML
        closedAt
        createdAt
        mergedAt
        title
        titleHTML
        url
      }
    }
  }
}
`;

async function getPullRequests() {
  console.log("Querying GitHub for pull requests");
  try {
    const response = await graphql(pullRequestsQuery, {
      headers: {
        authorization: "bearer " + GITHUB_PERSONAL_ACCESS_TOKEN,
      },
      owner: GITHUB_USERNAME,
      repo: GITHUB_REPOSITORY_NAME,
    });
    return response.repository.pullRequests.nodes;
  } catch (error) {
    console.error(error);
  }
}
async function getIssues() {
  console.log("Querying GitHub for issues");
  try {
    const response = await graphql(issuesQuery, {
      headers: {
        authorization: "bearer " + GITHUB_PERSONAL_ACCESS_TOKEN,
      },
      owner: GITHUB_USERNAME,
      repo: GITHUB_REPOSITORY_NAME,
    });
    return response.repository.issues.nodes;
  } catch (error) {
    console.error(error);
  }
}

async function populateGitHubData() {
  console.log("Populating GitHub data 🐙🐈");

  const pullRequests = await getPullRequests();
  await writeFile(`${__dirname}/../website/_data/githubPrs.json`, JSON.stringify(pullRequests, null, 2));

  const issues = await getIssues();
  await writeFile(`${__dirname}/../website/_data/githubIssues.json`, JSON.stringify(issues, null, 2));
}

populateGitHubData();

module.exports = populateGitHubData;
