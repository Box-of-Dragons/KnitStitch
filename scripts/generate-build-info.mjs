/**
 * generate-build-info.mjs — Node.js build info + changelog generator.
 *
 * Builds the release list from the repository's GitHub Releases plus local
 * semver git tags that don't have a published release (e.g. the v0.1.0–v0.7.0
 * guesstimated tags). Tag bodies are generated from the conventional commits
 * between the previous tag and the current tag.
 *
 * Outputs:
 *   - public/js/buildInfo.js  (window.BUILD_INFO)
 *   - CHANGELOG.md            (release-based markdown changelog)
 *   - public/pages/changelog-v2.html (HTML changelog fragment)
 *
 * Usage:
 *   node scripts/generate-build-info.mjs --root=. --output=public/js/buildInfo.js --format=js
 *   node scripts/generate-build-info.mjs --root=. --output=CHANGELOG.md --format=md
 *   node scripts/generate-build-info.mjs --root=. --output=public/pages/changelog-v2.html --format=html
 *
 * Parameters:
 *   --root     Repository root path (required)
 *   --output   Output file path (required)
 *   --format   Output format: js, md, html (default: js)
 *   --repo     GitHub owner/repo (default: parsed from git remote origin)
 *
 * Environment:
 *   GITHUB_TOKEN  Optional token for private repositories.
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const eq = arg.indexOf('=');
      if (eq !== -1) {
        args[arg.slice(2, eq)] = arg.slice(eq + 1);
      } else {
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith('--')) {
          args[key] = next;
          i++;
        } else {
          args[key] = true;
        }
      }
    }
  }
  return args;
}

function git(root, ...args) {
  try {
    const output = execFileSync('git', ['-C', root, ...args], {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
    });
    return output;
  } catch (e) {
    throw new Error(`git ${args.join(' ')} failed: ${e.message}`);
  }
}

function parseRemoteUrl(url) {
  const match = /github\.com[:/]([^/]+)\/([^/\s.]+(?:\.git)?)/.exec(url);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
  };
}

function getRepoSlug(root, args) {
  if (args.repo) {
    const [owner, repo] = args.repo.split('/');
    if (!owner || !repo) throw new Error('Use --repo=owner/repo');
    return { owner, repo };
  }
  const remote = git(root, 'remote', 'get-url', 'origin').trim();
  const parsed = parseRemoteUrl(remote);
  if (!parsed) throw new Error(`Could not parse GitHub remote: ${remote}. Use --repo=owner/repo`);
  return parsed;
}

async function fetchGitHubReleases(owner, repo, token) {
  const releases = [];
  let page = 1;
  let more = true;

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'knitstitch-build-info',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  while (more) {
    const url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
    const pageData = await res.json();
    if (Array.isArray(pageData) && pageData.length > 0) {
      releases.push(...pageData);
    }
    if (!Array.isArray(pageData) || pageData.length < 100) {
      more = false;
    } else {
      page++;
    }
  }

  return releases
    .filter((r) => !r.draft)
    .map((r) => ({ ...r, source: 'github' }));
}

function getLocalTags(root) {
  const output = git(
    root,
    'for-each-ref',
    '--sort=creatordate',
    '--format',
    '%(refname:short)|%(objectname)|%(creatordate:iso)',
    'refs/tags/v*',
  );

  const tags = [];
  for (const line of output.split('\n')) {
    if (line.trim() === '') continue;
    const parts = line.split('|', 3);
    if (parts.length !== 3) continue;
    tags.push({ tag: parts[0], sha: parts[1], published_at: parts[2] });
  }
  return tags;
}

function getChangelogGroup(subject) {
  if (/BREAKING CHANGE|!:/i.test(subject)) return 'breaking';
  if (/^feat(\([^)]+\))?:/i.test(subject)) return 'feature';
  if (/^fix(\([^)]+\))?:/i.test(subject)) return 'fix';
  if (/^docs(\([^)]+\))?:/i.test(subject)) return 'docs';
  if (/^refactor(\([^)]+\))?:/i.test(subject)) return 'refactor';
  if (/^test(\([^)]+\))?:/i.test(subject)) return 'test';
  if (/^chore(\([^)]+\))?:/i.test(subject)) return 'chore';
  return 'other';
}

function humanizeCommitSubject(subject) {
  const summary = subject.replace(/^(?:[a-z]+(?:\([^)]+\))?!?:\s*|BREAKING CHANGE:?\s*)/i, '').trim();
  if (summary === '') return subject;
  return summary.charAt(0).toUpperCase() + summary.slice(1);
}

function cleanCommitDescription(subject, body) {
  body = body.trim();
  if (body === '') return null;

  const lines = body.split(/\r?\n/);

  let hasBullets = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' || /^(Signed-off-by:|Co-authored-by:|Reviewed-by:|Acked-by:)/i.test(trimmed)) {
      continue;
    }
    if (/^[-*]\s/.test(trimmed)) {
      hasBullets = true;
      break;
    }
  }

  const stripPrefix = (text) => {
    const match = text.match(/^(?:[a-z]+(?:\([^)]+\))?!?:\s*|BREAKING CHANGE:?\s*)/i);
    if (match) {
      const rest = text.slice(match[0].length).trim();
      if (rest !== '') return rest;
    }
    return text;
  };

  const summaryPrefix = subject.replace(/^(?:[a-z]+(?:\([^)]+\))?!?:\s*|BREAKING CHANGE:?\s*)/i, '').trim();

  if (hasBullets) {
    const bullets = [];
    let currentBullet = null;

    const processCurrentBullet = () => {
      if (currentBullet === null) return;
      let trimmed = currentBullet.replace(/\s+/g, ' ').trim();
      if (trimmed === '') {
        currentBullet = null;
        return;
      }
      trimmed = stripPrefix(trimmed);
      if (summaryPrefix !== '' && trimmed.toLowerCase().startsWith(summaryPrefix.toLowerCase())) {
        trimmed = trimmed.slice(summaryPrefix.length).trim();
      }
      if (trimmed !== '') bullets.push(trimmed);
      currentBullet = null;
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '' || /^(Signed-off-by:|Co-authored-by:|Reviewed-by:|Acked-by:)/i.test(trimmed)) {
        processCurrentBullet();
        continue;
      }
      if (/^[-*]\s+/.test(line)) {
        processCurrentBullet();
        currentBullet = trimmed.replace(/^[-*]\s+/, '');
      } else if (currentBullet !== null) {
        currentBullet += ' ' + trimmed;
      } else {
        currentBullet = trimmed;
      }
    }
    processCurrentBullet();

    return bullets.length > 0 ? bullets : null;
  }

  const paragraphs = [];
  let current = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      if (current.length > 0) {
        paragraphs.push(current.join(' '));
        current = [];
      }
      continue;
    }
    if (/^(Signed-off-by:|Co-authored-by:|Reviewed-by:|Acked-by:)/i.test(trimmed)) {
      continue;
    }
    const cleaned = trimmed.replace(/^-\s*/, '').replace(/^\*\s*/, '');
    current.push(cleaned);
  }

  if (current.length > 0) {
    paragraphs.push(current.join(' '));
  }

  for (let paragraph of paragraphs) {
    paragraph = paragraph.replace(/\s+/g, ' ').trim();
    if (paragraph !== '') {
      paragraph = stripPrefix(paragraph);
      if (summaryPrefix !== '' && paragraph.toLowerCase().startsWith(summaryPrefix.toLowerCase())) {
        paragraph = paragraph.slice(summaryPrefix.length).trim();
      }
      if (paragraph === '') continue;
      return paragraph;
    }
  }

  return null;
}

