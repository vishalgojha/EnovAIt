export interface GuidanceItem {
  id: string;
  title: string;
  whatItIs: string;
  whatToSubmit: string;
  whoSendsIt: string;
}

export const sectionGuidance: Record<string, GuidanceItem> = {
  section_a: {
    id: "section_a",
    title: "Section A: General Disclosures",
    whatItIs: "Basic information about your company \u2014 who you are, where you operate, how many people you employ, and what issues matter most to your business.",
    whatToSubmit: "Company registration details, list of facilities, employee headcount by gender, material risk register, product/service catalog",
    whoSendsIt: "Company secretary, HR head, operations manager"
  },
  section_b: {
    id: "section_b",
    title: "Section B: Management Process",
    whatItIs: "Proof that your company has policies, processes, and board oversight for each of the 9 BRSR principles.",
    whatToSubmit: "Policy documents, board meeting minutes, committee charters, supplier code of conduct, training calendars",
    whoSendsIt: "Legal team, compliance officer, board secretary"
  },
  section_c: {
    id: "section_c",
    title: "Section C: Principle-wise Performance",
    whatItIs: "Actual numbers and metrics for each principle \u2014 the real data behind your ESG commitments.",
    whatToSubmit: "Energy bills, water bills, waste disposal receipts, training attendance sheets, grievance logs, emission calculations",
    whoSendsIt: "Facility managers, EHS team, HR, sustainability team"
  }
};

export const principleGuidance: Record<string, GuidanceItem> = {
  p1: {
    id: "p1",
    title: "P1: Ethics & Accountability",
    whatItIs: "Shows your company runs with integrity \u2014 anti-corruption policies, transparent reporting, and no conflicts of interest.",
    whatToSubmit: "Anti-bribery policy, code of conduct, whistleblower policy, training records, accounts payable data",
    whoSendsIt: "Legal, compliance, finance team"
  },
  p2: {
    id: "p2",
    title: "P2: Sustainable Products",
    whatItIs: "Proves your products and services are designed and delivered sustainably.",
    whatToSubmit: "Life cycle assessments, sustainable sourcing records, supplier code of conduct, EPR compliance docs",
    whoSendsIt: "Product team, procurement, R&D"
  },
  p3: {
    id: "p3",
    title: "P3: Employee Well-being",
    whatItIs: "Covers everything about your people \u2014 health insurance, safety, training, grievances, fair wages.",
    whatToSubmit: "Insurance coverage data, training attendance sheets, LTIFR reports, wage records, union membership data, parental leave stats",
    whoSendsIt: "HR, safety officer, plant manager"
  },
  p4: {
    id: "p4",
    title: "P4: Stakeholder Engagement",
    whatItIs: "Shows you listen to and act on feedback from employees, customers, suppliers, regulators, and communities.",
    whatToSubmit: "Stakeholder meeting minutes, ESAT survey results, grievance logs, CSR reports",
    whoSendsIt: "CSR team, investor relations, community manager"
  },
  p5: {
    id: "p5",
    title: "P5: Human Rights",
    whatItIs: "Proves you respect human rights across operations and supply chain.",
    whatToSubmit: "Human rights training records, minimum wage audits, gender pay ratio data, harassment complaint logs, worker welfare measures",
    whoSendsIt: "HR, legal, procurement"
  },
  p6: {
    id: "p6",
    title: "P6: Environmental Protection",
    whatItIs: "Your environmental footprint \u2014 energy, water, emissions, and waste.",
    whatToSubmit: "Electricity bills, water meter readings, GHG calculations, waste disposal receipts, recycling reports, environmental clearances",
    whoSendsIt: "Facility manager, EHS team, utilities team"
  },
  p7: {
    id: "p7",
    title: "P7: Policy Advocacy",
    whatItIs: "Shows how you engage with government and industry bodies on policy.",
    whatToSubmit: "Trade association memberships, policy position papers, advocacy spending records",
    whoSendsIt: "Government relations, CEO office"
  },
  p8: {
    id: "p8",
    title: "P8: Inclusive Growth",
    whatItIs: "Proves you support local communities, MSMEs, and marginalized groups.",
    whatToSubmit: "Social impact assessment reports, resettlement records, MSME procurement data, local hiring stats",
    whoSendsIt: "CSR team, procurement, community relations"
  },
  p9: {
    id: "p9",
    title: "P9: Consumer Value",
    whatItIs: "Shows you serve customers responsibly \u2014 product safety, data privacy, fair advertising.",
    whatToSubmit: "Customer satisfaction surveys, product certifications, data breach logs, consumer complaint records, ISO 27001 certificate",
    whoSendsIt: "Customer service, IT security, marketing"
  }
};
