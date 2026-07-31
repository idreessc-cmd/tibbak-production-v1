const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/mock/doctors.ts');
const text = fs.readFileSync(filePath, 'utf8');

const firstBracket = text.indexOf('[');
const lastBracket = text.lastIndexOf(']');
const arrayCode = text.substring(firstBracket, lastBracket + 1);

const doctors = eval('(' + arrayCode + ')');

doctors.forEach((d, i) => {
  if (typeof d.isSponsored !== 'boolean') {
    d.isSponsored = false;
  }
  if (typeof d.organicSortOrder !== 'number') {
    d.organicSortOrder = typeof d.sort_order === 'number' ? d.sort_order : (i + 1);
  }
  if (!d.subscriptionPlan) {
    d.subscriptionPlan = d.subscription_plan || d.rank || 'free';
  }
  delete d.rank;
  delete d.subscription_rank;
  delete d.subscription_plan;
  delete d.sort_order;
});

// Explicit mock doctors for separation testing
doctors[2].subscriptionPlan = 'vip';
doctors[2].isSponsored = false; // doc-3 is VIP but NOT sponsored

doctors[4].subscriptionPlan = 'professional';
doctors[4].isSponsored = true; // doc-5 is Professional and IS sponsored

const output = `import { Doctor } from '@/types';\n\nexport const mockDoctors: Doctor[] = ${JSON.stringify(doctors, null, 2)};\n`;
fs.writeFileSync(filePath, output, 'utf8');
console.log('Successfully updated', doctors.length, 'doctors in doctors.ts');
