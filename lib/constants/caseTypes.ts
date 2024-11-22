export const CASE_CATEGORIES = {
  Criminal: [
    "Narcotics",
    "Human Trafficking",
    "Cybercrime",
    "Financial Crime",
    "Homicide",
    "Sexual Assault",
    "Organized Crime",
  ],
  Corporate: [
    "Intellectual Property Theft",
    "Data Breach",
    "Employee Misconduct",
    "Financial Fraud",
    "Trade Secret Theft",
    "Corporate Espionage",
  ],
  Civil: [
    "Contract Dispute",
    "Employment",
    "Personal Injury",
    "Property Dispute",
    "Family Law",
    "Insurance Claims",
  ],
} as const

export type CaseCategory = keyof typeof CASE_CATEGORIES
export type CaseType = typeof CASE_CATEGORIES[CaseCategory][number]

export const CASE_CATEGORY_LIST = Object.keys(CASE_CATEGORIES) as CaseCategory[]
