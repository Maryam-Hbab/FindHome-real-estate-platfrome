/**
 * Content moderation service for filtering inappropriate content
 */

// List of prohibited terms for property descriptions
const PROHIBITED_TERMS = [
  // Discriminatory terms
  "whites only",
  "no minorities",
  "no children",
  "adults only",
  "no section 8",
  "christian only",
  "no muslims",
  "no jews",
  "preferred religion",
  "males only",
  "females only",
  "no disabled",
  "no wheelchairs",

  // Misleading terms
  "guaranteed return",
  "guaranteed investment",
  "guaranteed profit",
  "risk-free investment",
  "100% financing",
  "no money down",

  // Scam indicators
  "wire money",
  "western union",
  "moneygram",
  "cash only deal",
  "overseas owner",
  "out of country",
  "foreign investor",

  // Inappropriate content
  "adult entertainment",
  "adult business",
  "adult services",

  // Illegal activities
  "grow operation",
  "grow house",
  "drug manufacturing",
]

interface ModerationResult {
  isApproved: boolean
  flagged: boolean
  prohibitedTerms: string[]
  moderationScore: number
}

/**
 * Checks property description for prohibited content
 */
export function moderatePropertyDescription(description: string): ModerationResult {
  if (!description) {
    return {
      isApproved: true,
      flagged: false,
      prohibitedTerms: [],
      moderationScore: 0,
    }
  }

  const lowerCaseDescription = description.toLowerCase()
  const foundTerms: string[] = []

  // Check for prohibited terms
  PROHIBITED_TERMS.forEach((term) => {
    if (lowerCaseDescription.includes(term.toLowerCase())) {
      foundTerms.push(term)
    }
  })

  // Calculate moderation score (0-100)
  // Higher score means more likely to be inappropriate
  const moderationScore = Math.min(foundTerms.length * 25, 100)

  return {
    isApproved: moderationScore < 50,
    flagged: moderationScore >= 25,
    prohibitedTerms: foundTerms,
    moderationScore,
  }
}

/**
 * Checks property title for prohibited content
 */
export function moderatePropertyTitle(title: string): ModerationResult {
  if (!title) {
    return {
      isApproved: true,
      flagged: false,
      prohibitedTerms: [],
      moderationScore: 0,
    }
  }

  const lowerCaseTitle = title.toLowerCase()
  const foundTerms: string[] = []

  // Check for prohibited terms
  PROHIBITED_TERMS.forEach((term) => {
    if (lowerCaseTitle.includes(term.toLowerCase())) {
      foundTerms.push(term)
    }
  })

  // Title moderation is stricter since it's more visible
  const moderationScore = Math.min(foundTerms.length * 35, 100)

  return {
    isApproved: moderationScore < 35,
    flagged: moderationScore >= 20,
    prohibitedTerms: foundTerms,
    moderationScore,
  }
}

/**
 * Performs content moderation on a property listing
 */
export function moderatePropertyListing(property: {
  title: string
  description: string
}): {
  isApproved: boolean
  flagged: boolean
  prohibitedTerms: string[]
  moderationScore: number
  titleResult: ModerationResult
  descriptionResult: ModerationResult
} {
  const titleResult = moderatePropertyTitle(property.title)
  const descriptionResult = moderatePropertyDescription(property.description)

  // Combine results
  const prohibitedTerms = [...new Set([...titleResult.prohibitedTerms, ...descriptionResult.prohibitedTerms])]
  const moderationScore = Math.max(titleResult.moderationScore, descriptionResult.moderationScore)

  return {
    isApproved: titleResult.isApproved && descriptionResult.isApproved,
    flagged: titleResult.flagged || descriptionResult.flagged,
    prohibitedTerms,
    moderationScore,
    titleResult,
    descriptionResult,
  }
}
