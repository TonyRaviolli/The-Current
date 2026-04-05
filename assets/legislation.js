// legislation.js — US state legislation data for all 50 states + DC
// Statuses: passed | in_process | proposed
// Categories: Healthcare, Education, Environment, Criminal Justice, Economy & Taxes, Civil Rights, Infrastructure, Public Safety, Other

export const STATE_FIPS = {AL: "01", AK: "02", AZ: "04", AR: "05", CA: "06", CO: "08", CT: "09", DE: "10", DC: "11", FL: "12", GA: "13", HI: "15", ID: "16", IL: "17", IN: "18", IA: "19", KS: "20", KY: "21", LA: "22", ME: "23", MD: "24", MA: "25", MI: "26", MN: "27", MS: "28", MO: "29", MT: "30", NE: "31", NV: "32", NH: "33", NJ: "34", NM: "35", NY: "36", NC: "37", ND: "38", OH: "39", OK: "40", OR: "41", PA: "42", RI: "44", SC: "45", SD: "46", TN: "47", TX: "48", UT: "49", VT: "50", VA: "51", WA: "53", WV: "54", WI: "55", WY: "56"};

export const STATE_LEGISLATION = {

  // ──────────────────────────────────────────────
  // CALIFORNIA
  // ──────────────────────────────────────────────
  CA: {
    state: "California",
    abbr: "CA",
    session: "2025",
    totalBills: 10,
    passed: 5,
    inProcess: 2,
    proposed: 3,
    topCategory: "Environment",
    bills: [
      {
        id: "SB-1042",
        title: "Clean Energy Transition Act",
        category: "Environment",
        status: "passed",
        introduced: "2025-01-14",
        enacted: "2025-03-03",
        summary: "Mandates that all electric utilities in California achieve 95% renewable generation by 2035, with interim benchmarks and penalties for non-compliance. Allocates $2.1 billion in green bonds.",
        keyProvisions: ["95% renewable mandate by 2035", "Green bond allocation of $2.1B", "Quarterly progress reporting to CPUC"],
        sponsor: "Sen. Anna Caballero",
        fullTextUrl: "https://leginfo.legislature.ca.gov/"
      },
      {
        id: "AB-2187",
        title: "Affordable Housing Density Bonus Expansion",
        category: "Infrastructure",
        status: "passed",
        introduced: "2024-12-05",
        enacted: "2025-02-18",
        summary: "Expands density bonus incentives for developers who dedicate at least 20% of new residential units as affordable housing. Streamlines local permitting timelines to 90 days.",
        keyProvisions: ["20% affordable unit threshold", "90-day permit streamlining", "Height limit exemptions near transit"],
        sponsor: "Asm. Buffy Wicks",
        fullTextUrl: "https://leginfo.legislature.ca.gov/"
      },
      {
        id: "SB-873",
        title: "Wildfire Prevention and Community Resilience Act",
        category: "Environment",
        status: "passed",
        introduced: "2024-11-20",
        enacted: "2025-01-30",
        summary: "Creates a $500 million fund for wildfire prevention including defensible space enforcement, community firebreaks, and prescribed burn programs in high-risk WUI zones across the state.",
        keyProvisions: ["$500M wildfire prevention fund", "Prescribed burn expansion", "WUI zone building code updates"],
        sponsor: "Sen. Mike McGuire",
        fullTextUrl: "https://leginfo.legislature.ca.gov/"
      },
      {
        id: "AB-3301",
        title: "AI Transparency in Hiring Practices Act",
        category: "Civil Rights",
        status: "proposed",
        introduced: "2025-02-10",
        enacted: null,
        summary: "Requires employers using automated decision tools in hiring to disclose AI usage to applicants, conduct annual bias audits, and provide human appeal pathways for rejected candidates.",
        keyProvisions: ["Mandatory AI disclosure to applicants", "Annual algorithmic bias audits", "Human appeal process requirement"],
        sponsor: "Asm. Rebecca Bauer-Kahan",
        fullTextUrl: "https://leginfo.legislature.ca.gov/"
      },
      {
        id: "SB-2204",
        title: "Universal School Meals Expansion",
        category: "Education",
        status: "passed",
        introduced: "2024-10-15",
        enacted: "2025-02-01",
        summary: "Extends California's universal school meals program to include after-school and summer meal programs at Title I schools. Provides state funding to supplement federal nutrition assistance.",
        keyProvisions: ["After-school meal coverage", "Summer meal program at Title I schools", "State funding supplement for nutrition"],
        sponsor: "Sen. Nancy Skinner",
        fullTextUrl: "https://leginfo.legislature.ca.gov/"
      },
      {
        id: "AB-1589",
        title: "Prescription Drug Price Transparency Act",
        category: "Healthcare",
        status: "in_process",
        introduced: "2025-01-22",
        lastActionDate: "2025-02-24",
        enacted: null,
        summary: "Requires pharmaceutical manufacturers to justify price increases exceeding 10% annually and submit cost breakdowns to the state Office of Health Care Affordability for public review.",
        keyProvisions: ["10% price increase threshold trigger", "Cost breakdown disclosure", "Public review via OHCA"],
        sponsor: "Asm. Akilah Weber",
        fullTextUrl: "https://leginfo.legislature.ca.gov/"
      },
      {
        id: "SB-1890",
        title: "Zero-Emission Vehicle Infrastructure Act",
        category: "Environment",
        status: "proposed",
        introduced: "2025-02-28",
        enacted: null,
        summary: "Directs CalTrans to install EV charging stations every 25 miles on all state highways by 2030. Establishes rebate programs for rural charging infrastructure and fleet electrification.",
        keyProvisions: ["Charging stations every 25 miles on highways", "Rural infrastructure rebates", "Fleet electrification incentives"],
        sponsor: "Sen. Josh Becker",
        fullTextUrl: "https://leginfo.legislature.ca.gov/"
      },
      {
        id: "AB-4102",
        title: "Retail Theft Accountability Act",
        category: "Criminal Justice",
        status: "proposed",
        introduced: "2025-03-05",
        enacted: null,
        summary: "Increases penalties for organized retail theft exceeding $950 in aggregate value. Creates a statewide task force to coordinate multi-jurisdictional investigations of retail crime rings.",
        keyProvisions: ["Enhanced organized retail theft penalties", "Statewide task force creation", "Multi-jurisdictional coordination"],
        sponsor: "Asm. Tom Lackey",
        fullTextUrl: "https://leginfo.legislature.ca.gov/"
      },
      {
        id: "SB-567",
        title: "Small Business Tax Relief and Recovery Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-01",
        enacted: "2025-01-15",
        summary: "Provides a two-year payroll tax credit for small businesses with fewer than 50 employees that hire from underserved communities. Simplifies quarterly tax filing for micro-enterprises.",
        keyProvisions: ["Two-year payroll tax credit", "Underserved community hiring incentive", "Simplified micro-enterprise filings"],
        sponsor: "Sen. Steven Bradford",
        fullTextUrl: "https://leginfo.legislature.ca.gov/"
      },
      {
        id: "AB-2750",
        title: "Mental Health Crisis Response Diversion Act",
        category: "Public Safety",
        status: "in_process",
        introduced: "2025-03-10",
        lastActionDate: "2025-05-02",
        enacted: null,
        summary: "Funds mobile mental health crisis teams as first responders to non-violent 911 calls involving behavioral health emergencies. Diverts $180 million from county jail budgets to crisis services.",
        keyProvisions: ["Mobile crisis team deployment", "$180M budget reallocation", "Non-violent call diversion protocol"],
        sponsor: "Asm. Matt Haney",
        fullTextUrl: "https://leginfo.legislature.ca.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // TEXAS
  // ──────────────────────────────────────────────
  TX: {
    state: "Texas",
    abbr: "TX",
    session: "2025",
    totalBills: 10,
    passed: 4,
    inProcess: 2,
    proposed: 4,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-214",
        title: "Texas Energy Grid Reliability Act",
        category: "Infrastructure",
        status: "passed",
        introduced: "2024-11-12",
        enacted: "2025-02-05",
        summary: "Requires ERCOT to maintain a 20% reserve margin during peak demand. Mandates winterization of natural gas infrastructure and establishes penalties for generation failures below -10°F.",
        keyProvisions: ["20% ERCOT reserve margin", "Gas infrastructure winterization", "Cold weather performance penalties"],
        sponsor: "Sen. Charles Schwertner",
        fullTextUrl: "https://capitol.texas.gov/"
      },
      {
        id: "HB-1045",
        title: "Property Tax Relief for Homeowners Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-10-28",
        enacted: "2025-01-20",
        summary: "Raises the homestead exemption from $100,000 to $140,000 for primary residences. Caps annual appraisal increases at 5% for properties valued under $500,000 statewide.",
        keyProvisions: ["$140K homestead exemption", "5% annual appraisal cap", "Applies to homes under $500K"],
        sponsor: "Rep. Morgan Meyer",
        fullTextUrl: "https://capitol.texas.gov/"
      },
      {
        id: "SB-832",
        title: "Border Security Infrastructure Enhancement Act",
        category: "Public Safety",
        status: "proposed",
        introduced: "2025-01-15",
        enacted: null,
        summary: "Allocates $1.2 billion for border infrastructure including surveillance technology, additional DPS troopers, and construction of forward operating bases along the Rio Grande sector.",
        keyProvisions: ["$1.2B border infrastructure funding", "Surveillance technology deployment", "Forward operating base construction"],
        sponsor: "Sen. Brian Birdwell",
        fullTextUrl: "https://capitol.texas.gov/"
      },
      {
        id: "HB-2789",
        title: "Rural Healthcare Access Expansion Act",
        category: "Healthcare",
        status: "in_process",
        introduced: "2025-02-03",
        lastActionDate: "2025-03-24",
        enacted: null,
        summary: "Establishes telehealth reimbursement parity for rural providers and creates a loan forgiveness program for physicians who practice in medically underserved counties for at least five years.",
        keyProvisions: ["Telehealth reimbursement parity", "Physician loan forgiveness", "Five-year rural practice commitment"],
        sponsor: "Rep. Jacey Jetton",
        fullTextUrl: "https://capitol.texas.gov/"
      },
      {
        id: "SB-1567",
        title: "Texas Business Franchise Tax Reduction Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-02-28",
        summary: "Reduces the franchise tax rate by 25% for businesses with annual revenue under $20 million. Phases out the tax entirely for companies with fewer than 10 employees over three years.",
        keyProvisions: ["25% franchise tax rate reduction", "Small business phase-out", "Three-year implementation timeline"],
        sponsor: "Sen. Paul Bettencourt",
        fullTextUrl: "https://capitol.texas.gov/"
      },
      {
        id: "HB-3456",
        title: "School Safety and Mental Health Act",
        category: "Education",
        status: "in_process",
        introduced: "2025-02-20",
        lastActionDate: "2025-03-16",
        enacted: null,
        summary: "Mandates armed security officers at every public school campus and funds school-based mental health counselors at a ratio of one per 250 students in districts above 5,000 enrollment.",
        keyProvisions: ["Armed campus security mandate", "1:250 counselor-to-student ratio", "Mental health screening protocols"],
        sponsor: "Rep. James Frank",
        fullTextUrl: "https://capitol.texas.gov/"
      },
      {
        id: "SB-445",
        title: "Water Infrastructure Modernization Act",
        category: "Infrastructure",
        status: "proposed",
        introduced: "2025-01-30",
        enacted: null,
        summary: "Creates the Texas Water Future Fund with $3 billion for desalination plants, aquifer recharge projects, and pipeline expansions to address projected shortfalls in West Texas and the Hill Country.",
        keyProvisions: ["$3B Water Future Fund", "Desalination plant construction", "Aquifer recharge programs"],
        sponsor: "Sen. Charles Perry",
        fullTextUrl: "https://capitol.texas.gov/"
      },
      {
        id: "HB-901",
        title: "Fentanyl Trafficking Enhanced Penalties Act",
        category: "Criminal Justice",
        status: "passed",
        introduced: "2024-11-05",
        enacted: "2025-01-28",
        summary: "Classifies possession of more than four grams of fentanyl as a first-degree felony with a mandatory minimum sentence of 15 years. Adds fentanyl analogs to the state controlled substances schedule.",
        keyProvisions: ["First-degree felony for 4g+ possession", "15-year mandatory minimum", "Analog scheduling expansion"],
        sponsor: "Rep. David Cook",
        fullTextUrl: "https://capitol.texas.gov/"
      },
      {
        id: "SB-2100",
        title: "Renewable Energy Property Tax Exemption Act",
        category: "Economy & Taxes",
        status: "proposed",
        introduced: "2025-03-01",
        enacted: null,
        summary: "Exempts solar and wind energy installations on agricultural land from property tax reassessment for 10 years. Requires community benefit agreements for utility-scale renewable projects.",
        keyProvisions: ["10-year property tax exemption", "Agricultural land solar protection", "Community benefit agreements"],
        sponsor: "Sen. Drew Springer",
        fullTextUrl: "https://capitol.texas.gov/"
      },
      {
        id: "HB-4200",
        title: "Parental Rights in Education Act",
        category: "Education",
        status: "proposed",
        introduced: "2025-03-08",
        enacted: null,
        summary: "Requires school districts to notify parents within 48 hours of any disciplinary action and grants parental opt-out for health and sexuality curriculum. Establishes complaint review boards.",
        keyProvisions: ["48-hour disciplinary notification", "Health curriculum opt-out", "District complaint review boards"],
        sponsor: "Rep. Steve Toth",
        fullTextUrl: "https://capitol.texas.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // NEW YORK
  // ──────────────────────────────────────────────
  NY: {
    state: "New York",
    abbr: "NY",
    session: "2025",
    totalBills: 10,
    passed: 5,
    inProcess: 2,
    proposed: 3,
    topCategory: "Healthcare",
    bills: [
      {
        id: "SB-4521",
        title: "New York Health Equity Act",
        category: "Healthcare",
        status: "passed",
        introduced: "2024-11-18",
        enacted: "2025-02-12",
        summary: "Requires hospitals to collect and publicly report health outcome data by race, ethnicity, and income. Establishes health equity officers at all public hospitals in the state.",
        keyProvisions: ["Demographic health data reporting", "Health equity officer mandates", "Public hospital accountability metrics"],
        sponsor: "Sen. Gustavo Rivera",
        fullTextUrl: "https://www.nysenate.gov/"
      },
      {
        id: "AB-7890",
        title: "Climate Superfund Act",
        category: "Environment",
        status: "passed",
        introduced: "2024-10-22",
        enacted: "2025-01-25",
        summary: "Requires fossil fuel companies responsible for significant greenhouse gas emissions to pay into a state climate adaptation fund totaling $3 billion over 25 years for infrastructure resilience.",
        keyProvisions: ["$3B climate adaptation fund", "Polluter-pays principle", "25-year contribution schedule"],
        sponsor: "Asm. Jeffrey Dinowitz",
        fullTextUrl: "https://www.nysenate.gov/"
      },
      {
        id: "SB-3200",
        title: "Affordable Insulin Access Act",
        category: "Healthcare",
        status: "passed",
        introduced: "2024-12-01",
        enacted: "2025-02-20",
        summary: "Caps out-of-pocket insulin costs at $35 per 30-day supply for all insured New Yorkers. Creates a state-funded assistance program for uninsured patients requiring insulin therapy.",
        keyProvisions: ["$35 insulin copay cap", "Uninsured assistance program", "Manufacturer rebate requirements"],
        sponsor: "Sen. Brad Hoylman-Sigal",
        fullTextUrl: "https://www.nysenate.gov/"
      },
      {
        id: "AB-1234",
        title: "Congestion Pricing Revenue Allocation Act",
        category: "Infrastructure",
        status: "in_process",
        introduced: "2025-01-10",
        lastActionDate: "2025-01-31",
        enacted: null,
        summary: "Directs 60% of congestion pricing revenue to MTA subway modernization and 25% to bus rapid transit expansion. Mandates annual independent audits of toll revenue expenditures.",
        keyProvisions: ["60% to subway modernization", "25% to bus rapid transit", "Annual independent audits"],
        sponsor: "Asm. Robert Carroll",
        fullTextUrl: "https://www.nysenate.gov/"
      },
      {
        id: "SB-5678",
        title: "Tenant Protection and Rent Stabilization Act",
        category: "Civil Rights",
        status: "proposed",
        introduced: "2025-02-05",
        enacted: null,
        summary: "Extends rent stabilization protections statewide to buildings with six or more units. Limits annual rent increases to 3% or CPI, whichever is lower, for qualifying stabilized apartments.",
        keyProvisions: ["Statewide rent stabilization expansion", "3% or CPI annual cap", "Six-unit building threshold"],
        sponsor: "Sen. Julia Salazar",
        fullTextUrl: "https://www.nysenate.gov/"
      },
      {
        id: "AB-9012",
        title: "Public School Technology Modernization Act",
        category: "Education",
        status: "passed",
        introduced: "2024-11-30",
        enacted: "2025-02-15",
        summary: "Allocates $750 million over five years for classroom technology upgrades, broadband connectivity, and cybersecurity infrastructure in K-12 public schools across New York State.",
        keyProvisions: ["$750M five-year technology fund", "Broadband connectivity mandates", "School cybersecurity standards"],
        sponsor: "Asm. Michael Benedetto",
        fullTextUrl: "https://www.nysenate.gov/"
      },
      {
        id: "SB-2345",
        title: "Criminal Justice Bail Reform Adjustment Act",
        category: "Criminal Justice",
        status: "proposed",
        introduced: "2025-02-18",
        enacted: null,
        summary: "Allows judges to consider public safety risk when setting bail for repeat violent offenders. Maintains cashless bail for misdemeanors and non-violent felonies while adding judicial discretion.",
        keyProvisions: ["Public safety risk consideration", "Cashless bail retained for misdemeanors", "Enhanced judicial discretion"],
        sponsor: "Sen. Patrick Gallivan",
        fullTextUrl: "https://www.nysenate.gov/"
      },
      {
        id: "AB-5501",
        title: "Small Business Recovery Tax Credit Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-12-15",
        enacted: "2025-03-01",
        summary: "Provides a refundable tax credit of up to $10,000 for small businesses that maintained employment levels during economic downturns. Targets businesses with under 25 employees statewide.",
        keyProvisions: ["$10K refundable tax credit", "Employment retention requirement", "25-employee threshold"],
        sponsor: "Asm. Latrice Walker",
        fullTextUrl: "https://www.nysenate.gov/"
      },
      {
        id: "SB-6789",
        title: "Maternal Health Outcomes Improvement Act",
        category: "Healthcare",
        status: "proposed",
        introduced: "2025-03-05",
        enacted: null,
        summary: "Extends Medicaid postpartum coverage to 12 months and funds doula programs in communities with high maternal mortality rates. Requires implicit bias training for all obstetric staff.",
        keyProvisions: ["12-month postpartum Medicaid coverage", "Community doula program funding", "Obstetric implicit bias training"],
        sponsor: "Sen. Samra Brouk",
        fullTextUrl: "https://www.nysenate.gov/"
      },
      {
        id: "AB-3378",
        title: "Ghost Gun Prohibition and Traceability Act",
        category: "Public Safety",
        status: "in_process",
        introduced: "2025-03-12",
        lastActionDate: "2025-04-08",
        enacted: null,
        summary: "Bans the sale and possession of unserialized firearms and unfinished frames or receivers. Requires all firearms in New York to have traceable serial numbers registered with state police.",
        keyProvisions: ["Unserialized firearm ban", "Unfinished receiver prohibition", "State police serial registration"],
        sponsor: "Asm. Patricia Fahy",
        fullTextUrl: "https://www.nysenate.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // FLORIDA
  // ──────────────────────────────────────────────
  FL: {
    state: "Florida",
    abbr: "FL",
    session: "2025",
    totalBills: 10,
    passed: 5,
    inProcess: 2,
    proposed: 3,
    topCategory: "Public Safety",
    bills: [
      {
        id: "SB-302",
        title: "Hurricane Resilience and Recovery Fund Act",
        category: "Infrastructure",
        status: "passed",
        introduced: "2024-11-01",
        enacted: "2025-01-22",
        summary: "Creates a $2 billion revolving fund for hurricane-resistant infrastructure upgrades including seawalls, storm drainage, and building code enforcement in coastal counties statewide.",
        keyProvisions: ["$2B revolving infrastructure fund", "Coastal seawall upgrades", "Enhanced building code enforcement"],
        sponsor: "Sen. Jason Brodeur",
        fullTextUrl: "https://www.flsenate.gov/"
      },
      {
        id: "HB-1523",
        title: "Homeowners Insurance Market Stabilization Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-12-08",
        enacted: "2025-02-10",
        summary: "Reforms litigation practices driving insurance cost increases by limiting contingency fee multipliers and requiring pre-suit mediation. Creates a state reinsurance backstop for catastrophic events.",
        keyProvisions: ["Contingency fee multiplier limits", "Pre-suit mediation requirement", "State reinsurance backstop"],
        sponsor: "Rep. Bob Rommel",
        fullTextUrl: "https://www.flsenate.gov/"
      },
      {
        id: "SB-788",
        title: "Everglades Water Quality Restoration Act",
        category: "Environment",
        status: "proposed",
        introduced: "2025-01-20",
        enacted: null,
        summary: "Accelerates Everglades restoration by funding stormwater treatment areas and requiring agricultural runoff phosphorus limits. Allocates $450 million for water quality improvement projects.",
        keyProvisions: ["$450M restoration funding", "Phosphorus runoff limits", "Stormwater treatment area expansion"],
        sponsor: "Sen. Ana Maria Rodriguez",
        fullTextUrl: "https://www.flsenate.gov/"
      },
      {
        id: "HB-2301",
        title: "Fentanyl Crisis Response Act",
        category: "Public Safety",
        status: "passed",
        introduced: "2024-11-15",
        enacted: "2025-01-30",
        summary: "Classifies fentanyl trafficking as a capital-eligible offense for quantities exceeding 150 grams. Funds naloxone distribution programs in every county and mandates drug-free zone expansions.",
        keyProvisions: ["Enhanced trafficking penalties", "County-wide naloxone distribution", "Drug-free zone expansions"],
        sponsor: "Rep. Mike Beltran",
        fullTextUrl: "https://www.flsenate.gov/"
      },
      {
        id: "SB-1200",
        title: "School Choice Scholarship Expansion Act",
        category: "Education",
        status: "passed",
        introduced: "2024-12-20",
        enacted: "2025-02-25",
        summary: "Eliminates income caps for the Family Empowerment Scholarship, making all Florida families eligible for state-funded private school vouchers. Increases per-student funding to $8,500 annually.",
        keyProvisions: ["Universal scholarship eligibility", "$8,500 per-student funding", "Income cap elimination"],
        sponsor: "Sen. Corey Simon",
        fullTextUrl: "https://www.flsenate.gov/"
      },
      {
        id: "HB-3090",
        title: "Illegal Street Racing Enforcement Act",
        category: "Public Safety",
        status: "in_process",
        introduced: "2025-02-01",
        lastActionDate: "2025-03-31",
        enacted: null,
        summary: "Makes participation in organized street racing a third-degree felony on second offense. Authorizes vehicle seizure and forfeiture for repeat offenders and spectator accountability measures.",
        keyProvisions: ["Third-degree felony on second offense", "Vehicle seizure authority", "Spectator accountability"],
        sponsor: "Rep. Juan Fernandez-Barquin",
        fullTextUrl: "https://www.flsenate.gov/"
      },
      {
        id: "SB-567",
        title: "Senior Citizen Property Tax Freeze Act",
        category: "Economy & Taxes",
        status: "proposed",
        introduced: "2025-02-14",
        enacted: null,
        summary: "Freezes property tax assessments for homeowners aged 65 and older who have lived in their primary residence for at least 10 years. Applies to homes valued under $400,000.",
        keyProvisions: ["Assessment freeze for 65+ homeowners", "10-year residency requirement", "$400K property value cap"],
        sponsor: "Sen. Dennis Baxley",
        fullTextUrl: "https://www.flsenate.gov/"
      },
      {
        id: "HB-4455",
        title: "Telehealth Expansion and Access Act",
        category: "Healthcare",
        status: "in_process",
        introduced: "2025-02-28",
        lastActionDate: "2025-03-16",
        enacted: null,
        summary: "Permanently authorizes telehealth visits for all Medicaid-covered services and requires private insurers to cover virtual visits at in-person reimbursement rates across all specialties.",
        keyProvisions: ["Permanent Medicaid telehealth coverage", "Reimbursement parity mandate", "All-specialty virtual visit coverage"],
        sponsor: "Rep. Sam Garrison",
        fullTextUrl: "https://www.flsenate.gov/"
      },
      {
        id: "SB-1890",
        title: "Anti-Squatting Property Rights Protection Act",
        category: "Public Safety",
        status: "passed",
        introduced: "2025-01-08",
        enacted: "2025-03-10",
        summary: "Expedites removal of unauthorized occupants from residential properties within 48 hours of owner complaint. Makes squatting a first-degree misdemeanor with mandatory restitution requirements.",
        keyProvisions: ["48-hour expedited removal", "First-degree misdemeanor classification", "Mandatory restitution"],
        sponsor: "Sen. Nick DiCeglie",
        fullTextUrl: "https://www.flsenate.gov/"
      },
      {
        id: "HB-678",
        title: "Red Tide Research and Mitigation Act",
        category: "Environment",
        status: "proposed",
        introduced: "2025-03-15",
        enacted: null,
        summary: "Funds $120 million for red tide research at Florida universities and deploys experimental mitigation technologies along Gulf Coast beaches. Establishes early warning systems for coastal communities.",
        keyProvisions: ["$120M research funding", "Experimental mitigation technology", "Coastal early warning systems"],
        sponsor: "Rep. Will Robinson",
        fullTextUrl: "https://www.flsenate.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // ILLINOIS
  // ──────────────────────────────────────────────
  IL: {
    state: "Illinois",
    abbr: "IL",
    session: "2025",
    totalBills: 10,
    passed: 4,
    inProcess: 2,
    proposed: 4,
    topCategory: "Criminal Justice",
    bills: [
      {
        id: "SB-1501",
        title: "SAFE-T Act Implementation Adjustment Act",
        category: "Criminal Justice",
        status: "passed",
        introduced: "2024-11-10",
        enacted: "2025-01-18",
        summary: "Refines the pretrial detention provisions of the SAFE-T Act by clarifying judicial discretion for violent offenses and establishing standardized risk assessment protocols across all Illinois counties.",
        keyProvisions: ["Judicial discretion clarification", "Standardized risk assessments", "County implementation guidance"],
        sponsor: "Sen. Robert Peters",
        fullTextUrl: "https://www.ilga.gov/"
      },
      {
        id: "HB-2340",
        title: "Chicago Transit Modernization Act",
        category: "Infrastructure",
        status: "in_process",
        introduced: "2025-01-25",
        lastActionDate: "2025-02-14",
        enacted: null,
        summary: "Authorizes $4.5 billion in bonds for CTA Red Line extension to 130th Street, Blue Line O'Hare modernization, and systemwide accessibility upgrades for ADA compliance by 2030.",
        keyProvisions: ["$4.5B transit bond authorization", "Red Line extension to 130th", "ADA compliance by 2030"],
        sponsor: "Rep. Kam Buckner",
        fullTextUrl: "https://www.ilga.gov/"
      },
      {
        id: "SB-890",
        title: "Cannabis Revenue Community Reinvestment Act",
        category: "Criminal Justice",
        status: "passed",
        introduced: "2024-12-05",
        enacted: "2025-02-08",
        summary: "Directs 35% of cannabis tax revenue to communities disproportionately affected by drug enforcement. Funds expungement assistance, job training, and small business grants in qualified areas.",
        keyProvisions: ["35% revenue to affected communities", "Expungement assistance funding", "Small business grant programs"],
        sponsor: "Sen. Kimberly Lightford",
        fullTextUrl: "https://www.ilga.gov/"
      },
      {
        id: "HB-4567",
        title: "Clean Energy Jobs and Justice Act",
        category: "Environment",
        status: "proposed",
        introduced: "2025-02-10",
        enacted: null,
        summary: "Accelerates the closure of remaining coal plants by 2028 and mandates 50% renewable energy by 2035. Creates a workforce transition fund for displaced fossil fuel workers across Illinois.",
        keyProvisions: ["Coal plant closure by 2028", "50% renewable by 2035", "Worker transition fund"],
        sponsor: "Rep. Ann Williams",
        fullTextUrl: "https://www.ilga.gov/"
      },
      {
        id: "SB-2678",
        title: "Assault Weapons Registration and Safety Act",
        category: "Public Safety",
        status: "proposed",
        introduced: "2025-02-22",
        enacted: null,
        summary: "Strengthens Illinois' assault weapons ban by requiring registration of pre-ban firearms and establishing a buyback program. Increases penalties for illegal possession and straw purchases.",
        keyProvisions: ["Pre-ban firearm registration", "State buyback program", "Enhanced straw purchase penalties"],
        sponsor: "Sen. Don Harmon",
        fullTextUrl: "https://www.ilga.gov/"
      },
      {
        id: "HB-1100",
        title: "Early Childhood Education Expansion Act",
        category: "Education",
        status: "passed",
        introduced: "2024-11-20",
        enacted: "2025-02-01",
        summary: "Expands publicly funded pre-K to all three-year-olds in Illinois by 2027. Increases early childhood educator salaries to public school parity and funds new classroom construction.",
        keyProvisions: ["Universal pre-K for three-year-olds", "Educator salary parity", "New classroom construction funding"],
        sponsor: "Rep. Robyn Gabel",
        fullTextUrl: "https://www.ilga.gov/"
      },
      {
        id: "SB-3400",
        title: "Youth Sentencing Reform Act",
        category: "Criminal Justice",
        status: "proposed",
        introduced: "2025-03-01",
        enacted: null,
        summary: "Prohibits life-without-parole sentences for offenders who committed crimes before age 21. Establishes mandatory parole review hearings after 20 years of incarceration for youth offenders.",
        keyProvisions: ["Ban on juvenile LWOP under 21", "20-year parole review mandate", "Youth-specific sentencing guidelines"],
        sponsor: "Sen. Robert Peters",
        fullTextUrl: "https://www.ilga.gov/"
      },
      {
        id: "HB-5890",
        title: "Reproductive Health Care Access Act",
        category: "Healthcare",
        status: "passed",
        introduced: "2024-12-18",
        enacted: "2025-03-05",
        summary: "Establishes Illinois as a reproductive health sanctuary state with legal protections for out-of-state patients and providers. Funds clinic security and patient travel assistance programs.",
        keyProvisions: ["Sanctuary state protections", "Out-of-state patient legal shields", "Clinic security funding"],
        sponsor: "Rep. Kelly Cassidy",
        fullTextUrl: "https://www.ilga.gov/"
      },
      {
        id: "SB-750",
        title: "Property Tax Relief for Working Families Act",
        category: "Economy & Taxes",
        status: "proposed",
        introduced: "2025-03-08",
        enacted: null,
        summary: "Doubles the property tax credit from $5,000 to $10,000 for households earning under $100,000. Funded through a surcharge on commercial properties valued above $5 million in Cook County.",
        keyProvisions: ["$10K property tax credit", "$100K income threshold", "Commercial property surcharge"],
        sponsor: "Sen. Elgie Sims",
        fullTextUrl: "https://www.ilga.gov/"
      },
      {
        id: "HB-3210",
        title: "Police Accountability and Transparency Act",
        category: "Criminal Justice",
        status: "in_process",
        introduced: "2025-03-12",
        lastActionDate: "2025-04-21",
        enacted: null,
        summary: "Requires all law enforcement agencies to publish use-of-force data quarterly and creates an independent civilian oversight board with subpoena power for investigating police misconduct.",
        keyProvisions: ["Quarterly use-of-force reporting", "Independent civilian oversight board", "Subpoena power for investigations"],
        sponsor: "Rep. Justin Slaughter",
        fullTextUrl: "https://www.ilga.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // ALABAMA
  // ──────────────────────────────────────────────
  AL: {
    state: "Alabama",
    abbr: "AL",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Education",
    bills: [
      {
        id: "SB-105",
        title: "Alabama Literacy Improvement Act",
        category: "Education",
        status: "passed",
        introduced: "2024-11-15",
        enacted: "2025-02-10",
        summary: "Requires third-grade reading proficiency assessments for promotion and funds intensive reading intervention programs in underperforming school districts across the state.",
        keyProvisions: ["Third-grade reading gate", "Intervention program funding", "Teacher literacy training"],
        sponsor: "Sen. Arthur Orr",
        fullTextUrl: "https://www.legislature.state.al.us/"
      },
      {
        id: "HB-230",
        title: "Rural Broadband Expansion Act",
        category: "Infrastructure",
        status: "in_process",
        introduced: "2025-01-20",
        lastActionDate: "2025-02-21",
        enacted: null,
        summary: "Allocates $300 million in federal matching funds for broadband deployment in unserved rural areas. Requires ISPs to offer affordable tiers under $30 per month in subsidized service areas.",
        keyProvisions: ["$300M broadband deployment fund", "$30/month affordable tier", "Federal matching requirement"],
        sponsor: "Rep. Danny Garrett",
        fullTextUrl: "https://www.legislature.state.al.us/"
      },
      {
        id: "SB-412",
        title: "Prison Reform and Rehabilitation Act",
        category: "Criminal Justice",
        status: "proposed",
        introduced: "2025-02-05",
        enacted: null,
        summary: "Addresses federal court mandates by funding new correctional staff positions, expanding vocational training for inmates, and establishing reentry services in each of Alabama's 67 counties.",
        keyProvisions: ["Correctional staff expansion", "Vocational training programs", "County reentry services"],
        sponsor: "Sen. Cam Ward",
        fullTextUrl: "https://www.legislature.state.al.us/"
      },
      {
        id: "HB-678",
        title: "Education Trust Fund Revenue Stabilization Act",
        category: "Education",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-03-01",
        summary: "Creates a rainy-day reserve within the Education Trust Fund capped at 10% of annual revenue to prevent mid-year proration cuts to public schools during economic downturns.",
        keyProvisions: ["10% rainy-day reserve cap", "Proration prevention mechanism", "Automatic trigger provisions"],
        sponsor: "Rep. Bill Poole",
        fullTextUrl: "https://www.legislature.state.al.us/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // ALASKA
  // ──────────────────────────────────────────────
  AK: {
    state: "Alaska",
    abbr: "AK",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-42",
        title: "Permanent Fund Dividend Restructuring Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-05",
        enacted: "2025-01-28",
        summary: "Establishes a formula-based PFD tied to a percentage of the Permanent Fund's five-year average market value, ending annual legislative disputes over dividend amounts and stabilizing payouts.",
        keyProvisions: ["Formula-based PFD calculation", "Five-year market average basis", "Legislative override threshold"],
        sponsor: "Sen. Bill Wielechowski",
        fullTextUrl: "https://www.akleg.gov/"
      },
      {
        id: "HB-118",
        title: "Arctic Infrastructure Resilience Act",
        category: "Infrastructure",
        status: "in_process",
        introduced: "2025-01-15",
        lastActionDate: "2025-03-07",
        enacted: null,
        summary: "Funds permafrost monitoring systems and adapts road and building foundations in communities experiencing accelerated thaw. Allocates $180 million for infrastructure climate adaptation.",
        keyProvisions: ["$180M adaptation funding", "Permafrost monitoring systems", "Foundation retrofit programs"],
        sponsor: "Rep. Bryce Edgmon",
        fullTextUrl: "https://www.akleg.gov/"
      },
      {
        id: "SB-201",
        title: "Fisheries Sustainability and Revenue Act",
        category: "Economy & Taxes",
        status: "proposed",
        introduced: "2025-02-12",
        enacted: null,
        summary: "Modernizes the commercial fishing tax structure and invests revenue in hatchery improvements and habitat restoration to sustain salmon runs threatened by warming ocean temperatures.",
        keyProvisions: ["Commercial fishing tax modernization", "Hatchery improvement funding", "Salmon habitat restoration"],
        sponsor: "Sen. Jesse Bjorkman",
        fullTextUrl: "https://www.akleg.gov/"
      },
      {
        id: "HB-305",
        title: "Rural Healthcare Access Improvement Act",
        category: "Healthcare",
        status: "passed",
        introduced: "2024-12-20",
        enacted: "2025-03-05",
        summary: "Expands community health aide training programs and funds telemedicine hubs in remote villages. Provides housing stipends for healthcare workers in communities accessible only by air.",
        keyProvisions: ["Health aide training expansion", "Remote telemedicine hubs", "Healthcare worker housing stipends"],
        sponsor: "Rep. CJ McCormick",
        fullTextUrl: "https://www.akleg.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // ARIZONA
  // ──────────────────────────────────────────────
  AZ: {
    state: "Arizona",
    abbr: "AZ",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Infrastructure",
    bills: [
      {
        id: "SB-1150",
        title: "Arizona Water Security Act",
        category: "Infrastructure",
        status: "passed",
        introduced: "2024-11-08",
        enacted: "2025-02-03",
        summary: "Restricts new groundwater-dependent development in areas exceeding their assured water supply. Invests $600 million in desalination and water recycling to offset Colorado River shortfalls.",
        keyProvisions: ["Development groundwater restrictions", "$600M water recycling investment", "Colorado River offset programs"],
        sponsor: "Sen. T.J. Shope",
        fullTextUrl: "https://www.azleg.gov/"
      },
      {
        id: "HB-2345",
        title: "Border Community Safety Enhancement Act",
        category: "Public Safety",
        status: "in_process",
        introduced: "2025-01-28",
        lastActionDate: "2025-02-22",
        enacted: null,
        summary: "Provides $200 million for DPS border operations, surveillance cameras, and communication equipment. Establishes mutual aid agreements with county sheriffs along the international boundary.",
        keyProvisions: ["$200M DPS border funding", "Surveillance infrastructure", "Mutual aid agreements"],
        sponsor: "Rep. David Livingston",
        fullTextUrl: "https://www.azleg.gov/"
      },
      {
        id: "SB-780",
        title: "K-12 Teacher Recruitment and Retention Act",
        category: "Education",
        status: "proposed",
        introduced: "2025-02-15",
        enacted: null,
        summary: "Increases base teacher salary to $50,000 statewide and offers student loan forgiveness of $5,000 per year for educators in Title I schools serving for at least three consecutive years.",
        keyProvisions: ["$50K minimum teacher salary", "$5K annual loan forgiveness", "Three-year Title I commitment"],
        sponsor: "Sen. Christine Marsh",
        fullTextUrl: "https://www.azleg.gov/"
      },
      {
        id: "HB-1678",
        title: "Solar Energy Storage Tax Credit Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-12-01",
        enacted: "2025-02-20",
        summary: "Provides a 30% state tax credit for residential battery storage systems paired with solar installations. Caps individual credits at $5,000 and allocates $75 million for the program annually.",
        keyProvisions: ["30% battery storage tax credit", "$5,000 individual cap", "$75M annual program budget"],
        sponsor: "Rep. Amish Shah",
        fullTextUrl: "https://www.azleg.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // ARKANSAS
  // ──────────────────────────────────────────────
  AR: {
    state: "Arkansas",
    abbr: "AR",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-89",
        title: "Arkansas Income Tax Reduction Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-20",
        enacted: "2025-01-30",
        summary: "Reduces the top individual income tax rate from 4.4% to 3.9% over three years. Funded through projected revenue growth and a 2% reduction in state agency administrative budgets.",
        keyProvisions: ["Top rate cut to 3.9%", "Three-year phase-in", "Agency budget reductions"],
        sponsor: "Sen. Jonathan Dismang",
        fullTextUrl: "https://www.arkleg.state.ar.us/"
      },
      {
        id: "HB-1345",
        title: "LEARNS Act Implementation Enhancement",
        category: "Education",
        status: "in_process",
        introduced: "2025-01-22",
        lastActionDate: "2025-02-23",
        enacted: null,
        summary: "Expands the LEARNS Act school voucher program with additional accountability measures for participating private schools including standardized testing and financial transparency requirements.",
        keyProvisions: ["Private school testing mandates", "Financial transparency rules", "Voucher program expansion"],
        sponsor: "Rep. Keith Brooks",
        fullTextUrl: "https://www.arkleg.state.ar.us/"
      },
      {
        id: "SB-256",
        title: "Rural Hospital Stabilization Act",
        category: "Healthcare",
        status: "proposed",
        introduced: "2025-02-10",
        enacted: null,
        summary: "Creates a state grant program to prevent rural hospital closures by subsidizing operational costs for critical access hospitals serving populations under 25,000 in medically underserved areas.",
        keyProvisions: ["Rural hospital grant program", "Critical access hospital subsidies", "Population threshold of 25,000"],
        sponsor: "Sen. Missy Irvin",
        fullTextUrl: "https://www.arkleg.state.ar.us/"
      },
      {
        id: "HB-789",
        title: "Arkansas Highway Infrastructure Bond Act",
        category: "Infrastructure",
        status: "passed",
        introduced: "2024-12-15",
        enacted: "2025-02-25",
        summary: "Authorizes $1.2 billion in highway improvement bonds for Interstate widening and bridge replacement projects. Prioritizes the I-30 and I-40 corridors through central Arkansas.",
        keyProvisions: ["$1.2B highway bond authorization", "I-30/I-40 corridor priority", "Bridge replacement program"],
        sponsor: "Rep. Jeff Wardlaw",
        fullTextUrl: "https://www.arkleg.state.ar.us/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // COLORADO
  // ──────────────────────────────────────────────
  CO: {
    state: "Colorado",
    abbr: "CO",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Environment",
    bills: [
      {
        id: "SB-25-078",
        title: "Colorado Air Quality Improvement Act",
        category: "Environment",
        status: "passed",
        introduced: "2024-11-18",
        enacted: "2025-02-12",
        summary: "Tightens ozone precursor emission limits along the Front Range and funds $200 million in air monitoring upgrades. Requires industrial facilities to adopt best available control technology by 2027.",
        keyProvisions: ["Stricter ozone precursor limits", "$200M monitoring upgrades", "BACT mandate by 2027"],
        sponsor: "Sen. Chris Hansen",
        fullTextUrl: "https://leg.colorado.gov/"
      },
      {
        id: "HB-25-1234",
        title: "Affordable Housing Land Trust Act",
        category: "Civil Rights",
        status: "proposed",
        introduced: "2025-01-30",
        enacted: null,
        summary: "Creates a statewide community land trust program to preserve long-term housing affordability in resort and metro communities experiencing rapid appreciation and displacement pressures.",
        keyProvisions: ["Statewide land trust program", "Resort community targeting", "Long-term affordability covenants"],
        sponsor: "Rep. Brianna Titone",
        fullTextUrl: "https://leg.colorado.gov/"
      },
      {
        id: "SB-25-190",
        title: "Wildfire Risk Reduction and Insurance Act",
        category: "Environment",
        status: "in_process",
        introduced: "2025-02-18",
        lastActionDate: "2025-03-15",
        enacted: null,
        summary: "Requires insurance companies to offer premium discounts for homes meeting Firewise community standards. Funds $150 million in community wildfire preparedness and forest management projects.",
        keyProvisions: ["Firewise premium discounts", "$150M preparedness funding", "Forest management expansion"],
        sponsor: "Sen. Dylan Roberts",
        fullTextUrl: "https://leg.colorado.gov/"
      },
      {
        id: "HB-25-567",
        title: "Psilocybin Therapy Regulation Act",
        category: "Healthcare",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-03-01",
        summary: "Establishes the regulatory framework for licensed psilocybin therapy centers following voter approval. Sets practitioner training standards, dosing protocols, and client screening requirements.",
        keyProvisions: ["Licensed therapy center regulations", "Practitioner training standards", "Client screening protocols"],
        sponsor: "Rep. Javier Mabrey",
        fullTextUrl: "https://leg.colorado.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // CONNECTICUT
  // ──────────────────────────────────────────────
  CT: {
    state: "Connecticut",
    abbr: "CT",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-1052",
        title: "Connecticut Child Tax Credit Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-22",
        enacted: "2025-02-05",
        summary: "Creates a refundable state child tax credit of $600 per child under 6 for households earning under $200,000. Expected to benefit 250,000 families and reduce child poverty by 15% statewide.",
        keyProvisions: ["$600 per child under 6", "$200K income threshold", "Refundable credit structure"],
        sponsor: "Sen. Matt Lesser",
        fullTextUrl: "https://www.cga.ct.gov/"
      },
      {
        id: "HB-6890",
        title: "Gun Violence Prevention and Community Safety Act",
        category: "Public Safety",
        status: "in_process",
        introduced: "2025-01-18",
        lastActionDate: "2025-02-04",
        enacted: null,
        summary: "Funds community violence intervention programs in Hartford, New Haven, and Bridgeport. Requires safe storage of firearms in homes with minors and expands the ghost gun ban statewide.",
        keyProvisions: ["CVI program funding", "Safe storage mandate", "Ghost gun ban expansion"],
        sponsor: "Rep. Steven Stafstrom",
        fullTextUrl: "https://www.cga.ct.gov/"
      },
      {
        id: "SB-789",
        title: "Paid Family and Medical Leave Enhancement Act",
        category: "Civil Rights",
        status: "proposed",
        introduced: "2025-02-08",
        enacted: null,
        summary: "Increases paid family leave benefits from 12 to 16 weeks and raises the wage replacement rate to 80% for workers earning below the state median income. Expands qualifying conditions.",
        keyProvisions: ["16-week leave extension", "80% wage replacement rate", "Expanded qualifying conditions"],
        sponsor: "Sen. Julie Kushner",
        fullTextUrl: "https://www.cga.ct.gov/"
      },
      {
        id: "HB-5234",
        title: "Municipal Property Tax Cap Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-12-08",
        enacted: "2025-02-28",
        summary: "Limits annual municipal property tax increases to 2.5% or the rate of inflation, whichever is lower. Provides state aid to offset revenue shortfalls for municipalities below median per-capita income.",
        keyProvisions: ["2.5% annual tax increase cap", "CPI alternative ceiling", "State aid for low-income municipalities"],
        sponsor: "Rep. Jason Rojas",
        fullTextUrl: "https://www.cga.ct.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // DELAWARE
  // ──────────────────────────────────────────────
  DE: {
    state: "Delaware",
    abbr: "DE",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-45",
        title: "Delaware Corporate Franchise Tax Modernization Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-12",
        enacted: "2025-01-25",
        summary: "Updates Delaware's corporate franchise tax formula to capture revenue from digital-native businesses while maintaining the state's competitive advantage for corporate incorporations.",
        keyProvisions: ["Digital business tax formula", "Competitive incorporation rates", "Revenue capture modernization"],
        sponsor: "Sen. Darius Brown",
        fullTextUrl: "https://legis.delaware.gov/"
      },
      {
        id: "HB-190",
        title: "Coastal Resilience and Sea Level Adaptation Act",
        category: "Environment",
        status: "in_process",
        introduced: "2025-01-28",
        lastActionDate: "2025-03-25",
        enacted: null,
        summary: "Establishes a $150 million fund for beach nourishment, wetland restoration, and relocation assistance for properties in high-risk flood zones along Delaware's 28 miles of coastline.",
        keyProvisions: ["$150M coastal fund", "Beach nourishment programs", "Flood zone relocation assistance"],
        sponsor: "Rep. Steve Smyk",
        fullTextUrl: "https://legis.delaware.gov/"
      },
      {
        id: "SB-112",
        title: "Cannabis Social Equity Licensing Act",
        category: "Civil Rights",
        status: "proposed",
        introduced: "2025-02-14",
        enacted: null,
        summary: "Reserves 30% of new cannabis dispensary licenses for social equity applicants from communities disproportionately impacted by cannabis prohibition enforcement in Delaware.",
        keyProvisions: ["30% social equity license reservation", "Impacted community priority", "Application fee waivers"],
        sponsor: "Sen. Elizabeth Lockman",
        fullTextUrl: "https://legis.delaware.gov/"
      },
      {
        id: "HB-345",
        title: "Early Childhood Development Investment Act",
        category: "Education",
        status: "passed",
        introduced: "2024-12-20",
        enacted: "2025-03-08",
        summary: "Expands Delaware Stars quality rating system and increases subsidies for childcare providers who achieve top-tier ratings. Caps family copays at 7% of household income for subsidized care.",
        keyProvisions: ["Stars system expansion", "Provider subsidy increases", "7% family copay cap"],
        sponsor: "Rep. Kim Williams",
        fullTextUrl: "https://legis.delaware.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // DISTRICT OF COLUMBIA
  // ──────────────────────────────────────────────
  DC: {
    state: "District of Columbia",
    abbr: "DC",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Civil Rights",
    bills: [
      {
        id: "B25-0102",
        title: "DC Statehood Advocacy and Preparation Act",
        category: "Civil Rights",
        status: "in_process",
        introduced: "2025-01-15",
        lastActionDate: "2025-02-07",
        enacted: null,
        summary: "Funds a national advocacy campaign for DC statehood and prepares administrative frameworks for transitioning to state governance including draft tax codes and judicial reorganization plans.",
        keyProvisions: ["National advocacy campaign", "Administrative transition planning", "Draft state governance frameworks"],
        sponsor: "Councilmember Janeese Lewis George",
        fullTextUrl: "https://lims.dccouncil.gov/"
      },
      {
        id: "B25-0245",
        title: "District Affordable Housing Preservation Act",
        category: "Civil Rights",
        status: "passed",
        introduced: "2024-11-28",
        enacted: "2025-02-18",
        summary: "Grants the District first right of refusal to purchase multifamily buildings when tenants face displacement. Allocates $400 million from the Housing Production Trust Fund for preservation acquisitions.",
        keyProvisions: ["District right of first refusal", "$400M preservation fund", "Anti-displacement protections"],
        sponsor: "Councilmember Robert White",
        fullTextUrl: "https://lims.dccouncil.gov/"
      },
      {
        id: "B25-0378",
        title: "Vision Zero Traffic Safety Acceleration Act",
        category: "Public Safety",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-02-28",
        summary: "Reduces speed limits to 20 mph on all residential streets and funds $80 million in protected bike lane construction, pedestrian islands, and automated speed camera enforcement expansion.",
        keyProvisions: ["20 mph residential speed limit", "$80M bike lane funding", "Speed camera expansion"],
        sponsor: "Councilmember Charles Allen",
        fullTextUrl: "https://lims.dccouncil.gov/"
      },
      {
        id: "B25-0490",
        title: "Universal Pre-K Quality Enhancement Act",
        category: "Education",
        status: "proposed",
        introduced: "2025-03-05",
        enacted: null,
        summary: "Raises educator compensation at community-based pre-K providers to match DCPS teacher salaries. Funds facility improvements and mandates maximum class sizes of 15 students per educator.",
        keyProvisions: ["DCPS salary parity for pre-K", "Facility improvement grants", "15-student class size cap"],
        sponsor: "Councilmember Zachary Parker",
        fullTextUrl: "https://lims.dccouncil.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // GEORGIA
  // ──────────────────────────────────────────────
  GA: {
    state: "Georgia",
    abbr: "GA",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-120",
        title: "Georgia Income Tax Flat Rate Transition Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-10",
        enacted: "2025-01-28",
        summary: "Continues Georgia's transition to a flat income tax by reducing the rate from 5.39% to 5.15% for 2025, with a goal of reaching 4.99% by 2027 as revenues permit.",
        keyProvisions: ["Rate reduction to 5.15%", "4.99% target by 2027", "Revenue-triggered implementation"],
        sponsor: "Sen. Chuck Hufstetler",
        fullTextUrl: "https://www.legis.ga.gov/"
      },
      {
        id: "HB-567",
        title: "Election Integrity and Access Act",
        category: "Civil Rights",
        status: "in_process",
        introduced: "2025-02-01",
        lastActionDate: "2025-03-27",
        enacted: null,
        summary: "Modifies early voting provisions to require a minimum of three weeks of early voting including two Saturdays. Standardizes drop box placement at one per 30,000 registered voters per county.",
        keyProvisions: ["Three-week early voting minimum", "Saturday voting mandate", "Standardized drop box ratios"],
        sponsor: "Rep. Bee Nguyen",
        fullTextUrl: "https://www.legis.ga.gov/"
      },
      {
        id: "SB-340",
        title: "Film Industry Tax Credit Reform Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-12-05",
        enacted: "2025-02-20",
        summary: "Adds clawback provisions and job creation requirements to Georgia's film tax credit. Caps transferable credits at $900 million annually and requires minimum local hiring percentages.",
        keyProvisions: ["$900M annual credit cap", "Clawback provisions", "Local hiring minimums"],
        sponsor: "Sen. Blake Tillery",
        fullTextUrl: "https://www.legis.ga.gov/"
      },
      {
        id: "HB-892",
        title: "Rural Hospital Emergency Stabilization Act",
        category: "Healthcare",
        status: "proposed",
        introduced: "2025-02-18",
        enacted: null,
        summary: "Creates a state-funded program to convert struggling rural hospitals to emergency-only facilities while maintaining essential diagnostic and stabilization services for underserved communities.",
        keyProvisions: ["Rural hospital conversion program", "Emergency-only facility model", "Diagnostic service preservation"],
        sponsor: "Rep. Sharon Cooper",
        fullTextUrl: "https://www.legis.ga.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // HAWAII
  // ──────────────────────────────────────────────
  HI: {
    state: "Hawaii",
    abbr: "HI",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Environment",
    bills: [
      {
        id: "SB-1280",
        title: "Hawaii 100% Clean Energy Acceleration Act",
        category: "Environment",
        status: "passed",
        introduced: "2024-11-15",
        enacted: "2025-02-08",
        summary: "Accelerates Hawaii's 100% renewable energy target from 2045 to 2040. Mandates grid-scale battery storage deployment and funds offshore wind feasibility studies around the main islands.",
        keyProvisions: ["2040 renewable target acceleration", "Grid-scale battery mandates", "Offshore wind studies"],
        sponsor: "Sen. Chris Lee",
        fullTextUrl: "https://www.capitol.hawaii.gov/"
      },
      {
        id: "HB-2345",
        title: "Maui Wildfire Recovery and Prevention Act",
        category: "Public Safety",
        status: "passed",
        introduced: "2024-12-01",
        enacted: "2025-01-30",
        summary: "Allocates $500 million for Lahaina rebuilding, establishes a wildfire prevention authority for all islands, and mandates utility vegetation management standards to prevent ignition events.",
        keyProvisions: ["$500M Lahaina rebuilding fund", "Statewide wildfire authority", "Utility vegetation standards"],
        sponsor: "Rep. Troy Hashimoto",
        fullTextUrl: "https://www.capitol.hawaii.gov/"
      },
      {
        id: "SB-678",
        title: "Tourism Impact Fee and Housing Fund Act",
        category: "Economy & Taxes",
        status: "proposed",
        introduced: "2025-01-25",
        enacted: null,
        summary: "Imposes a $50 per-visitor green fee to fund affordable housing construction and environmental restoration. Revenue directed to the Aloha Housing Trust for resident-only rental developments.",
        keyProvisions: ["$50 per-visitor green fee", "Aloha Housing Trust funding", "Resident-only rental development"],
        sponsor: "Sen. Jarrett Keohokalole",
        fullTextUrl: "https://www.capitol.hawaii.gov/"
      },
      {
        id: "HB-901",
        title: "Coral Reef Protection and Restoration Act",
        category: "Environment",
        status: "in_process",
        introduced: "2025-02-20",
        lastActionDate: "2025-04-01",
        enacted: null,
        summary: "Bans reef-toxic sunscreens statewide and funds $40 million in coral nursery and restoration projects. Establishes marine protected area buffer zones around all major reef systems.",
        keyProvisions: ["Reef-toxic sunscreen ban", "$40M coral restoration funding", "Marine buffer zone expansion"],
        sponsor: "Rep. Nicole Lowen",
        fullTextUrl: "https://www.capitol.hawaii.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // IDAHO
  // ──────────────────────────────────────────────
  ID: {
    state: "Idaho",
    abbr: "ID",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-1045",
        title: "Idaho Grocery Tax Elimination Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-20",
        enacted: "2025-02-01",
        summary: "Permanently eliminates the state sales tax on groceries, replacing the existing tax credit system. Projected to save the average Idaho family $480 per year in food costs.",
        keyProvisions: ["Grocery sales tax elimination", "Tax credit system repeal", "$480 average family savings"],
        sponsor: "Sen. Jim Guthrie",
        fullTextUrl: "https://legislature.idaho.gov/"
      },
      {
        id: "HB-234",
        title: "Public Lands Access Protection Act",
        category: "Other",
        status: "in_process",
        introduced: "2025-01-18",
        lastActionDate: "2025-02-23",
        enacted: null,
        summary: "Protects public access to state and federal lands by prohibiting private enclosure of traditional access routes. Establishes easement acquisition programs for landlocked public parcels.",
        keyProvisions: ["Access route protection", "Easement acquisition programs", "Landlocked parcel access"],
        sponsor: "Rep. Britt Raybould",
        fullTextUrl: "https://legislature.idaho.gov/"
      },
      {
        id: "SB-567",
        title: "Wildland Fire Suppression Cost Sharing Act",
        category: "Environment",
        status: "proposed",
        introduced: "2025-02-10",
        enacted: null,
        summary: "Creates a cost-sharing framework between state and county governments for wildfire suppression in the wildland-urban interface. Establishes a $100 million fire suppression reserve fund.",
        keyProvisions: ["State-county cost sharing", "$100M suppression reserve", "WUI priority zones"],
        sponsor: "Sen. Mark Harris",
        fullTextUrl: "https://legislature.idaho.gov/"
      },
      {
        id: "HB-890",
        title: "Teacher Salary Competitiveness Act",
        category: "Education",
        status: "passed",
        introduced: "2024-12-15",
        enacted: "2025-03-05",
        summary: "Raises the minimum teacher salary in Idaho from $42,500 to $48,000 to reduce attrition to neighboring states. Funded through a portion of the state's surplus revenue allocation.",
        keyProvisions: ["$48K minimum teacher salary", "Surplus revenue funding", "Cross-state competitiveness goal"],
        sponsor: "Rep. Wendy Horman",
        fullTextUrl: "https://legislature.idaho.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // INDIANA
  // ──────────────────────────────────────────────
  IN: {
    state: "Indiana",
    abbr: "IN",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-345",
        title: "Indiana Economic Development Incentive Reform Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-14",
        enacted: "2025-01-30",
        summary: "Overhauls the state's business incentive program by requiring performance-based clawbacks and public reporting of job creation outcomes. Prioritizes incentives for advanced manufacturing.",
        keyProvisions: ["Performance-based clawbacks", "Public outcome reporting", "Advanced manufacturing priority"],
        sponsor: "Sen. Travis Holdman",
        fullTextUrl: "https://iga.in.gov/"
      },
      {
        id: "HB-1234",
        title: "Maternal Mortality Prevention Act",
        category: "Healthcare",
        status: "in_process",
        introduced: "2025-01-22",
        lastActionDate: "2025-02-17",
        enacted: null,
        summary: "Extends postpartum Medicaid coverage to 12 months and mandates implicit bias training for obstetric providers. Establishes maternal mortality review committees in all Indiana hospital regions.",
        keyProvisions: ["12-month postpartum Medicaid", "Provider bias training", "Regional mortality review"],
        sponsor: "Rep. Vanessa Summers",
        fullTextUrl: "https://iga.in.gov/"
      },
      {
        id: "SB-890",
        title: "EV Battery Manufacturing Tax Credit Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-12-08",
        enacted: "2025-02-20",
        summary: "Provides a 15-year property tax abatement and $50 million in workforce training grants for electric vehicle battery manufacturers establishing operations in Indiana.",
        keyProvisions: ["15-year property tax abatement", "$50M workforce training grants", "EV manufacturing focus"],
        sponsor: "Sen. Eric Koch",
        fullTextUrl: "https://iga.in.gov/"
      },
      {
        id: "HB-567",
        title: "School Safety Infrastructure Act",
        category: "Education",
        status: "proposed",
        introduced: "2025-02-15",
        enacted: null,
        summary: "Allocates $200 million for physical security upgrades at public schools including controlled entry systems, emergency communication networks, and ballistic-rated interior safety zones.",
        keyProvisions: ["$200M security upgrade fund", "Controlled entry systems", "Ballistic safety zones"],
        sponsor: "Rep. Wendy McNamara",
        fullTextUrl: "https://iga.in.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // IOWA
  // ──────────────────────────────────────────────
  IA: {
    state: "Iowa",
    abbr: "IA",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Education",
    bills: [
      {
        id: "SF-345",
        title: "Iowa School Choice Expansion Act",
        category: "Education",
        status: "passed",
        introduced: "2024-11-18",
        enacted: "2025-01-25",
        summary: "Expands the Students First education savings accounts to all Iowa families regardless of income. Increases per-student voucher amount to $7,900 and adds transportation coverage.",
        keyProvisions: ["Universal ESA eligibility", "$7,900 per-student voucher", "Transportation coverage addition"],
        sponsor: "Sen. Amy Sinclair",
        fullTextUrl: "https://www.legis.iowa.gov/"
      },
      {
        id: "HF-678",
        title: "Iowa Water Quality Protection Act",
        category: "Environment",
        status: "in_process",
        introduced: "2025-01-30",
        lastActionDate: "2025-03-09",
        enacted: null,
        summary: "Establishes nutrient reduction targets for agricultural operations exceeding 500 acres and funds cover crop incentive payments to reduce nitrate runoff into the Des Moines and Raccoon rivers.",
        keyProvisions: ["Nutrient reduction targets", "Cover crop incentive payments", "Large operation requirements"],
        sponsor: "Rep. Sami Scheetz",
        fullTextUrl: "https://www.legis.iowa.gov/"
      },
      {
        id: "SF-901",
        title: "Child Care Desert Elimination Act",
        category: "Education",
        status: "proposed",
        introduced: "2025-02-12",
        enacted: null,
        summary: "Provides startup grants of up to $75,000 for new childcare facilities in Iowa counties designated as childcare deserts. Funds training scholarships for early childhood educators statewide.",
        keyProvisions: ["$75K startup grants", "Childcare desert designation", "Educator training scholarships"],
        sponsor: "Sen. Sarah Trone Garriott",
        fullTextUrl: "https://www.legis.iowa.gov/"
      },
      {
        id: "HF-1200",
        title: "Iowa Flat Tax Implementation Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-12-05",
        enacted: "2025-02-08",
        summary: "Accelerates Iowa's transition to a flat 3.8% individual income tax rate from 2026. Eliminates the inheritance tax and reduces the corporate tax rate from 5.5% to 5.0%.",
        keyProvisions: ["3.8% flat tax acceleration", "Inheritance tax elimination", "Corporate rate reduction to 5.0%"],
        sponsor: "Rep. Bobby Kaufmann",
        fullTextUrl: "https://www.legis.iowa.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // KANSAS
  // ──────────────────────────────────────────────
  KS: {
    state: "Kansas",
    abbr: "KS",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-180",
        title: "Kansas Property Tax Transparency Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-22",
        enacted: "2025-02-05",
        summary: "Requires local governments to hold truth-in-taxation hearings before raising property tax levies and mandates clear disclosure of mill rate changes on annual property tax statements.",
        keyProvisions: ["Truth-in-taxation hearings", "Mill rate change disclosure", "Public notice requirements"],
        sponsor: "Sen. Caryn Tyson",
        fullTextUrl: "https://www.kslegislature.org/"
      },
      {
        id: "HB-2345",
        title: "Kansas Medicaid Expansion Act",
        category: "Healthcare",
        status: "in_process",
        introduced: "2025-01-18",
        lastActionDate: "2025-02-12",
        enacted: null,
        summary: "Expands Medicaid eligibility to adults earning up to 138% of the federal poverty level. Estimated to cover 150,000 uninsured Kansans and draw $1.5 billion in federal matching funds.",
        keyProvisions: ["138% FPL eligibility expansion", "150,000 newly covered residents", "$1.5B federal matching"],
        sponsor: "Rep. Susan Ruiz",
        fullTextUrl: "https://www.kslegislature.org/"
      },
      {
        id: "SB-456",
        title: "Kansas Wind Energy Property Tax Reform Act",
        category: "Economy & Taxes",
        status: "proposed",
        introduced: "2025-02-10",
        enacted: null,
        summary: "Adjusts the property tax valuation formula for wind energy installations to increase payments to host counties while maintaining Kansas's competitiveness for renewable energy investment.",
        keyProvisions: ["Wind farm valuation reform", "Increased county payments", "Investment competitiveness balance"],
        sponsor: "Sen. Mike Thompson",
        fullTextUrl: "https://www.kslegislature.org/"
      },
      {
        id: "HB-890",
        title: "School Funding Equity Compliance Act",
        category: "Education",
        status: "passed",
        introduced: "2024-12-12",
        enacted: "2025-02-28",
        summary: "Adjusts the school finance formula to comply with ongoing court mandates by increasing base state aid per pupil and adding weighted funding for special education and at-risk students.",
        keyProvisions: ["Base state aid increase", "Special education weighting", "At-risk student funding"],
        sponsor: "Rep. Kristey Williams",
        fullTextUrl: "https://www.kslegislature.org/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // KENTUCKY
  // ──────────────────────────────────────────────
  KY: {
    state: "Kentucky",
    abbr: "KY",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-101",
        title: "Kentucky Income Tax Phase-Down Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-08",
        enacted: "2025-01-20",
        summary: "Reduces Kentucky's flat income tax from 4.0% to 3.5% as part of a multi-year plan to eventually eliminate state income tax. Triggered by meeting revenue surplus thresholds.",
        keyProvisions: ["Rate reduction to 3.5%", "Revenue surplus triggers", "Long-term elimination pathway"],
        sponsor: "Sen. Chris McDaniel",
        fullTextUrl: "https://legislature.ky.gov/"
      },
      {
        id: "HB-234",
        title: "Eastern Kentucky Flood Recovery Infrastructure Act",
        category: "Infrastructure",
        status: "passed",
        introduced: "2024-12-15",
        enacted: "2025-02-18",
        summary: "Allocates $350 million for flood-resistant infrastructure rebuilding in eastern Kentucky counties devastated by 2022-2024 flooding. Includes buyout programs for repetitive loss properties.",
        keyProvisions: ["$350M recovery funding", "Flood-resistant rebuilding", "Repetitive loss buyouts"],
        sponsor: "Rep. Angie Hatton",
        fullTextUrl: "https://legislature.ky.gov/"
      },
      {
        id: "SB-345",
        title: "Kentucky Hemp and Cannabis Regulatory Act",
        category: "Other",
        status: "proposed",
        introduced: "2025-01-25",
        enacted: null,
        summary: "Establishes a comprehensive regulatory framework for delta-8 THC and intoxicating hemp products. Requires age verification, potency limits, and licensing for all retail hemp cannabinoid sales.",
        keyProvisions: ["Delta-8 THC regulation", "Age verification mandates", "Potency limit standards"],
        sponsor: "Sen. Paul Hornback",
        fullTextUrl: "https://legislature.ky.gov/"
      },
      {
        id: "HB-678",
        title: "Appalachian Health Workforce Pipeline Act",
        category: "Healthcare",
        status: "in_process",
        introduced: "2025-02-10",
        lastActionDate: "2025-04-11",
        enacted: null,
        summary: "Creates scholarship and loan forgiveness programs for healthcare workers who commit to practicing in Appalachian Kentucky for five years. Partners with regional universities and community colleges.",
        keyProvisions: ["Healthcare worker scholarships", "Five-year practice commitment", "Regional university partnerships"],
        sponsor: "Rep. Danny Bentley",
        fullTextUrl: "https://legislature.ky.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // LOUISIANA
  // ──────────────────────────────────────────────
  LA: {
    state: "Louisiana",
    abbr: "LA",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Criminal Justice",
    bills: [
      {
        id: "SB-78",
        title: "Louisiana Tax Modernization Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-25",
        enacted: "2025-02-01",
        summary: "Overhauls Louisiana's tax code by lowering the personal income tax rate to 3% flat, broadening the sales tax base, and eliminating many corporate exemptions to create a more predictable system.",
        keyProvisions: ["3% flat income tax", "Broadened sales tax base", "Corporate exemption elimination"],
        sponsor: "Sen. Bret Allain",
        fullTextUrl: "https://www.legis.la.gov/"
      },
      {
        id: "HB-234",
        title: "Juvenile Justice Reform and Diversion Act",
        category: "Criminal Justice",
        status: "in_process",
        introduced: "2025-01-20",
        lastActionDate: "2025-02-25",
        enacted: null,
        summary: "Creates diversion programs for non-violent juvenile offenders as alternatives to detention. Funds community-based rehabilitation centers and raises the age of juvenile jurisdiction to 18.",
        keyProvisions: ["Non-violent diversion programs", "Community rehabilitation centers", "Juvenile age raised to 18"],
        sponsor: "Rep. Edmond Jordan",
        fullTextUrl: "https://www.legis.la.gov/"
      },
      {
        id: "SB-456",
        title: "Coastal Master Plan Acceleration Act",
        category: "Environment",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-02-22",
        summary: "Fast-tracks critical coastal restoration projects including sediment diversions and barrier island restoration. Allocates $800 million from BP settlement funds for accelerated construction timelines.",
        keyProvisions: ["$800M BP settlement allocation", "Sediment diversion acceleration", "Barrier island restoration"],
        sponsor: "Sen. Sharon Hewitt",
        fullTextUrl: "https://www.legis.la.gov/"
      },
      {
        id: "HB-890",
        title: "Carjacking and Violent Crime Enhancement Act",
        category: "Criminal Justice",
        status: "proposed",
        introduced: "2025-02-15",
        enacted: null,
        summary: "Increases mandatory minimum sentences for carjacking to 10 years without parole eligibility. Establishes a multi-parish violent crime task force funded by asset forfeiture proceeds.",
        keyProvisions: ["10-year carjacking mandatory minimum", "No parole eligibility", "Multi-parish task force"],
        sponsor: "Rep. Alan Seabaugh",
        fullTextUrl: "https://www.legis.la.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // MAINE
  // ──────────────────────────────────────────────
  ME: {
    state: "Maine",
    abbr: "ME",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Healthcare",
    bills: [
      {
        id: "LD-450",
        title: "Maine Prescription Drug Affordability Act",
        category: "Healthcare",
        status: "passed",
        introduced: "2024-11-15",
        enacted: "2025-02-05",
        summary: "Establishes a Prescription Drug Affordability Board with authority to set upper payment limits on costly drugs. Allows importation of approved medications from Canadian pharmacies.",
        keyProvisions: ["Drug Affordability Board creation", "Upper payment limits", "Canadian drug importation"],
        sponsor: "Sen. Eloise Vitelli",
        fullTextUrl: "https://legislature.maine.gov/"
      },
      {
        id: "LD-890",
        title: "Offshore Wind Economic Development Act",
        category: "Economy & Taxes",
        status: "in_process",
        introduced: "2025-01-28",
        lastActionDate: "2025-03-12",
        enacted: null,
        summary: "Streamlines permitting for floating offshore wind projects in the Gulf of Maine and establishes port infrastructure grants for communities positioned to support the emerging wind industry.",
        keyProvisions: ["Offshore wind permit streamlining", "Port infrastructure grants", "Floating wind technology focus"],
        sponsor: "Rep. Lynne Williams",
        fullTextUrl: "https://legislature.maine.gov/"
      },
      {
        id: "LD-1234",
        title: "Right to Repair Farm Equipment Act",
        category: "Civil Rights",
        status: "proposed",
        introduced: "2025-02-12",
        enacted: null,
        summary: "Requires agricultural equipment manufacturers to provide diagnostic tools, parts, and repair documentation to independent mechanics and farmers for equipment they own or lease.",
        keyProvisions: ["Diagnostic tool access mandate", "Parts availability requirement", "Independent repair rights"],
        sponsor: "Sen. Craig Hickman",
        fullTextUrl: "https://legislature.maine.gov/"
      },
      {
        id: "LD-678",
        title: "Maine Home Health Worker Wage Act",
        category: "Healthcare",
        status: "passed",
        introduced: "2024-12-20",
        enacted: "2025-03-01",
        summary: "Sets a minimum wage of $20 per hour for home health aides and personal care attendants. Funded through Medicaid reimbursement rate increases to address the severe caregiver workforce shortage.",
        keyProvisions: ["$20/hour minimum for home health aides", "Medicaid reimbursement increase", "Workforce shortage mitigation"],
        sponsor: "Rep. Michele Meyer",
        fullTextUrl: "https://legislature.maine.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // MARYLAND
  // ──────────────────────────────────────────────
  MD: {
    state: "Maryland",
    abbr: "MD",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Environment",
    bills: [
      {
        id: "SB-302",
        title: "Chesapeake Bay Restoration Acceleration Act",
        category: "Environment",
        status: "passed",
        introduced: "2024-11-20",
        enacted: "2025-02-10",
        summary: "Doubles funding for the Chesapeake Bay Trust to $100 million annually for stormwater management, agricultural best practices, and oyster reef restoration across Maryland's bay watershed.",
        keyProvisions: ["$100M annual Bay Trust funding", "Stormwater management upgrades", "Oyster reef restoration"],
        sponsor: "Sen. Sarah Elfreth",
        fullTextUrl: "https://mgaleg.maryland.gov/"
      },
      {
        id: "HB-567",
        title: "Community Violence Intervention Investment Act",
        category: "Public Safety",
        status: "in_process",
        introduced: "2025-01-25",
        lastActionDate: "2025-03-20",
        enacted: null,
        summary: "Invests $150 million over three years in evidence-based violence intervention programs in Baltimore City, Prince George's County, and other high-crime jurisdictions across the state.",
        keyProvisions: ["$150M three-year investment", "Evidence-based programs", "Baltimore City and PG County focus"],
        sponsor: "Rep. Joseline Pena-Melnyk",
        fullTextUrl: "https://mgaleg.maryland.gov/"
      },
      {
        id: "SB-890",
        title: "Maryland Climate Solutions Now Enhancement Act",
        category: "Environment",
        status: "proposed",
        introduced: "2025-02-08",
        enacted: null,
        summary: "Strengthens the Climate Solutions Now Act by requiring 100% clean electricity by 2035 and mandating all-electric new construction for commercial buildings beginning in 2027 statewide.",
        keyProvisions: ["100% clean electricity by 2035", "All-electric new construction by 2027", "Commercial building standards"],
        sponsor: "Sen. Brian Feldman",
        fullTextUrl: "https://mgaleg.maryland.gov/"
      },
      {
        id: "HB-1200",
        title: "Blueprint for Maryland's Future Funding Act",
        category: "Education",
        status: "passed",
        introduced: "2024-12-15",
        enacted: "2025-02-28",
        summary: "Adjusts implementation timelines for the Blueprint education reform law and secures $3.8 billion in additional funding for teacher salary increases, pre-K expansion, and college readiness pathways.",
        keyProvisions: ["$3.8B additional funding", "Teacher salary increases", "Pre-K expansion timeline"],
        sponsor: "Rep. Maggie McIntosh",
        fullTextUrl: "https://mgaleg.maryland.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // MASSACHUSETTS
  // ──────────────────────────────────────────────
  MA: {
    state: "Massachusetts",
    abbr: "MA",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Healthcare",
    bills: [
      {
        id: "SB-1890",
        title: "Massachusetts Single-Payer Study and Pilot Act",
        category: "Healthcare",
        status: "proposed",
        introduced: "2025-01-15",
        enacted: null,
        summary: "Commissions a comprehensive feasibility study for a single-payer healthcare system in Massachusetts and authorizes a pilot program in three counties to test universal coverage models.",
        keyProvisions: ["Single-payer feasibility study", "Three-county pilot program", "Universal coverage model testing"],
        sponsor: "Sen. Jamie Eldridge",
        fullTextUrl: "https://malegislature.gov/"
      },
      {
        id: "HB-4567",
        title: "Massachusetts Housing Bond Authorization Act",
        category: "Infrastructure",
        status: "passed",
        introduced: "2024-11-28",
        enacted: "2025-02-15",
        summary: "Authorizes $6.5 billion in bonds for affordable housing production, public housing modernization, and transit-oriented development near MBTA stations across Greater Boston and Gateway Cities.",
        keyProvisions: ["$6.5B housing bond authorization", "Public housing modernization", "Transit-oriented development focus"],
        sponsor: "Rep. Aaron Michlewitz",
        fullTextUrl: "https://malegislature.gov/"
      },
      {
        id: "SB-345",
        title: "Behavioral Health Access and Parity Act",
        category: "Healthcare",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-03-01",
        summary: "Strengthens mental health parity enforcement by requiring insurers to demonstrate network adequacy for behavioral health providers equal to medical provider networks statewide.",
        keyProvisions: ["Mental health parity enforcement", "Network adequacy requirements", "Behavioral health provider standards"],
        sponsor: "Sen. Cindy Friedman",
        fullTextUrl: "https://malegislature.gov/"
      },
      {
        id: "HB-2100",
        title: "Clean Energy Siting Reform Act",
        category: "Environment",
        status: "in_process",
        introduced: "2025-02-20",
        lastActionDate: "2025-04-03",
        enacted: null,
        summary: "Streamlines permitting for solar, wind, and battery storage projects by establishing a centralized state siting board with authority to override local zoning restrictions for clean energy facilities.",
        keyProvisions: ["Centralized siting board", "Local zoning override authority", "Streamlined clean energy permits"],
        sponsor: "Rep. Jeffrey Roy",
        fullTextUrl: "https://malegislature.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // MICHIGAN
  // ──────────────────────────────────────────────
  MI: {
    state: "Michigan",
    abbr: "MI",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Infrastructure",
    bills: [
      {
        id: "SB-234",
        title: "Michigan Road and Bridge Repair Act",
        category: "Infrastructure",
        status: "passed",
        introduced: "2024-11-15",
        enacted: "2025-01-28",
        summary: "Allocates $3.5 billion over five years for road and bridge repairs prioritizing Michigan's worst-rated infrastructure corridors. Increases gas tax by 6 cents with annual CPI adjustment.",
        keyProvisions: ["$3.5B five-year allocation", "Worst-rated corridor priority", "6-cent gas tax increase"],
        sponsor: "Sen. Sean McCann",
        fullTextUrl: "https://www.legislature.mi.gov/"
      },
      {
        id: "HB-567",
        title: "EV Manufacturing Workforce Development Act",
        category: "Economy & Taxes",
        status: "proposed",
        introduced: "2025-01-22",
        enacted: null,
        summary: "Creates a $200 million fund for retraining autoworkers transitioning from internal combustion engine production to electric vehicle and battery manufacturing roles at Michigan facilities.",
        keyProvisions: ["$200M retraining fund", "ICE-to-EV transition focus", "Michigan facility priority"],
        sponsor: "Rep. Darrin Camilleri",
        fullTextUrl: "https://www.legislature.mi.gov/"
      },
      {
        id: "SB-890",
        title: "PFAS Contamination Remediation Act",
        category: "Environment",
        status: "passed",
        introduced: "2024-12-08",
        enacted: "2025-02-20",
        summary: "Sets the strictest PFAS limits in the nation at 8 parts per trillion for drinking water and funds $500 million for contamination cleanup at military bases and industrial sites statewide.",
        keyProvisions: ["8 ppt PFAS drinking water limit", "$500M cleanup fund", "Military and industrial site focus"],
        sponsor: "Sen. Winnie Brinks",
        fullTextUrl: "https://www.legislature.mi.gov/"
      },
      {
        id: "HB-1200",
        title: "Reproductive Freedom Implementation Act",
        category: "Civil Rights",
        status: "in_process",
        introduced: "2025-02-15",
        lastActionDate: "2025-03-10",
        enacted: null,
        summary: "Implements the voter-approved reproductive freedom constitutional amendment by repealing conflicting statutes and establishing clinic licensing standards consistent with medical best practices.",
        keyProvisions: ["Conflicting statute repeal", "Clinic licensing standards", "Medical best practice alignment"],
        sponsor: "Rep. Laurie Pohutsky",
        fullTextUrl: "https://www.legislature.mi.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // MINNESOTA
  // ──────────────────────────────────────────────
  MN: {
    state: "Minnesota",
    abbr: "MN",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Education",
    bills: [
      {
        id: "SF-1234",
        title: "Minnesota Free School Meals Continuation Act",
        category: "Education",
        status: "passed",
        introduced: "2024-11-20",
        enacted: "2025-02-01",
        summary: "Makes permanent Minnesota's universal free school breakfast and lunch program and expands coverage to include after-school snack programs in districts with majority low-income enrollment.",
        keyProvisions: ["Permanent universal free meals", "After-school snack expansion", "Low-income district priority"],
        sponsor: "Sen. Heather Gustafson",
        fullTextUrl: "https://www.leg.mn.gov/"
      },
      {
        id: "HF-567",
        title: "Paid Family Leave Implementation Act",
        category: "Civil Rights",
        status: "in_process",
        introduced: "2025-01-18",
        lastActionDate: "2025-02-19",
        enacted: null,
        summary: "Implements the voter-approved paid family and medical leave program beginning January 2026. Establishes premium rates, benefit calculations, and employer compliance requirements.",
        keyProvisions: ["January 2026 implementation", "Premium rate establishment", "Employer compliance framework"],
        sponsor: "Rep. Ruth Richardson",
        fullTextUrl: "https://www.leg.mn.gov/"
      },
      {
        id: "SF-890",
        title: "Minnesota Clean Transportation Act",
        category: "Environment",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-02-22",
        summary: "Adopts California's Advanced Clean Cars II standards for Minnesota, requiring increasing percentages of new vehicle sales to be zero-emission through 2035 with dealer compliance flexibility.",
        keyProvisions: ["Advanced Clean Cars II adoption", "Zero-emission sales requirements", "Dealer compliance flexibility"],
        sponsor: "Sen. Foung Hawj",
        fullTextUrl: "https://www.leg.mn.gov/"
      },
      {
        id: "HF-2345",
        title: "Teacher Shortage Emergency Response Act",
        category: "Education",
        status: "proposed",
        introduced: "2025-02-28",
        enacted: null,
        summary: "Creates emergency pathways for career-changers to enter teaching and provides $15,000 signing bonuses for educators who commit to teach in rural or high-need urban school districts.",
        keyProvisions: ["Career-changer teaching pathways", "$15K signing bonuses", "Rural and urban district focus"],
        sponsor: "Rep. Cheryl Youakim",
        fullTextUrl: "https://www.leg.mn.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // MISSISSIPPI
  // ──────────────────────────────────────────────
  MS: {
    state: "Mississippi",
    abbr: "MS",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Infrastructure",
    bills: [
      {
        id: "SB-2100",
        title: "Mississippi Income Tax Elimination Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-12",
        enacted: "2025-01-30",
        summary: "Phases out the state individual income tax over eight years beginning with a rate reduction from 4.7% to 4.0% in 2025. Offset by broadening the sales tax base to include select services.",
        keyProvisions: ["Eight-year income tax phase-out", "Rate cut to 4.0% in 2025", "Sales tax base broadening"],
        sponsor: "Sen. Josh Harkins",
        fullTextUrl: "https://www.legislature.ms.gov/"
      },
      {
        id: "HB-345",
        title: "Jackson Water System Federal Compliance Act",
        category: "Infrastructure",
        status: "passed",
        introduced: "2024-12-05",
        enacted: "2025-02-15",
        summary: "Allocates $250 million in state matching funds for Jackson's water treatment plant overhaul to meet federal consent decree requirements. Establishes an independent oversight commission.",
        keyProvisions: ["$250M state matching funds", "Treatment plant overhaul", "Independent oversight commission"],
        sponsor: "Rep. Cedric Burnett",
        fullTextUrl: "https://www.legislature.ms.gov/"
      },
      {
        id: "SB-567",
        title: "Mississippi Teacher Pay Raise Act",
        category: "Education",
        status: "proposed",
        introduced: "2025-01-25",
        enacted: null,
        summary: "Raises the average Mississippi teacher salary by $4,000 to reach the southeastern regional average. Funded through lottery revenue and a reallocation of general fund surplus.",
        keyProvisions: ["$4K average salary increase", "Regional average target", "Lottery revenue funding"],
        sponsor: "Sen. Dennis DeBar",
        fullTextUrl: "https://www.legislature.ms.gov/"
      },
      {
        id: "HB-890",
        title: "Rural Broadband Last-Mile Connectivity Act",
        category: "Infrastructure",
        status: "in_process",
        introduced: "2025-02-12",
        lastActionDate: "2025-02-27",
        enacted: null,
        summary: "Provides $180 million in grants for last-mile broadband connections in the Mississippi Delta and other underserved rural areas. Requires grantees to offer $25/month low-income service tiers.",
        keyProvisions: ["$180M last-mile grants", "Delta region priority", "$25/month low-income tier"],
        sponsor: "Rep. Sam Mims",
        fullTextUrl: "https://www.legislature.ms.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // MISSOURI
  // ──────────────────────────────────────────────
  MO: {
    state: "Missouri",
    abbr: "MO",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Criminal Justice",
    bills: [
      {
        id: "SB-123",
        title: "Missouri Cannabis Regulation Implementation Act",
        category: "Criminal Justice",
        status: "passed",
        introduced: "2024-11-18",
        enacted: "2025-02-08",
        summary: "Refines the voter-approved recreational cannabis program by establishing social equity licensing tiers, automatic expungement timelines, and tax revenue allocation to community reinvestment.",
        keyProvisions: ["Social equity licensing tiers", "Automatic expungement timelines", "Community reinvestment funding"],
        sponsor: "Sen. Barbara Washington",
        fullTextUrl: "https://www.senate.mo.gov/"
      },
      {
        id: "HB-456",
        title: "Missouri Childcare Accessibility Act",
        category: "Education",
        status: "in_process",
        introduced: "2025-01-22",
        lastActionDate: "2025-03-11",
        enacted: null,
        summary: "Provides tax credits to employers who offer on-site childcare or childcare subsidies to employees. Increases state childcare subsidy eligibility to 200% of the federal poverty level.",
        keyProvisions: ["Employer childcare tax credits", "200% FPL subsidy eligibility", "On-site childcare incentives"],
        sponsor: "Rep. Ashley Bland Manlove",
        fullTextUrl: "https://www.senate.mo.gov/"
      },
      {
        id: "SB-789",
        title: "Violent Crime Prosecution Enhancement Act",
        category: "Criminal Justice",
        status: "proposed",
        introduced: "2025-02-05",
        enacted: null,
        summary: "Authorizes the state attorney general to prosecute violent crimes in jurisdictions where local circuit attorneys decline to bring charges. Adds mandatory minimums for armed carjacking.",
        keyProvisions: ["AG prosecution authority", "Local DA override provision", "Armed carjacking mandatory minimum"],
        sponsor: "Sen. Tony Luetkemeyer",
        fullTextUrl: "https://www.senate.mo.gov/"
      },
      {
        id: "HB-1100",
        title: "I-70 Corridor Modernization Act",
        category: "Infrastructure",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-02-25",
        summary: "Authorizes $2.8 billion in bonds for the complete reconstruction and widening of Interstate 70 between Kansas City and St. Louis with modern safety features and tolling authority.",
        keyProvisions: ["$2.8B bond authorization", "I-70 full reconstruction", "Tolling authority establishment"],
        sponsor: "Rep. Becky Ruth",
        fullTextUrl: "https://www.senate.mo.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // MONTANA
  // ──────────────────────────────────────────────
  MT: {
    state: "Montana",
    abbr: "MT",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Environment",
    bills: [
      {
        id: "SB-150",
        title: "Montana Clean Water and Mining Reform Act",
        category: "Environment",
        status: "passed",
        introduced: "2024-11-20",
        enacted: "2025-02-05",
        summary: "Strengthens water quality protections near active mining operations and increases reclamation bond requirements. Addresses acid mine drainage from legacy hardrock mining sites in western Montana.",
        keyProvisions: ["Enhanced water quality protections", "Increased reclamation bonds", "Acid mine drainage remediation"],
        sponsor: "Sen. Janet Ellis",
        fullTextUrl: "https://leg.mt.gov/"
      },
      {
        id: "HB-345",
        title: "Montana Housing Affordability Act",
        category: "Infrastructure",
        status: "in_process",
        introduced: "2025-01-28",
        lastActionDate: "2025-03-11",
        enacted: null,
        summary: "Reforms local zoning to allow accessory dwelling units statewide and provides $100 million in workforce housing grants for resort and gateway communities near Glacier and Yellowstone.",
        keyProvisions: ["Statewide ADU allowance", "$100M workforce housing grants", "Resort community targeting"],
        sponsor: "Rep. Katie Sullivan",
        fullTextUrl: "https://leg.mt.gov/"
      },
      {
        id: "SB-456",
        title: "Montana Constitutional Right to Clean Environment Act",
        category: "Environment",
        status: "proposed",
        introduced: "2025-02-12",
        enacted: null,
        summary: "Strengthens enforcement mechanisms for Montana's constitutional right to a clean and healthful environment by creating a dedicated environmental enforcement office with independent authority.",
        keyProvisions: ["Environmental enforcement office", "Independent authority", "Constitutional right enforcement"],
        sponsor: "Sen. Shane Morigeau",
        fullTextUrl: "https://leg.mt.gov/"
      },
      {
        id: "HB-789",
        title: "Montana Rural EMS Sustainability Act",
        category: "Healthcare",
        status: "passed",
        introduced: "2024-12-15",
        enacted: "2025-03-01",
        summary: "Creates a sustainable funding mechanism for volunteer EMS services in rural Montana through a per-capita assessment and state matching grants. Funds equipment and paramedic training.",
        keyProvisions: ["Per-capita EMS assessment", "State matching grants", "Paramedic training funding"],
        sponsor: "Rep. Ed Buttrey",
        fullTextUrl: "https://leg.mt.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // NEBRASKA
  // ──────────────────────────────────────────────
  NE: {
    state: "Nebraska",
    abbr: "NE",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "LB-234",
        title: "Nebraska Property Tax Relief Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-15",
        enacted: "2025-01-28",
        summary: "Provides $1.5 billion in property tax relief over three years by increasing state aid to schools and reducing local school district reliance on property taxes as the primary funding source.",
        keyProvisions: ["$1.5B property tax relief", "Increased state school aid", "Property tax reliance reduction"],
        sponsor: "Sen. Lou Ann Linehan",
        fullTextUrl: "https://nebraskalegislature.gov/"
      },
      {
        id: "LB-567",
        title: "Nebraska Renewable Fuel Standard Act",
        category: "Economy & Taxes",
        status: "proposed",
        introduced: "2025-01-22",
        enacted: null,
        summary: "Mandates an E-15 ethanol blend as the minimum fuel standard at all Nebraska gas stations to support the state's corn industry. Provides infrastructure grants for station upgrades.",
        keyProvisions: ["E-15 minimum fuel standard", "Station upgrade grants", "Corn industry support"],
        sponsor: "Sen. Bruce Bostelman",
        fullTextUrl: "https://nebraskalegislature.gov/"
      },
      {
        id: "LB-890",
        title: "SNAP Benefits Expansion for Working Families Act",
        category: "Healthcare",
        status: "in_process",
        introduced: "2025-02-10",
        lastActionDate: "2025-03-14",
        enacted: null,
        summary: "Raises the gross income eligibility for SNAP benefits to 185% of the federal poverty level for working families with children. Simplifies recertification and reduces paperwork burdens.",
        keyProvisions: ["185% FPL eligibility expansion", "Simplified recertification", "Working family focus"],
        sponsor: "Sen. Machaela Cavanaugh",
        fullTextUrl: "https://nebraskalegislature.gov/"
      },
      {
        id: "LB-1100",
        title: "Nebraska Canal and Water Infrastructure Act",
        category: "Infrastructure",
        status: "passed",
        introduced: "2024-12-08",
        enacted: "2025-02-20",
        summary: "Funds the Perkins County Canal project to secure Nebraska's water rights from the South Platte River under the interstate compact with Colorado. Allocates $500 million in state funds.",
        keyProvisions: ["$500M canal project funding", "Interstate water rights security", "South Platte River access"],
        sponsor: "Sen. Mike Jacobson",
        fullTextUrl: "https://nebraskalegislature.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // NEVADA
  // ──────────────────────────────────────────────
  NV: {
    state: "Nevada",
    abbr: "NV",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-210",
        title: "Nevada Gaming Tax Modernization Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-22",
        enacted: "2025-02-01",
        summary: "Updates the gaming tax structure to include online sports betting and iGaming revenue streams. Directs additional revenue to education and infrastructure through the State Education Fund.",
        keyProvisions: ["Online sports betting taxation", "iGaming revenue inclusion", "Education fund allocation"],
        sponsor: "Sen. Dina Neal",
        fullTextUrl: "https://www.leg.state.nv.us/"
      },
      {
        id: "AB-345",
        title: "Nevada Water Conservation and Drought Response Act",
        category: "Environment",
        status: "in_process",
        introduced: "2025-01-18",
        lastActionDate: "2025-02-24",
        enacted: null,
        summary: "Bans non-functional turf in commercial properties statewide and funds $200 million in water recycling infrastructure to reduce Nevada's dependence on Colorado River allocations.",
        keyProvisions: ["Commercial non-functional turf ban", "$200M water recycling investment", "Colorado River dependence reduction"],
        sponsor: "Asm. Howard Watts",
        fullTextUrl: "https://www.leg.state.nv.us/"
      },
      {
        id: "SB-567",
        title: "Construction Worker Heat Safety Act",
        category: "Public Safety",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-02-22",
        summary: "Mandates employer-provided shade, water, and rest breaks when temperatures exceed 105°F on construction sites. Creates OSHA-equivalent state enforcement with penalties for non-compliance.",
        keyProvisions: ["Mandatory shade and water above 105°F", "Rest break requirements", "State enforcement authority"],
        sponsor: "Sen. Edgar Flores",
        fullTextUrl: "https://www.leg.state.nv.us/"
      },
      {
        id: "AB-890",
        title: "Affordable Housing Trust Fund Expansion Act",
        category: "Civil Rights",
        status: "proposed",
        introduced: "2025-02-15",
        enacted: null,
        summary: "Doubles the state Affordable Housing Trust Fund to $200 million and creates inclusionary zoning requirements for large residential developments within Clark and Washoe counties.",
        keyProvisions: ["$200M housing trust fund", "Inclusionary zoning mandates", "Clark and Washoe county focus"],
        sponsor: "Asm. Selena Torres",
        fullTextUrl: "https://www.leg.state.nv.us/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // NEW HAMPSHIRE
  // ──────────────────────────────────────────────
  NH: {
    state: "New Hampshire",
    abbr: "NH",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Education",
    bills: [
      {
        id: "SB-134",
        title: "Interest and Dividends Tax Repeal Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-18",
        enacted: "2025-01-25",
        summary: "Completes the phase-out of New Hampshire's interest and dividends tax, making the state fully income-tax-free. Revenue replaced through existing business taxes and meals/rooms tax.",
        keyProvisions: ["Complete I&D tax repeal", "Income-tax-free status", "Revenue replacement framework"],
        sponsor: "Sen. Jeb Bradley",
        fullTextUrl: "https://www.gencourt.state.nh.us/"
      },
      {
        id: "HB-567",
        title: "Education Freedom Account Enhancement Act",
        category: "Education",
        status: "in_process",
        introduced: "2025-01-22",
        lastActionDate: "2025-03-17",
        enacted: null,
        summary: "Expands Education Freedom Account eligibility to 500% of the federal poverty level and increases per-student funding. Adds accountability measures for participating private schools.",
        keyProvisions: ["500% FPL eligibility expansion", "Per-student funding increase", "Private school accountability"],
        sponsor: "Rep. Glenn Cordelli",
        fullTextUrl: "https://www.gencourt.state.nh.us/"
      },
      {
        id: "SB-345",
        title: "New Hampshire Housing Production Act",
        category: "Infrastructure",
        status: "proposed",
        introduced: "2025-02-08",
        enacted: null,
        summary: "Reforms local zoning to allow duplexes and ADUs in all residential zones and creates a state housing fund for workforce housing construction in communities experiencing severe shortages.",
        keyProvisions: ["Duplex and ADU zoning reform", "State housing fund creation", "Workforce housing priority"],
        sponsor: "Sen. Rebecca Perkins Kwoka",
        fullTextUrl: "https://www.gencourt.state.nh.us/"
      },
      {
        id: "HB-890",
        title: "Childcare Workforce Stabilization Act",
        category: "Education",
        status: "passed",
        introduced: "2024-12-15",
        enacted: "2025-02-28",
        summary: "Provides retention bonuses of $3,000 per year for licensed childcare workers and funds scholarship programs for early childhood education credentials at New Hampshire community colleges.",
        keyProvisions: ["$3K annual retention bonus", "ECE credential scholarships", "Community college partnership"],
        sponsor: "Rep. Mary Jane Wallner",
        fullTextUrl: "https://www.gencourt.state.nh.us/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // NEW JERSEY
  // ──────────────────────────────────────────────
  NJ: {
    state: "New Jersey",
    abbr: "NJ",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-2100",
        title: "New Jersey Property Tax Circuit Breaker Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-15",
        enacted: "2025-02-05",
        summary: "Creates a property tax circuit breaker credit for households spending more than 6% of income on property taxes. Provides relief to 1.2 million New Jersey homeowners and renters.",
        keyProvisions: ["6% income threshold trigger", "1.2M eligible households", "Homeowner and renter coverage"],
        sponsor: "Sen. Paul Sarlo",
        fullTextUrl: "https://www.njleg.state.nj.us/"
      },
      {
        id: "AB-4567",
        title: "NJ Transit Reliability and Funding Act",
        category: "Infrastructure",
        status: "proposed",
        introduced: "2025-01-28",
        enacted: null,
        summary: "Provides $2 billion in dedicated funding for NJ Transit through a corporate transit assessment and redirected Turnpike Authority surplus. Mandates on-time performance targets of 92%.",
        keyProvisions: ["$2B dedicated funding", "Corporate transit assessment", "92% on-time performance target"],
        sponsor: "Asm. Daniel Benson",
        fullTextUrl: "https://www.njleg.state.nj.us/"
      },
      {
        id: "SB-890",
        title: "Lead Pipe Replacement Acceleration Act",
        category: "Public Safety",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-02-22",
        summary: "Accelerates New Jersey's mandate to replace all lead service lines by 2031 with $1.2 billion in state funding. Requires utilities to cover costs for low-income households at no charge.",
        keyProvisions: ["2031 replacement deadline", "$1.2B state funding", "Free replacement for low-income"],
        sponsor: "Sen. Bob Smith",
        fullTextUrl: "https://www.njleg.state.nj.us/"
      },
      {
        id: "AB-1234",
        title: "Cannabis Social Equity Enhancement Act",
        category: "Civil Rights",
        status: "in_process",
        introduced: "2025-02-15",
        lastActionDate: "2025-03-08",
        enacted: null,
        summary: "Increases the percentage of cannabis licenses reserved for social equity applicants to 40% and provides low-interest loans and technical assistance for applicants from impacted communities.",
        keyProvisions: ["40% social equity license reservation", "Low-interest loan programs", "Technical assistance provision"],
        sponsor: "Asm. Annette Quijano",
        fullTextUrl: "https://www.njleg.state.nj.us/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // NEW MEXICO
  // ──────────────────────────────────────────────
  NM: {
    state: "New Mexico",
    abbr: "NM",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Education",
    bills: [
      {
        id: "SB-120",
        title: "New Mexico Early Childhood Education Trust Act",
        category: "Education",
        status: "passed",
        introduced: "2024-11-22",
        enacted: "2025-02-01",
        summary: "Draws $300 million annually from the Land Grant Permanent Fund to fund universal pre-K and early childhood programs, addressing New Mexico's court-mandated education adequacy requirements.",
        keyProvisions: ["$300M annual permanent fund draw", "Universal pre-K expansion", "Court mandate compliance"],
        sponsor: "Sen. Michael Padilla",
        fullTextUrl: "https://www.nmlegis.gov/"
      },
      {
        id: "HB-345",
        title: "Produced Water Treatment and Reuse Act",
        category: "Environment",
        status: "in_process",
        introduced: "2025-01-18",
        lastActionDate: "2025-03-01",
        enacted: null,
        summary: "Regulates the treatment and beneficial reuse of produced water from oil and gas operations in the Permian Basin. Requires advanced treatment standards before agricultural or industrial reuse.",
        keyProvisions: ["Produced water treatment standards", "Beneficial reuse regulations", "Permian Basin focus"],
        sponsor: "Rep. Matthew McQueen",
        fullTextUrl: "https://www.nmlegis.gov/"
      },
      {
        id: "SB-567",
        title: "Community Safety and Violence Prevention Act",
        category: "Public Safety",
        status: "proposed",
        introduced: "2025-02-10",
        enacted: null,
        summary: "Funds $75 million in community-based violence intervention programs in Albuquerque, Las Cruces, and Santa Fe. Establishes a state Office of Gun Violence Prevention with data collection authority.",
        keyProvisions: ["$75M violence intervention funding", "Office of Gun Violence Prevention", "Three-city program focus"],
        sponsor: "Sen. Antoinette Sedillo Lopez",
        fullTextUrl: "https://www.nmlegis.gov/"
      },
      {
        id: "HB-890",
        title: "New Mexico Teacher Residency Program Act",
        category: "Education",
        status: "passed",
        introduced: "2024-12-15",
        enacted: "2025-02-28",
        summary: "Creates a paid teacher residency program where aspiring educators receive a stipend while training in high-need schools for one year. Graduates commit to three years of service in New Mexico.",
        keyProvisions: ["Paid residency program", "High-need school placement", "Three-year service commitment"],
        sponsor: "Rep. G. Andres Romero",
        fullTextUrl: "https://www.nmlegis.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // NORTH CAROLINA
  // ──────────────────────────────────────────────
  NC: {
    state: "North Carolina",
    abbr: "NC",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-180",
        title: "North Carolina Corporate Tax Elimination Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-12",
        enacted: "2025-01-28",
        summary: "Continues the phased elimination of North Carolina's corporate income tax, reducing the rate from 2.25% to 1.5% in 2025 with full elimination scheduled for 2030.",
        keyProvisions: ["Rate reduction to 1.5%", "2030 full elimination target", "Revenue replacement plan"],
        sponsor: "Sen. Paul Newton",
        fullTextUrl: "https://www.ncleg.gov/"
      },
      {
        id: "HB-456",
        title: "Hurricane Helene Recovery and Resilience Act",
        category: "Infrastructure",
        status: "passed",
        introduced: "2024-12-01",
        enacted: "2025-02-15",
        summary: "Allocates $1.8 billion for western North Carolina recovery from Hurricane Helene including road rebuilding, bridge replacement, and community relocation programs in flood-prone areas.",
        keyProvisions: ["$1.8B recovery allocation", "Western NC road rebuilding", "Flood zone relocation programs"],
        sponsor: "Rep. Karl Gillespie",
        fullTextUrl: "https://www.ncleg.gov/"
      },
      {
        id: "SB-567",
        title: "North Carolina Medicaid Expansion Enhancement Act",
        category: "Healthcare",
        status: "proposed",
        introduced: "2025-01-25",
        enacted: null,
        summary: "Strengthens the recently implemented Medicaid expansion by adding dental and vision coverage for expansion enrollees and extending the hospital assessment that funds the state's share.",
        keyProvisions: ["Dental and vision coverage addition", "Hospital assessment extension", "Expansion population benefits"],
        sponsor: "Sen. Natasha Marcus",
        fullTextUrl: "https://www.ncleg.gov/"
      },
      {
        id: "HB-890",
        title: "Opportunity Scholarship Program Expansion Act",
        category: "Education",
        status: "in_process",
        introduced: "2025-02-12",
        lastActionDate: "2025-02-27",
        enacted: null,
        summary: "Removes the waitlist for the Opportunity Scholarship voucher program by providing full funding for all eligible applicants. Increases per-student awards to $7,500 for high school students.",
        keyProvisions: ["Waitlist elimination", "Full funding mandate", "$7,500 high school awards"],
        sponsor: "Rep. Tricia Cotham",
        fullTextUrl: "https://www.ncleg.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // NORTH DAKOTA
  // ──────────────────────────────────────────────
  ND: {
    state: "North Dakota",
    abbr: "ND",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-2050",
        title: "North Dakota Income Tax Elimination Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-15",
        enacted: "2025-01-30",
        summary: "Eliminates North Dakota's individual income tax for residents earning under $100,000 annually. Funded through oil extraction tax revenue and the state's $9 billion Legacy Fund earnings.",
        keyProvisions: ["Income tax elimination under $100K", "Oil tax revenue funding", "Legacy Fund earnings usage"],
        sponsor: "Sen. Dale Patten",
        fullTextUrl: "https://www.legis.nd.gov/"
      },
      {
        id: "HB-1234",
        title: "Carbon Capture and Storage Regulatory Act",
        category: "Environment",
        status: "in_process",
        introduced: "2025-01-20",
        lastActionDate: "2025-02-15",
        enacted: null,
        summary: "Establishes the regulatory framework for Class VI carbon injection wells in North Dakota and streamlines state primacy authority over CO2 sequestration projects in the Williston Basin.",
        keyProvisions: ["Class VI well regulations", "State primacy authority", "Williston Basin focus"],
        sponsor: "Rep. Todd Porter",
        fullTextUrl: "https://www.legis.nd.gov/"
      },
      {
        id: "SB-2300",
        title: "North Dakota Childcare Capacity Building Act",
        category: "Education",
        status: "proposed",
        introduced: "2025-02-10",
        enacted: null,
        summary: "Provides $50 million in grants for childcare facility construction in oil patch communities experiencing workforce growth. Offers retention bonuses for childcare workers in rural areas.",
        keyProvisions: ["$50M construction grants", "Oil patch community focus", "Rural worker retention bonuses"],
        sponsor: "Sen. Judy Lee",
        fullTextUrl: "https://www.legis.nd.gov/"
      },
      {
        id: "HB-1500",
        title: "Agricultural Innovation and Technology Act",
        category: "Other",
        status: "passed",
        introduced: "2024-12-08",
        enacted: "2025-02-20",
        summary: "Funds agricultural technology research at NDSU including precision agriculture, drought-resistant crop development, and autonomous farming equipment testing on state demonstration farms.",
        keyProvisions: ["NDSU research funding", "Precision agriculture programs", "Autonomous equipment testing"],
        sponsor: "Rep. Mike Nathe",
        fullTextUrl: "https://www.legis.nd.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // OHIO
  // ──────────────────────────────────────────────
  OH: {
    state: "Ohio",
    abbr: "OH",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-89",
        title: "Ohio Intel CHIPS Act Support and Workforce Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-18",
        enacted: "2025-02-01",
        summary: "Provides $2 billion in state incentives and workforce development funding to support Intel's semiconductor fabrication plants in New Albany. Creates a semiconductor technician training pipeline.",
        keyProvisions: ["$2B state incentive package", "Semiconductor workforce training", "Intel New Albany support"],
        sponsor: "Sen. Bill Reineke",
        fullTextUrl: "https://www.legislature.ohio.gov/"
      },
      {
        id: "HB-345",
        title: "Ohio Reproductive Rights Implementation Act",
        category: "Civil Rights",
        status: "in_process",
        introduced: "2025-01-22",
        lastActionDate: "2025-03-05",
        enacted: null,
        summary: "Implements the voter-approved reproductive freedom amendment by repealing conflicting statutes including the six-week heartbeat bill and establishing clinical standards for abortion providers.",
        keyProvisions: ["Heartbeat bill repeal", "Provider clinical standards", "Amendment implementation"],
        sponsor: "Rep. Allison Russo",
        fullTextUrl: "https://www.legislature.ohio.gov/"
      },
      {
        id: "SB-456",
        title: "Lake Erie Harmful Algal Bloom Prevention Act",
        category: "Environment",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-02-22",
        summary: "Sets mandatory phosphorus reduction targets for agricultural operations in the Maumee River watershed to combat harmful algal blooms in Lake Erie's western basin. Funds $250 million in BMPs.",
        keyProvisions: ["Mandatory phosphorus targets", "Maumee watershed focus", "$250M BMP funding"],
        sponsor: "Sen. Theresa Gavarone",
        fullTextUrl: "https://www.legislature.ohio.gov/"
      },
      {
        id: "HB-890",
        title: "Ohio Addiction Recovery and Treatment Act",
        category: "Healthcare",
        status: "proposed",
        introduced: "2025-02-15",
        enacted: null,
        summary: "Expands Medicaid-covered substance use disorder treatment to include residential programs up to 90 days and funds 50 new community recovery centers in counties with the highest overdose rates.",
        keyProvisions: ["90-day residential treatment coverage", "50 new recovery centers", "High-overdose county priority"],
        sponsor: "Rep. Beth Liston",
        fullTextUrl: "https://www.legislature.ohio.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // OKLAHOMA
  // ──────────────────────────────────────────────
  OK: {
    state: "Oklahoma",
    abbr: "OK",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Education",
    bills: [
      {
        id: "SB-1200",
        title: "Oklahoma Teacher Pay and Retention Act",
        category: "Education",
        status: "passed",
        introduced: "2024-11-15",
        enacted: "2025-01-25",
        summary: "Raises the minimum teacher salary to $48,000 and provides a $5,000 retention bonus for teachers in critical shortage areas. Funded through a reallocation of gross production tax revenue.",
        keyProvisions: ["$48K minimum salary", "$5K retention bonus", "Gross production tax reallocation"],
        sponsor: "Sen. Lonnie Paxton",
        fullTextUrl: "https://www.oklegislature.gov/"
      },
      {
        id: "HB-2345",
        title: "Tribal-State Compact Renewal and Gaming Act",
        category: "Economy & Taxes",
        status: "in_process",
        introduced: "2025-01-28",
        lastActionDate: "2025-02-22",
        enacted: null,
        summary: "Establishes the framework for tribal gaming compact renewals and authorizes commercial gaming at horse racing tracks to increase state revenue for education and infrastructure.",
        keyProvisions: ["Compact renewal framework", "Commercial gaming at racetracks", "Education revenue allocation"],
        sponsor: "Rep. Chad Caldwell",
        fullTextUrl: "https://www.oklegislature.gov/"
      },
      {
        id: "SB-567",
        title: "Oklahoma Earthquake Mitigation and Insurance Act",
        category: "Public Safety",
        status: "proposed",
        introduced: "2025-02-10",
        enacted: null,
        summary: "Creates an earthquake insurance pool for homeowners near active injection wells and tightens disposal well regulations in seismically active areas of north-central Oklahoma.",
        keyProvisions: ["Earthquake insurance pool", "Disposal well regulation tightening", "Seismic area restrictions"],
        sponsor: "Sen. David Bullard",
        fullTextUrl: "https://www.oklegislature.gov/"
      },
      {
        id: "HB-890",
        title: "Rural Healthcare Facility Support Act",
        category: "Healthcare",
        status: "passed",
        introduced: "2024-12-12",
        enacted: "2025-02-20",
        summary: "Provides emergency operating grants to rural hospitals facing closure and creates a rural health network model allowing facilities to share specialists, equipment, and administrative costs.",
        keyProvisions: ["Emergency operating grants", "Rural health network model", "Resource sharing framework"],
        sponsor: "Rep. Marcus McEntire",
        fullTextUrl: "https://www.oklegislature.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // OREGON
  // ──────────────────────────────────────────────
  OR: {
    state: "Oregon",
    abbr: "OR",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Environment",
    bills: [
      {
        id: "SB-530",
        title: "Oregon Climate Action Plan Strengthening Act",
        category: "Environment",
        status: "passed",
        introduced: "2024-11-20",
        enacted: "2025-02-08",
        summary: "Reinstates and strengthens Oregon's cap-and-invest program with a revised emissions reduction target of 60% below 1990 levels by 2035. Allocates auction revenue to climate-impacted communities.",
        keyProvisions: ["60% emissions reduction by 2035", "Cap-and-invest reinstatement", "Climate community investment"],
        sponsor: "Sen. Janeen Sollman",
        fullTextUrl: "https://www.oregonlegislature.gov/"
      },
      {
        id: "HB-3456",
        title: "Oregon Housing Production and Affordability Act",
        category: "Infrastructure",
        status: "proposed",
        introduced: "2025-01-25",
        enacted: null,
        summary: "Allows fourplexes on all residential lots in cities over 10,000 population and provides $500 million in housing production incentives targeting middle-income housing construction.",
        keyProvisions: ["Fourplex zoning allowance", "$500M production incentives", "Middle-income housing focus"],
        sponsor: "Rep. Maxine Dexter",
        fullTextUrl: "https://www.oregonlegislature.gov/"
      },
      {
        id: "SB-890",
        title: "Psilocybin Service Center Regulation Act",
        category: "Healthcare",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-02-25",
        summary: "Refines the voter-approved psilocybin therapy program by adjusting licensing fees, expanding eligible facilitator training programs, and establishing safety protocols for service centers.",
        keyProvisions: ["Licensing fee adjustments", "Facilitator training expansion", "Service center safety protocols"],
        sponsor: "Sen. Kate Lieber",
        fullTextUrl: "https://www.oregonlegislature.gov/"
      },
      {
        id: "HB-1200",
        title: "Drug Recriminalization and Treatment Act",
        category: "Criminal Justice",
        status: "in_process",
        introduced: "2025-02-18",
        lastActionDate: "2025-03-13",
        enacted: null,
        summary: "Following voter reversal of Measure 110, implements the recriminalization framework for hard drug possession while maintaining expanded treatment funding and deflection-first policies.",
        keyProvisions: ["Possession recriminalization framework", "Treatment funding preservation", "Deflection-first policies"],
        sponsor: "Rep. Jason Kropf",
        fullTextUrl: "https://www.oregonlegislature.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // PENNSYLVANIA
  // ──────────────────────────────────────────────
  PA: {
    state: "Pennsylvania",
    abbr: "PA",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Education",
    bills: [
      {
        id: "SB-234",
        title: "Pennsylvania School Funding Equity Act",
        category: "Education",
        status: "passed",
        introduced: "2024-11-15",
        enacted: "2025-02-10",
        summary: "Addresses the court-mandated school funding inequity by allocating $2 billion in additional state education spending targeted to the 100 most underfunded districts over three years.",
        keyProvisions: ["$2B additional education funding", "100 most underfunded districts", "Three-year implementation"],
        sponsor: "Sen. Vincent Hughes",
        fullTextUrl: "https://www.legis.state.pa.us/"
      },
      {
        id: "HB-567",
        title: "Pennsylvania Energy Transition Act",
        category: "Environment",
        status: "proposed",
        introduced: "2025-01-22",
        enacted: null,
        summary: "Joins the Regional Greenhouse Gas Initiative and directs cap-and-trade revenue to energy efficiency programs, mine reclamation, and transition assistance for fossil fuel communities.",
        keyProvisions: ["RGGI participation", "Cap-and-trade revenue allocation", "Fossil fuel community assistance"],
        sponsor: "Rep. Greg Vitali",
        fullTextUrl: "https://www.legis.state.pa.us/"
      },
      {
        id: "SB-890",
        title: "Pennsylvania Child Abuse Prevention and Investigation Act",
        category: "Public Safety",
        status: "passed",
        introduced: "2024-12-08",
        enacted: "2025-02-22",
        summary: "Strengthens child abuse reporting requirements and funds additional caseworkers for county Children and Youth Services agencies facing dangerous caseload levels across the Commonwealth.",
        keyProvisions: ["Enhanced reporting requirements", "Additional caseworker funding", "Caseload reduction mandates"],
        sponsor: "Sen. Kristin Phillips-Hill",
        fullTextUrl: "https://www.legis.state.pa.us/"
      },
      {
        id: "HB-1200",
        title: "Lifeline Scholarship Act",
        category: "Education",
        status: "in_process",
        introduced: "2025-02-15",
        lastActionDate: "2025-03-10",
        enacted: null,
        summary: "Creates education savings accounts for students in the lowest-performing 15% of public schools, allowing families to redirect per-pupil funding to private schools or tutoring services.",
        keyProvisions: ["ESAs for low-performing school students", "Per-pupil funding portability", "Private school and tutoring options"],
        sponsor: "Rep. Clint Owlett",
        fullTextUrl: "https://www.legis.state.pa.us/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // RHODE ISLAND
  // ──────────────────────────────────────────────
  RI: {
    state: "Rhode Island",
    abbr: "RI",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Environment",
    bills: [
      {
        id: "SB-234",
        title: "Rhode Island 100% Renewable Electricity Act",
        category: "Environment",
        status: "passed",
        introduced: "2024-11-18",
        enacted: "2025-02-05",
        summary: "Mandates 100% renewable electricity by 2033, the most aggressive timeline in New England. Leverages offshore wind contracts and expands community solar programs for low-income ratepayers.",
        keyProvisions: ["100% renewable by 2033", "Offshore wind leveraging", "Low-income community solar"],
        sponsor: "Sen. Dawn Euer",
        fullTextUrl: "https://www.rilegislature.gov/"
      },
      {
        id: "HB-567",
        title: "Rhode Island Housing Production Act",
        category: "Infrastructure",
        status: "in_process",
        introduced: "2025-01-25",
        lastActionDate: "2025-03-20",
        enacted: null,
        summary: "Overrides local zoning for affordable housing projects near transit and mandates that all municipalities allow accessory dwelling units by right. Creates a $100 million state housing fund.",
        keyProvisions: ["Transit-area zoning override", "Statewide ADU allowance", "$100M housing fund"],
        sponsor: "Rep. Karen Alzate",
        fullTextUrl: "https://www.rilegislature.gov/"
      },
      {
        id: "SB-890",
        title: "Narragansett Bay Water Quality Act",
        category: "Environment",
        status: "proposed",
        introduced: "2025-02-12",
        enacted: null,
        summary: "Funds $200 million in combined sewer overflow separation projects to reduce pollution in Narragansett Bay. Establishes stormwater management requirements for all new impervious surfaces.",
        keyProvisions: ["$200M CSO separation funding", "Stormwater management mandates", "Bay pollution reduction"],
        sponsor: "Sen. V. Susan Sosnowski",
        fullTextUrl: "https://www.rilegislature.gov/"
      },
      {
        id: "HB-1200",
        title: "Rhode Island Free Community College Continuation Act",
        category: "Education",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-02-28",
        summary: "Makes permanent the Rhode Island Promise program providing two years of free tuition at CCRI for recent high school graduates. Expands eligibility to adult learners over 25 returning to school.",
        keyProvisions: ["Permanent free CCRI tuition", "Adult learner eligibility expansion", "RI Promise continuation"],
        sponsor: "Rep. Joseph McNamara",
        fullTextUrl: "https://www.rilegislature.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // SOUTH CAROLINA
  // ──────────────────────────────────────────────
  SC: {
    state: "South Carolina",
    abbr: "SC",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-180",
        title: "South Carolina Income Tax Reduction Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-12",
        enacted: "2025-01-28",
        summary: "Reduces the top income tax rate from 6.3% to 5.7% and consolidates tax brackets from six to three. Projected to save taxpayers $500 million annually when fully implemented.",
        keyProvisions: ["Top rate reduction to 5.7%", "Bracket consolidation to three", "$500M annual savings"],
        sponsor: "Sen. Harvey Peeler",
        fullTextUrl: "https://www.scstatehouse.gov/"
      },
      {
        id: "HB-456",
        title: "Hurricane and Flood Resilience Building Code Act",
        category: "Infrastructure",
        status: "in_process",
        introduced: "2025-01-20",
        lastActionDate: "2025-03-09",
        enacted: null,
        summary: "Adopts statewide building codes requiring hurricane-resistant construction standards for all new residential buildings in coastal and inland flood-prone counties within 100 miles of the coast.",
        keyProvisions: ["Hurricane-resistant building codes", "Coastal county mandates", "100-mile inland zone coverage"],
        sponsor: "Rep. Jay Jordan",
        fullTextUrl: "https://www.scstatehouse.gov/"
      },
      {
        id: "SB-567",
        title: "South Carolina EV Manufacturing Incentive Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-12-05",
        enacted: "2025-02-15",
        summary: "Provides $1.3 billion in tax credits and infrastructure support for electric vehicle and battery manufacturers establishing production facilities in South Carolina's I-85 corridor.",
        keyProvisions: ["$1.3B tax credit package", "I-85 corridor targeting", "Battery manufacturing support"],
        sponsor: "Sen. Thomas Alexander",
        fullTextUrl: "https://www.scstatehouse.gov/"
      },
      {
        id: "HB-890",
        title: "Juvenile Justice Reform and Diversion Act",
        category: "Criminal Justice",
        status: "proposed",
        introduced: "2025-02-12",
        enacted: null,
        summary: "Creates diversion programs for first-time juvenile offenders charged with non-violent offenses and raises the age of adult prosecution from 17 to 18 for misdemeanor offenses statewide.",
        keyProvisions: ["First-time offender diversion", "Adult prosecution age raised to 18", "Non-violent offense focus"],
        sponsor: "Rep. Todd Rutherford",
        fullTextUrl: "https://www.scstatehouse.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // SOUTH DAKOTA
  // ──────────────────────────────────────────────
  SD: {
    state: "South Dakota",
    abbr: "SD",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-78",
        title: "South Dakota Sales Tax Reduction Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-15",
        enacted: "2025-01-25",
        summary: "Reduces the state sales tax rate from 4.5% to 4.2% following strong revenue growth. Maintains the grocery tax exemption enacted in the previous session for all food purchased for home consumption.",
        keyProvisions: ["Sales tax cut to 4.2%", "Grocery exemption maintained", "Revenue surplus trigger"],
        sponsor: "Sen. Casey Crabtree",
        fullTextUrl: "https://sdlegislature.gov/"
      },
      {
        id: "HB-1234",
        title: "South Dakota Workforce Housing Incentive Act",
        category: "Infrastructure",
        status: "in_process",
        introduced: "2025-01-22",
        lastActionDate: "2025-02-17",
        enacted: null,
        summary: "Creates tax incentives for developers building workforce housing in communities with employment growth exceeding 5% annually. Targets Sioux Falls, Rapid City, and Black Hills communities.",
        keyProvisions: ["Developer tax incentives", "5% employment growth threshold", "Three-city focus"],
        sponsor: "Rep. Chris Johnson",
        fullTextUrl: "https://sdlegislature.gov/"
      },
      {
        id: "SB-345",
        title: "Trust Industry Consumer Protection Act",
        category: "Economy & Taxes",
        status: "proposed",
        introduced: "2025-02-08",
        enacted: null,
        summary: "Strengthens consumer protections in South Dakota's $600 billion trust industry by increasing disclosure requirements and creating an independent trust examination division with enforcement powers.",
        keyProvisions: ["Enhanced trust disclosure rules", "Independent examination division", "Enforcement power creation"],
        sponsor: "Sen. Jim Bolin",
        fullTextUrl: "https://sdlegislature.gov/"
      },
      {
        id: "HB-567",
        title: "Tribal-State Cooperative Education Act",
        category: "Education",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-02-20",
        summary: "Establishes cooperative agreements between state school districts and tribal education departments for curriculum sharing, teacher exchanges, and joint Native American language preservation programs.",
        keyProvisions: ["Tribal-state education agreements", "Teacher exchange programs", "Language preservation funding"],
        sponsor: "Rep. Peri Pourier",
        fullTextUrl: "https://sdlegislature.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // TENNESSEE
  // ──────────────────────────────────────────────
  TN: {
    state: "Tennessee",
    abbr: "TN",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Public Safety",
    bills: [
      {
        id: "SB-234",
        title: "Tennessee Public Safety Enhancement Act",
        category: "Public Safety",
        status: "passed",
        introduced: "2024-11-18",
        enacted: "2025-02-01",
        summary: "Funds 500 additional state trooper positions and expands crime gun intelligence centers in Memphis and Nashville. Increases penalties for illegal firearm possession by convicted felons.",
        keyProvisions: ["500 new state troopers", "Crime gun intelligence centers", "Felon firearm penalty increase"],
        sponsor: "Sen. Jack Johnson",
        fullTextUrl: "https://www.capitol.tn.gov/"
      },
      {
        id: "HB-567",
        title: "Tennessee Education Savings Account Act",
        category: "Education",
        status: "proposed",
        introduced: "2025-01-25",
        enacted: null,
        summary: "Expands education savings accounts statewide after successful Nashville pilot. Allows families in any district rated in the bottom 10% to redirect per-pupil funding to private school tuition.",
        keyProvisions: ["Statewide ESA expansion", "Bottom 10% district eligibility", "Per-pupil funding portability"],
        sponsor: "Rep. Mark White",
        fullTextUrl: "https://www.capitol.tn.gov/"
      },
      {
        id: "SB-890",
        title: "Tennessee Fentanyl Trafficking Prevention Act",
        category: "Criminal Justice",
        status: "passed",
        introduced: "2024-12-08",
        enacted: "2025-02-18",
        summary: "Creates a second-degree murder charge for selling fentanyl that results in death. Mandates 25-year sentences for trafficking more than 100 grams with no possibility of early release.",
        keyProvisions: ["Second-degree murder for fatal sales", "25-year trafficking mandatory", "No early release provision"],
        sponsor: "Sen. Ferrell Haile",
        fullTextUrl: "https://www.capitol.tn.gov/"
      },
      {
        id: "HB-1200",
        title: "East Tennessee Broadband and Connectivity Act",
        category: "Infrastructure",
        status: "in_process",
        introduced: "2025-02-15",
        lastActionDate: "2025-03-10",
        enacted: null,
        summary: "Allocates $250 million from federal broadband funds for fiber deployment in Appalachian Tennessee counties with less than 50% broadband access. Partners with TVA for infrastructure corridors.",
        keyProvisions: ["$250M fiber deployment", "Appalachian county priority", "TVA corridor partnerships"],
        sponsor: "Rep. Lowell Russell",
        fullTextUrl: "https://www.capitol.tn.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // UTAH
  // ──────────────────────────────────────────────
  UT: {
    state: "Utah",
    abbr: "UT",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Infrastructure",
    bills: [
      {
        id: "SB-150",
        title: "Great Salt Lake Preservation and Restoration Act",
        category: "Environment",
        status: "passed",
        introduced: "2024-11-15",
        enacted: "2025-01-28",
        summary: "Allocates $500 million to raise Great Salt Lake levels through water rights acquisition, agricultural efficiency programs, and upstream water conservation mandates to prevent ecological collapse.",
        keyProvisions: ["$500M lake restoration fund", "Water rights acquisition", "Agricultural efficiency incentives"],
        sponsor: "Sen. Scott Sandall",
        fullTextUrl: "https://le.utah.gov/"
      },
      {
        id: "HB-345",
        title: "Utah Transit Expansion and Funding Act",
        category: "Infrastructure",
        status: "in_process",
        introduced: "2025-01-22",
        lastActionDate: "2025-03-05",
        enacted: null,
        summary: "Authorizes $3 billion in bonds for TRAX light rail expansion along the Point of the Mountain corridor and funds bus rapid transit connecting Provo, Orem, and Salt Lake City.",
        keyProvisions: ["$3B transit bond authorization", "TRAX corridor expansion", "BRT connections"],
        sponsor: "Rep. Norm Thurston",
        fullTextUrl: "https://le.utah.gov/"
      },
      {
        id: "SB-567",
        title: "Utah Inland Port Environmental Compliance Act",
        category: "Infrastructure",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-02-15",
        summary: "Imposes air quality monitoring and emissions reduction requirements on the Utah Inland Port development. Requires quarterly public reporting of particulate matter and ozone precursor levels.",
        keyProvisions: ["Air quality monitoring mandate", "Emissions reduction requirements", "Quarterly public reporting"],
        sponsor: "Sen. Luz Escamilla",
        fullTextUrl: "https://le.utah.gov/"
      },
      {
        id: "HB-890",
        title: "Social Media Minor Protection Act",
        category: "Public Safety",
        status: "proposed",
        introduced: "2025-02-18",
        enacted: null,
        summary: "Strengthens Utah's minor social media protections by requiring age verification, default privacy settings, and parental consent for accounts held by children under 16 years of age.",
        keyProvisions: ["Age verification requirement", "Default privacy for minors", "Parental consent under 16"],
        sponsor: "Rep. Jordan Teuscher",
        fullTextUrl: "https://le.utah.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // VERMONT
  // ──────────────────────────────────────────────
  VT: {
    state: "Vermont",
    abbr: "VT",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Environment",
    bills: [
      {
        id: "SB-89",
        title: "Vermont Climate Superfund Act",
        category: "Environment",
        status: "passed",
        introduced: "2024-11-20",
        enacted: "2025-02-01",
        summary: "Requires fossil fuel companies to pay into a state climate adaptation fund proportional to their historical greenhouse gas emissions. First-in-nation climate superfund law generating $150 million.",
        keyProvisions: ["Polluter-pays climate fund", "$150M projected revenue", "Historical emissions basis"],
        sponsor: "Sen. Anne Watson",
        fullTextUrl: "https://legislature.vermont.gov/"
      },
      {
        id: "HB-345",
        title: "Vermont Housing Supply and Affordability Act",
        category: "Infrastructure",
        status: "in_process",
        introduced: "2025-01-18",
        lastActionDate: "2025-03-01",
        enacted: null,
        summary: "Reforms Act 250 environmental review to streamline housing approvals in designated growth centers. Creates a $75 million housing investment fund targeting communities with vacancy rates below 1%.",
        keyProvisions: ["Act 250 reform for housing", "$75M housing investment fund", "Growth center targeting"],
        sponsor: "Rep. Emilie Kornheiser",
        fullTextUrl: "https://legislature.vermont.gov/"
      },
      {
        id: "SB-567",
        title: "Universal School Meals Permanent Authorization Act",
        category: "Education",
        status: "passed",
        introduced: "2024-12-08",
        enacted: "2025-02-22",
        summary: "Makes Vermont's universal free school meals program permanent after a successful pilot period. Funds expanded farm-to-school procurement requirements to support Vermont agriculture.",
        keyProvisions: ["Permanent universal meals", "Farm-to-school procurement", "Vermont agriculture support"],
        sponsor: "Sen. Ruth Hardy",
        fullTextUrl: "https://legislature.vermont.gov/"
      },
      {
        id: "HB-890",
        title: "Flood Recovery and Resilience Act",
        category: "Environment",
        status: "proposed",
        introduced: "2025-02-15",
        enacted: null,
        summary: "Addresses repeated flooding in Montpelier and other Vermont communities with $200 million for floodplain restoration, buyout programs, and resilient infrastructure rebuilding statewide.",
        keyProvisions: ["$200M flood resilience funding", "Floodplain restoration", "Community buyout programs"],
        sponsor: "Rep. Mike McCarthy",
        fullTextUrl: "https://legislature.vermont.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // VIRGINIA
  // ──────────────────────────────────────────────
  VA: {
    state: "Virginia",
    abbr: "VA",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SB-1234",
        title: "Virginia Data Center Tax Incentive Reform Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-15",
        enacted: "2025-02-05",
        summary: "Reforms Virginia's data center tax incentives by requiring community benefit agreements, environmental impact assessments, and renewable energy commitments for new facilities in Loudoun County.",
        keyProvisions: ["Community benefit agreements", "Environmental impact requirements", "Renewable energy commitments"],
        sponsor: "Sen. Chap Petersen",
        fullTextUrl: "https://lis.virginia.gov/"
      },
      {
        id: "HB-567",
        title: "Virginia Clean Economy Act Enhancement",
        category: "Environment",
        status: "in_process",
        introduced: "2025-01-22",
        lastActionDate: "2025-03-17",
        enacted: null,
        summary: "Accelerates the Virginia Clean Economy Act timeline for Dominion Energy and Appalachian Power to achieve 100% carbon-free electricity by 2040 instead of 2050 with interim milestones.",
        keyProvisions: ["2040 carbon-free target", "Accelerated timeline", "Utility-specific milestones"],
        sponsor: "Rep. Rip Sullivan",
        fullTextUrl: "https://lis.virginia.gov/"
      },
      {
        id: "SB-890",
        title: "Virginia Standard of Learning Reform Act",
        category: "Education",
        status: "proposed",
        introduced: "2025-02-10",
        enacted: null,
        summary: "Reduces standardized testing from annual SOL exams to diagnostic assessments in grades 3, 5, and 8 only. Redirects testing time to instructional hours and project-based learning.",
        keyProvisions: ["SOL testing reduction", "Diagnostic assessment model", "Instructional time increase"],
        sponsor: "Sen. Ghazala Hashmi",
        fullTextUrl: "https://lis.virginia.gov/"
      },
      {
        id: "HB-1200",
        title: "Virginia Grocery Tax Elimination Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-12-08",
        enacted: "2025-02-22",
        summary: "Eliminates the remaining 1% local grocery tax after the state portion was removed. Provides hold-harmless payments to localities from the state general fund to offset lost revenue.",
        keyProvisions: ["Full grocery tax elimination", "Local hold-harmless payments", "General fund offset"],
        sponsor: "Rep. Terry Austin",
        fullTextUrl: "https://lis.virginia.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // WASHINGTON
  // ──────────────────────────────────────────────
  WA: {
    state: "Washington",
    abbr: "WA",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Environment",
    bills: [
      {
        id: "SB-5234",
        title: "Washington Climate Commitment Act Revenue Allocation",
        category: "Environment",
        status: "passed",
        introduced: "2024-11-18",
        enacted: "2025-02-08",
        summary: "Directs cap-and-invest auction revenue to tribal salmon recovery, electric vehicle incentives, and environmental justice community grants. Allocates $1.5 billion over the biennium.",
        keyProvisions: ["$1.5B biennial allocation", "Tribal salmon recovery funding", "EV incentive programs"],
        sponsor: "Sen. Joe Nguyen",
        fullTextUrl: "https://leg.wa.gov/"
      },
      {
        id: "HB-1567",
        title: "Washington Behavioral Health Crisis System Act",
        category: "Healthcare",
        status: "in_process",
        introduced: "2025-01-25",
        lastActionDate: "2025-03-10",
        enacted: null,
        summary: "Creates a statewide behavioral health crisis response system with 988 co-responder teams in every county. Funds 10 new crisis stabilization centers and 23-hour observation beds.",
        keyProvisions: ["Statewide 988 co-responder teams", "10 crisis stabilization centers", "23-hour observation beds"],
        sponsor: "Rep. Tina Orwall",
        fullTextUrl: "https://leg.wa.gov/"
      },
      {
        id: "SB-5890",
        title: "Washington Missing Middle Housing Act",
        category: "Infrastructure",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-02-22",
        summary: "Expands middle housing requirements to cities over 15,000 population, mandating allowance of sixplexes near transit and fourplexes in all residential zones with streamlined permitting.",
        keyProvisions: ["Sixplexes near transit", "Fourplexes in all residential zones", "Streamlined permitting"],
        sponsor: "Sen. Patty Kuderer",
        fullTextUrl: "https://leg.wa.gov/"
      },
      {
        id: "HB-2345",
        title: "Capital Gains Tax Expansion Act",
        category: "Economy & Taxes",
        status: "proposed",
        introduced: "2025-02-18",
        enacted: null,
        summary: "Lowers the threshold for Washington's capital gains tax from $250,000 to $150,000 and expands coverage to include gains from real estate investment trusts. Revenue directed to education.",
        keyProvisions: ["$150K threshold reduction", "REIT gains inclusion", "Education revenue direction"],
        sponsor: "Rep. Noel Frame",
        fullTextUrl: "https://leg.wa.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // WEST VIRGINIA
  // ──────────────────────────────────────────────
  WV: {
    state: "West Virginia",
    abbr: "WV",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Infrastructure",
    bills: [
      {
        id: "SB-120",
        title: "West Virginia Income Tax Reduction Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-12",
        enacted: "2025-01-25",
        summary: "Reduces the personal income tax by 10% across all brackets as part of a multi-year effort to eliminate the state income tax. Funded through severance tax revenue and budget surpluses.",
        keyProvisions: ["10% across-the-board cut", "Multi-year elimination plan", "Severance tax funding"],
        sponsor: "Sen. Eric Tarr",
        fullTextUrl: "https://www.wvlegislature.gov/"
      },
      {
        id: "HB-345",
        title: "Abandoned Mine Land Economic Revitalization Act",
        category: "Infrastructure",
        status: "in_process",
        introduced: "2025-01-20",
        lastActionDate: "2025-03-03",
        enacted: null,
        summary: "Leverages $300 million in federal AML funds for economic development on reclaimed mine lands including solar farms, industrial parks, and outdoor recreation destinations in southern coalfields.",
        keyProvisions: ["$300M AML fund leveraging", "Reclaimed land solar farms", "Outdoor recreation development"],
        sponsor: "Rep. Sean Hornbuckle",
        fullTextUrl: "https://www.wvlegislature.gov/"
      },
      {
        id: "SB-567",
        title: "Hope Scholarship Accountability Act",
        category: "Education",
        status: "proposed",
        introduced: "2025-02-08",
        enacted: null,
        summary: "Adds academic testing requirements for Hope Scholarship voucher recipients and mandates financial audits of participating schools to ensure public funds support quality educational outcomes.",
        keyProvisions: ["Academic testing for voucher recipients", "Financial audit mandates", "Quality outcome requirements"],
        sponsor: "Sen. Mike Oliverio",
        fullTextUrl: "https://www.wvlegislature.gov/"
      },
      {
        id: "HB-890",
        title: "Broadband and Digital Equity Act",
        category: "Infrastructure",
        status: "passed",
        introduced: "2024-12-15",
        enacted: "2025-02-20",
        summary: "Deploys $500 million in BEAD federal funds for last-mile broadband in all 55 counties. Requires all state-funded connections to deliver at least 100/20 Mbps speeds with affordability provisions.",
        keyProvisions: ["$500M BEAD deployment", "100/20 Mbps minimum speeds", "55-county coverage"],
        sponsor: "Rep. Riley Keaton",
        fullTextUrl: "https://www.wvlegislature.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // WISCONSIN
  // ──────────────────────────────────────────────
  WI: {
    state: "Wisconsin",
    abbr: "WI",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Education",
    bills: [
      {
        id: "SB-234",
        title: "Wisconsin Legislative Redistricting Reform Act",
        category: "Civil Rights",
        status: "passed",
        introduced: "2024-11-18",
        enacted: "2025-02-01",
        summary: "Implements the Wisconsin Supreme Court's redistricting mandate by creating competitive legislative maps drawn by a nonpartisan commission. Applies to 2026 elections and all subsequent cycles.",
        keyProvisions: ["Nonpartisan redistricting commission", "Competitive map standards", "2026 election implementation"],
        sponsor: "Sen. Jeff Smith",
        fullTextUrl: "https://legis.wisconsin.gov/"
      },
      {
        id: "AB-567",
        title: "Wisconsin School Funding Increase Act",
        category: "Education",
        status: "proposed",
        introduced: "2025-01-25",
        enacted: null,
        summary: "Increases per-pupil state aid by $600 and raises revenue limits for school districts to account for inflation. Provides additional weighted funding for students with disabilities and English learners.",
        keyProvisions: ["$600 per-pupil increase", "Revenue limit inflation adjustment", "Disability and ELL weighting"],
        sponsor: "Asm. Jill Billings",
        fullTextUrl: "https://legis.wisconsin.gov/"
      },
      {
        id: "SB-890",
        title: "PFAS Contamination Accountability Act",
        category: "Environment",
        status: "passed",
        introduced: "2024-12-10",
        enacted: "2025-02-22",
        summary: "Sets strict PFAS drinking water standards at 20 parts per trillion and creates a polluter-funded remediation program. Mandates testing at all municipal water systems within two years.",
        keyProvisions: ["20 ppt PFAS standard", "Polluter-funded remediation", "Two-year testing mandate"],
        sponsor: "Sen. Kelda Roys",
        fullTextUrl: "https://legis.wisconsin.gov/"
      },
      {
        id: "AB-1200",
        title: "Childcare Access and Workforce Support Act",
        category: "Education",
        status: "in_process",
        introduced: "2025-02-15",
        lastActionDate: "2025-03-11",
        enacted: null,
        summary: "Increases childcare subsidy eligibility to 200% of the federal poverty level and provides $2,000 annual retention bonuses for licensed childcare providers in Wisconsin childcare deserts.",
        keyProvisions: ["200% FPL subsidy eligibility", "$2K provider retention bonuses", "Childcare desert targeting"],
        sponsor: "Asm. Lee Snodgrass",
        fullTextUrl: "https://legis.wisconsin.gov/"
      }
    ]
  },

  // ──────────────────────────────────────────────
  // WYOMING
  // ──────────────────────────────────────────────
  WY: {
    state: "Wyoming",
    abbr: "WY",
    session: "2025",
    totalBills: 4,
    passed: 2,
    inProcess: 1,
    proposed: 1,
    topCategory: "Economy & Taxes",
    bills: [
      {
        id: "SF-45",
        title: "Wyoming Mineral Revenue Diversification Act",
        category: "Economy & Taxes",
        status: "passed",
        introduced: "2024-11-15",
        enacted: "2025-01-28",
        summary: "Diversifies Wyoming's revenue base by investing mineral severance tax savings into technology sector recruitment, data center incentives, and a state sovereign wealth fund earning target of 7%.",
        keyProvisions: ["Severance tax savings investment", "Technology sector recruitment", "7% sovereign wealth target"],
        sponsor: "Sen. Cale Case",
        fullTextUrl: "https://www.wyoleg.gov/"
      },
      {
        id: "HB-234",
        title: "Wyoming Nuclear Energy Development Act",
        category: "Environment",
        status: "in_process",
        introduced: "2025-01-22",
        lastActionDate: "2025-02-27",
        enacted: null,
        summary: "Creates the regulatory framework for small modular nuclear reactors in Wyoming and provides tax incentives for the Kemmerer advanced reactor project. Addresses spent fuel storage provisions.",
        keyProvisions: ["SMR regulatory framework", "Kemmerer project incentives", "Spent fuel storage provisions"],
        sponsor: "Rep. Mike Yin",
        fullTextUrl: "https://www.wyoleg.gov/"
      },
      {
        id: "SF-180",
        title: "Wyoming Livestock Industry Protection Act",
        category: "Other",
        status: "proposed",
        introduced: "2025-02-10",
        enacted: null,
        summary: "Provides compensation programs for livestock losses due to grizzly bear and wolf predation. Funds non-lethal deterrent programs and establishes clear state authority over predator management.",
        keyProvisions: ["Livestock loss compensation", "Non-lethal deterrent funding", "State predator management authority"],
        sponsor: "Sen. Larry Hicks",
        fullTextUrl: "https://www.wyoleg.gov/"
      },
      {
        id: "HB-567",
        title: "Wyoming Teacher Housing Assistance Act",
        category: "Education",
        status: "passed",
        introduced: "2024-12-08",
        enacted: "2025-02-18",
        summary: "Provides housing subsidies and down payment assistance for teachers in Wyoming communities where housing costs exceed 35% of teacher salary. Targets resort communities near Jackson and Cody.",
        keyProvisions: ["Teacher housing subsidies", "Down payment assistance", "Resort community targeting"],
        sponsor: "Rep. Karlee Provenza",
        fullTextUrl: "https://www.wyoleg.gov/"
      }
    ]
  }
};