function parseCommitLog(output) {
  const commits = [];
  for (const record of output.split('\x1e')) {
    if (record.trim() === '') continue;
    const parts = record.split('\x1f', 4);
    if (parts.length !== 4) continue;

    commits.push({
      sha: parts[0].trim(),
      date: parts[1].trim(),
      subject: parts[2].trim(),
      body: parts[3],
    });
  }
  return commits;
}

const GROUP_LABELS = {
  breaking: 'Breaking Changes',
  feature: 'Features',
  fix: 'Fixes',
  docs: 'Documentation',
  refactor: 'Refactors',
  test: 'Tests',
  chore: 'Maintenance',
  other: 'Other Changes',
};

const GROUP_ORDER = ['breaking', 'feature', 'fix', 'docs', 'refactor', 'test', 'chore', 'other'];

function generateTagBody(root, tag, prevTag) {
  const range = prevTag ? `${prevTag}..${tag}` : tag;
  const output = git(
    root,
    'log',
    range,
    '--pretty=format:%H%x1f%ad%x1f%s%x1f%B%x1e',
    '--date=short',
    '--reverse',
    '--',
    '.',
  );

  const commits = parseCommitLog(output).filter(
    (commit) => !/^chore\(release-notes\):/i.test(commit.subject),
  );

  const groups = Object.fromEntries(GROUP_ORDER.map((group) => [group, []]));
  for (const commit of commits) {
    const group = getChangelogGroup(commit.subject);
    groups[group].push({
      subject: humanizeCommitSubject(commit.subject),
      description: cleanCommitDescription(commit.subject, commit.body),
    });
  }

  const lines = [];
  for (const group of GROUP_ORDER) {
    const items = groups[group];
    if (items.length === 0) continue;

    lines.push(`## ${GROUP_LABELS[group]}`);
    lines.push('');

    for (const item of items) {
      lines.push(`- ${item.subject}`);
      if (item.description) {
        if (Array.isArray(item.description)) {
          for (const detail of item.description) {
            lines.push(`  - ${detail}`);
          }
        } else {
          lines.push(`  - ${item.description}`);
        }
      }
    }

    lines.push('');
  }

  return lines.join('\n');
}

