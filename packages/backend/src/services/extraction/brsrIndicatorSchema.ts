// Complete BRSR Indicator-Level Schema
// Reverse-engineered from SEBI BRSR format and Rustomjee FY 2024-25 filing
// Covers all Essential and Leadership indicators for P1-P9

// ============================================================
// SECTION A: General Disclosures
// ============================================================

export const sectionASchema = {
  type: "object",
  title: "Section A: General Disclosures",
  properties: {
    listed_entity: {
      type: "object",
      properties: {
        cin: { type: "string", description: "Corporate Identity Number", example: "L45200MH1995PLC094208" },
        name: { type: "string", description: "Name of the Listed Entity" },
        year_of_incorporation: { type: "number", description: "Year of incorporation", example: 1995 },
        registered_office_address: { type: "string" },
        corporate_address: { type: "string" },
        email: { type: "string", format: "email" },
        telephone: { type: "string" },
        website: { type: "string", format: "uri" },
        financial_year_start: { type: "string", format: "date", example: "2024-04-01" },
        financial_year_end: { type: "string", format: "date", example: "2025-03-31" },
        stock_exchanges: { type: "array", items: { type: "string" }, example: ["BSE", "NSE"] },
        paid_up_capital: { type: "string", description: "Paid-up Capital in INR" },
        contact_person_name: { type: "string" },
        contact_person_email: { type: "string", format: "email" },
        contact_person_phone: { type: "string" },
        reporting_boundary: { type: "string", enum: ["standalone", "consolidated"] },
        assurance_provider: { type: "string" },
        assurance_type: { type: "string", enum: ["self", "external", "not_applicable"] },
      },
      required: ["cin", "name", "year_of_incorporation", "financial_year_start", "financial_year_end", "reporting_boundary"],
    },
    products_services: {
      type: "object",
      properties: {
        main_business_activities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              description: { type: "string" },
              business_activity: { type: "string" },
              percent_of_turnover: { type: "number", minimum: 0, maximum: 100 },
            },
            required: ["description", "business_activity", "percent_of_turnover"],
          },
        },
        products_sold: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product_service: { type: "string" },
              nic_code: { type: "string" },
              percent_of_turnover: { type: "number", minimum: 0, maximum: 100 },
            },
            required: ["product_service", "nic_code", "percent_of_turnover"],
          },
        },
      },
      required: ["main_business_activities", "products_sold"],
    },
    operations: {
      type: "object",
      properties: {
        plants_national: { type: "number", minimum: 0 },
        plants_international: { type: "number", minimum: 0 },
        offices_national: { type: "number", minimum: 0 },
        offices_international: { type: "number", minimum: 0 },
        states_served: { type: "number", minimum: 0 },
        countries_served: { type: "number", minimum: 0 },
        export_percent: { type: "number", minimum: 0, maximum: 100 },
        customer_segments: { type: "string" },
      },
      required: ["plants_national", "offices_national"],
    },
    workforce: {
      type: "object",
      properties: {
        employees: {
          type: "object",
          properties: {
            permanent: {
              type: "object",
              properties: {
                male: { type: "number", minimum: 0 },
                female: { type: "number", minimum: 0 },
                other: { type: "number", minimum: 0 },
                total: { type: "number", minimum: 0 },
              },
            },
            other_than_permanent: {
              type: "object",
              properties: {
                male: { type: "number", minimum: 0 },
                female: { type: "number", minimum: 0 },
                other: { type: "number", minimum: 0 },
                total: { type: "number", minimum: 0 },
              },
            },
          },
        },
        workers: {
          type: "object",
          properties: {
            permanent: {
              type: "object",
              properties: {
                male: { type: "number", minimum: 0 },
                female: { type: "number", minimum: 0 },
                other: { type: "number", minimum: 0 },
                total: { type: "number", minimum: 0 },
              },
            },
            other_than_permanent: {
              type: "object",
              properties: {
                male: { type: "number", minimum: 0 },
                female: { type: "number", minimum: 0 },
                other: { type: "number", minimum: 0 },
                total: { type: "number", minimum: 0 },
              },
            },
          },
        },
        differently_abled: {
          type: "object",
          properties: {
            employees_permanent: { type: "number", minimum: 0 },
            employees_other: { type: "number", minimum: 0 },
            workers_permanent: { type: "number", minimum: 0 },
            workers_other: { type: "number", minimum: 0 },
          },
        },
      },
      required: ["employees"],
    },
    material_issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          issue_name: { type: "string" },
          classification: { type: "string", enum: ["risk", "opportunity"] },
          rationale: { type: "string" },
          mitigation_or_approach: { type: "string" },
          financial_implications: { type: "string" },
        },
        required: ["issue_name", "classification", "rationale"],
      },
    },
  },
  required: ["listed_entity", "workforce", "material_issues"],
} as const;

// ============================================================
// SECTION B: Management and Process Disclosures
// ============================================================

