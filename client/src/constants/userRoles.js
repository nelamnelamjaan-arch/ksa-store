/** Canonical RBAC roles (aligned with MongoDB) */
export const USER_ROLES = Object.freeze({
  SUPER_ADMIN: "SuperAdmin",
  SELLER: "Seller",
  CUSTOMER: "Customer",
});

export const PRODUCT_STATUSES = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  HIDDEN: "hidden",
});

export const ROLE_LABELS = Object.freeze({
  [USER_ROLES.SUPER_ADMIN]: "Super Admin",
  [USER_ROLES.SELLER]: "Seller",
  [USER_ROLES.CUSTOMER]: "Customer",
});

/** @deprecated */
export const SELLER_STATUSES = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  BLOCKED: "blocked",
});

/** @deprecated */
export const PRODUCT_APPROVAL_STATUSES = PRODUCT_STATUSES;
