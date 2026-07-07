import { Scheme, Complaint, DocumentService } from './types';

export const initialSchemes: Scheme[] = [
  {
    id: 'pm-kisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    ministry: 'Ministry of Agriculture and Farmers Welfare',
    category: 'Agriculture & Farmers',
    description: 'An initiative by the Government of India that provides up to ₹6,000 per year in three equal installments to all small and marginal farmers as minimum income support.',
    benefits: [
      'Direct benefit transfer of ₹6,000 per year directly to bank accounts.',
      'Distributed in three equal installments of ₹2,000 every four months.',
      'Financial support for purchasing agricultural inputs and domestic needs.'
    ],
    eligibilitySummary: 'All landholding farmer families with cultivable land in their names. No high-income taxpayers or institutional landholders.',
    requiredDocs: ['Aadhaar Card', 'Land Holding Documents / Patta Chitta', 'Bank Account Details', 'Mobile Number linked with Aadhaar'],
    officialLink: 'https://pmkisan.gov.in/'
  },
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)',
    ministry: 'Ministry of Health and Family Welfare',
    category: 'Healthcare & Wellness',
    description: 'The largest health assurance scheme in the world, aiming to provide a health cover of ₹5 lakhs per family per year for secondary and tertiary care hospitalization to over 12 crore poor and vulnerable families.',
    benefits: [
      'Cashless and paperless access to healthcare services.',
      'Coverage of up to ₹5,00,000 per family per year.',
      'Covers pre-existing conditions from day one, including pre and post-hospitalization expenses.'
    ],
    eligibilitySummary: 'Identified households under the Socio-Economic Caste Census (SECC) 2011, low-income families, or active Rashtriya Swasthya Bima Yojana (RSBY) cards.',
    requiredDocs: ['Aadhaar Card / Ration Card', 'Income Certificate', 'SECC Letter / HHID Number', 'Mobile Number'],
    officialLink: 'https://pmjay.gov.in/'
  },
  {
    id: 'pm-awas-yojana',
    name: 'Pradhan Mantri Awas Yojana - Gramin / Urban (PMAY)',
    ministry: 'Ministry of Housing and Urban Affairs / Rural Development',
    category: 'Housing & Sanitation',
    description: 'A flagship social welfare program focused on providing affordable housing with eco-friendly features and basic amenities to the rural and urban poor.',
    benefits: [
      'Financial assistance of up to ₹1.2 Lakhs in plains and ₹1.3 Lakhs in hilly areas for rural housing.',
      'Interest subsidy of up to 6.5% on housing loans for urban poor (EWS/LIG).',
      'Assistance directly transferred to beneficiary bank accounts.'
    ],
    eligibilitySummary: 'Families without a pucca house, households with no adult member between 16 and 59, or families living in temporary single-room kutcha houses.',
    requiredDocs: ['Aadhaar Card', 'Ration Card / BPL Card', 'Income Certificate', 'Land Registry Certificate', 'Sworn Affidavit of no pucca house ownership'],
    officialLink: 'https://pmaymis.gov.in/'
  },
  {
    id: 'pudhumai-penn',
    name: 'Moovalur Ramamirtham Ammaiyar Higher Education Assurance (Pudhumai Penn)',
    ministry: 'Department of Social Welfare, Government of Tamil Nadu',
    category: 'Education & Scholarships',
    description: 'A state welfare scheme in Tamil Nadu that provides a monthly stipend of ₹1,000 to girl students who studied in government schools from Classes 6 to 12 and are now pursuing higher education.',
    benefits: [
      'Stipend of ₹1,000 per month deposited directly into the student\'s bank account.',
      'Sustained support throughout the undergraduate degree, diploma, or ITI course.',
      'Empowerment of girls from lower income groups to prevent early marriages.'
    ],
    eligibilitySummary: 'Female students who studied in Tamil Nadu Government schools from Class 6 to 12 and have enrolled in any higher education program (UG, Diploma, ITI).',
    requiredDocs: ['Government School Transfer Certificate (TC)', 'Admissions Proof / College ID', 'Aadhaar Card', 'Bank Passbook copy with IFSC', 'Community Certificate'],
    officialLink: 'https://penkalvi.tn.gov.in/'
  },
  {
    id: 'gruha-lakshmi',
    name: 'Gruha Lakshmi Scheme - Karnataka',
    ministry: 'Department of Women and Child Development, Government of Karnataka',
    category: 'Women Empowerment',
    description: 'A social security scheme by the Government of Karnataka providing financial assistance to the woman head of every household in the state, encouraging economic independence.',
    benefits: [
      'Monthly direct benefit transfer (DBT) of ₹2,000 to eligible women.',
      'Financial independence for homemakers and low-income families.',
      'Covers both Above Poverty Line (APL) and Below Poverty Line (BPL) cardholders.'
    ],
    eligibilitySummary: 'The woman must be registered as the head of the family in the Ration Card (RC/BPL/APL). The woman or her husband must not be an income tax payer or GST filer.',
    requiredDocs: ['Ration Card (showing woman as head)', 'Aadhaar Card of woman and husband', 'Bank Account details linked with Aadhaar', 'Mobile number'],
    officialLink: 'https://sevasindhu.karnataka.gov.in/'
  },
  {
    id: 'atal-pension',
    name: 'Atal Pension Yojana (APY)',
    ministry: 'Ministry of Finance / PFRDA',
    category: 'Social Security & Pension',
    description: 'A government-backed pension scheme in India targeted at the unorganized sector, offering a guaranteed minimum pension of ₹1,000 to ₹5,000 per month after the age of 60.',
    benefits: [
      'Guaranteed pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000 or ₹5,000 per month.',
      'Co-contribution by central government for eligible accounts (50% of contribution, up to ₹1,000/year).',
      'In case of death of the subscriber, pension is guaranteed to the spouse, and return of corpus to nominees.'
    ],
    eligibilitySummary: 'Any citizen of India between 18 and 40 years of age with a savings bank account. Must not be a member of any statutory social security scheme.',
    requiredDocs: ['Aadhaar Card', 'Savings Bank Account number', 'Mobile Number', 'Nominee Details'],
    officialLink: 'https://www.npscra.nsdl.co.in/'
  },
  {
    id: 'pm-mudra',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    ministry: 'Ministry of Finance',
    category: 'Employment & Business',
    description: 'A scheme to provide collateral-free loans up to ₹10 Lakhs to non-corporate, non-farm small/micro enterprises to help them establish or expand businesses.',
    benefits: [
      'Three loan categories: Shishu (up to ₹50,000), Kishor (₹50,000 to ₹5 Lakhs), and Tarun (₹5 Lakhs to ₹10 Lakhs).',
      'No collateral security required.',
      'No processing fee for Shishu loans; lower interest rates for small enterprises.'
    ],
    eligibilitySummary: 'Any Indian citizen who has a business plan for non-farm income-generating activity such as manufacturing, processing, trading, or service sector.',
    requiredDocs: ['Aadhaar / Voter ID / PAN Card', 'Business Address Proof', 'Business Plan / Quotation of machinery', 'Passport size photographs', 'Community certificate (if SC/ST/OBC)'],
    officialLink: 'https://www.mudra.org.in/'
  },
  {
    id: 'sukanya-samriddhi',
    name: 'Sukanya Samriddhi Yojana (SSY)',
    ministry: 'Ministry of Women and Child Development',
    category: 'Women Empowerment',
    description: 'A small deposit savings scheme promoted under the "Beti Bachao Beti Padhao" campaign, offering attractive interest rates and tax exemptions to secure the financial future of girl children.',
    benefits: [
      'High government-backed compound interest rate (historically > 8% p.a.).',
      'Income Tax benefits under Section 80C of the IT Act.',
      'Partial withdrawal allowed for higher education once the girl child turns 18.'
    ],
    eligibilitySummary: 'Parents or legal guardians can open an account in the name of a girl child from her birth till she attains the age of 10 years. Maximum of two accounts per family.',
    requiredDocs: ['Birth Certificate of the girl child', 'Aadhaar Card & PAN of parent/guardian', 'Address Proof of parent/guardian', 'Passport size photo'],
    officialLink: 'https://www.indiapost.gov.in/'
  },
  {
    id: 'pm-swanidhi',
    name: 'PM Street Vendor\'s AtmaNirbhar Nidhi (PM SVANidhi)',
    ministry: 'Ministry of Housing and Urban Affairs',
    category: 'Employment & Business',
    description: 'A special micro-credit facility scheme for providing affordable working capital loans to street vendors to resume their livelihoods post pandemic.',
    benefits: [
      'First loan of up to ₹10,000, 2nd loan of ₹20,000, and 3rd loan of ₹50,000 upon timely repayment.',
      'Interest subsidy of 7% per annum credited to the bank account quarterly.',
      'Cashback of up to ₹1,200 per year for conducting digital transactions.'
    ],
    eligibilitySummary: 'Street vendors or hawkers engaged in vending in urban, semi-urban, or rural areas on or before March 24, 2020, with a Certificate of Vending.',
    requiredDocs: ['Aadhaar Card', 'Voter Identity Card', 'Certificate of Vending / Letter of Recommendation from local municipal body', 'Bank Passbook'],
    officialLink: 'https://pmsvanidhi.mohua.gov.in/'
  },
  {
    id: 'pm-ujjwala',
    name: 'Pradhan Mantri Ujjwala Yojana (PMUY)',
    ministry: 'Ministry of Petroleum and Natural Gas',
    category: 'Housing & Sanitation',
    description: 'A scheme designed to provide clean cooking fuel like LPG to women from Below Poverty Line (BPL) households, replacing unhealthy traditional cooking methods.',
    benefits: [
      'Free LPG connection including a cylinder, stove, regulator, and safety hose.',
      'Financial support of ₹1,600 per connection provided by the central government.',
      'Direct subsidy on refills credited directly to bank accounts.'
    ],
    eligibilitySummary: 'Adult woman belonging to poor households (SC, ST, Pradhan Mantri Awas Yojana, Most Backward Classes, or general BPL households). Must not have any other LPG connection.',
    requiredDocs: ['BPL Ration Card', 'Aadhaar Card of all family members', 'Income Certificate', 'Bank Passbook', 'Declaration form'],
    officialLink: 'https://www.pmuy.gov.in/'
  }
];

