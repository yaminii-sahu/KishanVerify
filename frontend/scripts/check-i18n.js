import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.resolve(__dirname, '../src/locales');

function readJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    if (k === '_meta') continue;
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys = keys.concat(getKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function runCheck() {
  console.log('🔍 Running KisanVerify i18n Verification Suite...\n');

  if (!fs.existsSync(LOCALES_DIR)) {
    console.error(`❌ Locales directory not found: ${LOCALES_DIR}`);
    process.exit(1);
  }

  const enDir = path.join(LOCALES_DIR, 'en');
  if (!fs.existsSync(enDir)) {
    console.error('❌ Baseline English locale (en) not found.');
    process.exit(1);
  }

  const namespaces = fs
    .readdirSync(enDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));

  console.log(`📁 Baseline namespaces detected (${namespaces.length}): ${namespaces.join(', ')}`);

  // Build English baseline key map: { [ns]: [keys] }
  const baselineKeys = {};
  let totalBaselineKeys = 0;

  for (const ns of namespaces) {
    const data = readJsonFile(path.join(enDir, `${ns}.json`));
    if (!data) {
      console.error(`❌ Failed to read en/${ns}.json`);
      process.exit(1);
    }
    const keys = getKeys(data);
    baselineKeys[ns] = keys;
    totalBaselineKeys += keys.length;
  }

  console.log(`🔑 Total baseline translation keys: ${totalBaselineKeys}\n`);

  // Inspect all available languages in locales directory
  const availableLangs = fs
    .readdirSync(LOCALES_DIR)
    .filter((f) => fs.statSync(path.join(LOCALES_DIR, f)).isDirectory());

  let hasErrors = false;
  const coverageReport = [];

  for (const lang of availableLangs) {
    const langDir = path.join(LOCALES_DIR, lang);
    let langTotalKeys = 0;
    let missingKeysCount = 0;
    const missingDetails = [];
    let reviewStatus = 'unknown';

    for (const ns of namespaces) {
      const nsFile = path.join(langDir, `${ns}.json`);
      if (!fs.existsSync(nsFile)) {
        missingKeysCount += baselineKeys[ns].length;
        missingDetails.push(`Missing namespace file: ${ns}.json`);
        continue;
      }
      const data = readJsonFile(nsFile);
      if (!data) {
        missingKeysCount += baselineKeys[ns].length;
        missingDetails.push(`Invalid JSON: ${ns}.json`);
        continue;
      }

      if (data._meta && data._meta.review_status) {
        reviewStatus = data._meta.review_status;
      }

      const langKeys = new Set(getKeys(data));
      langTotalKeys += langKeys.size;

      for (const expectedKey of baselineKeys[ns]) {
        if (!langKeys.has(expectedKey)) {
          missingKeysCount++;
          if (missingDetails.length < 5) {
            missingDetails.push(`${ns}:${expectedKey}`);
          }
        }
      }
    }

    const coveragePct =
      totalBaselineKeys > 0
        ? Math.round(((totalBaselineKeys - missingKeysCount) / totalBaselineKeys) * 100)
        : 100;

    coverageReport.push({
      language: lang,
      totalKeys: langTotalKeys,
      missing: missingKeysCount,
      coverage: `${coveragePct}%`,
      status: reviewStatus,
    });

    if (missingKeysCount > 0 && lang === 'en') {
      hasErrors = true;
    }
  }

  console.table(coverageReport);

  if (hasErrors) {
    console.error('\n❌ i18n check failed: Baseline English has missing keys.');
    process.exit(1);
  }

  console.log('\n✅ All namespaces validated successfully.');
  process.exit(0);
}

runCheck();
