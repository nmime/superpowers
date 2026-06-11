import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const testsRoot = path.join(repoRoot, 'tests');
const usingSuperpowersPath = path.join(repoRoot, 'skills', 'using-superpowers', 'SKILL.md');
const sessionStartHookPath = path.join(repoRoot, 'hooks', 'session-start');
const opencodePluginPath = path.join(repoRoot, '.opencode', 'plugins', 'superpowers.js');
const skillTriggeringPromptsDir = path.join(testsRoot, 'skill-triggering', 'prompts');
const explicitSkillPromptsDir = path.join(testsRoot, 'explicit-skill-requests', 'prompts');

const usingSuperpowers = read(usingSuperpowersPath);
const usingSuperpowersBody = stripFrontmatter(usingSuperpowers);
const sessionStartHook = read(sessionStartHookPath);
const opencodePlugin = read(opencodePluginPath);

const autonomousRequirements = [
  {
    label: 'must invoke relevant skills before any response or action',
    pattern: /Invoke relevant or requested skills BEFORE any response or action\./,
  },
  {
    label: 'must check skills before clarifying questions',
    pattern: /Skill check comes BEFORE clarifying questions\./,
  },
  {
    label: 'must treat gathering context as something skills govern',
    pattern: /Skills tell you HOW to gather information\./,
  },
  {
    label: 'must forbid doing one quick thing before checking skills',
    pattern: /Check BEFORE doing anything\./,
  },
  {
    label: 'must require invocation at even a 1% chance',
    pattern: /even a 1% chance a skill might apply/i,
  },
];

const expectedTriggerFixtures = {
  'dispatching-parallel-agents': [
    /independent test failures/i,
    /unrelated issues in different parts of the codebase/i,
    /investigate all of them/i,
  ],
  'executing-plans': [
    /plan document at docs\/superpowers\/plans\/.*\.md/i,
    /needs to be executed|please implement it/i,
  ],
  'requesting-code-review': [
    /review the changes before I merge/i,
    /commits are between/i,
  ],
  'systematic-debugging': [
    /tests are failing/i,
    /TypeError/i,
    /figure out what's going wrong and fix it/i,
  ],
  'test-driven-development': [
    /new feature/i,
    /Can you implement this\?/i,
  ],
  'writing-plans': [
    /Here's the spec/i,
    /multiple steps involved/i,
  ],
};

const explicitPromptExpectations = {
  'subagent-driven-development-please.txt': /subagent-driven-development/i,
  'use-systematic-debugging.txt': /systematic-debugging/i,
  'please-use-brainstorming.txt': /brainstorming/i,
  'i-know-what-sdd-means.txt': /subagent-driven-development|\bSDD\b/i,
  'mid-conversation-execute-plan.txt': /execute the plan|plan/i,
  'after-planning-flow.txt': /plan|implement/i,
  'claude-suggested-it.txt': /suggested|subagent-driven-development|\bSDD\b/i,
  'action-oriented.txt': /Do subagent-driven development|start with Task 1|dispatch a subagent/i,
  'skip-formalities.txt': /skip|just|formalities|implement|execute/i,
};

test('using-superpowers bootstrap contains fully autonomous skill-check requirements', () => {
  for (const requirement of autonomousRequirements) {
    assert.match(usingSuperpowers, requirement.pattern, requirement.label);
  }

  assert.match(
    frontmatterDescription(usingSuperpowers),
    /before ANY response including clarifying questions/,
    'frontmatter description advertises autonomous skill invocation before clarifications',
  );
});

test('session-start hook injects the full autonomous bootstrap for non-OpenCode harnesses', () => {
  assert.match(sessionStartHook, /cat "\$\{PLUGIN_ROOT\}\/skills\/using-superpowers\/SKILL\.md"/, 'reads the real using-superpowers skill');
  assert.match(sessionStartHook, /You have superpowers\./, 'wraps session context with superpowers bootstrap');
  assert.match(sessionStartHook, /full content of your 'superpowers:using-superpowers' skill/, 'describes full bootstrap content');
  assert.match(sessionStartHook, /additionalContext/, 'emits SDK-standard additionalContext for autonomous startup context');
});

test('OpenCode plugin injects using-superpowers body and tool mapping without asking external services', async () => {
  const { SuperpowersPlugin } = await import(pathToFileURL(opencodePluginPath).href);
  const plugin = await SuperpowersPlugin({ client: {}, directory: repoRoot });
  const transform = plugin['experimental.chat.messages.transform'];
  assert.equal(typeof transform, 'function', 'plugin exposes message transform for session prompt injection');

  const output = {
    messages: [{
      info: { role: 'user' },
      parts: [{ type: 'text', text: 'Let\'s make a react todo list' }],
    }],
  };

  await transform({}, output);

  const bootstrap = output.messages[0].parts[0].text;
  assert.match(bootstrap, /You have superpowers\./, 'injects superpowers bootstrap language');
  assert.match(bootstrap, /ALREADY LOADED - you are currently following it/, 'prevents redundant bootstrap skill loading');
  assert.match(bootstrap, /Use OpenCode's native `skill` tool to list and load skills\./, 'maps skill loading to OpenCode native skill tool');

  for (const phrase of [
    'Invoke relevant or requested skills BEFORE any response or action.',
    'Skill check comes BEFORE clarifying questions.',
    'Check BEFORE doing anything.',
  ]) {
    assert.ok(
      bootstrap.includes(phrase),
      `OpenCode-injected bootstrap contains required autonomous phrase: ${phrase}`,
    );
  }
});

test('naive skill-triggering fixtures cover autonomous prompts for every trigger skill', () => {
  for (const [skillName, patterns] of Object.entries(expectedTriggerFixtures)) {
    const promptPath = path.join(skillTriggeringPromptsDir, `${skillName}.txt`);
    const prompt = read(promptPath);

    assert.ok(prompt.trim().length > 0, `${skillName} prompt is not empty`);
    assert.doesNotMatch(
      prompt,
      new RegExp(escapeRegExp(skillName), 'i'),
      `${skillName} naive fixture should not name the skill directly`,
    );

    for (const pattern of patterns) {
      assert.match(prompt, pattern, `${skillName} fixture includes autonomous trigger evidence: ${pattern}`);
    }
  }
});

test('explicit skill request fixtures exercise direct, mid-conversation, and anti-rationalization wording', () => {
  for (const [fileName, pattern] of Object.entries(explicitPromptExpectations)) {
    const prompt = read(path.join(explicitSkillPromptsDir, fileName));
    assert.ok(prompt.trim().length > 0, `${fileName} prompt is not empty`);
    assert.match(prompt, pattern, `${fileName} contains the expected autonomous request wording`);
  }

  const promptNames = fs.readdirSync(explicitSkillPromptsDir).filter((name) => name.endsWith('.txt')).sort();
  assert.deepEqual(promptNames, Object.keys(explicitPromptExpectations).sort(), 'all explicit skill request fixtures are covered by static expectations');
});

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function frontmatterDescription(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, 'expected SKILL.md frontmatter');
  const description = match[1]
    .split('\n')
    .find((line) => line.startsWith('description:'));
  assert.ok(description, 'expected description field in SKILL.md frontmatter');
  return description.slice('description:'.length).trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
