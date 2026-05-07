console.log("IT'S ALIVE!");

const ARE_WE_LOCAL =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";

const BASE_PATH = ARE_WE_LOCAL ? "/" : "/portfolio/";

let pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "contact/", title: "Contact" },
  { url: "cv/", title: "CV" },
  { url: "meta/", title: "Meta" },
  { url: "https://github.com/wwroxanne219", title: "GitHub" }
  
];

let nav = document.createElement("nav");
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;

  if (!url.startsWith("http")) {
    url = BASE_PATH + url;
  }

  let a = document.createElement("a");
  a.href = url;
  a.textContent = p.title;

  a.classList.toggle(
    "current",
    a.host === location.host && a.pathname === location.pathname
  );

  if (a.host !== location.host) {
    a.target = "_blank";
  }

  nav.append(a);
}

document.body.insertAdjacentHTML(
  "afterbegin",
  `
    <label class="color-scheme">
      Theme:
      <select>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  `
);

let select = document.querySelector(".color-scheme select");

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty("color-scheme", colorScheme);
  select.value = colorScheme;
  localStorage.colorScheme = colorScheme;
}

select.addEventListener("input", function (event) {
  setColorScheme(event.target.value);
});

if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel) {
  containerElement.innerHTML = '';

  for (let project of projects) {
    const article = document.createElement('article');

    const heading = document.createElement(headingLevel);
    heading.textContent = project.title;

    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title;

    const p = document.createElement('p');
    p.textContent = project.description;

    article.appendChild(heading);
    article.appendChild(img);
    article.appendChild(p);

    containerElement.appendChild(article);
  }
}