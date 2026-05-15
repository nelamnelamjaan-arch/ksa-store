import mongoose from "mongoose";

export const USER_ROLES = Object.freeze({
  GRAND_ADMIN: "grand_admin",
  VENDOR_ADMIN: "vendor_admin",
  CUSTOMER: "customer",
});

const FAMILY_RELATIONSHIPS = Object.freeze([
  "self",
  "spouse",
  "child",
  "parent",
  "grandparent",
  "other",
]);

const familyMemberSchema = new mongoose.Schema(
  {
    relationship: {
      type: String,
      enum: FAMILY_RELATIONSHIPS,
      default: "other",
    },
    display_name: { type: String, default: "", trim: true, maxlength: 80 },
    /** Preferred when set — server derives age for recommendations */
    date_of_birth: { type: Date, default: null },
    /** Optional fallback when DOB unknown */
    age_years: { type: Number, default: null, min: 0, max: 125 },
  },
  { _id: true, timestamps: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    /** Operator login (e.g. Kiran) — sparse unique */
    username: { type: String, unique: true, sparse: true, trim: true },
    name: { type: String, required: true, trim: true },
    /** Google OIDC subject when the account uses "Sign in with Google" */
    googleSub: { type: String, unique: true, sparse: true, trim: true },
    picture: { type: String, default: "" },
    passwordHash: { type: String, default: null },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
      default: USER_ROLES.CUSTOMER,
    },
    /** Family life-cycle — powers age-based “Family Needs” recommendations */
    family_members: { type: [familyMemberSchema], default: [] },
    /** KSA Coins — earned on paid orders (1% of subtotal); redeem 1:1 SAR at checkout (capped). */
    ksaCoins: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
