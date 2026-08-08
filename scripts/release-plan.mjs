import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const eq = arg.indexOf('=');
    if (eq !== -1) {
      args[arg.slice(2, eq)] = arg.slice(eq + 1);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i++;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
}

function parseSemverTag(tag) {
  const match = /^v(\d+)\.(\d+)\.(\d+)$/.exec(tag.trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareSemver(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function formatSemver(version) {
  return `v${version[0]}.${version[1]}.${version[2]}`;
}

function bumpSemver(version, bumpType) {
  switch (bumpType) {
    case 'major':
      return [version[0] + 1, 0, 0];
    case 'minor':
      return [version[0], version[1] + 1, 0];
    case 'patch':
      return [version[0], version[1], version[2] + 1];
    default:
      return version.slice();
  }
}

function classifyCommit(subject) {
  if (/BREAKING CHANGE|!:/i.test(subject)) return 'major';
  if (/^feat(\([^)]+\))?:/i.test(subject)) return 'minor';
  if (/^fix(\([^)]+\))?:/i.test(subject)) return 'patch';
  if (/^ui(\([^)]+\))?:/i.test(subject)) return 'ui';
  if (/^docs(\([^)]+\))?:/i.test(subject)) return 'docs';
  return 'other';
}

function humanizeCommitSubject(subject) {
  const cleaned = subject.replace(/^(?:[a-z]+(?:\([^)]+\))?!?:\s*|BREAKING CHANGE:?\s*)/i, '').trim();
  if (cleaned === '') return subject.trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function findLatestTag(root, headRef) {
  const output = git(root, 'tag', '--merged', headRef, '--list', 'v*');
  const tags = [];
  for (const line of output.split('\n')) {
    const tag = line.trim();
    if (tag === '') continue;
    const version = parseSemverTag(tag);
    if (!version) continue;
    tags.push({ tag, version });
  }
  if (tags.length === 0) return null;
  tags.sort((a, b) => compareSemver(b.version, a.version));
  return tags[0];
}

const args = parseArgs(process.argv);
const root = args.root ? resolve(args.root) : process.cwd();
const headRef = args.head || 'HEAD';
const notesPath = args.notes || resolve(root, 'release-notes.md');
const jsonPath = args.json || resolve(root, 'release-plan.json');

const latestTag = findLatestTag(root, headRef);
if (!latestTag) {
  throw new Error('No semver release tag found. Create the first release tag before running the release workflow.');
}

const commitOutput = git(
  root,
  'log',
  `${latestTag.tag}..${headRef}`,
  '--reverse',
  '--date=short',
  '--pretty=format:%H%x1f%ad%x1f%s%x1f%B%x1e'
);

const commits = [];
for (const record of commitOutput.split('\x1e')) {
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

let bumpType = 'none';
for (const commit of commits) {
  const type = classifyCommit(commit.subject);
  if (type === 'major') {
    bumpType = 'major';
    break;
  }
  if (type === 'minor' && bumpType !== 'major') {
    bumpType = 'minor';
  } else if (type === 'patch' && bumpType === 'none') {
    bumpType = 'patch';
  }
}

const nextVersion = bumpSemver(latestTag.version, bumpType);
const releaseTag = formatSemver(nextVersion);
const shouldRelease = bumpType !== 'none';

const sections = [
  ['major', 'Breaking Changes'],
  ['minor', 'Features'],
  ['patch', 'Fixes'],
  ['ui', 'Interface'],
  ['docs', 'Documentation'],
];

const grouped = new Map(sections.map(([key, label]) => [key, { label, items: [] }]));
for (const commit of commits) {
  const type = classifyCommit(commit.subject);
  if (!grouped.has(type)) continue;
  grouped.get(type).items.push({
    subject: humanizeCommitSubject(commit.subject),
    sha: commit.sha.slice(0, 8),
    date: commit.date,
  });
}

const notes = [];
notes.push(`# ${releaseTag}`);
notes.push('');
notes.push(`Changes since ${latestTag.tag}.`);
notes.push('');

if (!shouldRelease) {
  notes.push('No release-worthy Conventional Commit changes were found since the last release tag.');
  notes.push('');
} else {
  for (const [key] of sections) {
    const section = grouped.get(key);
    if (!section || section.items.length === 0) continue;
    notes.push(`## ${section.label}`);
    notes.push('');
    for (const item of section.items) {
      notes.push(`- ${item.subject}`);
    }
    notes.push('');
  }
}

mkdirSync(dirname(notesPath), { recursive: true });
writeFileSync(notesPath, notes.join('\n'), 'utf8');

const plan = {
  latestTag: latestTag.tag,
  latestVersion: formatSemver(latestTag.version),
  nextVersion: releaseTag,
  releaseTag,
  bumpType,
  shouldRelease,
  commitCount: commits.length,
  notesPath,
};

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, JSON.stringify(plan, null, 2) + '\n', 'utf8');

console.log(JSON.stringify(plan, null, 2));