function buildAllReleases(root, owner, repo, githubReleases) {
  const githubByTag = Object.fromEntries(githubReleases.map((r) => [r.tag_name, r]));
  const localTags = getLocalTags(root);
  const releases = [];

  for (let i = 0; i < localTags.length; i++) {
    const { tag, published_at } = localTags[i];
    if (githubByTag[tag]) {
      releases.push(githubByTag[tag]);
      continue;
    }

    const prevTag = i > 0 ? localTags[i - 1].tag : null;
    const body = generateTagBody(root, tag, prevTag);
    releases.push({
      tag_name: tag,
      name: tag,
      published_at,
      html_url: `https://github.com/${owner}/${repo}/tree/${tag}`,
      body,
      prerelease: false,
      draft: false,
    });
  }

  for (const release of githubReleases) {
    if (!localTags.some((t) => t.tag === release.tag_name)) {
      releases.push(release);
    }
  }

  releases.sort((a, b) => {
    const dateDiff = new Date(b.published_at) - new Date(a.published_at);
    if (dateDiff !== 0) return dateDiff;
    return (b.tag_name || '').localeCompare(a.tag_name || '');
  });

  return releases;
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineHtml(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  const html = [];
  const listStack = [];
  let inPara = false;

  function flushParagraph() {
    if (!inPara) return;
    html.push('</p>');
    inPara = false;
  }

  function closeLists(targetDepth = 0) {
    while (listStack.length > targetDepth) {
      const list = listStack.pop();
      html.push(`</li></${list.type}>`);
    }
  }

  function listDepthFromIndent(indent) {
    return Math.max(1, Math.floor(indent / 2) + 1);
  }

  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');

    const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (hMatch) {
      flushParagraph();
      closeLists(0);
      const tag = `h${hMatch[1].length + 2}`;
      html.push(`<${tag}>${inlineHtml(escapeHtml(hMatch[2].trim()))}</${tag}>`);
      continue;
    }

    const ulMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (ulMatch || olMatch) {
      flushParagraph();
      const isUl = !!ulMatch;
      const rawIndent = isUl ? ulMatch[1].length : olMatch[1].length;
      const text = isUl ? ulMatch[2] : olMatch[2];
      const type = isUl ? 'ul' : 'ol';
      const depth = listDepthFromIndent(rawIndent);

      if (listStack.length < depth) {
        while (listStack.length < depth) {
          html.push(`<${type}>`);
          listStack.push({ type });
        }
      } else if (listStack.length > depth) {
        while (listStack.length > depth) {
          const list = listStack.pop();
          html.push(`</li></${list.type}>`);
        }
        if (listStack.length > 0 && listStack[listStack.length - 1].type !== type) {
          const list = listStack.pop();
          html.push(`</li></${list.type}>`);
          html.push(`<${type}>`);
          listStack.push({ type });
        } else {
          html.push('</li>');
        }
      } else {
        if (listStack.length > 0 && listStack[listStack.length - 1].type !== type) {
          const list = listStack.pop();
          html.push(`</li></${list.type}>`);
          html.push(`<${type}>`);
          listStack.push({ type });
        } else if (listStack.length > 0) {
          html.push('</li>');
        }
      }
      html.push(`<li>${inlineHtml(escapeHtml(text.trim()))}`);
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
      continue;
    }

    if (!inPara) {
      html.push('<p>');
      inPara = true;
    } else {
      html.push(' ');
    }
    html.push(inlineHtml(escapeHtml(line.trim())));
  }

  flushParagraph();
  closeLists(0);
  return html.join('');
}

