const defaultQATemplates = {
  // Criminal Cases

  CSAM: {
      name: "Child Sexual Abuse Material",
      type: "ORGANIZATION",
      checklistItems: [
        // Pre-Investigation Phase
        {
          name: "Case Authorization and Scope Definition",
          description: "Ensure the investigation is properly authorized with clear scope, jurisdiction, and interagency cooperation agreements if necessary.",
          category: "Pre-Investigation",
          required: true,
          order: 0,
        },
        {
          name: "Legal Documentation Preparation",
          description: "Obtain all necessary legal documents such as search warrants, subpoenas, and court orders, ensuring they specifically address digital evidence related to CSAM.",
          category: "Pre-Investigation",
          required: true,
          order: 1,
        },
        {
          name: "Specialized Training Verification",
          description: "Confirm that all personnel involved have received specialized training in handling CSAM cases, including understanding psychological impacts and legal considerations.",
          category: "Pre-Investigation",
          required: true,
          order: 2,
        },
        {
          name: "Wellness Resources Briefing",
          description: "Provide information on mental health resources and support systems available to investigators due to the sensitive nature of CSAM content.",
          category: "Pre-Investigation",
          required: true,
          order: 3,
        },
  
        // Evidence Collection Phase
        {
          name: "Digital Evidence Preservation",
          description: "Use forensically sound methods to seize and preserve digital devices and storage media, ensuring data integrity.",
          category: "Collection",
          required: true,
          order: 4,
        },
        {
          name: "Network Data Acquisition",
          description: "Collect network logs, ISP records, and online activity data relevant to the distribution or possession of CSAM.",
          category: "Collection",
          required: true,
          order: 5,
        },
        {
          name: "Cloud and Online Account Preservation",
          description: "Secure and preserve data from cloud services and online accounts using appropriate legal processes.",
          category: "Collection",
          required: true,
          order: 6,
        },
        {
          name: "Metadata Preservation",
          description: "Ensure metadata associated with files and communications is preserved for analysis and attribution.",
          category: "Collection",
          required: true,
          order: 7,
        },
  
        // Analysis Phase
        {
          name: "Forensic Imaging and Verification",
          description: "Create forensic images of all digital media and verify hashes to ensure exact duplicates for analysis.",
          category: "Analysis",
          required: true,
          order: 8,
        },
        {
          name: "Content Identification and Categorization",
          description: "Use specialized software to identify and categorize CSAM content, minimizing exposure to investigators.",
          category: "Analysis",
          required: true,
          order: 9,
        },
        {
          name: "Hash Value Comparison",
          description: "Compare file hashes against known CSAM databases (e.g., Project VIC, NCMEC) to identify previously cataloged material.",
          category: "Analysis",
          required: true,
          order: 10,
        },
        {
          name: "Artifact and Metadata Analysis",
          description: "Analyze system artifacts and metadata to determine file creation dates, access history, and file origins.",
          category: "Analysis",
          required: true,
          order: 11,
        },
        {
          name: "Communication Analysis",
          description: "Examine emails, chat logs, and social media interactions for evidence of distribution or networking related to CSAM.",
          category: "Analysis",
          required: true,
          order: 12,
        },
        {
          name: "User Attribution",
          description: "Establish links between the suspect and the digital evidence to prove knowledge and possession.",
          category: "Analysis",
          required: true,
          order: 13,
        },
  
        // Chain of Custody Phase
        {
          name: "Evidence Handling Documentation",
          description: "Maintain detailed records of all evidence handling, including transfers, storage conditions, and access logs.",
          category: "Chain of Custody",
          required: true,
          order: 14,
        },
        {
          name: "Secure Evidence Storage",
          description: "Store all evidence in a secure location with limited access to authorized personnel only.",
          category: "Chain of Custody",
          required: true,
          order: 15,
        },
        {
          name: "Exhibit Labeling and Inventory",
          description: "Label all exhibits clearly and maintain an accurate inventory for easy tracking and reference.",
          category: "Chain of Custody",
          required: true,
          order: 16,
        },
  
        // Documentation Phase
        {
          name: "Investigative Report Writing",
          description: "Prepare detailed reports documenting all investigative actions, findings, and methodologies used.",
          category: "Documentation",
          required: true,
          order: 17,
        },
        {
          name: "Legal Documentation Filing",
          description: "Ensure all legal documents, such as warrants and subpoenas, are properly filed and accessible for review.",
          category: "Documentation",
          required: true,
          order: 18,
        },
        {
          name: "Interagency Communication Records",
          description: "Document all communications with other agencies or organizations involved in the investigation.",
          category: "Documentation",
          required: true,
          order: 19,
        },
        {
          name: "Victim Identification Efforts",
          description: "Record all efforts made to identify and safeguard potential victims, collaborating with appropriate child protection agencies.",
          category: "Documentation",
          required: true,
          order: 20,
        },
  
        // Review Phase
        {
          name: "Technical Peer Review",
          description: "Have forensic findings and methodologies reviewed by another qualified digital forensic examiner.",
          category: "Review",
          required: true,
          order: 21,
        },
        {
          name: "Legal Compliance Verification",
          description: "Ensure all investigative activities comply with applicable laws, policies, and ethical standards.",
          category: "Review",
          required: true,
          order: 22,
        },
        {
          name: "Psychological Impact Assessment",
          description: "Conduct debriefings to assess the psychological well-being of investigators and provide support if needed.",
          category: "Review",
          required: true,
          order: 23,
        },
        {
          name: "Prosecutorial Consultation",
          description: "Engage with prosecutors to review the case, discuss charges, and prepare for court proceedings.",
          category: "Review",
          required: true,
          order: 24,
        },
  
        // Post-Investigation Phase
        {
          name: "Evidence Disposal Procedures",
          description: "Follow legal guidelines for the long-term storage or destruction of CSAM evidence post-trial.",
          category: "Post-Investigation",
          required: true,
          order: 25,
        },
        {
          name: "Case Debrief and Lessons Learned",
          description: "Conduct a debriefing session to discuss the investigation's successes and areas for improvement.",
          category: "Post-Investigation",
          required: true,
          order: 26,
        },
        {
          name: "Policy and Procedure Updates",
          description: "Recommend updates to policies or procedures based on insights gained during the investigation.",
          category: "Post-Investigation",
          required: false,
          order: 27,
        },
      ],
  },
  

  IdentityTheft: {
    name: "Identity Theft",
    type: "ORGANIZATION",
    checklistItems: [
      // Pre-Investigation Phase
      {
        name: "Case Authorization and Scope Definition",
        description: "Ensure the investigation is authorized and clearly define its scope, including jurisdictional considerations.",
        category: "Pre-Investigation",
        required: true,
        order: 0,
      },
      {
        name: "Victim Intake and Verification",
        description: "Collect initial reports from victims, verify their identities, and gather consent for accessing personal records.",
        category: "Pre-Investigation",
        required: true,
        order: 1,
      },
      {
        name: "Legal Documentation Preparation",
        description: "Prepare and obtain necessary legal documents such as subpoenas and warrants for data collection.",
        category: "Pre-Investigation",
        required: true,
        order: 2,
      },

      // Evidence Collection Phase
      {
        name: "Digital Evidence Acquisition",
        description: "Collect digital artifacts including phishing emails, malware samples, and compromised devices using forensically sound methods.",
        category: "Collection",
        required: true,
        order: 3,
      },
      {
        name: "Network and System Logs Retrieval",
        description: "Obtain logs from ISPs, financial institutions, and affected systems to trace unauthorized access.",
        category: "Collection",
        required: true,
        order: 4,
      },
      {
        name: "Financial Records Collection",
        description: "Gather bank statements, credit reports, and transaction histories with proper legal authorization.",
        category: "Collection",
        required: true,
        order: 5,
      },
      {
        name: "Social Media and Online Presence Analysis",
        description: "Collect information from social media platforms and online services related to the suspect's activities.",
        category: "Collection",
        required: false,
        order: 6,
      },

      // Analysis Phase
      {
        name: "Digital Forensic Examination",
        description: "Perform in-depth analysis of digital evidence to identify malware, hacking methods, and data exfiltration techniques.",
        category: "Analysis",
        required: true,
        order: 7,
      },
      {
        name: "Data Correlation and Timeline Reconstruction",
        description: "Correlate data from various sources to reconstruct the sequence of events and identify patterns.",
        category: "Analysis",
        required: true,
        order: 8,
      },
      {
        name: "IP Address and Geolocation Tracking",
        description: "Analyze IP addresses and geolocation data to pinpoint the suspect's physical location.",
        category: "Analysis",
        required: true,
        order: 9,
      },
      {
        name: "Financial Transaction Analysis",
        description: "Trace unauthorized transactions to uncover money flow and potential accomplices.",
        category: "Analysis",
        required: true,
        order: 10,
      },

      // Chain of Custody Phase
      {
        name: "Evidence Handling and Documentation",
        description: "Maintain strict chain of custody records for all physical and digital evidence collected.",
        category: "Chain of Custody",
        required: true,
        order: 11,
      },

      // Documentation Phase
      {
        name: "Investigative Reports Compilation",
        description: "Document all findings, methodologies, and analysis in detailed reports.",
        category: "Documentation",
        required: true,
        order: 12,
      },
      {
        name: "Legal Documentation Filing",
        description: "Ensure all legal documents are properly filed, including evidence submission forms and court orders.",
        category: "Documentation",
        required: true,
        order: 13,
      },

      // Review Phase
      {
        name: "Technical Peer Review",
        description: "Have all digital forensic work reviewed by a peer or supervisor to ensure accuracy and completeness.",
        category: "Review",
        required: true,
        order: 14,
      },
      {
        name: "Legal Compliance Verification",
        description: "Confirm that all investigative activities comply with relevant laws, regulations, and agency policies.",
        category: "Review",
        required: true,
        order: 15,
      },
      {
        name: "Case Summary and Prosecutorial Preparation",
        description: "Prepare a comprehensive case summary for prosecutorial review, including recommendations for charges.",
        category: "Review",
        required: true,
        order: 16,
      },
    ],
  },

  Cyberstalking: {
    name: "Cyberstalking",
    type: "ORGANIZATION",
    checklistItems: [
      // Pre-Investigation Phase
      {
        name: "Complaint Assessment",
        description: "Evaluate the victim's complaint to determine the credibility and severity of the cyberstalking incident.",
        category: "Pre-Investigation",
        required: true,
        order: 0,
      },
      {
        name: "Legal Authorization",
        description: "Obtain necessary legal approvals, including warrants or court orders, to collect digital evidence.",
        category: "Pre-Investigation",
        required: true,
        order: 1,
      },
      {
        name: "Victim Safety Planning",
        description: "Develop a safety plan for the victim, including recommendations on digital privacy measures.",
        category: "Pre-Investigation",
        required: true,
        order: 2,
      },

      // Evidence Collection Phase
      {
        name: "Digital Communications Collection",
        description: "Collect emails, messages, social media posts, and other communications from the victim and relevant platforms.",
        category: "Collection",
        required: true,
        order: 3,
      },
      {
        name: "Metadata Preservation",
        description: "Ensure metadata associated with digital communications is preserved for analysis.",
        category: "Collection",
        required: true,
        order: 4,
      },
      {
        name: "Device Forensic Imaging",
        description: "Create forensic images of devices used by the victim and, if accessible, the suspect.",
        category: "Collection",
        required: true,
        order: 5,
      },
      {
        name: "Online Activity Monitoring",
        description: "Monitor online activities related to the suspect, including forum posts and social media interactions.",
        category: "Collection",
        required: false,
        order: 6,
      },

      // Analysis Phase
      {
        name: "Digital Communication Analysis",
        description: "Analyze collected communications to identify patterns, threats, and the suspect's modus operandi.",
        category: "Analysis",
        required: true,
        order: 7,
      },
      {
        name: "IP Address and Account Tracing",
        description: "Trace IP addresses and online accounts used by the suspect to establish identity and location.",
        category: "Analysis",
        required: true,
        order: 8,
      },
      {
        name: "Link Analysis",
        description: "Perform link analysis to connect the suspect to multiple incidents or victims.",
        category: "Analysis",
        required: false,
        order: 9,
      },
      {
        name: "Behavioral Analysis",
        description: "Assess the suspect's behavior for escalation patterns and potential risks.",
        category: "Analysis",
        required: true,
        order: 10,
      },

      // Chain of Custody Phase
      {
        name: "Evidence Documentation",
        description: "Maintain detailed records of evidence collection, handling, and storage procedures.",
        category: "Chain of Custody",
        required: true,
        order: 11,
      },

      // Documentation Phase
      {
        name: "Investigative Findings Report",
        description: "Document all analysis results, including supporting evidence and expert interpretations.",
        category: "Documentation",
        required: true,
        order: 12,
      },
      {
        name: "Victim Impact Statement Preparation",
        description: "Assist the victim in preparing an impact statement, if appropriate.",
        category: "Documentation",
        required: false,
        order: 13,
      },

      // Review Phase
      {
        name: "Technical Review",
        description: "Have all forensic analyses reviewed by a qualified peer to ensure methodological soundness.",
        category: "Review",
        required: true,
        order: 14,
      },
      {
        name: "Legal Review",
        description: "Confirm all investigative steps meet legal standards and respect privacy rights.",
        category: "Review",
        required: true,
        order: 15,
      },
      {
        name: "Prosecutorial Consultation",
        description: "Consult with prosecutors to prepare for potential charges and courtroom presentation.",
        category: "Review",
        required: true,
        order: 16,
      },
    ],
  },

  Narcotics: {
    name: "Narcotics",
    type: "ORGANIZATION",
    checklistItems: [
      // Pre-Investigation Phase
      {
        name: "Investigation Authorization",
        description: "Verify proper authorization documentation, including warrants, probable cause affidavits, and jurisdictional requirements.",
        category: "Pre-Investigation",
        required: true,
        order: 0,
      },
      {
        name: "Operational Planning",
        description: "Review operational plan, risk assessment, and resource allocation for search/seizure activities.",
        category: "Pre-Investigation",
        required: true,
        order: 1,
      },
      {
        name: "Digital Intelligence Review",
        description: "Verify preliminary digital intelligence gathering, including social media analysis and communication patterns.",
        category: "Pre-Investigation",
        required: true,
        order: 2,
      },

      // Surveillance Phase
      {
        name: "Physical Surveillance Documentation",
        description: "Review surveillance logs, photos, videos, and GPS tracking data with proper timestamps and locations.",
        category: "Surveillance",
        required: true,
        order: 3,
      },
      {
        name: "Electronic Surveillance Review",
        description: "Verify proper documentation of authorized wiretaps, pen registers, and electronic monitoring.",
        category: "Surveillance",
        required: true,
        order: 4,
      },
      {
        name: "Financial Surveillance",
        description: "Review documentation of financial monitoring, including suspicious transaction reports and money flow analysis.",
        category: "Surveillance",
        required: true,
        order: 5,
      },

      // Evidence Collection Phase
      {
        name: "Physical Evidence Collection",
        description: "Verify proper collection procedures for controlled substances, including field testing and packaging protocols.",
        category: "Collection",
        required: true,
        order: 6,
      },
      {
        name: "Digital Evidence Collection",
        description: "Review collection of digital evidence including phones, computers, and storage devices with proper write blocking.",
        category: "Collection",
        required: true,
        order: 7,
      },
      {
        name: "Documentation Collection",
        description: "Verify collection of relevant documents including ledgers, notes, and financial records.",
        category: "Collection",
        required: true,
        order: 8,
      },
      {
        name: "Asset Documentation",
        description: "Review documentation of seized assets, currency, and property with proper photographs and inventories.",
        category: "Collection",
        required: true,
        order: 9,
      },

      // Analysis Phase
      {
        name: "Drug Analysis",
        description: "Verify proper laboratory testing procedures, including weight, purity testing, and chemical analysis.",
        category: "Analysis",
        required: true,
        order: 10,
      },
      {
        name: "Digital Device Analysis",
        description: "Review analysis of seized digital devices, including call records, messages, and location data.",
        category: "Analysis",
        required: true,
        order: 11,
      },
      {
        name: "Financial Analysis",
        description: "Verify analysis of financial records, including money laundering patterns and unexplained wealth.",
        category: "Analysis",
        required: true,
        order: 12,
      },
      {
        name: "Network Analysis",
        description: "Review analysis of criminal network connections and communication patterns.",
        category: "Analysis",
        required: true,
        order: 13,
      },

      // Chain of Custody Phase
      {
        name: "Physical Evidence Tracking",
        description: "Verify complete chain of custody documentation for all physical evidence, including controlled substances.",
        category: "Chain of Custody",
        required: true,
        order: 14,
      },
      {
        name: "Digital Evidence Tracking",
        description: "Review chain of custody for all digital evidence, including access logs and storage conditions.",
        category: "Chain of Custody",
        required: true,
        order: 15,
      },
      {
        name: "Laboratory Submission Tracking",
        description: "Verify proper documentation of all laboratory submissions and results tracking.",
        category: "Chain of Custody",
        required: true,
        order: 16,
      },

      // Documentation Phase
      {
        name: "Investigation Documentation",
        description: "Review comprehensive case documentation, including investigative steps, findings, and conclusions.",
        category: "Documentation",
        required: true,
        order: 17,
      },
      {
        name: "Interview Documentation",
        description: "Verify proper documentation of all witness and suspect interviews, including recordings and transcripts.",
        category: "Documentation",
        required: true,
        order: 18,
      },
      {
        name: "Photo/Video Documentation",
        description: "Review all photo and video evidence documentation, including metadata and storage protocols.",
        category: "Documentation",
        required: true,
        order: 19,
      },

      // Review Phase
      {
        name: "Legal Review",
        description: "Verify compliance with all legal requirements and procedures throughout investigation.",
        category: "Review",
        required: true,
        order: 20,
      },
      {
        name: "Technical Review",
        description: "Review all technical findings and analysis results for accuracy and completeness.",
        category: "Review",
        required: true,
        order: 21,
      },
      {
        name: "Final Report Review",
        description: "Confirm final report includes all required elements and meets prosecutorial standards.",
        category: "Review",
        required: true,
        order: 22,
      },
    ],
  },

  "Human Trafficking": {
    name: "Human Trafficking",
    type: "ORGANIZATION",
    checklistItems: [
      // Pre-Investigation Phase
      {
        name: "Case Authorization",
        description: "Verify proper authorization for investigation, including interagency agreements and jurisdictional considerations.",
        category: "Pre-Investigation",
        required: true,
        order: 0,
      },
      {
        name: "Victim Support Planning",
        description: "Ensure planning for victim support services, including medical, legal, and psychological assistance.",
        category: "Pre-Investigation",
        required: true,
        order: 1,
      },
      {
        name: "Cultural Sensitivity Training",
        description: "Confirm investigators have received training on cultural sensitivity and victim-centered approaches.",
        category: "Pre-Investigation",
        required: true,
        order: 2,
      },

      // Surveillance Phase
      {
        name: "Intelligence Gathering",
        description: "Review collection of intelligence on trafficking operations, routes, and key individuals.",
        category: "Surveillance",
        required: true,
        order: 3,
      },
      {
        name: "Electronic Surveillance",
        description: "Verify legal authorization and documentation of electronic surveillance activities.",
        category: "Surveillance",
        required: true,
        order: 4,
      },
      {
        name: "Undercover Operations",
        description: "Review planning and execution of undercover operations, ensuring safety protocols are in place.",
        category: "Surveillance",
        required: true,
        order: 5,
      },

      // Evidence Collection Phase
      {
        name: "Victim Interviews",
        description: "Ensure interviews are conducted by trained personnel in a safe environment, with proper documentation.",
        category: "Collection",
        required: true,
        order: 6,
      },
      {
        name: "Physical Evidence Collection",
        description: "Verify collection of physical evidence such as passports, IDs, and personal belongings.",
        category: "Collection",
        required: true,
        order: 7,
      },
      {
        name: "Digital Evidence Collection",
        description: "Review collection of digital evidence including communications, transaction records, and online advertisements.",
        category: "Collection",
        required: true,
        order: 8,
      },

      // Analysis Phase
      {
        name: "Financial Analysis",
        description: "Verify tracing of financial transactions linked to trafficking activities.",
        category: "Analysis",
        required: true,
        order: 9,
      },
      {
        name: "Communication Analysis",
        description: "Review analysis of communication networks among traffickers.",
        category: "Analysis",
        required: true,
        order: 10,
      },
      {
        name: "Victimology Analysis",
        description: "Analyze victim profiles to identify patterns and risk factors.",
        category: "Analysis",
        required: true,
        order: 11,
      },
      {
        name: "Travel and Immigration Analysis",
        description: "Verify analysis of travel documents and immigration records to establish movement patterns.",
        category: "Analysis",
        required: true,
        order: 12,
      },

      // Chain of Custody Phase
      {
        name: "Evidence Handling",
        description: "Ensure all evidence is properly stored and tracked with complete chain of custody documentation.",
        category: "Chain of Custody",
        required: true,
        order: 13,
      },

      // Documentation Phase
      {
        name: "Case File Documentation",
        description: "Review completeness of case files, including all reports, evidence logs, and correspondence.",
        category: "Documentation",
        required: true,
        order: 14,
      },
      {
        name: "Interagency Communication Records",
        description: "Verify documentation of communications with other agencies and organizations.",
        category: "Documentation",
        required: true,
        order: 15,
      },
      {
        name: "Victim Support Documentation",
        description: "Ensure all victim support activities are documented, including referrals and consent forms.",
        category: "Documentation",
        required: true,
        order: 16,
      },

      // Review Phase
      {
        name: "Legal Compliance Review",
        description: "Verify adherence to legal standards, including victim rights and anti-trafficking laws.",
        category: "Review",
        required: true,
        order: 17,
      },
      {
        name: "Case Analysis Review",
        description: "Review analysis conclusions for accuracy and support by evidence.",
        category: "Review",
        required: true,
        order: 18,
      },
      {
        name: "Final Report Preparation",
        description: "Confirm final report is comprehensive, victim-sensitive, and suitable for prosecution.",
        category: "Review",
        required: true,
        order: 19,
      },
    ],
  },

  Cybercrime: {
    name: "Cybercrime",
    type: "ORGANIZATION",
    checklistItems: [
      // Pre-Investigation Phase
      {
        name: "Legal Authorization Verification",
        description: "Ensure all necessary warrants, court orders, and consents are obtained for digital investigations.",
        category: "Pre-Investigation",
        required: true,
        order: 0,
      },
      {
        name: "Incident Response Coordination",
        description: "Review coordination with incident response teams to secure systems and preserve evidence.",
        category: "Pre-Investigation",
        required: true,
        order: 1,
      },
      {
        name: "Cyber Threat Intelligence Gathering",
        description: "Verify collection of intelligence on potential cyber threats and vulnerabilities.",
        category: "Pre-Investigation",
        required: true,
        order: 2,
      },

      // Evidence Collection Phase
      {
        name: "Digital Evidence Acquisition",
        description: "Ensure use of forensically sound methods for imaging and collecting digital evidence.",
        category: "Collection",
        required: true,
        order: 3,
      },
      {
        name: "Network Data Capture",
        description: "Review procedures for capturing network traffic, logs, and metadata.",
        category: "Collection",
        required: true,
        order: 4,
      },
      {
        name: "Malware Collection",
        description: "Verify proper collection and handling of suspected malware samples.",
        category: "Collection",
        required: true,
        order: 5,
      },

      // Analysis Phase
      {
        name: "Forensic Analysis",
        description: "Review detailed analysis of digital evidence, including file systems, registries, and artifacts.",
        category: "Analysis",
        required: true,
        order: 6,
      },
      {
        name: "Malware Analysis",
        description: "Verify dynamic and static analysis of malware to understand functionality and origin.",
        category: "Analysis",
        required: true,
        order: 7,
      },
      {
        name: "Network Analysis",
        description: "Review analysis of network activity to identify intrusion vectors and data exfiltration.",
        category: "Analysis",
        required: true,
        order: 8,
      },
      {
        name: "Attribution Analysis",
        description: "Assess efforts to attribute cyber activities to specific individuals or groups.",
        category: "Analysis",
        required: true,
        order: 9,
      },

      // Chain of Custody Phase
      {
        name: "Digital Evidence Tracking",
        description: "Ensure meticulous chain of custody records for all digital evidence.",
        category: "Chain of Custody",
        required: true,
        order: 10,
      },

      // Documentation Phase
      {
        name: "Incident Documentation",
        description: "Verify comprehensive documentation of the cyber incident, including timelines and actions taken.",
        category: "Documentation",
        required: true,
        order: 11,
      },
      {
        name: "Legal Correspondence",
        description: "Review all legal correspondence, including mutual legal assistance requests if international.",
        category: "Documentation",
        required: true,
        order: 12,
      },

      // Review Phase
      {
        name: "Legal Compliance Review",
        description: "Ensure all investigative steps comply with cyber laws and privacy regulations.",
        category: "Review",
        required: true,
        order: 13,
      },
      {
        name: "Technical Findings Verification",
        description: "Confirm technical findings are accurate and reproducible.",
        category: "Review",
        required: true,
        order: 14,
      },
      {
        name: "Report Compilation",
        description: "Compile a detailed report suitable for legal proceedings, including evidence and analysis.",
        category: "Review",
        required: true,
        order: 15,
      },
    ],
  },

  "Financial Crime": {
    name: "Financial Crime",
    type: "ORGANIZATION",
    checklistItems: [
      // Pre-Investigation Phase
      {
        name: "Authorization and Compliance",
        description: "Verify all necessary legal authorizations are obtained, including subpoenas and warrants.",
        category: "Pre-Investigation",
        required: true,
        order: 0,
      },
      {
        name: "Interagency Coordination",
        description: "Ensure coordination with relevant financial regulatory bodies and agencies.",
        category: "Pre-Investigation",
        required: true,
        order: 1,
      },
      {
        name: "Initial Financial Intelligence",
        description: "Gather preliminary financial intelligence reports and red flag indicators.",
        category: "Pre-Investigation",
        required: true,
        order: 2,
      },

      // Evidence Collection Phase
      {
        name: "Financial Records Collection",
        description: "Collect bank statements, transaction records, ledgers, and other financial documents.",
        category: "Collection",
        required: true,
        order: 3,
      },
      {
        name: "Digital Evidence Collection",
        description: "Obtain digital financial data, including emails, accounting software data, and transaction logs.",
        category: "Collection",
        required: true,
        order: 4,
      },
      {
        name: "Asset Identification",
        description: "Identify and document assets, properties, and investments related to the case.",
        category: "Collection",
        required: true,
        order: 5,
      },

      // Analysis Phase
      {
        name: "Transaction Analysis",
        description: "Analyze transactions for irregularities, patterns, and links to illicit activities.",
        category: "Analysis",
        required: true,
        order: 6,
      },
      {
        name: "Forensic Accounting",
        description: "Apply forensic accounting techniques to uncover hidden assets and fraudulent entries.",
        category: "Analysis",
        required: true,
        order: 7,
      },
      {
        name: "Money Laundering Indicators",
        description: "Identify indicators of money laundering and structuring activities.",
        category: "Analysis",
        required: true,
        order: 8,
      },
      {
        name: "Beneficial Ownership Analysis",
        description: "Determine the true ownership of entities involved.",
        category: "Analysis",
        required: true,
        order: 9,
      },

      // Chain of Custody Phase
      {
        name: "Evidence Handling",
        description: "Ensure all collected documents and digital data are properly secured and documented.",
        category: "Chain of Custody",
        required: true,
        order: 10,
      },

      // Documentation Phase
      {
        name: "Financial Reports Compilation",
        description: "Compile detailed financial analysis reports with supporting evidence.",
        category: "Documentation",
        required: true,
        order: 11,
      },
      {
        name: "Interviews Documentation",
        description: "Document all interviews with witnesses, suspects, and financial experts.",
        category: "Documentation",
        required: true,
        order: 12,
      },

      // Review Phase
      {
        name: "Compliance Review",
        description: "Verify compliance with financial regulations and legal procedures.",
        category: "Review",
        required: true,
        order: 13,
      },
      {
        name: "Expert Review",
        description: "Have financial experts review analysis and findings for accuracy.",
        category: "Review",
        required: true,
        order: 14,
      },
      {
        name: "Final Report Preparation",
        description: "Prepare a comprehensive report suitable for prosecution and legal proceedings.",
        category: "Review",
        required: true,
        order: 15,
      },
    ],
  },

  Homicide: {
    name: "Homicide",
    type: "ORGANIZATION",
    checklistItems: [
      // Pre-Investigation Phase
      {
        name: "Scene Securing",
        description: "Ensure the crime scene is secured to prevent contamination or loss of evidence.",
        category: "Pre-Investigation",
        required: true,
        order: 0,
      },
      {
        name: "First Responders' Reports",
        description: "Collect and review reports from first responders.",
        category: "Pre-Investigation",
        required: true,
        order: 1,
      },

      // Evidence Collection Phase
      {
        name: "Crime Scene Documentation",
        description: "Photograph and sketch the crime scene thoroughly before evidence collection.",
        category: "Collection",
        required: true,
        order: 2,
      },
      {
        name: "Physical Evidence Collection",
        description: "Collect all physical evidence, including weapons, biological samples, and trace evidence.",
        category: "Collection",
        required: true,
        order: 3,
      },
      {
        name: "Environmental Conditions Recording",
        description: "Document weather, lighting, and other environmental conditions.",
        category: "Collection",
        required: true,
        order: 4,
      },

      // Analysis Phase
      {
        name: "Forensic Testing",
        description: "Ensure all evidence is submitted for appropriate forensic testing.",
        category: "Analysis",
        required: true,
        order: 5,
      },
      {
        name: "Autopsy Coordination",
        description: "Coordinate with medical examiner for autopsy and collect the report.",
        category: "Analysis",
        required: true,
        order: 6,
      },
      {
        name: "Victimology",
        description: "Analyze the victim's background for potential motives and suspects.",
        category: "Analysis",
        required: true,
        order: 7,
      },
      {
        name: "Timeline Reconstruction",
        description: "Reconstruct the victim's and suspects' timelines leading up to the event.",
        category: "Analysis",
        required: true,
        order: 8,
      },

      // Chain of Custody Phase
      {
        name: "Evidence Tracking",
        description: "Maintain detailed chain of custody for all collected evidence.",
        category: "Chain of Custody",
        required: true,
        order: 9,
      },

      // Documentation Phase
      {
        name: "Witness Interviews",
        description: "Conduct and document interviews with witnesses and persons of interest.",
        category: "Documentation",
        required: true,
        order: 10,
      },
      {
        name: "Suspect Interrogations",
        description: "Document interrogations, ensuring legal rights are observed.",
        category: "Documentation",
        required: true,
        order: 11,
      },
      {
        name: "Scene Reports",
        description: "Compile comprehensive reports on the crime scene findings.",
        category: "Documentation",
        required: true,
        order: 12,
      },

      // Review Phase
      {
        name: "Legal Compliance Review",
        description: "Review the investigation for adherence to legal protocols and rights.",
        category: "Review",
        required: true,
        order: 13,
      },
      {
        name: "Evidence Review",
        description: "Ensure all evidence is accounted for and properly documented.",
        category: "Review",
        required: true,
        order: 14,
      },
      {
        name: "Case File Compilation",
        description: "Prepare the complete case file for prosecutorial review.",
        category: "Review",
        required: true,
        order: 15,
      },
    ],
  },

  "Sexual Assault": {
    name: "Sexual Assault",
    type: "ORGANIZATION",
    checklistItems: [
      // Pre-Investigation Phase
      {
        name: "Victim Support Coordination",
        description: "Ensure victim has access to medical and psychological support services.",
        category: "Pre-Investigation",
        required: true,
        order: 0,
      },
      {
        name: "Legal Rights Information",
        description: "Inform victim of their legal rights and options.",
        category: "Pre-Investigation",
        required: true,
        order: 1,
      },

      // Evidence Collection Phase
      {
        name: "Medical Examination",
        description: "Coordinate timely forensic medical examination with consent.",
        category: "Collection",
        required: true,
        order: 2,
      },
      {
        name: "Physical Evidence Collection",
        description: "Collect clothing, biological samples, and any other physical evidence.",
        category: "Collection",
        required: true,
        order: 3,
      },
      {
        name: "Scene Examination",
        description: "Secure and examine the crime scene for additional evidence.",
        category: "Collection",
        required: true,
        order: 4,
      },

      // Analysis Phase
      {
        name: "Forensic Testing",
        description: "Ensure timely processing of DNA and other forensic tests.",
        category: "Analysis",
        required: true,
        order: 5,
      },
      {
        name: "Suspect Identification",
        description: "Work on identifying the suspect through evidence and witness statements.",
        category: "Analysis",
        required: true,
        order: 6,
      },
      {
        name: "Behavioral Analysis",
        description: "Analyze suspect's behavior patterns for investigative leads.",
        category: "Analysis",
        required: true,
        order: 7,
      },

      // Chain of Custody Phase
      {
        name: "Evidence Handling",
        description: "Maintain strict chain of custody for all evidence collected.",
        category: "Chain of Custody",
        required: true,
        order: 8,
      },

      // Documentation Phase
      {
        name: "Victim Interview Documentation",
        description: "Document the victim's account with sensitivity and accuracy.",
        category: "Documentation",
        required: true,
        order: 9,
      },
      {
        name: "Witness Statements",
        description: "Collect and document statements from any witnesses.",
        category: "Documentation",
        required: true,
        order: 10,
      },
      {
        name: "Suspect Interrogations",
        description: "Document suspect interviews, ensuring rights are upheld.",
        category: "Documentation",
        required: true,
        order: 11,
      },

      // Review Phase
      {
        name: "Legal Compliance Review",
        description: "Ensure all actions comply with laws and victim rights.",
        category: "Review",
        required: true,
        order: 12,
      },
      {
        name: "Evidence and Case Review",
        description: "Review all evidence and documentation for completeness.",
        category: "Review",
        required: true,
        order: 13,
      },
      {
        name: "Final Report Preparation",
        description: "Prepare a comprehensive report for prosecutorial review.",
        category: "Review",
        required: true,
        order: 14,
      },
    ],
  },

  "Organized Crime": {
    name: "Organized Crime",
    type: "ORGANIZATION",
    checklistItems: [
      // Pre-Investigation Phase
      {
        name: "Strategic Planning",
        description: "Develop a comprehensive plan including objectives, resources, and interagency coordination.",
        category: "Pre-Investigation",
        required: true,
        order: 0,
      },
      {
        name: "Legal Authorization",
        description: "Obtain necessary legal permissions for surveillance and investigative techniques.",
        category: "Pre-Investigation",
        required: true,
        order: 1,
      },
      {
        name: "Intelligence Gathering",
        description: "Collect preliminary intelligence on the organization's structure and activities.",
        category: "Pre-Investigation",
        required: true,
        order: 2,
      },

      // Surveillance Phase
      {
        name: "Physical Surveillance",
        description: "Conduct and document physical surveillance operations.",
        category: "Surveillance",
        required: true,
        order: 3,
      },
      {
        name: "Electronic Surveillance",
        description: "Implement authorized wiretaps and electronic monitoring, ensuring legal compliance.",
        category: "Surveillance",
        required: true,
        order: 4,
      },
      {
        name: "Financial Surveillance",
        description: "Monitor financial transactions and patterns for illegal activities.",
        category: "Surveillance",
        required: true,
        order: 5,
      },

      // Evidence Collection Phase
      {
        name: "Informant Handling",
        description: "Manage informants with proper documentation and risk assessments.",
        category: "Collection",
        required: true,
        order: 6,
      },
      {
        name: "Undercover Operations",
        description: "Conduct undercover operations with clear objectives and safety protocols.",
        category: "Collection",
        required: false,
        order: 7,
      },
      {
        name: "Document and Record Seizure",
        description: "Collect physical and digital records during raids or searches.",
        category: "Collection",
        required: true,
        order: 8,
      },

      // Analysis Phase
      {
        name: "Network Analysis",
        description: "Map organizational structures and relationships.",
        category: "Analysis",
        required: true,
        order: 9,
      },
      {
        name: "Financial Analysis",
        description: "Trace financial flows and money laundering activities.",
        category: "Analysis",
        required: true,
        order: 10,
      },
      {
        name: "Communication Analysis",
        description: "Analyze intercepted communications for actionable intelligence.",
        category: "Analysis",
        required: true,
        order: 11,
      },

      // Chain of Custody Phase
      {
        name: "Evidence Handling",
        description: "Maintain chain of custody for all collected evidence.",
        category: "Chain of Custody",
        required: true,
        order: 12,
      },

      // Documentation Phase
      {
        name: "Operational Reports",
        description: "Document all operations, including surveillance and raids.",
        category: "Documentation",
        required: true,
        order: 13,
      },
      {
        name: "Interagency Communication",
        description: "Maintain records of communications with other agencies.",
        category: "Documentation",
        required: true,
        order: 14,
      },

      // Review Phase
      {
        name: "Legal Review",
        description: "Ensure all activities comply with legal standards.",
        category: "Review",
        required: true,
        order: 15,
      },
      {
        name: "Operational Debrief",
        description: "Conduct debriefings after operations to assess effectiveness and gather lessons learned.",
        category: "Review",
        required: true,
        order: 16,
      },
      {
        name: "Case Compilation",
        description: "Prepare a comprehensive case file for prosecution.",
        category: "Review",
        required: true,
        order: 17,
      },
    ],
  },

  // Corporate Cases
  "Intellectual Property Theft": {
    name: "Intellectual Property Theft",
    type: "ORGANIZATION",
    checklistItems: [
      // Pre-Investigation Phase
      {
        name: "Authorization and Scope Definition",
        description: "Obtain necessary permissions and define the scope of the investigation.",
        category: "Pre-Investigation",
        required: true,
        order: 0,
      },
      {
        name: "IP Documentation Collection",
        description: "Gather all relevant intellectual property documentation and proof of ownership.",
        category: "Pre-Investigation",
        required: true,
        order: 1,
      },
      {
        name: "Security Policy Review",
        description: "Review company's security policies and protocols related to IP protection.",
        category: "Pre-Investigation",
        required: true,
        order: 2,
      },

      // Evidence Collection Phase
      {
        name: "Digital Evidence Collection",
        description: "Collect digital evidence, including access logs, emails, and file transfer records.",
        category: "Collection",
        required: true,
        order: 3,
      },
      {
        name: "Physical Evidence Collection",
        description: "Gather any physical documents or devices that may contain stolen IP.",
        category: "Collection",
        required: true,
        order: 4,
      },
      {
        name: "Employee Interviews",
        description: "Interview employees who may have knowledge of the theft.",
        category: "Collection",
        required: true,
        order: 5,
      },

      // Analysis Phase
      {
        name: "Access Log Analysis",
        description: "Analyze system access logs for unauthorized access.",
        category: "Analysis",
        required: true,
        order: 6,
      },
      {
        name: "Data Transfer Analysis",
        description: "Examine data transfer records for suspicious activities.",
        category: "Analysis",
        required: true,
        order: 7,
      },
      {
        name: "Comparative Analysis",
        description: "Compare stolen IP with suspect's materials to establish infringement.",
        category: "Analysis",
        required: true,
        order: 8,
      },

      // Chain of Custody Phase
      {
        name: "Evidence Handling",
        description: "Ensure proper chain of custody for all collected evidence.",
        category: "Chain of Custody",
        required: true,
        order: 9,
      },

      // Documentation Phase
      {
        name: "Incident Reports",
        description: "Document all findings and actions taken during the investigation.",
        category: "Documentation",
        required: true,
        order: 10,
      },
      {
        name: "Legal Correspondence",
        description: "Maintain records of all communications with legal counsel.",
        category: "Documentation",
        required: true,
        order: 11,
      },

      // Review Phase
      {
        name: "Legal Compliance Review",
        description: "Ensure investigation complies with legal and regulatory requirements.",
        category: "Review",
        required: true,
        order: 12,
      },
      {
        name: "Risk Assessment",
        description: "Assess the impact of the theft on the company.",
        category: "Review",
        required: true,
        order: 13,
      },
      {
        name: "Final Report Preparation",
        description: "Prepare a comprehensive report for legal action or internal use.",
        category: "Review",
        required: true,
        order: 14,
      },
    ],
  },


  "Data Breach": {
    name: "Data Breach",
    type: "ORGANIZATION",
    checklistItems: [
      {
        name: "Incident Timeline",
        description: "Verify incident timeline documentation and supporting logs",
        category: "Documentation",
        required: true,
        order: 0,
      },
      {
        name: "System Logs Review",
        description: "Check system logs analysis and anomaly detection",
        category: "Technical Analysis",
        required: true,
        order: 1,
      },
      {
        name: "Data Impact Assessment",
        description: "Review data impact assessment and affected records",
        category: "Analysis",
        required: true,
        order: 2,
      },
      {
        name: "Security Measures Review",
        description: "Verify security measures documentation and effectiveness",
        category: "Technical Review",
        required: true,
        order: 3,
      },
      {
        name: "Breach Notification Review",
        description: "Verify breach notification compliance and documentation",
        category: "Compliance",
        required: true,
        order: 4,
      }
    ]
  },

  "Employee Misconduct": {
    name: "Employee Misconduct",
    type: "ORGANIZATION",
    checklistItems: [
      {
        name: "Interview Documentation",
        description: "Verify all interviews are properly documented and recorded",
        category: "Documentation",
        required: true,
        order: 0,
      },
      {
        name: "Policy Review",
        description: "Check relevant policy documentation and violations",
        category: "Documentation",
        required: true,
        order: 1,
      },
      {
        name: "Evidence Collection",
        description: "Verify proper evidence collection procedures and chain of custody",
        category: "Evidence Handling",
        required: true,
        order: 2,
      },
      {
        name: "HR Documentation",
        description: "Review HR-related documentation and personnel files",
        category: "Documentation",
        required: true,
        order: 3,
      },
      {
        name: "Digital Evidence Review",
        description: "Analyze email, computer, and phone records",
        category: "Digital Evidence",
        required: true,
        order: 4,
      }
    ]
  },

  "Trade Secret Theft": {
    name: "Trade Secret Theft",
    type: "ORGANIZATION",
    checklistItems: [
      {
        name: "Trade Secret Documentation",
        description: "Verify documentation of trade secret protection measures",
        category: "Documentation",
        required: true,
        order: 0,
      },
      {
        name: "Access Analysis",
        description: "Review access logs and unauthorized access patterns",
        category: "Analysis",
        required: true,
        order: 1,
      },
      {
        name: "Data Exfiltration Review",
        description: "Check for evidence of data exfiltration attempts",
        category: "Technical Analysis",
        required: true,
        order: 2,
      },
      {
        name: "Employee Agreement Review",
        description: "Verify relevant NDAs and employment agreements",
        category: "Documentation",
        required: true,
        order: 3,
      }
    ]
  },

  "Corporate Espionage": {
    name: "Corporate Espionage",
    type: "ORGANIZATION",
    checklistItems: [
      {
        name: "Security Breach Analysis",
        description: "Review security breach detection and analysis",
        category: "Analysis",
        required: true,
        order: 0,
      },
      {
        name: "Network Activity Review",
        description: "Check suspicious network activity and connections",
        category: "Technical Analysis",
        required: true,
        order: 1,
      },
      {
        name: "Physical Security Review",
        description: "Verify physical security measures and breaches",
        category: "Investigation",
        required: true,
        order: 2,
      },
      {
        name: "Insider Threat Analysis",
        description: "Review potential insider threat indicators",
        category: "Analysis",
        required: true,
        order: 3,
      }
    ]
  },

  // Civil Cases
  "Contract Dispute": {
    name: "Contract Dispute",
    type: "ORGANIZATION",
    checklistItems: [
      {
        name: "Contract Review",
        description: "Verify contract analysis documentation and terms",
        category: "Documentation",
        required: true,
        order: 0,
      },
      {
        name: "Communication Review",
        description: "Check relevant communication documentation and timeline",
        category: "Documentation",
        required: true,
        order: 1,
      },
      {
        name: "Timeline Analysis",
        description: "Verify timeline documentation and key events",
        category: "Analysis",
        required: true,
        order: 2,
      },
      {
        name: "Document Authentication",
        description: "Confirm document authentication procedures and results",
        category: "Evidence Handling",
        required: true,
        order: 3,
      },
      {
        name: "Financial Impact Analysis",
        description: "Review financial impact documentation and calculations",
        category: "Analysis",
        required: true,
        order: 4,
      }
    ]
  },

  Employment: {
    name: "Employment",
    type: "ORGANIZATION",
    checklistItems: [
      {
        name: "Employment Records Review",
        description: "Verify employment history and documentation",
        category: "Documentation",
        required: true,
        order: 0,
      },
      {
        name: "Policy Compliance Check",
        description: "Review compliance with employment policies",
        category: "Analysis",
        required: true,
        order: 1,
      },
      {
        name: "Communication Analysis",
        description: "Check relevant workplace communications",
        category: "Investigation",
        required: true,
        order: 2,
      },
      {
        name: "HR Documentation Review",
        description: "Verify HR records and incident reports",
        category: "Documentation",
        required: true,
        order: 3,
      }
    ]
  },

  "Personal Injury": {
    name: "Personal Injury",
    type: "ORGANIZATION",
    checklistItems: [
      {
        name: "Medical Records Review",
        description: "Verify all medical records and treatment documentation",
        category: "Documentation",
        required: true,
        order: 0,
      },
      {
        name: "Incident Scene Documentation",
        description: "Review incident scene photos and documentation",
        category: "Evidence Collection",
        required: true,
        order: 1,
      },
      {
        name: "Witness Statements",
        description: "Verify witness statements and interview records",
        category: "Investigation",
        required: true,
        order: 2,
      },
      {
        name: "Expert Reports",
        description: "Review expert analysis reports and findings",
        category: "Analysis",
        required: true,
        order: 3,
      },
      {
        name: "Insurance Documentation",
        description: "Verify insurance claims and coverage documentation",
        category: "Documentation",
        required: true,
        order: 4,
      }
    ]
  },

  "Property Dispute": {
    name: "Property Dispute",
    type: "ORGANIZATION",
    checklistItems: [
      {
        name: "Property Documentation",
        description: "Verify property ownership and boundary documentation",
        category: "Documentation",
        required: true,
        order: 0,
      },
      {
        name: "Survey Analysis",
        description: "Review property surveys and measurements",
        category: "Analysis",
        required: true,
        order: 1,
      },
      {
        name: "Historical Records",
        description: "Check historical property records and transfers",
        category: "Documentation",
        required: true,
        order: 2,
      },
      {
        name: "Photographic Evidence",
        description: "Verify property photos and visual documentation",
        category: "Evidence Collection",
        required: true,
        order: 3,
      }
    ]
  },

  "Family Law": {
    name: "Family Law",
    type: "ORGANIZATION",
    checklistItems: [
      {
        name: "Financial Documentation",
        description: "Verify financial records and asset documentation",
        category: "Documentation",
        required: true,
        order: 0,
      },
      {
        name: "Custody Evidence Review",
        description: "Check custody-related evidence and documentation",
        category: "Investigation",
        required: true,
        order: 1,
      },
      {
        name: "Communication Records",
        description: "Review relevant family communication records",
        category: "Documentation",
        required: true,
        order: 2,
      },
      {
        name: "Witness Statements",
        description: "Verify witness statements and testimonies",
        category: "Investigation",
        required: true,
        order: 3,
      }
    ]
  },

  "Insurance Claims": {
    name: "Insurance Claims",
    type: "ORGANIZATION",
    checklistItems: [
      {
        name: "Claim Documentation",
        description: "Verify insurance claim forms and submissions",
        category: "Documentation",
        required: true,
        order: 0,
      },
      {
        name: "Damage Assessment",
        description: "Review damage assessment reports and photos",
        category: "Analysis",
        required: true,
        order: 1,
      },
      {
        name: "Policy Coverage Review",
        description: "Check policy coverage and terms documentation",
        category: "Documentation",
        required: true,
        order: 2,
      },
      {
        name: "Expert Reports",
        description: "Verify expert assessment reports and findings",
        category: "Analysis",
        required: true,
        order: 3,
      }
    ]
  }
};

module.exports = {
  defaultQATemplates
};
