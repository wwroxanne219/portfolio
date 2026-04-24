import { fetchJSON, renderProjects } from './global.js';

const projects = await fetchJSON('./lib/projects.json');

const latestProjects = projects.slice(0, 3);

const projectsContainer = document.querySelector('.projects');

renderProjects(latestProjects, projectsContainer, 'h2');


const githubData = await fetchJSON('https://api.github.com/users/wwroxanne219');

const statsContainer = document.querySelector('#profile-stats');

statsContainer.innerHTML = `
  <p>Public Repos: ${githubData.public_repos}</p>
  <p>Followers: ${githubData.followers}</p>
  <p>Following: ${githubData.following}</p>
  <p>Public Gists: ${githubData.public_gists}</p>
`;