export const sectionBSchema = {
  type: "object",
  title: "Section B: Management and Process Disclosures",
  properties: {
    principle_policies: {
      type: "array",
      items: {
        type: "object",
        properties: {
          principle: { type: "string", enum: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9"] },
          policy_covered: { type: "boolean" },
          board_approved: { type: "boolean" },
          web_link: { type: "string", format: "uri" },
          procedure_translated: { type: "boolean" },
          extends_to_value_chain: { type: "boolean" },
          standards_mapped: { type: "array", items: { type: "string" } },
          goals_targets: { type: "array", items: { type: "string" } },
          performance_summary: { type: "string" },
          independent_assessment: { type: "boolean" },
          assessing_agency: { type: "string" },
          material_not_applicable: { type: "boolean" },
          planned_next_year: { type: "boolean" },
        },
        required: ["principle", "policy_covered"],
      },
      minItems: 9,
      maxItems: 9,
    },
    governance_oversight: {
      type: "object",
      properties: {
        responsible_director: { type: "string" },
        sustainability_committee_exists: { type: "boolean" },
        committee_details: { type: "string" },
        review_frequency: { type: "string" },
        independent_policy_assessment: { type: "boolean" },
      },
      required: ["responsible_director"],
    },
    director_statement: {
      type: "string",
      description: "Statement by director responsible for BRSR report",
    },
  },
  required: ["principle_policies", "governance_oversight"],
} as const;

// ============================================================
// SECTION C: Principle-wise Performance Disclosures
// ============================================================

// ---- P1: Ethics, Transparency and Accountability ----
export const p1Schema = {
  principle: "P1",
  title: "Businesses should conduct and govern themselves with integrity, and in a manner that is Ethical, Transparent and Accountable",
  essential_indicators: {
    e1_training_coverage: {
      title: "Percentage coverage by training and awareness programmes on Principles",
      type: "array",
      items: {
        type: "object",
        properties: {
          segment: { type: "string", enum: ["Board of Directors", "Key Managerial Personnel", "Employees other than BoD and KMPs", "Workers"] },
          training_programmes_count: { type: "number" },
          topics_covered: { type: "string" },
          coverage_percent: { type: "number", minimum: 0, maximum: 100 },
        },
      },
    },
    e2_fines_penalties: {
      title: "Details of fines/penalties/punishment/award/compounding fees/settlement amount paid",
      type: "object",
      properties: {
        monetary: {
          type: "array",
          items: {
            type: "object",
            properties: {
              principle: { type: "string" },
              authority: { type: "string" },
              amount_inr: { type: "number" },
              brief: { type: "string" },
              appeal_preferred: { type: "boolean" },
              type: { type: "string", enum: ["Penalty/Fine", "Settlement", "Compounding fee"] },
            },
          },
        },
        non_monetary: {
          type: "array",
          items: {
            type: "object",
            properties: {
              principle: { type: "string" },
              authority: { type: "string" },
              brief: { type: "string" },
              appeal_preferred: { type: "boolean" },
              punishment: { type: "string" },
            },
          },
        },
      },
    },
    e3_appeals_revision: {
      title: "Details of Appeal/Revision preferred in cases where action has been appealed",
      type: "array",
      items: {
        type: "object",
        properties: {
          case_details: { type: "string" },
          authority: { type: "string" },
        },
      },
    },
    e4_anti_corruption_policy: {
      title: "Anti-corruption or anti-bribery policy",
      type: "object",
      properties: {
        exists: { type: "boolean" },
        web_link: { type: "string", format: "uri" },
        details: { type: "string" },
      },
      required: ["exists"],
    },
    e5_bribery_corruption_actions: {
      title: "Number of Directors/KMPs/employees/workers against whom disciplinary action was taken for bribery/corruption",
      type: "object",
      properties: {
        current_year: {
          type: "object",
          properties: {
            directors: { type: "number" },
            kmps: { type: "number" },
            employees: { type: "number" },
            workers: { type: "number" },
          },
        },
        previous_year: {
          type: "object",
          properties: {
            directors: { type: "number" },
            kmps: { type: "number" },
            employees: { type: "number" },
            workers: { type: "number" },
          },
        },
      },
    },
    e6_conflict_of_interest_complaints: {
      title: "Details of complaints with regard to conflict of interest",
      type: "object",
      properties: {
        directors: { type: "number" },
        kmps: { type: "number" },
        directors_remarks: { type: "string" },
        kmps_remarks: { type: "string" },
        current_year: { type: "number" },
        previous_year: { type: "number" },
      },
    },
    e7_corrective_action_corruption: {
      title: "Corrective action on cases of corruption and conflicts of interest",
      type: "string",
    },
    e8_accounts_payable_days: {
      title: "Number of days of accounts payable",
      type: "object",
      properties: {
        current_year: { type: "number" },
        previous_year: { type: "number" },
      },
    },
    e9_concentration_purchases_sales: {
      title: "Open-ness of business - concentration of purchases and sales",
      type: "object",
      properties: {
        purchases_from_trading_houses_percent: { type: "number" },
        trading_houses_count: { type: "number" },
        top_10_trading_houses_percent: { type: "number" },
        sales_to_dealers_percent: { type: "number" },
        dealers_count: { type: "number" },
        related_party_purchases_percent: { type: "number" },
        related_party_sales_percent: { type: "number" },
        related_party_loans_percent: { type: "number" },
        related_party_investments_percent: { type: "number" },
      },
    },
  },
  leadership_indicators: {
    l1_value_chain_awareness: {
      title: "Awareness programmes conducted for value chain partners on Principles",
      type: "object",
      properties: {
        programmes_count: { type: "number" },
        topics_covered: { type: "string" },
        value_chain_partners_covered_percent: { type: "number" },
      },
    },
    l2_conflict_of_interest_processes: {
      title: "Processes to manage conflict of interest",
      type: "object",
      properties: {
        exists: { type: "boolean" },
        details: { type: "string" },
      },
    },
  },
} as const;

// ---- P2: Sustainable Goods and Services ----
export const p2Schema = {
  principle: "P2",
  title: "Businesses should provide goods and services in a manner that is sustainable and safe",
  essential_indicators: {
    e1_rd_capex_sustainable: {
      title: "Percentage of R&D and capex investments in specific technologies to improve environmental and social impacts",
      type: "object",
      properties: {
        sustainable_rd_percent: { type: "number", minimum: 0, maximum: 100 },
        sustainable_capex_percent: { type: "number", minimum: 0, maximum: 100 },
        previous_year_rd_percent: { type: "number" },
        previous_year_capex_percent: { type: "number" },
        improvements_details: { type: "string" },
      },
    },
    e2_sustainable_sourcing: {
      title: "Sustainable sourcing",
      type: "object",
      properties: {
        procedures_exist: { type: "boolean" },
        inputs_sourced_sustainably_percent: { type: "number", minimum: 0, maximum: 100 },
        supplier_code_of_conduct: { type: "string" },
        vendor_assessments_done: { type: "boolean" },
      },
      required: ["procedures_exist"],
    },
    e3_product_reclaim: {
      title: "Processes to safely reclaim products for reusing, recycling and disposing",
      type: "object",
      properties: {
        plastics: { type: "string" },
        e_waste: { type: "string" },
        hazardous_waste: { type: "string" },
        other_waste: { type: "string" },
      },
    },
    e4_epr_applicable: {
      title: "Whether Extended Producer Responsibility (EPR) is applicable",
      type: "object",
      properties: {
        applicable: { type: "boolean" },
        details: { type: "string" },
      },
      required: ["applicable"],
    },
  },
  leadership_indicators: {
    l1_lca_conducted: {
      title: "Life Cycle Perspective/Assessments (LCA) conducted",
      type: "array",
      items: {
        type: "object",
        properties: {
          nic_code: { type: "string" },
          product_service: { type: "string" },
          percent_turnover: { type: "number" },
          boundary: { type: "string" },
          external_agency: { type: "boolean" },
          public_domain: { type: "boolean" },
          web_link: { type: "string" },
        },
      },
    },
    l2_social_environmental_risks: {
      title: "Significant social or environmental concerns/risks from production or disposal",
      type: "string",
    },
  },
} as const;

// ---- P3: Employee Well-being ----
export const p3Schema = {
  principle: "P3",
  title: "Businesses should respect and promote the well-being of all employees, including those in their value chains",
  essential_indicators: {
    e1_wellbeing_measures_employees: {
      title: "Well-being measures for employees",
      type: "object",
      properties: {
        health_insurance: { type: "number", minimum: 0 },
        health_insurance_percent: { type: "number", minimum: 0, maximum: 100 },
        accident_insurance: { type: "number", minimum: 0 },
        accident_insurance_percent: { type: "number", minimum: 0, maximum: 100 },
        maternity_benefits: { type: "number", minimum: 0 },
        maternity_benefits_percent: { type: "number", minimum: 0, maximum: 100 },
        paternity_benefits: { type: "number", minimum: 0 },
        paternity_benefits_percent: { type: "number", minimum: 0, maximum: 100 },
        day_care: { type: "number", minimum: 0 },
        day_care_percent: { type: "number", minimum: 0, maximum: 100 },
        total_employees: { type: "number" },
      },
    },
    e1_wellbeing_measures_workers: {
      title: "Well-being measures for workers",
      type: "object",
      properties: {
        health_insurance: { type: "number" },
        accident_insurance: { type: "number" },
        maternity_benefits: { type: "number" },
        paternity_benefits: { type: "number" },
        day_care: { type: "number" },
        total_workers: { type: "number" },
      },
    },
    e1_wellbeing_spending: {
      title: "Spending on measures towards well-being of employees and workers",
      type: "object",
      properties: {
        percent_of_revenue_current: { type: "number" },
        percent_of_revenue_previous: { type: "number" },
      },
    },
    e2_retirement_benefits: {
      title: "Details of retirement benefits",
      type: "array",
      items: {
        type: "object",
        properties: {
          benefit: { type: "string", enum: ["PF", "Gratuity", "ESI"] },
          employees_covered_percent_current: { type: "number" },
          workers_covered_percent_current: { type: "number" },
          deposited_current: { type: "boolean" },
          employees_covered_percent_previous: { type: "number" },
          workers_covered_percent_previous: { type: "number" },
          deposited_previous: { type: "boolean" },
        },
      },
    },
    e3_accessible_workplaces: {
      title: "Accessibility of workplaces for differently abled",
      type: "object",
      properties: {
        accessible: { type: "boolean" },
        details: { type: "string" },
      },
      required: ["accessible"],
    },
    e4_equal_opportunity_policy: {
      title: "Equal opportunity policy as per RPwD Act 2016",
      type: "object",
      properties: {
        exists: { type: "boolean" },
        web_link: { type: "string", format: "uri" },
      },
      required: ["exists"],
    },
    e5_parental_leave_retention: {
      title: "Return to work and Retention rates of permanent workers that took parental leave",
      type: "object",
      properties: {
        male_return_rate: { type: "number" },
        male_retention_rate: { type: "number" },
        female_return_rate: { type: "number" },
        female_retention_rate: { type: "number" },
      },
    },
    e6_grievance_mechanism: {
      title: "Grievance redressal mechanism",
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["Permanent Workers", "Other than Permanent Workers", "Permanent Employees", "Other than Permanent Employees"] },
          available: { type: "boolean" },
          details: { type: "string" },
        },
      },
    },
    e7_union_membership: {
      title: "Membership of employees and worker in association(s) or Unions",
      type: "object",
      properties: {
        permanent_employees_total: { type: "number" },
        permanent_employees_union: { type: "number" },
        permanent_employees_union_percent: { type: "number" },
        permanent_workers_total: { type: "number" },
        permanent_workers_union: { type: "number" },
      },
    },
    e8_training_details: {
      title: "Details of training given to employees and workers",
      type: "object",
      properties: {
        employees_male_total: { type: "number" },
        employees_male_health_safety: { type: "number" },
        employees_male_health_safety_percent: { type: "number" },
        employees_male_skill: { type: "number" },
        employees_male_skill_percent: { type: "number" },
        employees_female_total: { type: "number" },
        employees_female_health_safety: { type: "number" },
        employees_female_skill: { type: "number" },
        workers_male_total: { type: "number" },
        workers_female_total: { type: "number" },
      },
    },
    e9_performance_reviews: {
      title: "Performance and career development reviews",
      type: "object",
      properties: {
        employees_male_total: { type: "number" },
        employees_male_reviewed: { type: "number" },
        employees_male_reviewed_percent: { type: "number" },
        employees_female_total: { type: "number" },
        employees_female_reviewed: { type: "number" },
        workers_total: { type: "number" },
      },
    },
    e10_ohs_management_system: {
      title: "Occupational health and safety management system",
      type: "object",
      properties: {
        implemented: { type: "boolean" },
        coverage: { type: "string" },
        hazard_identification_process: { type: "string" },
        workers_report_hazards: { type: "boolean" },
        non_occupational_medical_access: { type: "boolean" },
      },
      required: ["implemented"],
    },
    e11_safety_incidents: {
      title: "Safety related incidents",
      type: "object",
      properties: {
        ltifr_employees_current: { type: "number" },
        ltifr_employees_previous: { type: "number" },
        ltifr_workers_current: { type: "number" },
        ltifr_workers_previous: { type: "number" },
        recordable_injuries_employees_current: { type: "number" },
        recordable_injuries_employees_previous: { type: "number" },
        recordable_injuries_workers_current: { type: "number" },
        recordable_injuries_workers_previous: { type: "number" },
        fatalities_employees_current: { type: "number" },
        fatalities_employees_previous: { type: "number" },
        fatalities_workers_current: { type: "number" },
        fatalities_workers_previous: { type: "number" },
        high_consequence_employees_current: { type: "number" },
        high_consequence_workers_current: { type: "number" },
      },
    },
    e12_safe_workplace_measures: {
      title: "Measures to ensure a safe and healthy workplace",
      type: "string",
    },
    e13_complaints: {
      title: "Complaints on working conditions, health & safety",
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["Working Conditions", "Health & Safety"] },
          filed_current: { type: "number" },
          pending_current: { type: "number" },
          remarks_current: { type: "string" },
          filed_previous: { type: "number" },
          pending_previous: { type: "number" },
        },
      },
    },
    e14_assessment_coverage: {
      title: "% of plants and offices assessed",
      type: "object",
      properties: {
        health_safety_practices: { type: "number", minimum: 0, maximum: 100 },
        working_conditions: { type: "number", minimum: 0, maximum: 100 },
      },
    },
    e15_corrective_actions: {
      title: "Corrective action on safety incidents and risks",
      type: "string",
    },
  },
  leadership_indicators: {
    l1_life_insurance: {
      title: "Life insurance or compensatory package in event of death",
      type: "object",
      properties: {
        employees: { type: "boolean" },
        workers: { type: "boolean" },
      },
    },
    l2_value_chain_statutory_dues: {
      title: "Statutory dues deducted and deposited by value chain partners",
      type: "string",
    },
    l3_rehabilitation: {
      title: "Employees/workers rehabilitated after high consequence work-related injury",
      type: "object",
      properties: {
        affected_employees_current: { type: "number" },
        affected_employees_previous: { type: "number" },
        affected_workers_current: { type: "number" },
        affected_workers_previous: { type: "number" },
        rehabilitated_employees_current: { type: "number" },
        rehabilitated_workers_current: { type: "number" },
      },
    },
    l4_transition_assistance: {
      title: "Transition assistance programs for career endings",
      type: "object",
      properties: {
        exists: { type: "boolean" },
        details: { type: "string" },
      },
    },
    l5_value_chain_assessment: {
      title: "Assessment of value chain partners",
      type: "object",
      properties: {
        health_safety_percent: { type: "number" },
        working_conditions_percent: { type: "number" },
      },
    },
    l6_value_chain_corrective: {
      title: "Corrective actions for value chain partners",
      type: "string",
    },
  },
} as const;