function stripFirstTitle(body, tag) {
  const lines = body.split(/\r?\n/);
  const firstNonEmpty = lines.findIndex((l) => l.trim() !== '');
  if (firstNonEmpty === -1) return body;

  const m = lines[firstNonEmpty].match(/^#\s+(.+)$/);
  if (!m) return body;

  const title = m[1].trim().toLowerCase().replace(/^v/, '');
  const tagNorm = tag.toLowerCase().replace(/^v/, '');
  if (title !== tagNorm) return body;

  const rest = lines.slice(firstNonEmpty + 1);
  const nextNonEmpty = rest.findIndex((l) => l.trim() !== '');
  if (nextNonEmpty === -1) return '';
  return rest.slice(nextNonEmpty).join('\n');
}

const INTRO_TITLE = 'Versioning note';

function buildIntroText() {
  return [
    `The KnitStitch version number and this changelog are now generated from the repository's git tags and GitHub Releases.`,
    `From here on, the release line is starting back at **v0.1.0** so versions can grow cleanly.`,
    `The older CraftCMS (v1) history is preserved in the Archive tab.`,
  ].join(' ');
}

function buildIntroHtml() {
  const text = buildIntroText();
  return `<p>${inlineHtml(escapeHtml(text))}</p>`;
}

function buildIntroMd() {
  return buildIntroText();
}

// --- Main ---

const args = parseArgs(process.argv);
const root = args.root ? resolve(args.root) : null;
const outputPath = args.output ? resolve(args.output) : null;
const format = args.format || 'js';

if (!root || !outputPath) {
  console.error('Usage: node scripts/generate-build-info.mjs --root=. --output=... --format=js');
  process.exit(1);
}

const { owner, repo } = getRepoSlug(root, args);
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const githubReleases = await fetchGitHubReleases(owner, repo, token);
const releases = buildAllReleases(root, owner, repo, githubReleases);

const latestRelease = releases[0] || null;
const displayVersion = latestRelease ? latestRelease.tag_name : 'v0.1.0';
const productionVersion = displayVersion;
const releaseDate = latestRelease ? formatDate(latestRelease.published_at) : '';
const releaseUrl = latestRelease ? latestRelease.html_url : '';

const commitCount = parseInt(git(root, 'rev-list', '--count', 'HEAD').trim(), 10);
const shortSha = git(root, 'rev-parse', '--short', 'HEAD').trim();

let content;

if (format === 'js') {
  content = `window.BUILD_INFO = {
  version: "${displayVersion}",
  productionVersion: "${productionVersion}",
  commit: "${shortSha}",
  commitCount: "${commitCount}",
  releaseDate: "${releaseDate}",
  releaseUrl: "${releaseUrl}"
};
`;
} else if (format === 'md') {
  const lines = [];
  lines.push('# Changelog');
  lines.push('');
  if (latestRelease) {
    lines.push(
      `> **Release-based changelog** — Version ${displayVersion} · published ${releaseDate} · ${commitCount} commits · ${shortSha}`,
    );
  } else {
    lines.push(
      `> **Release-based changelog** — Baseline v0.1.0 · ${commitCount} commits · ${shortSha}`,
    );
  }
  lines.push('>');
  lines.push(`> ${buildIntroMd()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  if (releases.length === 0) {
    lines.push('No releases have been published yet. The first release will be **v0.1.0**.');
    lines.push('');
  }

  for (const release of releases) {
    const tag = release.tag_name;
    const date = formatDate(release.published_at);
    const pre = release.prerelease ? ' (pre-release)' : '';
    const url = release.html_url;
    lines.push(`## ${tag}${pre}`);
    lines.push('');
    lines.push(`Published ${date} — [View on GitHub](${url})`);
    lines.push('');
    const body = stripFirstTitle(release.body || 'No release notes.', tag);
    if (body.trim()) {
      lines.push(body);
      lines.push('');
    }
  }

  content = lines.join('\n');
} else if (format === 'html') {
  const esc = escapeHtml;
  const html = [];

  html.push('<div class="changelog-types" data-version="v2">');
  html.push('  <div class="container-section--headed">');
  html.push('    <div class="container-section-header">Change Types</div>');
  html.push('    <div class="container-section-body">');
  html.push('      <nav class="container-actions" aria-label="Changelog sections">');
  html.push(`        <a class="chip color-pair-ink" href="#versioning-note">Versioning note</a>`);
  html.push('      </nav>');
  html.push('    </div>');
  html.push('  </div>');
  html.push('</div>');

  html.push('<div class="changelog-versions" data-version="v2">');
  html.push('  <div class="container-section--headed">');
  html.push('    <div class="container-section-header">Versions</div>');
  html.push('    <div class="container-section-body">');
  html.push('      <ul class="list">');
  for (const release of releases) {
    html.push(`        <li><a href="#release-${esc(release.tag_name)}"><span class="caption">${esc(release.tag_name)}</span></a></li>`);
  }
  html.push('      </ul>');
  html.push('    </div>');
  html.push('  </div>');
  html.push('</div>');

  html.push('<div class="container-sections">');

  html.push('  <section class="panel panel--padded" id="versioning-note">');
  html.push(`    <h3>${esc(INTRO_TITLE)}</h3>`);
  html.push(`    <div class="body">${buildIntroHtml()}</div>`);
  html.push('  </section>');

  if (releases.length === 0) {
    html.push('  <section class="panel panel--padded">');
    html.push('    <h3>No releases yet</h3>');
    html.push(`    <div class="body"><p>No releases have been published yet. The first release will be <strong>v0.1.0</strong>.</p></div>`);
    html.push('  </section>');
  }

  for (const release of releases) {
    const tag = release.tag_name;
    const title = release.name && release.name.trim() ? release.name : tag;
    const preChip = release.prerelease ? '<span class="chip color-pair-plum">pre-release</span>' : '';
    html.push(`  <section class="panel panel--padded" id="release-${esc(tag)}">`);
    html.push(`    <h3>${esc(title)}${preChip ? ' ' + preChip : ''}</h3>`);
    html.push('    <div class="container-actions">');
    html.push(`      <span class="chip color-pair-stone">Published ${esc(formatDate(release.published_at))}</span>`);
    html.push(`      <a class="chip color-pair-sky" href="${esc(release.html_url)}">View on GitHub</a>`);
    html.push('    </div>');
    const body = stripFirstTitle(release.body || 'No release notes.', tag);
    html.push(`    <div class="release-body body">${mdToHtml(body)}</div>`);
    html.push('  </section>');
  }

  html.push('</div>');
  content = html.join('\n');
} else {
  console.error(`Unknown format: ${format}. Supported formats: js, md, html`);
  process.exit(1);
}

// Write output
const outputDir = dirname(outputPath);
if (outputDir && !existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

writeFileSync(outputPath, content, 'utf8');
console.log(`Generated ${outputPath} (${format}) — version ${displayVersion}, commit ${shortSha}`);
