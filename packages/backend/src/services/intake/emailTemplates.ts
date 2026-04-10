export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  principle: string;
  category: string;
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: "energy-consumption",
    name: "Energy Consumption Report",
    subject: "[BRSR P6] Energy Data - {facility} - {month} {year}",
    body: `Facility: {name}
Total electricity (kWh): {value}
Renewable energy (kWh): {value}
Non-renewable fuel (litres): {value}`,
    principle: "P6",
    category: "energy",
  },
  {
    id: "water-consumption",
    name: "Water Consumption Report",
    subject: "[BRSR P6] Water Data - {facility} - {month} {year}",
    body: `Facility: {name}
Total water withdrawal (kilolitres): {value}
Source: {surface/ground/third party}
Water recycled (kilolitres): {value}`,
    principle: "P6",
    category: "water",
  },
  {
    id: "employee-training",
    name: "Employee Training Records",
    subject: "[BRSR P3] Training Data - {department} - {period}",
    body: `Department: {name}
Employees trained: {count}
Topic: {health_safety/skill_upgradation/other}
Duration (hours): {value}`,
    principle: "P3",
    category: "training",
  },
  {
    id: "policy-document",
    name: "Policy Document",
    subject: "[BRSR Policy] {policy_name} - {principle}",
    body: `Policy Name: {name}
Principle: {P1-P9}
Board Approved: {yes/no}
Extends to Value Chain: {yes/no}`,
    principle: "Section B",
    category: "policy",
  },
  {
    id: "ghg-emissions",
    name: "GHG Emissions Report",
    subject: "[BRSR P6] GHG Emissions - {period}",
    body: `Scope 1 (tCO2e): {value}
Scope 2 (tCO2e): {value}
Scope 3 (tCO2e): {value}`,
    principle: "P6",
    category: "emissions",
  },
  {
    id: "waste-management",
    name: "Waste Management Data",
    subject: "[BRSR P6] Waste Data - {facility} - {period}",
    body: `Facility: {name}
Total waste (metric tonnes): {value}
Construction & demolition waste: {value}
Recycled (metric tonnes): {value}
Reused (metric tonnes): {value}`,
    principle: "P6",
    category: "waste",
  },
  {
    id: "human-rights-training",
    name: "Human Rights Training",
    subject: "[BRSR P5] HR Training - {department} - {period}",
    body: `Department: {name}
Employees covered: {count}
Total employees: {count}
Training type: {awareness/workshop/online}`,
    principle: "P5",
    category: "training",
  },
  {
    id: "grievance-report",
    name: "Stakeholder Grievance Report",
    subject: "[BRSR P4] Stakeholder Grievances - {period}",
    body: `Total grievances received: {count}
Resolved: {count}
Pending: {count}
Stakeholder group: {employees/customers/suppliers/community}`,
    principle: "P4",
    category: "grievance",
  },
];

export function getEmailTemplates(): EmailTemplate[] {
  return emailTemplates;
}

export function getEmailTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find((t) => t.id === id);
}