// ---- P4: Stakeholder Engagement ----
export const p4Schema = {
  principle: "P4",
  title: "Businesses should respect the interests of and be responsive to all its stakeholders",
  essential_indicators: {
    e1_stakeholder_identification: {
      title: "Processes for identifying key stakeholder groups",
      type: "string",
    },
    e2_stakeholder_engagement: {
      title: "Stakeholder groups and engagement frequency",
      type: "array",
      items: {
        type: "object",
        properties: {
          group: { type: "string" },
          vulnerable_marginalized: { type: "boolean" },
          channels: { type: "string" },
          frequency: { type: "string" },
          purpose_scope: { type: "string" },
        },
        required: ["group", "frequency"],
      },
    },
  },
  leadership_indicators: {
    l1_board_consultation: {
      title: "Consultation between stakeholders and Board on ESG topics",
      type: "string",
    },
    l2_stakeholder_consultation_esg: {
      title: "Stakeholder consultation for identification and management of ESG topics",
      type: "object",
      properties: {
        used: { type: "boolean" },
        details: { type: "string" },
      },
    },
    l3_vulnerable_stakeholder_engagement: {
      title: "Engagement with vulnerable/marginalized stakeholder groups",
      type: "string",
    },
  },
} as const;

// ---- P5: Human Rights ----
export const p5Schema = {
  principle: "P5",
  title: "Businesses should respect and promote human rights",
  essential_indicators: {
    e1_hr_training: {
      title: "Employees and workers provided training on human rights",
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["Permanent Employees", "Other than Permanent", "Total Employees", "Permanent Workers", "Other than Permanent Workers", "Total Workers"] },
          total: { type: "number" },
          covered: { type: "number" },
          coverage_percent: { type: "number" },
        },
      },
    },
    e2_minimum_wages: {
      title: "Minimum wages paid to employees and workers",
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          gender: { type: "string", enum: ["Male", "Female", "Total"] },
          total: { type: "number" },
          equal_to_minimum: { type: "number" },
          equal_to_minimum_percent: { type: "number" },
          more_than_minimum: { type: "number" },
          more_than_minimum_percent: { type: "number" },
        },
      },
    },
    e3_overtime_wages: {
      title: "Overtime wages paid to employees and workers",
      type: "object",
      properties: {
        employees_above_minimum: { type: "number" },
        employees_above_minimum_percent: { type: "number" },
        workers_above_minimum: { type: "number" },
        workers_above_minimum_percent: { type: "number" },
      },
    },
    e4_gender_wage_ratio: {
      title: "Ratio of remuneration and rewards: Male to Female",
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          remuneration_ratio: { type: "number" },
          rewards_ratio: { type: "number" },
        },
      },
    },
    e5_conditions_of_workers: {
      title: "Conditions of workers (non-permanent)",
      type: "array",
      items: {
        type: "object",
        properties: {
          parameter: { type: "string" },
          permanent_count: { type: "number" },
          permanent_percent: { type: "number" },
          non_permanent_count: { type: "number" },
          non_permanent_percent: { type: "number" },
        },
      },
    },
    e6_sexual_harassment_complaints: {
      title: "Sexual harassment complaints",
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["Employees", "Workers"] },
          filed: { type: "number" },
          disposed: { type: "number" },
          pending: { type: "number" },
        },
      },
    },
    e7_discrimination_complaints: {
      title: "Complaints on discrimination",
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["Employees", "Workers"] },
          filed: { type: "number" },
          disposed: { type: "number" },
          pending: { type: "number" },
        },
      },
    },
    e8_welfare_measures: {
      title: "Welfare measures for workers",
      type: "array",
      items: {
        type: "object",
        properties: {
          measure: { type: "string" },
          permanent_workers: { type: "number" },
          non_permanent_workers: { type: "number" },
        },
      },
    },
    e9_safety_training: {
      title: "Health and safety training for workers",
      type: "object",
      properties: {
        permanent_trained: { type: "number" },
        permanent_percent: { type: "number" },
        non_permanent_trained: { type: "number" },
        non_permanent_percent: { type: "number" },
      },
    },
    e10_hr_reviews: {
      title: "Performance and career development reviews for workers",
      type: "object",
      properties: {
        permanent_reviewed: { type: "number" },
        permanent_percent: { type: "number" },
        non_permanent_reviewed: { type: "number" },
        non_permanent_percent: { type: "number" },
      },
    },
    e11_hr_policy_complaints: {
      title: "Complaints under human rights policies",
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          filed: { type: "number" },
          pending: { type: "number" },
          remarks: { type: "string" },
        },
      },
    },
    e11_hr_assessments: {
      title: "% of plants and offices assessed for human rights",
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    e11_hr_corrective: {
      title: "Corrective action on human rights practices",
      type: "string",
    },
  },
  leadership_indicators: {
    l1_hr_value_chain_assessment: {
      title: "% of value chain partners assessed for human rights",
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    l2_hr_value_chain_corrective: {
      title: "Corrective actions for value chain partners on human rights",
      type: "string",
    },
  },
} as const;

