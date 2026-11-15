import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Keep the most recent result for each project/test across the full regression
// run and targeted runs after fixes. This avoids rerunning unaffected 3D tests.
export async function summarizeTests() {
  const tests = new Map();
  for (const path of ['reports/playwright-site.json','reports/playwright-languages.json','reports/playwright.json']) {
    const report = JSON.parse(await readFile(path,'utf8'));
    function visit(suite) {
      for (const spec of suite.specs || []) for (const test of spec.tests) {
        const key = `${spec.file}:${spec.title}:${test.projectName}`;
        tests.set(key,{ title:spec.title,project:test.projectName,status:test.status,results:test.results.map((r)=>r.status) });
      }
      for (const child of suite.suites || []) visit(child);
    }
    report.suites.forEach(visit);
  }
  const rows = [...tests.values()];
  const stats = { expected:rows.filter((r)=>r.status==='expected').length,skipped:rows.filter((r)=>r.status==='skipped').length,unexpected:rows.filter((r)=>!['expected','skipped'].includes(r.status)).length };
  assert.equal(stats.unexpected,0,'A browser test still fails in the most recent results.');
  await writeFile('reports/browser-validation-summary.json',JSON.stringify({stats,tests:rows},null,2));
  return {stats};
}
