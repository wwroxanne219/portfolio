import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let data = [];
let commits = [];
let selectedCommits = [];

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      return {
        id: commit,
        author,
        date,
        time,
        timezone,
        datetime,
        lines,
        totalLines: lines.length,
      };
    });
}

function displayStats(data, commits) {
  const stats = d3.select('#stats');

  const numberOfFiles = d3.groups(data, (d) => d.file).length;
  const numberOfCommits = commits.length;
  const totalLines = data.length;
  const maxDepth = d3.max(data, (d) => d.depth);

  stats.html(`
    <dl class="stats">
      <dt>Total lines</dt>
      <dd>${totalLines}</dd>

      <dt>Files</dt>
      <dd>${numberOfFiles}</dd>

      <dt>Commits</dt>
      <dd>${numberOfCommits}</dd>

      <dt>Max depth</dt>
      <dd>${maxDepth}</dd>
    </dl>
  `);
}

function createScatterplot(commits) {
  const width = 800;
  const height = 500;
  const margin = { top: 20, right: 30, bottom: 50, left: 70 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  const yScale = d3
    .scaleTime()
    .domain([new Date('1970-01-01T00:00'), new Date('1970-01-01T23:59')])
    .range([usableArea.bottom, usableArea.top]);

  const rScale = d3
    .scaleSqrt()
    .domain(d3.extent(commits, (d) => d.totalLines))
    .range([4, 18]);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%I %p'));

  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat('')
        .tickSize(-usableArea.width)
    );

  const dots = svg
    .append('g')
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => {
      const time = new Date(`1970-01-01T${d.time}`);
      return yScale(time);
    })
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .attr('opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      showTooltip(event, commit);
    })
    .on('mouseleave', () => {
      hideTooltip();
    });

  const brush = d3.brush()
    .extent([
      [usableArea.left, usableArea.top],
      [usableArea.right, usableArea.bottom],
    ])
    .on('brush end', brushed);

  svg.append('g')
    .attr('class', 'brush')
    .call(brush);

  function brushed(event) {
    const selection = event.selection;

    selectedCommits = !selection
      ? []
      : commits.filter((d) => {
          const cx = xScale(d.datetime);
          const cy = yScale(new Date(`1970-01-01T${d.time}`));

          return (
            cx >= selection[0][0] &&
            cx <= selection[1][0] &&
            cy >= selection[0][1] &&
            cy <= selection[1][1]
          );
        });

    dots.classed('selected', (d) => selectedCommits.includes(d));
    updateSelectionCount();
    updateLanguageBreakdown();
  }
}

function showTooltip(event, commit) {
  const tooltip = document.querySelector('#commit-tooltip');

  document.querySelector('#commit-link').href = `https://github.com/wwroxanne219/portfolio/commit/${commit.id}`;
  document.querySelector('#commit-link').textContent = commit.id.slice(0, 7);
  document.querySelector('#commit-date').textContent = commit.date;
  document.querySelector('#commit-time').textContent = commit.time;
  document.querySelector('#commit-author').textContent = commit.author;
  document.querySelector('#commit-lines').textContent = commit.totalLines;

  tooltip.hidden = false;
  tooltip.style.left = `${event.clientX + 10}px`;
  tooltip.style.top = `${event.clientY + 10}px`;
}

function hideTooltip() {
  const tooltip = document.querySelector('#commit-tooltip');
  tooltip.hidden = true;
}

function updateSelectionCount() {
  const count = selectedCommits.length;
  const selectionCount = document.querySelector('#selection-count');

  if (count === 0) {
    selectionCount.textContent = 'No commits selected';
  } else {
    selectionCount.textContent = `${count} commit${count === 1 ? '' : 's'} selected`;
  }
}

function updateLanguageBreakdown() {
  const selectedLines = selectedCommits.flatMap((d) => d.lines);
  const container = d3.select('#language-breakdown');

  if (selectedLines.length === 0) {
    container.html('');
    return;
  }

  const breakdown = d3.rollups(
    selectedLines,
    (v) => v.length,
    (d) => d.type
  );

  container.html('');

  for (const [language, count] of breakdown) {
    container.append('dt').text(language);
    container.append('dd').text(`${count} lines`);
  }
}

data = await loadData();
commits = processCommits(data);

displayStats(data, commits);
createScatterplot(commits);