// ---- P6: Environmental Protection ----
export const p6Schema = {
  principle: "P6",
  title: "Businesses should respect and make efforts to protect and restore the environment",
  essential_indicators: {
    e1_energy_consumption: {
      title: "Total energy consumption and energy intensity",
      type: "object",
      properties: {
        renewable_electricity_kj: { type: "number" },
        renewable_fuel_kj: { type: "number" },
        renewable_other_kj: { type: "number" },
        renewable_total_kj: { type: "number" },
        non_renewable_electricity_kj: { type: "number" },
        non_renewable_fuel_kj: { type: "number" },
        non_renewable_other_kj: { type: "number" },
        non_renewable_total_kj: { type: "number" },
        total_energy_kj: { type: "number" },
        energy_intensity_per_rupee: { type: "number" },
        energy_intensity_ppp: { type: "number" },
        energy_intensity_physical: { type: "number" },
        energy_intensity_unit: { type: "string" },
        independent_assurance: { type: "boolean" },
        previous_year_total_kj: { type: "number" },
        previous_year_renewable_kj: { type: "number" },
        previous_year_non_renewable_kj: { type: "number" },
      },
    },
    e2_pat_scheme: {
      title: "Designated consumer under PAT Scheme",
      type: "object",
      properties: {
        applicable: { type: "boolean" },
        details: { type: "string" },
      },
    },
    e3_water_withdrawal: {
      title: "Water withdrawal and consumption",
      type: "object",
      properties: {
        surface_water_kl: { type: "number" },
        groundwater_kl: { type: "number" },
        third_party_kl: { type: "number" },
        seawater_kl: { type: "number" },
        other_kl: { type: "number" },
        total_withdrawal_kl: { type: "number" },
        total_consumption_kl: { type: "number" },
        water_intensity_per_rupee: { type: "number" },
        water_intensity_ppp: { type: "number" },
        water_intensity_physical: { type: "number" },
        independent_assurance: { type: "boolean" },
      },
    },
    e4_water_discharge: {
      title: "Water discharged by destination and treatment",
      type: "object",
      properties: {
        surface_water_kl: { type: "number" },
        groundwater_kl: { type: "number" },
        seawater_kl: { type: "number" },
        third_party_kl: { type: "number" },
        other_kl: { type: "number" },
        total_discharged_kl: { type: "number" },
        treated_kl: { type: "number" },
        untreated_kl: { type: "number" },
        independent_assurance: { type: "boolean" },
      },
    },
    e5_water_recycling: {
      title: "Water withdrawn and recycled/reused",
      type: "object",
      properties: {
        recycled_percent: { type: "number", minimum: 0, maximum: 100 },
        reused_percent: { type: "number", minimum: 0, maximum: 100 },
        treatment_method: { type: "string" },
      },
    },
    e6_ghg_emissions: {
      title: "Greenhouse gas emissions",
      type: "object",
      properties: {
        scope1_tco2e: { type: "number" },
        scope2_tco2e: { type: "number" },
        scope1_intensity: { type: "number" },
        scope2_intensity: { type: "number" },
        scope1_ppp_intensity: { type: "number" },
        scope2_ppp_intensity: { type: "number" },
        scope1_physical_intensity: { type: "number" },
        scope2_physical_intensity: { type: "number" },
        independent_assurance: { type: "boolean" },
        previous_year_scope1: { type: "number" },
        previous_year_scope2: { type: "number" },
      },
    },
    e7_nox_sox_emissions: {
      title: "NOx and SOx emissions",
      type: "object",
      properties: {
        nox_current: { type: "number" },
        nox_previous: { type: "number" },
        sox_current: { type: "number" },
        sox_previous: { type: "number" },
        particulate_matter_current: { type: "number" },
        particulate_matter_previous: { type: "number" },
        unit: { type: "string" },
        independent_assurance: { type: "boolean" },
      },
    },
    e8_ghg_reduction_projects: {
      title: "Projects related to reducing Green House Gas emission",
      type: "object",
      properties: {
        exists: { type: "boolean" },
        details: { type: "string" },
      },
    },
    e9_waste_management: {
      title: "Waste management by category",
      type: "object",
      properties: {
        plastic_waste_mt: { type: "number" },
        e_waste_mt: { type: "number" },
        biomedical_waste_mt: { type: "number" },
        cd_waste_mt: { type: "number" },
        battery_waste_mt: { type: "number" },
        radioactive_waste_mt: { type: "number" },
        other_hazardous_mt: { type: "number" },
        other_non_hazardous_mt: { type: "number" },
        total_waste_mt: { type: "number" },
        waste_intensity_per_rupee: { type: "number" },
        waste_intensity_ppp: { type: "number" },
        waste_intensity_physical: { type: "number" },
        // Recovery by category
        cd_waste_recycled_mt: { type: "number" },
        cd_waste_reused_mt: { type: "number" },
        cd_waste_recovery_total_mt: { type: "number" },
        cd_waste_diverted_from_landfill_percent: { type: "number" },
        independent_assurance: { type: "boolean" },
      },
    },
    e10_waste_management_practices: {
      title: "Waste management practices and strategy",
      type: "string",
    },
    e11_ecologically_sensitive_areas: {
      title: "Operations in/around ecologically sensitive areas",
      type: "array",
      items: {
        type: "object",
        properties: {
          location: { type: "string" },
          operation_type: { type: "string" },
          compliance: { type: "boolean" },
          reasons_non_compliance: { type: "string" },
          corrective_action: { type: "string" },
        },
      },
    },
    e12_environmental_impact_assessment: {
      title: "Environmental impact assessments",
      type: "array",
      items: {
        type: "object",
        properties: {
          project_name: { type: "string" },
          eia_notification: { type: "string" },
          date: { type: "string" },
          external_agency: { type: "boolean" },
          public_domain: { type: "boolean" },
          web_link: { type: "string" },
        },
      },
    },
    e13_environmental_law_compliance: {
      title: "Applicable environmental law/regulations compliance",
      type: "boolean",
    },
  },
  leadership_indicators: {
    l1_water_stress_areas: {
      title: "Facilities in areas of water stress",
      type: "array",
      items: {
        type: "object",
        properties: {
          area_name: { type: "string" },
          operations: { type: "string" },
        },
      },
    },
    l2_scope3_emissions: {
      title: "Total Scope 3 emissions and intensity",
      type: "object",
      properties: {
        scope3_tco2e: { type: "number" },
        scope3_per_rupee: { type: "number" },
        scope3_intensity: { type: "number" },
        scope3_methodology: { type: "string" },
        independent_assurance: { type: "boolean" },
      },
    },
    l3_biodiversity_impact: {
      title: "Impact on biodiversity in ecologically sensitive areas",
      type: "string",
    },
    l4_innovative_initiatives: {
      title: "Initiatives to improve resource efficiency or reduce emissions/effluent/waste",
      type: "array",
      items: {
        type: "object",
        properties: {
          initiative: { type: "string" },
          details: { type: "string" },
          outcome: { type: "string" },
        },
      },
    },
    l5_material_risk_opportunity: {
      title: "Material responsible business conduct issues - environmental and social",
      type: "array",
      items: {
        type: "object",
        properties: {
          issue: { type: "string" },
          classification: { type: "string", enum: ["risk", "opportunity"] },
          rationale: { type: "string" },
          mitigation_approach: { type: "string" },
          financial_implications: { type: "string" },
        },
      },
    },
  },
} as const;

