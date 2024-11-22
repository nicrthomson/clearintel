export const defaultTemplate = {
  name: "Digital Forensics Investigation",
  checklistItems: [
    {
      name: "Evidence Intake Documentation",
      description: "Document all received evidence details and condition",
      category: "Evidence Acquisition",
      required: true,
      order: 1,
    },
    {
      name: "Write Blocker Verification",
      description: "Verify write blocker functionality before acquisition",
      category: "Evidence Acquisition",
      required: true,
      order: 2,
    },
    {
      name: "Hash Verification",
      description: "Calculate and verify MD5/SHA256 hashes",
      category: "Evidence Acquisition",
      required: true,
      order: 3,
    },
    {
      name: "Chain of Custody Documentation",
      description: "Update chain of custody documentation",
      category: "Documentation",
      required: true,
      order: 4,
    },
    {
      name: "Evidence Analysis Plan",
      description: "Create detailed analysis plan",
      category: "Analysis",
      required: true,
      order: 5,
    },
    {
      name: "Data Recovery",
      description: "Perform data recovery procedures if needed",
      category: "Analysis",
      required: false,
      order: 6,
    },
    {
      name: "Timeline Analysis",
      description: "Create and analyze system timeline",
      category: "Analysis",
      required: true,
      order: 7,
    },
    {
      name: "Artifact Analysis",
      description: "Analyze relevant system artifacts",
      category: "Analysis",
      required: true,
      order: 8,
    },
    {
      name: "Report Generation",
      description: "Generate comprehensive forensic report",
      category: "Reporting",
      required: true,
      order: 9,
    },
    {
      name: "Peer Review",
      description: "Complete peer review of findings",
      category: "Quality Assurance",
      required: true,
      order: 10,
    }
  ]
}; 