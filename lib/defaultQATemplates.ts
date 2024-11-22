import { CASE_CATEGORIES } from "./constants/caseTypes"

export const defaultQATemplates = {
  // Criminal Cases
  Narcotics: {
    name: "Narcotics Investigation QA Template",
    type: "ORGANIZATION" as const,
    checklistItems: [
      {
        name: "Chain of Custody Documentation",
        description: "Verify all evidence handling is properly documented",
        category: "Evidence Handling",
        required: true,
        order: 0,
      },
      {
        name: "Drug Testing Documentation",
        description: "Confirm lab results and testing procedures are documented",
        category: "Evidence Analysis",
        required: true,
        order: 1,
      },
      {
        name: "Search Warrant Review",
        description: "Review search warrant execution and documentation",
        category: "Legal Documentation",
        required: true,
        order: 2,
      },
      {
        name: "Witness Statements",
        description: "Verify all witness statements are properly documented",
        category: "Documentation",
        required: true,
        order: 3,
      },
      {
        name: "Evidence Photos",
        description: "Check quality and completeness of evidence photographs",
        category: "Evidence Documentation",
        required: true,
        order: 4,
      }
    ]
  },

  Cybercrime: {
    name: "Cybercrime Investigation QA Template",
    type: "ORGANIZATION" as const,
    checklistItems: [
      {
        name: "Digital Evidence Collection",
        description: "Verify proper digital evidence collection procedures",
        category: "Evidence Collection",
        required: true,
        order: 0,
      },
      {
        name: "Hash Verification",
        description: "Confirm hash values for all digital evidence",
        category: "Evidence Integrity",
        required: true,
        order: 1,
      },
      {
        name: "Network Analysis",
        description: "Review network traffic analysis documentation",
        category: "Technical Analysis",
        required: true,
        order: 2,
      },
      {
        name: "Malware Analysis",
        description: "Check malware analysis procedures and findings",
        category: "Technical Analysis",
        required: true,
        order: 3,
      },
      {
        name: "Digital Chain of Custody",
        description: "Verify digital evidence chain of custody",
        category: "Evidence Handling",
        required: true,
        order: 4,
      }
    ]
  },

  "Financial Crime": {
    name: "Financial Crime Investigation QA Template",
    type: "ORGANIZATION" as const,
    checklistItems: [
      {
        name: "Financial Records Review",
        description: "Verify all financial records are properly analyzed",
        category: "Documentation",
        required: true,
        order: 0,
      },
      {
        name: "Transaction Analysis",
        description: "Confirm suspicious transaction analysis",
        category: "Analysis",
        required: true,
        order: 1,
      },
      {
        name: "Bank Statement Review",
        description: "Review all relevant bank statements",
        category: "Documentation",
        required: true,
        order: 2,
      },
      {
        name: "Asset Tracking",
        description: "Verify asset tracking documentation",
        category: "Analysis",
        required: true,
        order: 3,
      }
    ]
  },

  // Corporate Cases
  "Data Breach": {
    name: "Data Breach Investigation QA Template",
    type: "ORGANIZATION" as const,
    checklistItems: [
      {
        name: "Incident Timeline",
        description: "Verify incident timeline documentation",
        category: "Documentation",
        required: true,
        order: 0,
      },
      {
        name: "System Logs Review",
        description: "Check system logs analysis",
        category: "Technical Analysis",
        required: true,
        order: 1,
      },
      {
        name: "Data Impact Assessment",
        description: "Review data impact assessment",
        category: "Analysis",
        required: true,
        order: 2,
      },
      {
        name: "Security Measures Review",
        description: "Verify security measures documentation",
        category: "Technical Review",
        required: true,
        order: 3,
      }
    ]
  },

  "Employee Misconduct": {
    name: "Employee Misconduct Investigation QA Template",
    type: "ORGANIZATION" as const,
    checklistItems: [
      {
        name: "Interview Documentation",
        description: "Verify all interviews are properly documented",
        category: "Documentation",
        required: true,
        order: 0,
      },
      {
        name: "Policy Review",
        description: "Check relevant policy documentation",
        category: "Documentation",
        required: true,
        order: 1,
      },
      {
        name: "Evidence Collection",
        description: "Verify proper evidence collection procedures",
        category: "Evidence Handling",
        required: true,
        order: 2,
      },
      {
        name: "HR Documentation",
        description: "Review HR-related documentation",
        category: "Documentation",
        required: true,
        order: 3,
      }
    ]
  },

  // Civil Cases
  "Contract Dispute": {
    name: "Contract Dispute Investigation QA Template",
    type: "ORGANIZATION" as const,
    checklistItems: [
      {
        name: "Contract Review",
        description: "Verify contract analysis documentation",
        category: "Documentation",
        required: true,
        order: 0,
      },
      {
        name: "Communication Review",
        description: "Check relevant communication documentation",
        category: "Documentation",
        required: true,
        order: 1,
      },
      {
        name: "Timeline Analysis",
        description: "Verify timeline documentation",
        category: "Analysis",
        required: true,
        order: 2,
      },
      {
        name: "Document Authentication",
        description: "Confirm document authentication procedures",
        category: "Evidence Handling",
        required: true,
        order: 3,
      }
    ]
  }
}

// Helper function to get template by case type
export function getDefaultTemplateForCaseType(caseType: string) {
  return defaultQATemplates[caseType as keyof typeof defaultQATemplates] || null
}

// Helper function to get all default templates
export function getAllDefaultTemplates() {
  return Object.values(defaultQATemplates)
}
