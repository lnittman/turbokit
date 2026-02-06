#!/usr/bin/env node

import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative } from "node:path";

function getArg(flag, fallback) {
	const index = process.argv.indexOf(flag);
	if (index === -1) return fallback;
	return process.argv[index + 1] ?? fallback;
}

function sh(command) {
	return execSync(command, {
		encoding: "utf8",
		stdio: ["pipe", "pipe", "ignore"],
	}).trim();
}

function trySh(command) {
	try {
		return sh(command);
	} catch {
		return "";
	}
}

const issuePrefix = getArg("--prefix", "TEMP");
const commitLimit = Number(getArg("--commits", "80"));
const outputPath = getArg("--output", "");
const issueRegex = new RegExp(`${issuePrefix}-\\d+`, "g");
const now = new Date().toISOString();

const commitRows = trySh(
	`git log --date=short --pretty=format:%h%x09%ad%x09%s -n ${commitLimit}`,
)
	.split("\n")
	.filter(Boolean)
	.map((row) => {
		const [hash, date, ...messageParts] = row.split("\t");
		const message = messageParts.join("\t");
		return {
			hash,
			date,
			message,
			issues: [...new Set(message.match(issueRegex) ?? [])],
		};
	});

const linkedCommits = commitRows.filter((row) => row.issues.length > 0);
const orphanCommits = commitRows.filter((row) => row.issues.length === 0);

const todoRows = trySh(
	`rg -n "TODO|FIXME" . -g '!**/node_modules/**' -g '!**/.next/**' -g '!**/dist/**' -g '!scripts/reconcile-temp.mjs' -g '!docs/reports/**'`,
)
	.split("\n")
	.filter(Boolean)
	.map((row) => {
		const [file, line, ...rest] = row.split(":");
		const text = rest.join(":").trim();
		const relativeFile = relative(process.cwd(), file);
		return {
			file: relativeFile,
			line,
			text,
			issues: [...new Set(text.match(issueRegex) ?? [])],
		};
	});

const linkedTodos = todoRows.filter((row) => row.issues.length > 0);
const orphanTodos = todoRows.filter((row) => row.issues.length === 0);

const issueCommitCounts = new Map();
for (const row of linkedCommits) {
	for (const issue of row.issues) {
		issueCommitCounts.set(issue, (issueCommitCounts.get(issue) ?? 0) + 1);
	}
}

const issueTodoCounts = new Map();
for (const row of linkedTodos) {
	for (const issue of row.issues) {
		issueTodoCounts.set(issue, (issueTodoCounts.get(issue) ?? 0) + 1);
	}
}

const allIssues = [
	...new Set([...issueCommitCounts.keys(), ...issueTodoCounts.keys()]),
].sort();

const report = [
	`# ${issuePrefix} Delivery Reconciliation Report`,
	"",
	`Generated: ${now}`,
	`Commit window: last ${commitLimit} commits`,
	"",
	"## Summary",
	"",
	`- linked commits: ${linkedCommits.length}`,
	`- orphan commits (no ${issuePrefix}-* key): ${orphanCommits.length}`,
	`- linked TODO/FIXME lines: ${linkedTodos.length}`,
	`- orphan TODO/FIXME lines (no ${issuePrefix}-* key): ${orphanTodos.length}`,
	"",
	"## Issue Coverage",
	"",
	"| issue | commits | TODO/FIXME |",
	"| --- | ---: | ---: |",
	...(allIssues.length > 0
		? allIssues.map(
				(issue) =>
					`| ${issue} | ${issueCommitCounts.get(issue) ?? 0} | ${issueTodoCounts.get(issue) ?? 0} |`,
			)
		: ["| (none) | 0 | 0 |"]),
	"",
	"## Orphan TODO/FIXME",
	"",
	...(orphanTodos.length > 0
		? orphanTodos.map((row) => `- ${row.file}:${row.line} — ${row.text}`)
		: ["- none"]),
	"",
	"## Orphan Commits",
	"",
	...(orphanCommits.length > 0
		? orphanCommits.map((row) => `- ${row.hash} (${row.date}) ${row.message}`)
		: ["- none"]),
	"",
].join("\n");

if (!outputPath) {
	process.stdout.write(`${report}\n`);
	process.exit(0);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${report}\n`);
process.stdout.write(`Wrote ${outputPath}\n`);