// ---- P7: Policy Advocacy ----
export const p7Schema = {
  principle: "P7",
  title: "Businesses, when engaging in influencing public and regulatory policy, should do so in a manner that is responsible and transparent",
  essential_indicators: {
    e1_affiliations_with_trade: {
      title: "Affiliations with trade and industry chambers/associations",
      type: "boolean",
    },
    e2_directors_on_committees: {
      title: "Number of directors on committees of trade associations",
      type: "number",
    },
    e3_advocacy_paid_beyond_membership: {
      title: "Details of advocacy paid beyond membership fees",
      type: "array",
      items: {
        type: "object",
        properties: {
          association: { type: "string" },
          amount_inr: { type: "number" },
          purpose: { type: "string" },
          beneficiary: { type: "string" },
        },
      },
    },
    e4_advocacy_in_kind: {
      title: "Advocacy in-kind beyond membership fees",
      type: "array",
      items: {
        type: "object",
        properties: {
          association: { type: "string" },
          details: { type: "string" },
        },
      },
    },
    e5_policy_positions_advocated: {
      title: "Specific policy positions advocated",
      type: "array",
      items: {
        type: "object",
        properties: {
          policy: { type: "string" },
          association: { type: "string" },
          stance: { type: "string" },
          outcome: { type: "string" },
        },
      },
    },
    e6_responsible_conduct: {
      title: "Complaints/grievances on P7",
      type: "object",
      properties: {
        filed: { type: "number" },
        pending: { type: "number" },
        remarks: { type: "string" },
      },
    },
  },
  leadership_indicators: {
    l1_memberships_trade_associations: {
      title: "Memberships of trade and industry chambers/associations",
      type: "array",
      items: {
        type: "object",
        properties: {
          association: { type: "string" },
          membership_type: { type: "string" },
        },
      },
    },
  },
} as const;

