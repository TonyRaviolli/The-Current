import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseWhiteHouseArchive,
  parseFederalRegisterDocuments,
  parseCongressBills,
  parseGovInfoBillSummaries,
  parseSupremeCourtOpinions,
  parseOpenFemaDeclarations
} from '../src/lib/source-adapters.js';

test('parseWhiteHouseArchive extracts article links and dates from briefing archive markup', () => {
  const html = `
    <article>
      <h2>## <a href="https://www.whitehouse.gov/briefing-room/statements-releases/2026/03/14/example-release/">Statement from the President</a></h2>
      <div class="meta">March 14, 2026</div>
    </article>
    <article>
      <h2>## <a href="https://www.whitehouse.gov/briefing-room/speeches-remarks/2026/03/13/example-remarks/">Remarks by the President</a></h2>
      <div class="meta">March 13, 2026</div>
    </article>
  `;

  const items = parseWhiteHouseArchive(html);
  assert.equal(items.length, 2);
  assert.equal(items[0].title, 'Statement from the President');
  assert.equal(items[0].link, 'https://www.whitehouse.gov/briefing-room/statements-releases/2026/03/14/example-release');
  assert.ok(items[0].published.startsWith('2026-03-14'));
  assert.equal(items[1].title, 'Remarks by the President');
});

test('parseFederalRegisterDocuments extracts official document links and dates', () => {
  const payload = {
    results: [
      {
        title: 'Executive Order on Something Important',
        abstract: 'A short summary of the order.',
        html_url: 'https://www.federalregister.gov/documents/2026/03/14/2026-12345/executive-order-on-something-important',
        publication_date: '2026-03-14'
      }
    ]
  };

  const items = parseFederalRegisterDocuments(payload);
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'Executive Order on Something Important');
  assert.equal(items[0].link, 'https://www.federalregister.gov/documents/2026/03/14/2026-12345/executive-order-on-something-important');
  assert.ok(items[0].published.startsWith('2026-03-14'));
});

test('parseCongressBills extracts bill title, latest action, and Congress.gov link', () => {
  const payload = {
    bills: [
      {
        congress: 119,
        type: 'hr',
        number: '1234',
        title: 'A bill to improve something important',
        updateDate: '2026-03-14T00:00:00Z',
        latestAction: { text: 'Referred to the Committee on Energy and Commerce.' }
      }
    ]
  };

  const items = parseCongressBills(payload);
  assert.equal(items.length, 1);
  assert.match(items[0].link, /congress\.gov\/bill\/119th-congress\/hr-bill\/1234/);
  assert.match(items[0].summary, /Committee on Energy and Commerce/);
});

test('parseGovInfoBillSummaries extracts details links and issue dates', () => {
  const items = parseGovInfoBillSummaries([
    {
      title: 'H.R. 1234',
      detailsLink: 'https://www.govinfo.gov/app/details/BILLS-119hr1234ih',
      dateIssued: '2026-03-10'
    }
  ]);

  assert.equal(items.length, 1);
  assert.equal(items[0].link, 'https://www.govinfo.gov/app/details/BILLS-119hr1234ih');
  assert.ok(items[0].published.startsWith('2026-03-10'));
});

test('parseSupremeCourtOpinions extracts slip opinion pdf links', () => {
  const html = `
    <tr>
      <td>March 14, 2026</td>
      <td>24-101</td>
      <td><a href="/opinions/25pdf/24-101_abc.pdf">Example v. United States</a></td>
    </tr>
  `;

  const items = parseSupremeCourtOpinions(html);
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'Example v. United States');
  assert.equal(items[0].link, 'https://www.supremecourt.gov/opinions/25pdf/24-101_abc.pdf');
});

test('parseOpenFemaDeclarations extracts disaster declaration links and dates', () => {
  const payload = {
    DisasterDeclarationsSummaries: [
      {
        declarationTitle: 'Major Disaster Declaration for California',
        declarationDate: '2026-03-12T00:00:00.000Z',
        disasterNumber: '1234'
      }
    ]
  };

  const items = parseOpenFemaDeclarations(payload);
  assert.equal(items.length, 1);
  assert.equal(items[0].link, 'https://www.fema.gov/disaster/1234');
  assert.ok(items[0].published.startsWith('2026-03-12'));
});
