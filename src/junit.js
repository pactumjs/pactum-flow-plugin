const fs = require('fs');
const config = require('./config');

function generateXMLReport(results) {
  if (!config.jUnitReporter) {
    return
  }
  const test_suites = [];
  let test_suite_failures = 0;
  for (let i = 0; i < results.length; i++) {
    console.log(results[i])
    const { environment, consumers, providers } = results[i];
    const test_cases = [];
    let failures = 0;
    for (let j = 0; j < consumers.length; j++) {
      const consumer = consumers[j];
      if (consumer.status === 'PASSED') {
        test_cases.push(`
          <testcase name="consumer - ${consumer.name}-${consumer.version}" time="0">
          </testcase>
        `);
      } else {
        failures++;
        const failure_message = consumer.exceptions.reduce((p, c) => { return `${p}\n${c.flow}\n${c.error}\n` }, '');
        test_cases.push(`
        <testcase name="consumer - ${consumer.name}-${consumer.version}" time="0">
          <failure message="${consumer.status}">
            ${failure_message}
          </failure>
        </testcase>
      `);
      }
    }
    for (let j = 0; j < providers.length; j++) {
      const provider = providers[j];
      if (provider.status === 'PASSED') {
        test_cases.push(`
          <testcase name="provider - ${provider.name}-${provider.version}" time="0">
          </testcase>
        `);
      } else {
        failures++;
        const failure_message = provider.exceptions.reduce((p, c) => { return `${p}\n${c.flow}\n${c.error}\n` }, '');
        test_cases.push(`
          <testcase name="provider - ${provider.name}-${provider.version}" time="0">
            <failure message="${provider.status}">
              ${failure_message}
            </failure>
          </testcase>
        `);
      }
    }
    test_suites.push(`
      <testsuite name="${environment}" tests="${consumers.length + providers.length}" failures="${failures}" time="0">
        ${test_cases.reduce((p, c) => { return `${p}${c}\n` }, '')}
      </testsuite>
    `);
    if (failures > 0) {
      test_suite_failures++;
    }
  }
  const report = `<?xml version="1.0" encoding="UTF-8" ?> 
    <testsuites name="Contract Tests" tests="${test_suites.length}" failures="${test_suite_failures}" errors="" time="0">
      ${test_suites.reduce((p, c) => { return `${p}${c}\n` }, '')}
    </testsuites>`;
  fs.writeFileSync(config.jUnitReporterPath, report);
}

module.exports = {
  generateXMLReport
}