// ---- P8: Inclusive Growth ----
export const p8Schema = {
  principle: "P8",
  title: "Businesses should promote inclusive growth and equitable development",
  essential_indicators: {
    e1_social_impact_assessments: {
      title: "Social impact assessments conducted",
      type: "array",
      items: {
        type: "object",
        properties: {
          project: { type: "string" },
          location: { type: "string" },
          scope: { type: "string" },
          result: { type: "string" },
        },
      },
    },
    e2_resettlement_rehabilitation: {
      title: "Resettlement and rehabilitation details",
      type: "object",
      properties: {
        displaced_persons: { type: "number" },
        families_rehabilitated: { type: "number" },
        compensation_details: { type: "string" },
      },
    },
    e3_inclusive_procurement: {
      title: "Procedures for inclusive procurement from marginalized/vulnerable groups",
      type: "object",
      properties: {
        exists: { type: "boolean" },
        details: { type: "string" },
        msme_procurement_percent: { type: "number" },
      },
    },
    e4_social_impact_complaints: {
      title: "Complaints/grievances on social impact",
      type: "object",
      properties: {
        filed: { type: "number" },
        pending: { type: "number" },
        remarks: { type: "string" },
      },
    },
  },
  leadership_indicators: {
    l1_value_chain_inclusive_assessment: {
      title: "% of value chain partners assessed for inclusive practices",
      type: "number",
      minimum: 0,
      maximum: 100,
    },
  },
} as const;

