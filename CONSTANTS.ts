export const NEW_ACCOUNT_SIGNUP_BONUS = 10;

// Membership & Pricing Configuration
export const MEMBERSHIP_FEATURES = {
  FREE: {
    name: "FREE",
    icon: "BrainIcon",
    color: "text-blue-600",
    features: [
      { icon: "FileText", text: "Unlimited notes and folders" },
      { icon: "Save", text: "Unlimited saving and editing" },
      { icon: "Search", text: "Search your notes" },
      { icon: "Type", text: "Rich text editing" },
      { icon: "Folder", text: "Organize with folders" },
    ],
  },
  PRO: {
    name: "PRO",
    icon: "Crown",
    color: "text-yellow-600",
    price: "$1.99",
    features: [
      { icon: "Globe", text: "Unlimited note publishing" },
      { icon: "MessageCircle", text: "Unlimited AI chat conversations" },
      { icon: "History", text: "Note versioning & history" },
      { icon: "Sparkles", text: "Advanced semantic search" },
      { icon: "Crown", text: "Priority support" },
    ],
  },
} as const;

export const MEMBERSHIP_UPGRADE_FEATURES = [
  "Note publishing",
  "AI chat",
  "Version history",
  "Semantic search",
  "Priority support",
];

export const UPGRADE_BUTTON_LABEL = `Upgrade to ${MEMBERSHIP_FEATURES.PRO.name} - ${MEMBERSHIP_FEATURES.PRO.price}/month`;