export const initialComplaints: Complaint[] = [
  {
    id: 'comp-1',
    title: 'Major Potholes near RS Puram Signal',
    category: 'Roads & Footpaths',
    description: 'There are three massive potholes right at the turning of RS Puram signal. It is extremely hazardous for two-wheelers, especially during night hours and rainy spells. Already multiple skidding incidents occurred.',
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80',
    latitude: 11.0112,
    longitude: 76.9482,
    status: 'In Progress',
    statusText: 'Municipal engineers have inspected the site and asphalt materials are dispatched. Repair scheduled tonight.',
    urgency: 'high',
    createdAt: '2026-07-01T10:30:00Z',
    affectedCount: 34,
    updates: [
      { date: '2026-07-01T10:30:00Z', text: 'Complaint registered by citizen Sowjanya S.', status: 'Reported' },
      { date: '2026-07-02T09:15:00Z', text: 'Acknowledged by Coimbatore Municipal Corporation (Ward 23). Assigned to Assistant Engineer.', status: 'Acknowledged' },
      { date: '2026-07-05T14:20:00Z', text: 'Materials scheduled. Patching scheduled for night hours.', status: 'In Progress' }
    ]
  },
  {
    id: 'comp-2',
    title: 'Clogged Open Drain causing overflow',
    category: 'Sanitation & Garbage',
    description: 'The open storm drain near Gandhipuram 4th street is completely clogged with plastic waste and garbage. The black water is spilling onto the street and emitting a terrible stench, creating a breeding ground for mosquitoes.',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    latitude: 11.0185,
    longitude: 76.9644,
    status: 'Acknowledged',
    statusText: 'Assigned to the Sanitation Inspector of Gandhipuram Zone for clearance of solid waste blockages.',
    urgency: 'medium',
    createdAt: '2026-07-03T08:12:00Z',
    affectedCount: 18,
    updates: [
      { date: '2026-07-03T08:12:00Z', text: 'Complaint reported with geo-coordinates.', status: 'Reported' },
      { date: '2026-07-04T11:00:00Z', text: 'Ward sanitary workers notified. Cleanup scheduled within 48 hours.', status: 'Acknowledged' }
    ]
  },
  {
    id: 'comp-3',
    title: 'Flickering Streetlights on Avinashi Road Flyover',
    category: 'Electricity & Lighting',
    description: 'At least 5 streetlights in a row are completely dead or continuously flickering on the main flyover of Avinashi Road, near Laxmi Mills. This creates a dangerous dark blind spot on a high-speed arterial road.',
    latitude: 11.0128,
    longitude: 76.9852,
    status: 'Reported',
    statusText: 'Complaint logged under Electrical Maintenance division of Corporation.',
    urgency: 'high',
    createdAt: '2026-07-06T20:45:00Z',
    affectedCount: 42,
    updates: [
      { date: '2026-07-06T20:45:00Z', text: 'Automated logging. Community members reported dark spots.', status: 'Reported' }
    ]
  },
  {
    id: 'comp-4',
    title: 'Uncollected Garbage Pile near Town Hall School',
    category: 'Sanitation & Garbage',
    description: 'A huge pile of household garbage has been dumped right opposite the government primary school in Town Hall. The municipal dumper has not visited this point for the last 5 days. Dogs are scattering the waste everywhere.',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    latitude: 10.9994,
    longitude: 76.9621,
    status: 'Resolved',
    statusText: 'Municipal garbage collection truck has cleared the pile and installed a "No Dumping" warning sign.',
    urgency: 'medium',
    createdAt: '2026-06-28T07:30:00Z',
    affectedCount: 56,
    updates: [
      { date: '2026-06-28T07:30:00Z', text: 'Complaint submitted by parents association.', status: 'Reported' },
      { date: '2026-06-29T10:00:00Z', text: 'Acknowledged. Sanitation inspectors visited the location.', status: 'Acknowledged' },
      { date: '2026-06-30T09:00:00Z', text: 'Heavy dumper deployed. Rubbish cleared completely.', status: 'In Progress' },
      { date: '2026-07-02T16:00:00Z', text: 'Verified resolved. Signboards placed, monitoring activated.', status: 'Resolved' }
    ]
  },
  {
    id: 'comp-5',
    title: 'Drinking water pipeline leakage at Singanallur',
    category: 'Water & Sewage',
    description: 'Major drinking water pipeline has burst under the footpath near Singanallur bus stand. Gallons of clean water are leaking continuously and flooding the road, causing severe loss of municipal water supply for nearby houses.',
    imageUrl: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&w=600&q=80',
    latitude: 11.0025,
    longitude: 77.0195,
    status: 'In Progress',
    statusText: 'Water board engineers have isolated the leakage valve. Excavation underway to replace the ruptured segment.',
    urgency: 'critical',
    createdAt: '2026-07-05T06:00:00Z',
    affectedCount: 89,
    updates: [
      { date: '2026-07-05T06:00:00Z', text: 'Emergency leak report filed by resident.', status: 'Reported' },
      { date: '2026-07-05T08:30:00Z', text: 'Coimbatore Water Supply Board engineer dispatched. Main valve shut.', status: 'Acknowledged' },
      { date: '2026-07-06T10:00:00Z', text: 'Excavation initiated. Replacement pipe delivered.', status: 'In Progress' }
    ]
  }
];