// ---- P9: Consumer Value ----
export const p9Schema = {
  principle: "P9",
  title: "Businesses should engage with and provide value to their consumers in a responsible manner",
  essential_indicators: {
    e1_customer_satisfaction: {
      title: "Customer satisfaction surveys and feedback mechanisms",
      type: "object",
      properties: {
        surveys_conducted: { type: "boolean" },
        satisfaction_percent: { type: "number" },
        feedback_channels: { type: "string" },
      },
    },
    e2_product_safety: {
      title: "Product/service safety and quality certifications",
      type: "array",
      items: {
        type: "object",
        properties: {
          product: { type: "string" },
          certification: { type: "string" },
          certifying_agency: { type: "string" },
        },
      },
    },
    e3_data_security: {
      title: "Data security and privacy incidents",
      type: "object",
      properties: {
        breaches: { type: "number" },
        complaints: { type: "number" },
        iso_27001_certified: { type: "boolean" },
        dpdp_compliant: { type: "boolean" },
      },
    },
    e4_complaints_mechanism: {
      title: "Consumer complaints mechanism and resolution",
      type: "object",
      properties: {
        received: { type: "number" },
        resolved: { type: "number" },
        pending: { type: "number" },
        average_resolution_days: { type: "number" },
      },
    },
    e5_unfair_trade_complaints: {
      title: "Complaints on unfair trade practices, irresponsible advertising, anti-competitive behavior",
      type: "object",
      properties: {
        unfair_trade: { type: "number" },
        advertising: { type: "number" },
        anti_competitive: { type: "number" },
        privacy: { type: "number" },
        cyber_security: { type: "number" },
      },
    },
    e6_awareness_programmes: {
      title: "Awareness programmes for consumers on safe and responsible usage",
      type: "array",
      items: {
        type: "object",
        properties: {
          topic: { type: "string" },
          participants: { type: "number" },
          frequency: { type: "string" },
        },
      },
    },
  },
  leadership_indicators: {
    l1_extended_responsibility: {
      title: "Extended Producer Responsibility (EPR) compliance",
      type: "object",
      properties: {
        applicable: { type: "boolean" },
        targets_met: { type: "boolean" },
        details: { type: "string" },
      },
    },
    l2_responsible_value_chain: {
      title: "% of value chain partners assessed for responsible business conduct",
      type: "number",
      minimum: 0,
      maximum: 100,
    },
  },
} as const;

// ============================================================
// Complete BRSR Indicator Registry
// ============================================================

export const brsrIndicatorRegistry = {
  section_a: sectionASchema,
  section_b: sectionBSchema,
  section_c: {
    principles: {
      p1: p1Schema,
      p2: p2Schema,
      p3: p3Schema,
      p4: p4Schema,
      p5: p5Schema,
      p6: p6Schema,
      p7: p7Schema,
      p8: p8Schema,
      p9: p9Schema,
    },
  },
} as const;

// ============================================================
// Indicator Count Summary (for validation)
// ============================================================

export const brsrIndicatorCounts = {
  section_a_fields: 30,
  section_b_fields: 12,
  principles: {
    p1: { essential: 9, leadership: 2 },
    p2: { essential: 4, leadership: 2 },
    p3: { essential: 15, leadership: 6 },
    p4: { essential: 2, leadership: 3 },
    p5: { essential: 13, leadership: 2 },
    p6: { essential: 13, leadership: 5 },
    p7: { essential: 6, leadership: 1 },
    p8: { essential: 4, leadership: 1 },
    p9: { essential: 6, leadership: 2 },
  },
  total_essential: 72,
  total_leadership: 24,
  total_indicators: 96,
} as const;