export const initialDocumentServices: DocumentService[] = [
  {
    id: 'ration-card',
    name: 'New Ration Card (Smart Ration Card) Application',
    description: 'Apply for a family smart ration card in Tamil Nadu (TNPDS) or central states to avail essential commodities and state assistance schemes.',
    category: 'Civil Documents & Food Security',
    checklist: [
      { id: 'rc-1', name: 'Aadhaar Card of all family members', description: 'Mandatory for deduplication and linkage.', required: true },
      { id: 'rc-2', name: 'Address Proof (Gas Bill / EB Bill / Rental Agreement)', description: 'Must match current residency.', required: true },
      { id: 'rc-3', name: 'Income Certificate', description: 'Required to determine category (BPL/APL/Antyodaya).', required: false },
      { id: 'rc-4', name: 'Passport Size Photograph of Head of Family', description: 'Clear front-facing photo on light background.', required: true },
      { id: 'rc-5', name: 'Self-Declaration Form', description: 'Stating no previous ration cards held in India.', required: true },
      { id: 'rc-6', name: 'Community Certificate', description: 'Needed for specific state subsidies if applicable.', required: false }
    ]
  },
  {
    id: 'driving-license',
    name: 'Driving License - First Time Application',
    description: 'Procure a permanent driving license from the Regional Transport Office (RTO) after completing the mandatory learner\'s permit duration.',
    category: 'Transport & Licenses',
    checklist: [
      { id: 'dl-1', name: 'Learner\'s License (LL)', description: 'Must be valid (issued between 30 days and 6 months ago).', required: true },
      { id: 'dl-2', name: 'Age Proof (10th Marksheet / Birth Certificate / Passport)', description: 'Must clearly show date of birth proving age > 18.', required: true },
      { id: 'dl-3', name: 'Address Proof (Aadhaar / Voter ID / LIC)', description: 'Current residence address within the RTO jurisdiction.', required: true },
      { id: 'dl-4', name: 'Medical Certificate (Form 1A)', description: 'Mandatory for applicants over 40 years or transport vehicle class.', required: false },
      { id: 'dl-5', name: 'Form 4 Application', description: 'Duly filled application for permanent license.', required: true },
      { id: 'dl-6', name: 'Passport size photographs', description: '3 copies, recent and clear.', required: true }
    ]
  },
  {
    id: 'passport-renewal',
    name: 'Indian Passport Renewal (Re-issue)',
    description: 'Apply for re-issue of Indian passport due to validity expiry, exhaustion of pages, or damage.',
    category: 'Travel & Identity',
    checklist: [
      { id: 'pass-1', name: 'Original Expiring Passport', description: 'Must include the old booklets, damaged or expired pages.', required: true },
      { id: 'pass-2', name: 'Copy of First and Last page', description: 'Self-attested copies showing personal details and ECR/Non-ECR status.', required: true },
      { id: 'pass-3', name: 'Proof of Address (Utility bill / Rent Deed / Bank statement)', description: 'Required if current address is different from the old passport.', required: false },
      { id: 'pass-4', name: 'Non-ECR Proof (Degree Certificate / Matriculation Certificate)', description: 'Required only if changing status from ECR to Non-ECR.', required: false },
      { id: 'pass-5', name: 'Annexure/Affidavit for Name/Address change', description: 'Only required if name, spouse name, or parent name is being updated.', required: false }
    ]
  },
  {
    id: 'birth-certificate',
    name: 'Birth Certificate Registration & Certificate',
    description: 'Obtain a birth certificate from the local Municipal Corporation or Panchayat Office.',
    category: 'Civil Documents & Registration',
    checklist: [
      { id: 'bc-1', name: 'Hospital Discharge Summary / Birth Record', description: 'Provided by the hospital where the birth took place.', required: true },
      { id: 'bc-2', name: 'Aadhaar Cards of Parents', description: 'Both mother\'s and father\'s identity and residence verification.', required: true },
      { id: 'bc-3', name: 'Marriage Certificate of Parents', description: 'For standard child lineage registration support.', required: false },
      { id: 'bc-4', name: 'Affidavit for Delayed Registration', description: 'Required only if registering birth after 21 days.', required: false },
      { id: 'bc-5', name: 'Name Inclusion Request letter', description: 'If child\'s name was not registered at the time of hospital birth.', required: false }
    ]
  }
];
