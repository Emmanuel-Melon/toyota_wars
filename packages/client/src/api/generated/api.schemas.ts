import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const JsonApiError = z
  .object({
    id: z.string().uuid(),
    status: z.string(),
    code: z.string(),
    title: z.string(),
    detail: z.string(),
    metadata: z.record(z.unknown().nullable()),
    source: z
      .object({ pointer: z.string(), method: z.string() })
      .partial()
      .passthrough()
      .optional(),
  })
  .passthrough();
const JsonApiErrorResponse = z
  .object({ errors: z.array(JsonApiError) })
  .passthrough();
const postV1admininvites_Body = z
  .object({
    email: z.string().max(255).email(),
    role: z.enum(["user", "admin", "partner"]),
    partnerAssignment: z
      .object({
        partnerId: z.string().uuid(),
        partnerRole: z.enum(["owner", "staff"]),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();
const postV1adminclusters_Body = z
  .object({
    name: z.string().min(1).max(255),
    postalCodes: z.array(z.string().regex(/^\d{5}$/)).min(1),
    status: z.enum(["draft", "live", "paused"]).optional().default("draft"),
  })
  .passthrough();
const postV1authsignup_Body = z
  .object({
    name: z.string().max(255).nullish(),
    email: z.string().max(255).email(),
    password: z.string().min(8),
    invitationToken: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    role: z.enum(["user", "partner", "admin"]).optional(),
  })
  .passthrough();
const postV1authlogin_Body = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
    rememberMe: z.boolean(),
    role: z.enum(["user", "partner", "admin"]).optional(),
  })
  .passthrough();
const postV1authchangePassword_Body = z
  .object({ currentPassword: z.string().min(1), password: z.string().min(8) })
  .passthrough();
const postV1authresetPassword_Body = z
  .object({ password: z.string().min(8), token: z.string().min(1) })
  .passthrough();
const postV1classifierquestions_Body = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string(),
    prompt: z.string(),
    step: z.string(),
    type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "SCALE", "BOOLEAN"]),
    scope: z.enum(["RELATIONSHIP", "OCCASION", "PROCESS", null]).nullish(),
    isActive: z.boolean().optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
    createdBy: z.string().uuid().nullish(),
    updatedBy: z.string().uuid().nullish(),
  })
  .passthrough();
const postV1classifieranswers_Body = z
  .object({
    id: z.string().uuid().optional(),
    questionId: z.string().uuid(),
    label: z.string(),
    mappedIntentId: z.string().uuid().nullish(),
    mappedRelationshipDepth: z
      .enum(["FORMAL", "FAMILIAR", "VERY_CLOSE", null])
      .nullish(),
    mappedSignalIntensity: z
      .enum(["LIGHT", "NOTICEABLE", "QUIET_AND_DEEP", null])
      .nullish(),
    triggersStage: z.string().nullish(),
    weight: z.number().int().gte(-2147483648).lte(2147483647).nullish(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
    createdBy: z.string().uuid().nullish(),
    updatedBy: z.string().uuid().nullish(),
  })
  .passthrough();
const postV1decisionsOccasionIdassistance_Body = z
  .object({
    userId: z.string().uuid(),
    occasionId: z.string(),
    recipientId: z.string().uuid(),
    decisionType: z.enum(["INQUIRY", "SELECTION", "OPERATIONAL", "INTENT"]),
    decisionValue: z.enum(["ACCEPT", "DECLINE"]),
  })
  .passthrough();
const CountryResource = z
  .object({
    type: z.literal("country"),
    id: z.string().regex(/^[A-Z]{2}$/),
    attributes: z
      .object({ code: z.string().regex(/^[A-Z]{2}$/), name: z.string().min(1) })
      .passthrough(),
    relationships: z.record(z.unknown().nullable()).optional(),
    meta: z.record(z.unknown().nullable()).optional(),
    links: z.record(z.string()).optional(),
  })
  .passthrough();
const CountryCollectionResponse = z
  .object({
    data: z.array(CountryResource),
    links: z.object({ self: z.string() }).passthrough(),
    metadata: z
      .object({
        requestId: z.string(),
        timestamp: z.string(),
        total: z.number().int().gte(0),
      })
      .passthrough(),
  })
  .passthrough();
const postV1giftProcess_Body = z
  .object({
    email: z.string().email(),
    relationshipId: z.string().uuid(),
    occasionId: z.string().uuid().nullable(),
    entryMode: z.enum(["occasion_guided", "direct"]),
    outcome: z.enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY"]),
  })
  .partial()
  .passthrough();
const postV1giftProcessProcessIdselectTone_Body = z
  .object({ ref: z.enum(["A", "B", "C"]) })
  .passthrough();
const postV1giftProcessProcessIdselectPartner_Body = z
  .object({ include: z.boolean(), partnerId: z.string().uuid().optional() })
  .passthrough();
const postV1giftProcessProcessIdconfirmShipping_Body = z
  .object({
    shippingAddressLine: z.string().max(255).nullable(),
    shippingPostalCode: z.string().max(10).nullable(),
    shippingCity: z.string().max(100).nullable(),
    shippingCountryCode: z.string().max(2).nullable(),
    shippingNotes: z.string().nullable(),
    skip: z.boolean(),
  })
  .partial()
  .passthrough();
const postV1giftProcessProcessIdrevert_Body = z
  .object({
    step: z.enum([
      "CLASSIFICATION",
      "AWAITING_VARIANT_SELECTION",
      "AWAITING_TONE_SELECTION",
      "AWAITING_PARTNER_SELECTION",
      "AWAITING_VOUCHER_VALUE",
      "AWAITING_SHIPPING_ADDRESS",
      "ORDER_REVIEW",
      "AWAITING_CHECKOUT",
      "AWAITING_VOUCHER_PAYMENT_RECOVERY",
    ]),
  })
  .passthrough();
const postV1giftProcessProcessIdstatus_Body = z
  .object({
    status: z.enum([
      "sent_to_fulfillment",
      "confirmed",
      "shipped",
      "delivered",
      "completed",
      "hold",
      "failed",
      "cancelled",
      "missed",
    ]),
    notes: z.string().optional(),
    metadata: z.record(z.unknown().nullable()).optional(),
  })
  .passthrough();
const postV1occasions_Body = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string(),
    description: z.string().nullish(),
    date: z.string(),
    recurrenceType: z
      .enum(["none", "daily", "weekly", "monthly", "yearly"])
      .optional(),
    recurrenceInterval: z.string().nullish(),
    parentId: z.string().uuid().nullish(),
    organizerId: z.string().uuid(),
    status: z.enum(["created", "upcoming", "active", "passed"]).optional(),
    createdAt: z.string().datetime({ offset: true }).nullish(),
    updatedAt: z.string().datetime({ offset: true }).nullish(),
    relationshipId: z.string().optional(),
    userId: z.string().optional(),
  })
  .passthrough();
const putV1occasionsId_Body = z
  .object({ name: z.string(), description: z.string(), date: z.string() })
  .partial()
  .passthrough();
const postV1occasionsrecipients_Body = z
  .object({ occasionId: z.string(), email: z.string() })
  .passthrough();
const postV1occasionsOccasionIdreminderssnooze_Body = z
  .object({
    until: z.string().datetime({ offset: true }),
    reason: z.string().max(500).optional(),
  })
  .passthrough();
const postV1partners_Body = z
  .object({
    id: z.string().uuid().optional(),
    externalId: z.string().max(50).nullish(),
    name: z.string().max(255),
    category: z.string().max(100),
    voucherType: z.string().max(100),
    city: z.string().max(255),
    postalCode: z.string().max(5),
    countryCode: z.string().max(2).optional(),
    latitude: z.number().gte(-140737488355328).lte(140737488355327).nullish(),
    longitude: z.number().gte(-140737488355328).lte(140737488355327).nullish(),
    energyLevel: z.enum(["calm", "balanced", "active", null]).nullish(),
    socialMode: z.enum(["solo", "duo", "social", null]).nullish(),
    coverage: z.enum(["none", "low", "high"]).optional(),
    active: z.boolean().optional(),
    priority: z.number().int().gte(-2147483648).lte(2147483647).optional(),
    source: z.string().max(50).nullish(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
    createdBy: z.string().uuid().nullish(),
    updatedBy: z.string().uuid().nullish(),
  })
  .passthrough();
const patchV1partnersId_Body = z
  .object({
    id: z.string().uuid(),
    externalId: z.string().max(50).nullable(),
    name: z.string().max(255),
    category: z.string().max(100),
    voucherType: z.string().max(100),
    city: z.string().max(255),
    postalCode: z.string().max(5),
    countryCode: z.string().max(2),
    latitude: z.number().gte(-140737488355328).lte(140737488355327).nullable(),
    longitude: z.number().gte(-140737488355328).lte(140737488355327).nullable(),
    energyLevel: z.enum(["calm", "balanced", "active", null]).nullable(),
    socialMode: z.enum(["solo", "duo", "social", null]).nullable(),
    coverage: z.enum(["none", "low", "high"]),
    active: z.boolean(),
    priority: z.number().int().gte(-2147483648).lte(2147483647),
    source: z.string().max(50).nullable(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    createdBy: z.string().uuid().nullable(),
    updatedBy: z.string().uuid().nullable(),
  })
  .partial()
  .passthrough();
const postV1partnersredeemVoucher_Body = z
  .object({
    claimCode: z.string().min(1),
    amountCents: z.number().gt(0),
    partnerId: z.string().uuid(),
  })
  .passthrough();
const postV1partnerscreateOrganization_Body = z
  .object({
    name: z.string().min(1).max(255),
    city: z.string().min(1).max(255),
    postalCode: z.string().regex(/^\d{5}$/),
    category: z.enum(["Dining", "Wellness", "Activity"]),
  })
  .passthrough();
const ConnectOnboarding = z.object({ url: z.string().url() }).passthrough();
const ConnectAccountStatus = z
  .object({
    stripeAccountId: z.string().nullable(),
    status: z.enum(["onboarded", "pending", "restricted", "not_started"]),
    detailsSubmitted: z.boolean(),
    chargesEnabled: z.boolean(),
    payoutsEnabled: z.boolean(),
    payoutCurrency: z.string().optional(),
  })
  .passthrough();
const PartnerEarnings = z
  .object({
    totalEarningsCents: z.number().int(),
    totalPaidOutCents: z.number().int(),
    pendingTransferCents: z.number().int(),
    connectedAccount: z.unknown().nullish(),
    payouts: z.array(z.unknown().nullable()),
    transactions: z.array(z.unknown().nullable()),
  })
  .passthrough();
const postV1partnersPartnerIdmembers_Body = z
  .object({
    email: z.string().email(),
    role: z.enum(["owner", "staff"]).optional().default("staff"),
  })
  .passthrough();
const postV1relationships_Body = z
  .object({
    id: z.string().uuid().optional(),
    userId: z.string().uuid(),
    relatedUserId: z.string().uuid().nullish(),
    email: z.string().nullish(),
    nickname: z.string().nullish(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    avatarUrl: z.string().max(2048).nullish(),
    birthday: z.string().nullish(),
    relationshipType: z.string().optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
    needsRefinement: z.boolean().optional(),
    quizCompletedAt: z.string().datetime({ offset: true }).nullish(),
  })
  .passthrough();
const putV1relationshipsId_Body = z
  .object({
    relationshipType: z.string(),
    nickname: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    birthday: z.string().nullable(),
  })
  .partial()
  .passthrough();
const postV1relationshipscontacts_Body = z
  .object({
    contacts: z
      .array(
        z
          .object({
            name: z.array(z.string()),
            email: z.array(z.string()),
            tel: z.array(z.string()),
          })
          .partial()
          .passthrough()
      )
      .min(1),
  })
  .passthrough();
const postV1relationshipsIdaddresses_Body = z
  .object({
    id: z.string().uuid().optional(),
    relationshipId: z.string().uuid().nullish(),
    addressLine: z.string().max(255),
    postalCode: z.string().max(10),
    city: z.string().max(100),
    countryCode: z.string().max(2).optional(),
    notes: z.string().nullish(),
    isDefault: z.number().int().gte(-2147483648).lte(2147483647).nullish(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const postV1users_Body = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().max(255).nullish(),
    emailVerifiedAt: z.string().datetime({ offset: true }).nullish(),
    firstName: z.string().max(255).nullish(),
    lastName: z.string().max(255).nullish(),
    preferredName: z.string().max(255).nullish(),
    email: z.string().max(255).email(),
    password: z.string().max(255).nullish(),
    dob: z.string().nullish(),
    country: z.string().max(255).nullish(),
    city: z.string().max(255).nullish(),
    preferredLanguage: z.string().max(50).optional(),
    interests: z
      .union([
        z.string(),
        z.number(),
        z.boolean(),
        z.unknown(),
        z.record(z.unknown().nullable()),
        z.array(z.unknown().nullable()),
      ])
      .optional(),
    giftingStatements: z
      .union([
        z.string(),
        z.number(),
        z.boolean(),
        z.unknown(),
        z.record(z.unknown().nullable()),
        z.array(z.unknown().nullable()),
      ])
      .optional(),
    role: z.enum(["admin", "user", "partner"]).optional(),
    stripeCustomerId: z.string().max(255).nullish(),
    stripeAccountId: z.string().max(255).nullish(),
    avatarUrl: z.string().max(2048).nullish(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
    isFirstLogin: z.boolean().optional(),
    isOnboarded: z.boolean().optional(),
  })
  .passthrough();
const patchV1usersId_Body = z
  .object({
    name: z.string().max(255).nullable(),
    emailVerifiedAt: z.string().datetime({ offset: true }).nullable(),
    firstName: z.string().max(255).nullable(),
    lastName: z.string().max(255).nullable(),
    preferredName: z.string().max(255).nullable(),
    email: z.string().max(255).email(),
    dob: z.string().nullable(),
    country: z.string().max(255).nullable(),
    city: z.string().max(255).nullable(),
    preferredLanguage: z.string().max(50),
    interests: z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.unknown(),
      z.record(z.unknown().nullable()),
      z.array(z.unknown().nullable()),
    ]),
    giftingStatements: z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.unknown(),
      z.record(z.unknown().nullable()),
      z.array(z.unknown().nullable()),
    ]),
    role: z.enum(["admin", "user", "partner"]),
    stripeCustomerId: z.string().max(255).nullable(),
    stripeAccountId: z.string().max(255).nullable(),
    avatarUrl: z.string().max(2048).nullable(),
    updatedAt: z.string().datetime({ offset: true }),
    isFirstLogin: z.boolean(),
    isOnboarded: z.boolean(),
  })
  .partial()
  .passthrough();
const postV1usersonboarding_Body = z
  .object({
    stepOne: z
      .object({
        firstName: z.string().min(1),
        lastName: z.string().optional(),
        preferredName: z.string().optional(),
        dob: z.string(),
        country: z.string().min(1),
        city: z.string().optional(),
        preferredLanguage: z.enum(["en", "de"]).optional().default("en"),
        interests: z.array(z.string()).optional().default([]),
      })
      .passthrough(),
    stepTwo: z
      .object({ giftingStatements: z.array(z.string()).min(1) })
      .passthrough(),
  })
  .passthrough();
const postV1vouchersorders_Body = z
  .object({
    id: z.string().uuid().optional(),
    voucherProductId: z.string().uuid().nullish(),
    partnerId: z.string().uuid(),
    processId: z.string().uuid(),
    orderItemId: z.string().uuid().nullish(),
    state: z
      .enum(["draft", "paid", "vouchers_issued", "failed", "cancelled"])
      .optional(),
    currency: z.string().max(3).optional(),
    expectedTotalCents: z.number().int().gte(-2147483648).lte(2147483647),
    holdReason: z.string().nullish(),
    holdDetails: z.unknown().nullish(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
    setId: z.string().uuid().nullish(),
    createdBy: z.string().uuid().nullish(),
    updatedBy: z.string().uuid().nullish(),
  })
  .passthrough();
const postV1vouchers_Body = z
  .object({
    id: z.string().uuid().optional(),
    userId: z.string().uuid(),
    claimCode: z.string(),
    voucherOrderId: z.string().uuid(),
    partnerId: z.string().uuid(),
    faceValueCents: z.number().int().gte(-2147483648).lte(2147483647),
    remainingCents: z.number().int().gte(-2147483648).lte(2147483647),
    status: z
      .enum([
        "active",
        "operational_expired",
        "legal_expired",
        "exhausted",
        "cancelled",
      ])
      .optional(),
    storageKey: z.string().nullish(),
    operationalExpiresAt: z.string().datetime({ offset: true }),
    legalExpiresAt: z.string().datetime({ offset: true }),
    sequence: z.number().int().gte(-2147483648).lte(2147483647),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
    updatedBy: z.string().uuid().nullish(),
  })
  .passthrough();
const postV1vouchersproducts_Body = z
  .object({
    id: z.string().uuid().optional(),
    partnerId: z.string().uuid().nullish(),
    name: z.string(),
    description: z.string().nullish(),
    valueCents: z.number().int().gte(-2147483648).lte(2147483647),
    currency: z.string().max(3).optional(),
    isActive: z.boolean().optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
    stripePriceId: z.string().max(255).nullish(),
    createdBy: z.string().uuid().nullish(),
    updatedBy: z.string().uuid().nullish(),
  })
  .passthrough();
const OrderItemMetadata = z.union([
  z.record(z.unknown().nullable()),
  z.record(z.unknown().nullable()),
  z.record(z.unknown().nullable()),
  z.unknown(),
]);
const postV1ordersIdholdResolution_Body = z
  .object({
    reason: z.string().optional(),
    refund: z.boolean().optional(),
    action: z.enum(["release", "cancel", "fail", "refund"]),
  })
  .passthrough();
const postV1ordersIdnotes_Body = z
  .object({
    orderId: z.string(),
    actor: z.string(),
    notes: z.string().min(1),
    metadata: z.record(z.unknown().nullable()).optional(),
  })
  .passthrough();
const patchV1ordersIdstate_Body = z
  .object({
    status: z.enum(["pending", "paid", "failed", "refunded"]),
    fulfillmentStatus: z
      .enum([
        "sent_to_fulfillment",
        "confirmed",
        "shipped",
        "delivered",
        "completed",
        "hold",
        "failed",
        "cancelled",
        "missed",
        null,
      ])
      .nullable(),
    notes: z.string().max(2000),
    metadata: z.record(z.unknown().nullable()),
    carrier: z.string().max(100).nullable(),
    trackingNumber: z.string().max(100).nullable(),
    trackingUrl: z.string().url().nullable(),
  })
  .partial()
  .passthrough();

export const schemas = {
  JsonApiError,
  JsonApiErrorResponse,
  postV1admininvites_Body,
  postV1adminclusters_Body,
  postV1authsignup_Body,
  postV1authlogin_Body,
  postV1authchangePassword_Body,
  postV1authresetPassword_Body,
  postV1classifierquestions_Body,
  postV1classifieranswers_Body,
  postV1decisionsOccasionIdassistance_Body,
  CountryResource,
  CountryCollectionResponse,
  postV1giftProcess_Body,
  postV1giftProcessProcessIdselectTone_Body,
  postV1giftProcessProcessIdselectPartner_Body,
  postV1giftProcessProcessIdconfirmShipping_Body,
  postV1giftProcessProcessIdrevert_Body,
  postV1giftProcessProcessIdstatus_Body,
  postV1occasions_Body,
  putV1occasionsId_Body,
  postV1occasionsrecipients_Body,
  postV1occasionsOccasionIdreminderssnooze_Body,
  postV1partners_Body,
  patchV1partnersId_Body,
  postV1partnersredeemVoucher_Body,
  postV1partnerscreateOrganization_Body,
  ConnectOnboarding,
  ConnectAccountStatus,
  PartnerEarnings,
  postV1partnersPartnerIdmembers_Body,
  postV1relationships_Body,
  putV1relationshipsId_Body,
  postV1relationshipscontacts_Body,
  postV1relationshipsIdaddresses_Body,
  postV1users_Body,
  patchV1usersId_Body,
  postV1usersonboarding_Body,
  postV1vouchersorders_Body,
  postV1vouchers_Body,
  postV1vouchersproducts_Body,
  OrderItemMetadata,
  postV1ordersIdholdResolution_Body,
  postV1ordersIdnotes_Body,
  patchV1ordersIdstate_Body,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/v1/admin/clusters",
    alias: "getV1adminclusters",
    description: `Returns a list of all coverage clusters with their postal codes and assigned partners`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("coverage_cluster"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  name: z.string().max(255),
                  status: z.enum(["draft", "live", "paused"]),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/admin/clusters",
    alias: "postV1adminclusters",
    description: `Creates a new coverage cluster with its postal codes`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1adminclusters_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("coverage_cluster"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                name: z.string().max(255),
                status: z.enum(["draft", "live", "paused"]),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/admin/clusters/:clusterId",
    alias: "getV1adminclustersClusterId",
    description: `Returns a single coverage cluster with its postal codes and assigned partners`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("coverage_cluster"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                name: z.string().max(255),
                status: z.enum(["draft", "live", "paused"]),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/admin/clusters/:clusterId/partners",
    alias: "getV1adminclustersClusterIdpartners",
    description: `Returns all partners assigned to a coverage cluster, including the partner details`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("coverage_cluster_partner"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  clusterId: z.string().uuid(),
                  partnerId: z.string().uuid(),
                  createdAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/admin/clusters/:clusterId/partners",
    alias: "postV1adminclustersClusterIdpartners",
    description: `Assigns an existing partner to a coverage cluster`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ partnerId: z.string().uuid() }).passthrough(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("coverage_cluster_partner"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                clusterId: z.string().uuid(),
                partnerId: z.string().uuid(),
                createdAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/admin/dashboard/metrics",
    alias: "getV1admindashboardmetrics",
    description: `Returns orders this month, open orders, customers, and partner store counts.`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("dashboard_metrics"),
            id: z.string().uuid(),
            attributes: z
              .object({
                ordersThisMonth: z.number().int().gte(0),
                openOrders: z.number().int().gte(0),
                customers: z.number().int().gte(0),
                partnerStores: z.number().int().gte(0),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/admin/invites",
    alias: "getV1admininvites",
    description: `Returns invitations newest first with pagination.`,
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(10),
      },
    ],
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("invitation"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  email: z.string().max(255),
                  role: z.enum(["admin", "user", "partner"]),
                  partnerAssignment: z
                    .object({
                      partnerId: z.string().uuid(),
                      partnerRole: z.enum(["owner", "staff"]),
                    })
                    .passthrough()
                    .nullable(),
                  invitedByUserId: z.string().uuid().nullable(),
                  status: z.enum(["pending", "accepted", "revoked"]),
                  acceptedByUserId: z.string().uuid().nullable(),
                  expiresAt: z.string().datetime({ offset: true }),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/admin/invites",
    alias: "postV1admininvites",
    description: `Creates a new invite`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1admininvites_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("invitation"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                email: z.string().max(255),
                role: z.enum(["admin", "user", "partner"]),
                partnerAssignment: z
                  .object({
                    partnerId: z.string().uuid(),
                    partnerRole: z.enum(["owner", "staff"]),
                  })
                  .passthrough()
                  .nullable(),
                invitedByUserId: z.string().uuid().nullable(),
                status: z.enum(["pending", "accepted", "revoked"]),
                acceptedByUserId: z.string().uuid().nullable(),
                expiresAt: z.string().datetime({ offset: true }),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/auth/change-password",
    alias: "postV1authchangePassword",
    description: `Keeps the current session active and revokes other sessions.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1authchangePassword_Body,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 500,
        description: `An unexpected condition was encountered and no more specific message is suitable.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/auth/invitation",
    alias: "postV1authinvitation",
    description: `Checks an invitation without accepting or consuming it.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ token: z.string().regex(/^[a-f0-9]{64}$/) })
          .passthrough(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("invitation"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                email: z.string().max(255),
                role: z.enum(["admin", "user", "partner"]),
                partnerAssignment: z
                  .object({
                    partnerId: z.string().uuid(),
                    partnerRole: z.enum(["owner", "staff"]),
                  })
                  .passthrough()
                  .nullable(),
                invitedByUserId: z.string().uuid().nullable(),
                status: z.enum(["pending", "accepted", "revoked"]),
                acceptedByUserId: z.string().uuid().nullable(),
                expiresAt: z.string().datetime({ offset: true }),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/auth/login",
    alias: "postV1authlogin",
    description: `Validates account credentials and establishes a secure session across persistent cookie layers.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1authlogin_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("auth"),
            id: z.string().uuid(),
            attributes: z
              .object({
                data: z
                  .object({
                    type: z.literal("user"),
                    id: z.string().uuid(),
                    attributes: z
                      .object({
                        id: z.string().uuid(),
                        name: z.string().max(255).nullable(),
                        emailVerifiedAt: z
                          .string()
                          .datetime({ offset: true })
                          .nullable(),
                        firstName: z.string().max(255).nullable(),
                        lastName: z.string().max(255).nullable(),
                        preferredName: z.string().max(255).nullable(),
                        email: z.string().max(255),
                        dob: z.string().nullable(),
                        country: z.string().max(255).nullable(),
                        city: z.string().max(255).nullable(),
                        preferredLanguage: z.string().max(50),
                        interests: z.union([
                          z.string(),
                          z.number(),
                          z.boolean(),
                          z.unknown(),
                          z.record(z.unknown().nullable()),
                          z.array(z.unknown().nullable()),
                        ]),
                        giftingStatements: z.union([
                          z.string(),
                          z.number(),
                          z.boolean(),
                          z.unknown(),
                          z.record(z.unknown().nullable()),
                          z.array(z.unknown().nullable()),
                        ]),
                        role: z.enum(["admin", "user", "partner"]),
                        stripeCustomerId: z.string().max(255).nullable(),
                        stripeAccountId: z.string().max(255).nullable(),
                        avatarUrl: z.string().max(2048).nullable(),
                        createdAt: z.string().datetime({ offset: true }),
                        updatedAt: z.string().datetime({ offset: true }),
                        isFirstLogin: z.boolean(),
                        isOnboarded: z.boolean(),
                        sid: z.string().optional(),
                      })
                      .passthrough(),
                    relationships: z.record(z.unknown().nullable()).optional(),
                    meta: z.record(z.unknown().nullable()).optional(),
                    links: z.record(z.string()).optional(),
                  })
                  .passthrough(),
                links: z.object({ self: z.string() }).passthrough(),
                metadata: z.record(z.unknown().nullable()),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            accessToken: z.string(),
            expiresAt: z.string().datetime({ offset: true }),
            tokenType: z.literal("Bearer"),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/auth/logout",
    alias: "postV1authlogout",
    description: `Revokes the current active database session token and wipes matching browser identification cookies.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/auth/me",
    alias: "getV1authme",
    description: `Returns fully serialized account record info belonging to the requesting session owner.`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("auth"),
            id: z.string().uuid(),
            attributes: z
              .object({
                data: z
                  .object({
                    type: z.literal("user"),
                    id: z.string().uuid(),
                    attributes: z
                      .object({
                        id: z.string().uuid(),
                        name: z.string().max(255).nullable(),
                        emailVerifiedAt: z
                          .string()
                          .datetime({ offset: true })
                          .nullable(),
                        firstName: z.string().max(255).nullable(),
                        lastName: z.string().max(255).nullable(),
                        preferredName: z.string().max(255).nullable(),
                        email: z.string().max(255),
                        dob: z.string().nullable(),
                        country: z.string().max(255).nullable(),
                        city: z.string().max(255).nullable(),
                        preferredLanguage: z.string().max(50),
                        interests: z.union([
                          z.string(),
                          z.number(),
                          z.boolean(),
                          z.unknown(),
                          z.record(z.unknown().nullable()),
                          z.array(z.unknown().nullable()),
                        ]),
                        giftingStatements: z.union([
                          z.string(),
                          z.number(),
                          z.boolean(),
                          z.unknown(),
                          z.record(z.unknown().nullable()),
                          z.array(z.unknown().nullable()),
                        ]),
                        role: z.enum(["admin", "user", "partner"]),
                        stripeCustomerId: z.string().max(255).nullable(),
                        stripeAccountId: z.string().max(255).nullable(),
                        avatarUrl: z.string().max(2048).nullable(),
                        createdAt: z.string().datetime({ offset: true }),
                        updatedAt: z.string().datetime({ offset: true }),
                        isFirstLogin: z.boolean(),
                        isOnboarded: z.boolean(),
                        sid: z.string().optional(),
                      })
                      .passthrough(),
                    relationships: z.record(z.unknown().nullable()).optional(),
                    meta: z.record(z.unknown().nullable()).optional(),
                    links: z.record(z.string()).optional(),
                  })
                  .passthrough(),
                links: z.object({ self: z.string() }).passthrough(),
                metadata: z.record(z.unknown().nullable()),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/auth/refresh",
    alias: "postV1authrefresh",
    description: `Validates refresh cookie and returns new token data and metadata.`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("refreshToken"),
            id: z.string().uuid(),
            attributes: z.object({ token: z.string() }).passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            accessToken: z.string(),
            expiresAt: z.string().datetime({ offset: true }),
            tokenType: z.literal("Bearer"),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 500,
        description: `An unexpected condition was encountered and no more specific message is suitable.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/auth/resend-verification",
    alias: "postV1authresendVerification",
    description: `Queues a new verification email for the specified user.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ email: z.string().email() }).passthrough(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("emailVerificationStatus"),
            id: z.string().uuid(),
            attributes: z.object({ message: z.string() }).passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 429,
        description: `The user has sent too many requests in a given amount of time.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 500,
        description: `An unexpected condition was encountered and no more specific message is suitable.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/auth/reset-password",
    alias: "postV1authresetPassword",
    description: `Validates the new password before consuming the single-use recovery token.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1authresetPassword_Body,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 410,
        description: `The requested resource is no longer available and will not be available again.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 500,
        description: `An unexpected condition was encountered and no more specific message is suitable.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/auth/reset-password-request",
    alias: "postV1authresetPasswordRequest",
    description: `Dispatches transactional recovery emails carrying secure signature parameters to verify state ownership.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ email: z.string().email() }).passthrough(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/auth/signup",
    alias: "postV1authsignup",
    description: `Creates a new user account and provisions authentication session tokens via http-only cookies.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1authsignup_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("auth"),
            id: z.string().uuid(),
            attributes: z
              .object({
                data: z
                  .object({
                    type: z.literal("user"),
                    id: z.string().uuid(),
                    attributes: z
                      .object({
                        id: z.string().uuid(),
                        name: z.string().max(255).nullable(),
                        emailVerifiedAt: z
                          .string()
                          .datetime({ offset: true })
                          .nullable(),
                        firstName: z.string().max(255).nullable(),
                        lastName: z.string().max(255).nullable(),
                        preferredName: z.string().max(255).nullable(),
                        email: z.string().max(255),
                        dob: z.string().nullable(),
                        country: z.string().max(255).nullable(),
                        city: z.string().max(255).nullable(),
                        preferredLanguage: z.string().max(50),
                        interests: z.union([
                          z.string(),
                          z.number(),
                          z.boolean(),
                          z.unknown(),
                          z.record(z.unknown().nullable()),
                          z.array(z.unknown().nullable()),
                        ]),
                        giftingStatements: z.union([
                          z.string(),
                          z.number(),
                          z.boolean(),
                          z.unknown(),
                          z.record(z.unknown().nullable()),
                          z.array(z.unknown().nullable()),
                        ]),
                        role: z.enum(["admin", "user", "partner"]),
                        stripeCustomerId: z.string().max(255).nullable(),
                        stripeAccountId: z.string().max(255).nullable(),
                        avatarUrl: z.string().max(2048).nullable(),
                        createdAt: z.string().datetime({ offset: true }),
                        updatedAt: z.string().datetime({ offset: true }),
                        isFirstLogin: z.boolean(),
                        isOnboarded: z.boolean(),
                        sid: z.string().optional(),
                      })
                      .passthrough(),
                    relationships: z.record(z.unknown().nullable()).optional(),
                    meta: z.record(z.unknown().nullable()).optional(),
                    links: z.record(z.string()).optional(),
                  })
                  .passthrough(),
                links: z.object({ self: z.string() }).passthrough(),
                metadata: z.record(z.unknown().nullable()),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            accessToken: z.string(),
            expiresAt: z.string().datetime({ offset: true }),
            tokenType: z.literal("Bearer"),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `User registration conflict: Email address already registered`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/auth/verify-email",
    alias: "postV1authverifyEmail",
    description: `Consumes a secure link to mark a user&#x27;s email as verified.`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("emailVerificationStatus"),
            id: z.string().uuid(),
            attributes: z.object({ message: z.string() }).passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 429,
        description: `The user has sent too many requests in a given amount of time.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 500,
        description: `An unexpected condition was encountered and no more specific message is suitable.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/classifier/answers",
    alias: "postV1classifieranswers",
    description: `Registers a choice option tied directly to a specific parent classifier question resource block.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1classifieranswers_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("classifier-answer"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                questionId: z.string().uuid(),
                label: z.string(),
                mappedIntentId: z.string().uuid().nullable(),
                mappedRelationshipDepth: z
                  .enum(["FORMAL", "FAMILIAR", "VERY_CLOSE", null])
                  .nullable(),
                mappedSignalIntensity: z
                  .enum(["LIGHT", "NOTICEABLE", "QUIET_AND_DEEP", null])
                  .nullable(),
                triggersStage: z.string().nullable(),
                weight: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                createdBy: z.string().uuid().nullable(),
                updatedBy: z.string().uuid().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/classifier/questions",
    alias: "getV1classifierquestions",
    description: `Fetches a collection of available classification onboarding questions along with their nested option answer structures.`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("question-with-answers"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  title: z.string(),
                  prompt: z.string(),
                  step: z.string(),
                  type: z.enum([
                    "SINGLE_CHOICE",
                    "MULTIPLE_CHOICE",
                    "SCALE",
                    "BOOLEAN",
                  ]),
                  scope: z
                    .enum(["RELATIONSHIP", "OCCASION", "PROCESS", null])
                    .nullable(),
                  isActive: z.boolean(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  createdBy: z.string().uuid().nullable(),
                  updatedBy: z.string().uuid().nullable(),
                  answers: z.array(
                    z
                      .object({
                        id: z.string().uuid(),
                        questionId: z.string().uuid(),
                        label: z.string(),
                        mappedIntentId: z.string().uuid().nullable(),
                        mappedRelationshipDepth: z
                          .enum(["FORMAL", "FAMILIAR", "VERY_CLOSE", null])
                          .nullable(),
                        mappedSignalIntensity: z
                          .enum(["LIGHT", "NOTICEABLE", "QUIET_AND_DEEP", null])
                          .nullable(),
                        triggersStage: z.string().nullable(),
                        weight: z
                          .number()
                          .int()
                          .gte(-2147483648)
                          .lte(2147483647)
                          .nullable(),
                        createdAt: z.string().datetime({ offset: true }),
                        updatedAt: z.string().datetime({ offset: true }),
                        createdBy: z.string().uuid().nullable(),
                        updatedBy: z.string().uuid().nullable(),
                      })
                      .passthrough()
                  ),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
  },
  {
    method: "post",
    path: "/v1/classifier/questions",
    alias: "postV1classifierquestions",
    description: `Creates a baseline system question mapped inside the user filtering matrices.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1classifierquestions_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("classifier-question"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                title: z.string(),
                prompt: z.string(),
                step: z.string(),
                type: z.enum([
                  "SINGLE_CHOICE",
                  "MULTIPLE_CHOICE",
                  "SCALE",
                  "BOOLEAN",
                ]),
                scope: z
                  .enum(["RELATIONSHIP", "OCCASION", "PROCESS", null])
                  .nullable(),
                isActive: z.boolean(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                createdBy: z.string().uuid().nullable(),
                updatedBy: z.string().uuid().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/classifier/questions/:questionId",
    alias: "getV1classifierquestionsQuestionId",
    description: `Fetches detailed metadata and related options for an individual classifier question by its unique identifier.`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("classifier-question"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                title: z.string(),
                prompt: z.string(),
                step: z.string(),
                type: z.enum([
                  "SINGLE_CHOICE",
                  "MULTIPLE_CHOICE",
                  "SCALE",
                  "BOOLEAN",
                ]),
                scope: z
                  .enum(["RELATIONSHIP", "OCCASION", "PROCESS", null])
                  .nullable(),
                isActive: z.boolean(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                createdBy: z.string().uuid().nullable(),
                updatedBy: z.string().uuid().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/decisions/:occasionId/assistance",
    alias: "postV1decisionsOccasionIdassistance",
    description: `Records a user&#x27;s gifting selection decision for a designated occasion and triggers associated workflow side-effects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1decisionsOccasionIdassistance_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("decision"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                userId: z.string().uuid(),
                occasionId: z.string().uuid(),
                relationshipId: z.string().uuid().nullable(),
                processId: z.string().uuid().nullable(),
                decisionType: z.enum([
                  "INQUIRY",
                  "SELECTION",
                  "OPERATIONAL",
                  "INTENT",
                ]),
                decisionKey: z.string(),
                decisionValue: z.string(),
                resolvedAt: z.string().datetime({ offset: true }),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/decisions/:processId/selection",
    alias: "postV1decisionsProcessIdselection",
    description: `Selects a specific gift choice for the ongoing gifting process tracking matrix and advances state workflow.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ giftId: z.string().uuid() }).passthrough(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("decision"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                userId: z.string().uuid(),
                occasionId: z.string().uuid(),
                relationshipId: z.string().uuid().nullable(),
                processId: z.string().uuid().nullable(),
                decisionType: z.enum([
                  "INQUIRY",
                  "SELECTION",
                  "OPERATIONAL",
                  "INTENT",
                ]),
                decisionKey: z.string(),
                decisionValue: z.string(),
                resolvedAt: z.string().datetime({ offset: true }),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process",
    alias: "postV1giftProcess",
    description: `Creates a new gifting process using a recipient email. Supports both occasion-guided and direct entry modes.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1giftProcess_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftProcess"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                sourceProcessId: z.string().uuid().nullable(),
                supersededByProcessId: z.string().uuid().nullable(),
                userId: z.string().uuid(),
                name: z.string().max(255).nullable(),
                occasionId: z.string().uuid().nullable(),
                entryMode: z.enum(["occasion_guided", "direct"]),
                status: z
                  .enum([
                    "PROCESS_CREATED",
                    "CLASSIFICATION_STARTED",
                    "CLASSIFICATION_COMPLETED",
                    "VARIANT_SELECTED",
                    "TONE_SELECTED",
                    "GIFT_SET_SELECTED",
                    "INTENT_RESOLVED",
                    "PARTNER_SELECTED",
                    "VOUCHER_SELECTED",
                    "SHIPPING_ADDRESS_ADDED",
                    "READY_FOR_CHECKOUT",
                    "PREPARING_ORDER",
                    "READY_FOR_FULFILLMENT",
                    "ORDER_CONFIRMED",
                    "SENT_TO_FULFILLMENT",
                    "IN_FULFILLMENT",
                    "SHIPPED",
                    "ON_HOLD",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    "VOUCHER_REFUND_PENDING",
                    "DELIVERED",
                    "COMPLETED",
                    "REFUNDED",
                    "FAILED",
                    "CANCELLED",
                    "SUPERSEDED",
                    "MISSED",
                    null,
                  ])
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                recipientId: z.string().uuid(),
                relationshipId: z.string().uuid(),
                resolvedIntentId: z.string().uuid().nullable(),
                selectedSetId: z.string().uuid().nullable(),
                selectedVariantId: z.string().uuid().nullable(),
                partnerId: z.string().uuid().nullable(),
                selectedVoucherId: z.string().uuid().nullable(),
                selectedVoucherValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                variantRequired: z.boolean(),
                voucherRequired: z.boolean(),
                outcome: z
                  .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                  .nullable(),
                detectionStatus: z
                  .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                  .nullable(),
                currentStep: z
                  .enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    null,
                  ])
                  .nullable(),
                selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                toneRecommendationSrc: z.string().nullable(),
                toneLastChangedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                toneLocked: z.boolean(),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                toneOptionsSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingAddressLine: z.string().max(255).nullable(),
                shippingPostalCode: z.string().max(10).nullable(),
                shippingCity: z.string().max(100).nullable(),
                shippingCountryCode: z.string().max(2).nullable(),
                shippingNotes: z.string().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gift-process",
    alias: "getV1giftProcess",
    description: `Returns a list of all active gift processes for the authenticated user. The response metadata carries a pipeline projection per process, including a server-computed progress percentage, so list views do not need to derive pipeline state client side.`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("giftProcess"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  sourceProcessId: z.string().uuid().nullable(),
                  supersededByProcessId: z.string().uuid().nullable(),
                  userId: z.string().uuid(),
                  name: z.string().max(255).nullable(),
                  occasionId: z.string().uuid().nullable(),
                  entryMode: z.enum(["occasion_guided", "direct"]),
                  status: z
                    .enum([
                      "PROCESS_CREATED",
                      "CLASSIFICATION_STARTED",
                      "CLASSIFICATION_COMPLETED",
                      "VARIANT_SELECTED",
                      "TONE_SELECTED",
                      "GIFT_SET_SELECTED",
                      "INTENT_RESOLVED",
                      "PARTNER_SELECTED",
                      "VOUCHER_SELECTED",
                      "SHIPPING_ADDRESS_ADDED",
                      "READY_FOR_CHECKOUT",
                      "PREPARING_ORDER",
                      "READY_FOR_FULFILLMENT",
                      "ORDER_CONFIRMED",
                      "SENT_TO_FULFILLMENT",
                      "IN_FULFILLMENT",
                      "SHIPPED",
                      "ON_HOLD",
                      "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                      "VOUCHER_REFUND_PENDING",
                      "DELIVERED",
                      "COMPLETED",
                      "REFUNDED",
                      "FAILED",
                      "CANCELLED",
                      "SUPERSEDED",
                      "MISSED",
                      null,
                    ])
                    .nullable(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  recipientId: z.string().uuid(),
                  relationshipId: z.string().uuid(),
                  resolvedIntentId: z.string().uuid().nullable(),
                  selectedSetId: z.string().uuid().nullable(),
                  selectedVariantId: z.string().uuid().nullable(),
                  partnerId: z.string().uuid().nullable(),
                  selectedVoucherId: z.string().uuid().nullable(),
                  selectedVoucherValueCents: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647)
                    .nullable(),
                  variantRequired: z.boolean(),
                  voucherRequired: z.boolean(),
                  outcome: z
                    .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                    .nullable(),
                  detectionStatus: z
                    .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                    .nullable(),
                  currentStep: z
                    .enum([
                      "CLASSIFICATION",
                      "AWAITING_VARIANT_SELECTION",
                      "AWAITING_TONE_SELECTION",
                      "AWAITING_PARTNER_SELECTION",
                      "AWAITING_VOUCHER_VALUE",
                      "AWAITING_SHIPPING_ADDRESS",
                      "ORDER_REVIEW",
                      "AWAITING_CHECKOUT",
                      "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                      null,
                    ])
                    .nullable(),
                  selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                  toneRecommendationSrc: z.string().nullable(),
                  toneLastChangedAt: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  toneLocked: z.boolean(),
                  checkoutSnapshot: z.union([
                    z.string(),
                    z.number(),
                    z.boolean(),
                    z.unknown(),
                    z.record(z.unknown().nullable()),
                    z.array(z.unknown().nullable()),
                  ]),
                  toneOptionsSnapshot: z.union([
                    z.string(),
                    z.number(),
                    z.boolean(),
                    z.unknown(),
                    z.record(z.unknown().nullable()),
                    z.array(z.unknown().nullable()),
                  ]),
                  shippingSnapshot: z.union([
                    z.string(),
                    z.number(),
                    z.boolean(),
                    z.unknown(),
                    z.record(z.unknown().nullable()),
                    z.array(z.unknown().nullable()),
                  ]),
                  shippingAddressLine: z.string().max(255).nullable(),
                  shippingPostalCode: z.string().max(10).nullable(),
                  shippingCity: z.string().max(100).nullable(),
                  shippingCountryCode: z.string().max(2).nullable(),
                  shippingNotes: z.string().nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
            pipelines: z.array(
              z
                .object({
                  isPipelineComplete: z.boolean(),
                  currentStepLabel: z.string().nullable(),
                  activeStepKey: z
                    .enum([
                      "CLASSIFICATION",
                      "TONE_SELECTION",
                      "VARIANTS",
                      "ADDRESS",
                      "PARTNERS",
                      "VOUCHERS",
                      null,
                    ])
                    .nullable(),
                  activeStep: z.enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                  ]),
                  outcome: z
                    .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                    .nullable(),
                  progress: z.number().int().gte(0).lte(100),
                  pipeline: z.array(
                    z
                      .object({
                        key: z.enum([
                          "CLASSIFICATION",
                          "TONE_SELECTION",
                          "VARIANTS",
                          "ADDRESS",
                          "PARTNERS",
                          "VOUCHERS",
                        ]),
                        label: z.string().optional(),
                        description: z.string().optional(),
                        icon: z.string().optional(),
                        status: z.enum(["COMPLETED", "IN_PROGRESS", "PENDING"]),
                        outcome: z.enum([
                          "PENDING",
                          "IN_PROGRESS",
                          "COMPLETED",
                          "SELECTED",
                          "SKIPPED",
                        ]),
                        isLocked: z.boolean(),
                        canInteract: z.boolean(),
                      })
                      .passthrough()
                  ),
                  processId: z.string().uuid(),
                })
                .passthrough()
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gift-process/:processId",
    alias: "getV1giftProcessProcessId",
    description: `Returns full operational properties linked to a single specific transaction state identifier.`,
    requestFormat: "json",
    parameters: [
      {
        name: "processId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftProcess"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                sourceProcessId: z.string().uuid().nullable(),
                supersededByProcessId: z.string().uuid().nullable(),
                userId: z.string().uuid(),
                name: z.string().max(255).nullable(),
                occasionId: z.string().uuid().nullable(),
                entryMode: z.enum(["occasion_guided", "direct"]),
                status: z
                  .enum([
                    "PROCESS_CREATED",
                    "CLASSIFICATION_STARTED",
                    "CLASSIFICATION_COMPLETED",
                    "VARIANT_SELECTED",
                    "TONE_SELECTED",
                    "GIFT_SET_SELECTED",
                    "INTENT_RESOLVED",
                    "PARTNER_SELECTED",
                    "VOUCHER_SELECTED",
                    "SHIPPING_ADDRESS_ADDED",
                    "READY_FOR_CHECKOUT",
                    "PREPARING_ORDER",
                    "READY_FOR_FULFILLMENT",
                    "ORDER_CONFIRMED",
                    "SENT_TO_FULFILLMENT",
                    "IN_FULFILLMENT",
                    "SHIPPED",
                    "ON_HOLD",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    "VOUCHER_REFUND_PENDING",
                    "DELIVERED",
                    "COMPLETED",
                    "REFUNDED",
                    "FAILED",
                    "CANCELLED",
                    "SUPERSEDED",
                    "MISSED",
                    null,
                  ])
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                recipientId: z.string().uuid(),
                relationshipId: z.string().uuid(),
                resolvedIntentId: z.string().uuid().nullable(),
                selectedSetId: z.string().uuid().nullable(),
                selectedVariantId: z.string().uuid().nullable(),
                partnerId: z.string().uuid().nullable(),
                selectedVoucherId: z.string().uuid().nullable(),
                selectedVoucherValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                variantRequired: z.boolean(),
                voucherRequired: z.boolean(),
                outcome: z
                  .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                  .nullable(),
                detectionStatus: z
                  .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                  .nullable(),
                currentStep: z
                  .enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    null,
                  ])
                  .nullable(),
                selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                toneRecommendationSrc: z.string().nullable(),
                toneLastChangedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                toneLocked: z.boolean(),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                toneOptionsSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingAddressLine: z.string().max(255).nullable(),
                shippingPostalCode: z.string().max(10).nullable(),
                shippingCity: z.string().max(100).nullable(),
                shippingCountryCode: z.string().max(2).nullable(),
                shippingNotes: z.string().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            isPipelineComplete: z.boolean(),
            currentStepLabel: z.string().nullable(),
            activeStepKey: z
              .enum([
                "CLASSIFICATION",
                "TONE_SELECTION",
                "VARIANTS",
                "ADDRESS",
                "PARTNERS",
                "VOUCHERS",
                null,
              ])
              .nullable(),
            activeStep: z.enum([
              "CLASSIFICATION",
              "AWAITING_VARIANT_SELECTION",
              "AWAITING_TONE_SELECTION",
              "AWAITING_PARTNER_SELECTION",
              "AWAITING_VOUCHER_VALUE",
              "AWAITING_SHIPPING_ADDRESS",
              "ORDER_REVIEW",
              "AWAITING_CHECKOUT",
              "AWAITING_VOUCHER_PAYMENT_RECOVERY",
            ]),
            outcome: z
              .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
              .nullable(),
            progress: z.number().int().gte(0).lte(100),
            pipeline: z.array(
              z
                .object({
                  key: z.enum([
                    "CLASSIFICATION",
                    "TONE_SELECTION",
                    "VARIANTS",
                    "ADDRESS",
                    "PARTNERS",
                    "VOUCHERS",
                  ]),
                  label: z.string().optional(),
                  description: z.string().optional(),
                  icon: z.string().optional(),
                  status: z.enum(["COMPLETED", "IN_PROGRESS", "PENDING"]),
                  outcome: z.enum([
                    "PENDING",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "SELECTED",
                    "SKIPPED",
                  ]),
                  isLocked: z.boolean(),
                  canInteract: z.boolean(),
                })
                .passthrough()
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "put",
    path: "/v1/gift-process/:processId",
    alias: "putV1giftProcessProcessId",
    description: `Updates the display name of a gift process owned by the authenticated user. The name is the only user-mutable field; pipeline state is advanced exclusively through the dedicated step endpoints.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ name: z.string().min(1).max(255) }).passthrough(),
      },
      {
        name: "processId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftProcess"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                sourceProcessId: z.string().uuid().nullable(),
                supersededByProcessId: z.string().uuid().nullable(),
                userId: z.string().uuid(),
                name: z.string().max(255).nullable(),
                occasionId: z.string().uuid().nullable(),
                entryMode: z.enum(["occasion_guided", "direct"]),
                status: z
                  .enum([
                    "PROCESS_CREATED",
                    "CLASSIFICATION_STARTED",
                    "CLASSIFICATION_COMPLETED",
                    "VARIANT_SELECTED",
                    "TONE_SELECTED",
                    "GIFT_SET_SELECTED",
                    "INTENT_RESOLVED",
                    "PARTNER_SELECTED",
                    "VOUCHER_SELECTED",
                    "SHIPPING_ADDRESS_ADDED",
                    "READY_FOR_CHECKOUT",
                    "PREPARING_ORDER",
                    "READY_FOR_FULFILLMENT",
                    "ORDER_CONFIRMED",
                    "SENT_TO_FULFILLMENT",
                    "IN_FULFILLMENT",
                    "SHIPPED",
                    "ON_HOLD",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    "VOUCHER_REFUND_PENDING",
                    "DELIVERED",
                    "COMPLETED",
                    "REFUNDED",
                    "FAILED",
                    "CANCELLED",
                    "SUPERSEDED",
                    "MISSED",
                    null,
                  ])
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                recipientId: z.string().uuid(),
                relationshipId: z.string().uuid(),
                resolvedIntentId: z.string().uuid().nullable(),
                selectedSetId: z.string().uuid().nullable(),
                selectedVariantId: z.string().uuid().nullable(),
                partnerId: z.string().uuid().nullable(),
                selectedVoucherId: z.string().uuid().nullable(),
                selectedVoucherValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                variantRequired: z.boolean(),
                voucherRequired: z.boolean(),
                outcome: z
                  .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                  .nullable(),
                detectionStatus: z
                  .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                  .nullable(),
                currentStep: z
                  .enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    null,
                  ])
                  .nullable(),
                selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                toneRecommendationSrc: z.string().nullable(),
                toneLastChangedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                toneLocked: z.boolean(),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                toneOptionsSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingAddressLine: z.string().max(255).nullable(),
                shippingPostalCode: z.string().max(10).nullable(),
                shippingCity: z.string().max(100).nullable(),
                shippingCountryCode: z.string().max(2).nullable(),
                shippingNotes: z.string().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "delete",
    path: "/v1/gift-process/:processId",
    alias: "deleteV1giftProcessProcessId",
    description: `Hard-deletes a gift process owned by the authenticated user. Fails with 409 CONFLICT if the process has an associated order. Admins can delete processes with no order.`,
    requestFormat: "json",
    parameters: [
      {
        name: "processId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gift-process/:processId/answers",
    alias: "getV1giftProcessProcessIdanswers",
    description: `Retrieves complete answer metrics assigned to onboarding forms mapped to the current context ID.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/checkout-sessions",
    alias: "postV1giftProcessProcessIdcheckoutSessions",
    description: `Finalizes current variables logs records structures and initiates session generation steps through system providers billing modules.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/classify",
    alias: "postV1giftProcessProcessIdclassify",
    description: `Processes answer entries properties lists through filtering systems to establish output parameters targets profiles.`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftProcess"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                sourceProcessId: z.string().uuid().nullable(),
                supersededByProcessId: z.string().uuid().nullable(),
                userId: z.string().uuid(),
                name: z.string().max(255).nullable(),
                occasionId: z.string().uuid().nullable(),
                entryMode: z.enum(["occasion_guided", "direct"]),
                status: z
                  .enum([
                    "PROCESS_CREATED",
                    "CLASSIFICATION_STARTED",
                    "CLASSIFICATION_COMPLETED",
                    "VARIANT_SELECTED",
                    "TONE_SELECTED",
                    "GIFT_SET_SELECTED",
                    "INTENT_RESOLVED",
                    "PARTNER_SELECTED",
                    "VOUCHER_SELECTED",
                    "SHIPPING_ADDRESS_ADDED",
                    "READY_FOR_CHECKOUT",
                    "PREPARING_ORDER",
                    "READY_FOR_FULFILLMENT",
                    "ORDER_CONFIRMED",
                    "SENT_TO_FULFILLMENT",
                    "IN_FULFILLMENT",
                    "SHIPPED",
                    "ON_HOLD",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    "VOUCHER_REFUND_PENDING",
                    "DELIVERED",
                    "COMPLETED",
                    "REFUNDED",
                    "FAILED",
                    "CANCELLED",
                    "SUPERSEDED",
                    "MISSED",
                    null,
                  ])
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                recipientId: z.string().uuid(),
                relationshipId: z.string().uuid(),
                resolvedIntentId: z.string().uuid().nullable(),
                selectedSetId: z.string().uuid().nullable(),
                selectedVariantId: z.string().uuid().nullable(),
                partnerId: z.string().uuid().nullable(),
                selectedVoucherId: z.string().uuid().nullable(),
                selectedVoucherValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                variantRequired: z.boolean(),
                voucherRequired: z.boolean(),
                outcome: z
                  .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                  .nullable(),
                detectionStatus: z
                  .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                  .nullable(),
                currentStep: z
                  .enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    null,
                  ])
                  .nullable(),
                selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                toneRecommendationSrc: z.string().nullable(),
                toneLastChangedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                toneLocked: z.boolean(),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                toneOptionsSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingAddressLine: z.string().max(255).nullable(),
                shippingPostalCode: z.string().max(10).nullable(),
                shippingCity: z.string().max(100).nullable(),
                shippingCountryCode: z.string().max(2).nullable(),
                shippingNotes: z.string().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            isPipelineComplete: z.boolean(),
            currentStepLabel: z.string().nullable(),
            activeStepKey: z
              .enum([
                "CLASSIFICATION",
                "TONE_SELECTION",
                "VARIANTS",
                "ADDRESS",
                "PARTNERS",
                "VOUCHERS",
                null,
              ])
              .nullable(),
            activeStep: z.enum([
              "CLASSIFICATION",
              "AWAITING_VARIANT_SELECTION",
              "AWAITING_TONE_SELECTION",
              "AWAITING_PARTNER_SELECTION",
              "AWAITING_VOUCHER_VALUE",
              "AWAITING_SHIPPING_ADDRESS",
              "ORDER_REVIEW",
              "AWAITING_CHECKOUT",
              "AWAITING_VOUCHER_PAYMENT_RECOVERY",
            ]),
            outcome: z
              .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
              .nullable(),
            progress: z.number().int().gte(0).lte(100),
            pipeline: z.array(
              z
                .object({
                  key: z.enum([
                    "CLASSIFICATION",
                    "TONE_SELECTION",
                    "VARIANTS",
                    "ADDRESS",
                    "PARTNERS",
                    "VOUCHERS",
                  ]),
                  label: z.string().optional(),
                  description: z.string().optional(),
                  icon: z.string().optional(),
                  status: z.enum(["COMPLETED", "IN_PROGRESS", "PENDING"]),
                  outcome: z.enum([
                    "PENDING",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "SELECTED",
                    "SKIPPED",
                  ]),
                  isLocked: z.boolean(),
                  canInteract: z.boolean(),
                })
                .passthrough()
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/confirm-shipping",
    alias: "postV1giftProcessProcessIdconfirmShipping",
    description: `Validates destination recipient fields details variables and applies routing components configurations settings.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1giftProcessProcessIdconfirmShipping_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftProcess"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                sourceProcessId: z.string().uuid().nullable(),
                supersededByProcessId: z.string().uuid().nullable(),
                userId: z.string().uuid(),
                name: z.string().max(255).nullable(),
                occasionId: z.string().uuid().nullable(),
                entryMode: z.enum(["occasion_guided", "direct"]),
                status: z
                  .enum([
                    "PROCESS_CREATED",
                    "CLASSIFICATION_STARTED",
                    "CLASSIFICATION_COMPLETED",
                    "VARIANT_SELECTED",
                    "TONE_SELECTED",
                    "GIFT_SET_SELECTED",
                    "INTENT_RESOLVED",
                    "PARTNER_SELECTED",
                    "VOUCHER_SELECTED",
                    "SHIPPING_ADDRESS_ADDED",
                    "READY_FOR_CHECKOUT",
                    "PREPARING_ORDER",
                    "READY_FOR_FULFILLMENT",
                    "ORDER_CONFIRMED",
                    "SENT_TO_FULFILLMENT",
                    "IN_FULFILLMENT",
                    "SHIPPED",
                    "ON_HOLD",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    "VOUCHER_REFUND_PENDING",
                    "DELIVERED",
                    "COMPLETED",
                    "REFUNDED",
                    "FAILED",
                    "CANCELLED",
                    "SUPERSEDED",
                    "MISSED",
                    null,
                  ])
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                recipientId: z.string().uuid(),
                relationshipId: z.string().uuid(),
                resolvedIntentId: z.string().uuid().nullable(),
                selectedSetId: z.string().uuid().nullable(),
                selectedVariantId: z.string().uuid().nullable(),
                partnerId: z.string().uuid().nullable(),
                selectedVoucherId: z.string().uuid().nullable(),
                selectedVoucherValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                variantRequired: z.boolean(),
                voucherRequired: z.boolean(),
                outcome: z
                  .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                  .nullable(),
                detectionStatus: z
                  .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                  .nullable(),
                currentStep: z
                  .enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    null,
                  ])
                  .nullable(),
                selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                toneRecommendationSrc: z.string().nullable(),
                toneLastChangedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                toneLocked: z.boolean(),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                toneOptionsSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingAddressLine: z.string().max(255).nullable(),
                shippingPostalCode: z.string().max(10).nullable(),
                shippingCity: z.string().max(100).nullable(),
                shippingCountryCode: z.string().max(2).nullable(),
                shippingNotes: z.string().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            isPipelineComplete: z.boolean(),
            currentStepLabel: z.string().nullable(),
            activeStepKey: z
              .enum([
                "CLASSIFICATION",
                "TONE_SELECTION",
                "VARIANTS",
                "ADDRESS",
                "PARTNERS",
                "VOUCHERS",
                null,
              ])
              .nullable(),
            activeStep: z.enum([
              "CLASSIFICATION",
              "AWAITING_VARIANT_SELECTION",
              "AWAITING_TONE_SELECTION",
              "AWAITING_PARTNER_SELECTION",
              "AWAITING_VOUCHER_VALUE",
              "AWAITING_SHIPPING_ADDRESS",
              "ORDER_REVIEW",
              "AWAITING_CHECKOUT",
              "AWAITING_VOUCHER_PAYMENT_RECOVERY",
            ]),
            outcome: z
              .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
              .nullable(),
            progress: z.number().int().gte(0).lte(100),
            pipeline: z.array(
              z
                .object({
                  key: z.enum([
                    "CLASSIFICATION",
                    "TONE_SELECTION",
                    "VARIANTS",
                    "ADDRESS",
                    "PARTNERS",
                    "VOUCHERS",
                  ]),
                  label: z.string().optional(),
                  description: z.string().optional(),
                  icon: z.string().optional(),
                  status: z.enum(["COMPLETED", "IN_PROGRESS", "PENDING"]),
                  outcome: z.enum([
                    "PENDING",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "SELECTED",
                    "SKIPPED",
                  ]),
                  isLocked: z.boolean(),
                  canInteract: z.boolean(),
                })
                .passthrough()
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gift-process/:processId/order-preview",
    alias: "getV1giftProcessProcessIdorderPreview",
    description: `Evaluates aggregate items arrays configurations and provides mock calculations outlining fees and delivery projections.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gift-process/:processId/partner-options",
    alias: "getV1giftProcessProcessIdpartnerOptions",
    description: `Returns valid available alternative external fulfillers and brand profile integrations available to handle current requirements.`,
    requestFormat: "json",
    parameters: [
      {
        name: "processId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("partner"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  externalId: z.string().max(50).nullable(),
                  name: z.string().max(255),
                  category: z.string().max(100),
                  voucherType: z.string().max(100),
                  city: z.string().max(255),
                  postalCode: z.string().max(5),
                  countryCode: z.string().max(2),
                  latitude: z
                    .number()
                    .gte(-140737488355328)
                    .lte(140737488355327)
                    .nullable(),
                  longitude: z
                    .number()
                    .gte(-140737488355328)
                    .lte(140737488355327)
                    .nullable(),
                  energyLevel: z
                    .enum(["calm", "balanced", "active", null])
                    .nullable(),
                  socialMode: z
                    .enum(["solo", "duo", "social", null])
                    .nullable(),
                  coverage: z.enum(["none", "low", "high"]),
                  active: z.boolean(),
                  priority: z.number().int().gte(-2147483648).lte(2147483647),
                  source: z.string().max(50).nullable(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  createdBy: z.string().uuid().nullable(),
                  updatedBy: z.string().uuid().nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
            partnerId: z.string().uuid().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/recovery/cancel",
    alias: "postV1giftProcessProcessIdrecoverycancel",
    description: `Requests a full platform refund for the process order and marks the process REFUNDED. Admin only.`,
    requestFormat: "json",
    parameters: [
      {
        name: "processId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftProcess"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                sourceProcessId: z.string().uuid().nullable(),
                supersededByProcessId: z.string().uuid().nullable(),
                userId: z.string().uuid(),
                name: z.string().max(255).nullable(),
                occasionId: z.string().uuid().nullable(),
                entryMode: z.enum(["occasion_guided", "direct"]),
                status: z
                  .enum([
                    "PROCESS_CREATED",
                    "CLASSIFICATION_STARTED",
                    "CLASSIFICATION_COMPLETED",
                    "VARIANT_SELECTED",
                    "TONE_SELECTED",
                    "GIFT_SET_SELECTED",
                    "INTENT_RESOLVED",
                    "PARTNER_SELECTED",
                    "VOUCHER_SELECTED",
                    "SHIPPING_ADDRESS_ADDED",
                    "READY_FOR_CHECKOUT",
                    "PREPARING_ORDER",
                    "READY_FOR_FULFILLMENT",
                    "ORDER_CONFIRMED",
                    "SENT_TO_FULFILLMENT",
                    "IN_FULFILLMENT",
                    "SHIPPED",
                    "ON_HOLD",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    "VOUCHER_REFUND_PENDING",
                    "DELIVERED",
                    "COMPLETED",
                    "REFUNDED",
                    "FAILED",
                    "CANCELLED",
                    "SUPERSEDED",
                    "MISSED",
                    null,
                  ])
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                recipientId: z.string().uuid(),
                relationshipId: z.string().uuid(),
                resolvedIntentId: z.string().uuid().nullable(),
                selectedSetId: z.string().uuid().nullable(),
                selectedVariantId: z.string().uuid().nullable(),
                partnerId: z.string().uuid().nullable(),
                selectedVoucherId: z.string().uuid().nullable(),
                selectedVoucherValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                variantRequired: z.boolean(),
                voucherRequired: z.boolean(),
                outcome: z
                  .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                  .nullable(),
                detectionStatus: z
                  .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                  .nullable(),
                currentStep: z
                  .enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    null,
                  ])
                  .nullable(),
                selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                toneRecommendationSrc: z.string().nullable(),
                toneLastChangedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                toneLocked: z.boolean(),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                toneOptionsSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingAddressLine: z.string().max(255).nullable(),
                shippingPostalCode: z.string().max(10).nullable(),
                shippingCity: z.string().max(100).nullable(),
                shippingCountryCode: z.string().max(2).nullable(),
                shippingNotes: z.string().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/recovery/retry-partner",
    alias: "postV1giftProcessProcessIdrecoveryretryPartner",
    description: `Creates a voucher-only checkout session (payment_step &quot;b&quot;) so the customer can re-pay the voucher portion after a recovery refund. Admin only.`,
    requestFormat: "json",
    parameters: [
      {
        name: "processId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({ id: z.string(), url: z.string().url() }).passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gift-process/:processId/recovery/status",
    alias: "getV1giftProcessProcessIdrecoverystatus",
    description: `Returns the current recovery status, step, outcome, source process link, and terminal/recovery flags for a gift process. Admin only.`,
    requestFormat: "json",
    parameters: [
      {
        name: "processId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        processId: z.string().uuid(),
        status: z
          .enum([
            "PROCESS_CREATED",
            "CLASSIFICATION_STARTED",
            "CLASSIFICATION_COMPLETED",
            "VARIANT_SELECTED",
            "TONE_SELECTED",
            "GIFT_SET_SELECTED",
            "INTENT_RESOLVED",
            "PARTNER_SELECTED",
            "VOUCHER_SELECTED",
            "SHIPPING_ADDRESS_ADDED",
            "READY_FOR_CHECKOUT",
            "PREPARING_ORDER",
            "READY_FOR_FULFILLMENT",
            "ORDER_CONFIRMED",
            "SENT_TO_FULFILLMENT",
            "IN_FULFILLMENT",
            "SHIPPED",
            "ON_HOLD",
            "AWAITING_VOUCHER_PAYMENT_RECOVERY",
            "VOUCHER_REFUND_PENDING",
            "DELIVERED",
            "COMPLETED",
            "REFUNDED",
            "FAILED",
            "CANCELLED",
            "SUPERSEDED",
            "MISSED",
            null,
          ])
          .nullable(),
        currentStep: z
          .enum([
            "CLASSIFICATION",
            "AWAITING_VARIANT_SELECTION",
            "AWAITING_TONE_SELECTION",
            "AWAITING_PARTNER_SELECTION",
            "AWAITING_VOUCHER_VALUE",
            "AWAITING_SHIPPING_ADDRESS",
            "ORDER_REVIEW",
            "AWAITING_CHECKOUT",
            "AWAITING_VOUCHER_PAYMENT_RECOVERY",
            null,
          ])
          .nullable(),
        outcome: z
          .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
          .nullable(),
        sourceProcessId: z.string().uuid().nullable(),
        supersededByProcessId: z.string().uuid().nullable(),
        voucherRequired: z.boolean(),
        inRecovery: z.boolean(),
        refundPending: z.boolean(),
        terminal: z.boolean(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/recovery/supersede",
    alias: "postV1giftProcessProcessIdrecoverysupersede",
    description: `Clones a paid SET_AND_VOUCHER process into a SET_ONLY continuation (linked via source_process_id) and queues a partial refund of the failed voucher portion. Admin only.`,
    requestFormat: "json",
    parameters: [
      {
        name: "processId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftProcess"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                sourceProcessId: z.string().uuid().nullable(),
                supersededByProcessId: z.string().uuid().nullable(),
                userId: z.string().uuid(),
                name: z.string().max(255).nullable(),
                occasionId: z.string().uuid().nullable(),
                entryMode: z.enum(["occasion_guided", "direct"]),
                status: z
                  .enum([
                    "PROCESS_CREATED",
                    "CLASSIFICATION_STARTED",
                    "CLASSIFICATION_COMPLETED",
                    "VARIANT_SELECTED",
                    "TONE_SELECTED",
                    "GIFT_SET_SELECTED",
                    "INTENT_RESOLVED",
                    "PARTNER_SELECTED",
                    "VOUCHER_SELECTED",
                    "SHIPPING_ADDRESS_ADDED",
                    "READY_FOR_CHECKOUT",
                    "PREPARING_ORDER",
                    "READY_FOR_FULFILLMENT",
                    "ORDER_CONFIRMED",
                    "SENT_TO_FULFILLMENT",
                    "IN_FULFILLMENT",
                    "SHIPPED",
                    "ON_HOLD",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    "VOUCHER_REFUND_PENDING",
                    "DELIVERED",
                    "COMPLETED",
                    "REFUNDED",
                    "FAILED",
                    "CANCELLED",
                    "SUPERSEDED",
                    "MISSED",
                    null,
                  ])
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                recipientId: z.string().uuid(),
                relationshipId: z.string().uuid(),
                resolvedIntentId: z.string().uuid().nullable(),
                selectedSetId: z.string().uuid().nullable(),
                selectedVariantId: z.string().uuid().nullable(),
                partnerId: z.string().uuid().nullable(),
                selectedVoucherId: z.string().uuid().nullable(),
                selectedVoucherValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                variantRequired: z.boolean(),
                voucherRequired: z.boolean(),
                outcome: z
                  .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                  .nullable(),
                detectionStatus: z
                  .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                  .nullable(),
                currentStep: z
                  .enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    null,
                  ])
                  .nullable(),
                selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                toneRecommendationSrc: z.string().nullable(),
                toneLastChangedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                toneLocked: z.boolean(),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                toneOptionsSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingAddressLine: z.string().max(255).nullable(),
                shippingPostalCode: z.string().max(10).nullable(),
                shippingCity: z.string().max(100).nullable(),
                shippingCountryCode: z.string().max(2).nullable(),
                shippingNotes: z.string().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/revert",
    alias: "postV1giftProcessProcessIdrevert",
    description: `Points currentStep back at an earlier step and clears every selection made downstream of it, so the step can be answered again without a stale downstream choice surviving. The target must belong to the process&#x27;s resolved outcome flow and must not be later than the current step; anything else is rejected with 400. A process that has already been confirmed is rejected with 409, since rewinding it would orphan the order those selections priced. Unlike the step submission endpoints this moves backwards, which is why it exists separately rather than reusing advanceGiftProcess.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1giftProcessProcessIdrevert_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftProcess"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                sourceProcessId: z.string().uuid().nullable(),
                supersededByProcessId: z.string().uuid().nullable(),
                userId: z.string().uuid(),
                name: z.string().max(255).nullable(),
                occasionId: z.string().uuid().nullable(),
                entryMode: z.enum(["occasion_guided", "direct"]),
                status: z
                  .enum([
                    "PROCESS_CREATED",
                    "CLASSIFICATION_STARTED",
                    "CLASSIFICATION_COMPLETED",
                    "VARIANT_SELECTED",
                    "TONE_SELECTED",
                    "GIFT_SET_SELECTED",
                    "INTENT_RESOLVED",
                    "PARTNER_SELECTED",
                    "VOUCHER_SELECTED",
                    "SHIPPING_ADDRESS_ADDED",
                    "READY_FOR_CHECKOUT",
                    "PREPARING_ORDER",
                    "READY_FOR_FULFILLMENT",
                    "ORDER_CONFIRMED",
                    "SENT_TO_FULFILLMENT",
                    "IN_FULFILLMENT",
                    "SHIPPED",
                    "ON_HOLD",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    "VOUCHER_REFUND_PENDING",
                    "DELIVERED",
                    "COMPLETED",
                    "REFUNDED",
                    "FAILED",
                    "CANCELLED",
                    "SUPERSEDED",
                    "MISSED",
                    null,
                  ])
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                recipientId: z.string().uuid(),
                relationshipId: z.string().uuid(),
                resolvedIntentId: z.string().uuid().nullable(),
                selectedSetId: z.string().uuid().nullable(),
                selectedVariantId: z.string().uuid().nullable(),
                partnerId: z.string().uuid().nullable(),
                selectedVoucherId: z.string().uuid().nullable(),
                selectedVoucherValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                variantRequired: z.boolean(),
                voucherRequired: z.boolean(),
                outcome: z
                  .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                  .nullable(),
                detectionStatus: z
                  .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                  .nullable(),
                currentStep: z
                  .enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    null,
                  ])
                  .nullable(),
                selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                toneRecommendationSrc: z.string().nullable(),
                toneLastChangedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                toneLocked: z.boolean(),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                toneOptionsSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingAddressLine: z.string().max(255).nullable(),
                shippingPostalCode: z.string().max(10).nullable(),
                shippingCity: z.string().max(100).nullable(),
                shippingCountryCode: z.string().max(2).nullable(),
                shippingNotes: z.string().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            isPipelineComplete: z.boolean(),
            currentStepLabel: z.string().nullable(),
            activeStepKey: z
              .enum([
                "CLASSIFICATION",
                "TONE_SELECTION",
                "VARIANTS",
                "ADDRESS",
                "PARTNERS",
                "VOUCHERS",
                null,
              ])
              .nullable(),
            activeStep: z.enum([
              "CLASSIFICATION",
              "AWAITING_VARIANT_SELECTION",
              "AWAITING_TONE_SELECTION",
              "AWAITING_PARTNER_SELECTION",
              "AWAITING_VOUCHER_VALUE",
              "AWAITING_SHIPPING_ADDRESS",
              "ORDER_REVIEW",
              "AWAITING_CHECKOUT",
              "AWAITING_VOUCHER_PAYMENT_RECOVERY",
            ]),
            outcome: z
              .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
              .nullable(),
            progress: z.number().int().gte(0).lte(100),
            pipeline: z.array(
              z
                .object({
                  key: z.enum([
                    "CLASSIFICATION",
                    "TONE_SELECTION",
                    "VARIANTS",
                    "ADDRESS",
                    "PARTNERS",
                    "VOUCHERS",
                  ]),
                  label: z.string().optional(),
                  description: z.string().optional(),
                  icon: z.string().optional(),
                  status: z.enum(["COMPLETED", "IN_PROGRESS", "PENDING"]),
                  outcome: z.enum([
                    "PENDING",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "SELECTED",
                    "SKIPPED",
                  ]),
                  isLocked: z.boolean(),
                  canInteract: z.boolean(),
                })
                .passthrough()
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/select-partner",
    alias: "postV1giftProcessProcessIdselectPartner",
    description: `Submits selected brand configuration markers explicitly into active workflow configurations.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1giftProcessProcessIdselectPartner_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftProcess"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                sourceProcessId: z.string().uuid().nullable(),
                supersededByProcessId: z.string().uuid().nullable(),
                userId: z.string().uuid(),
                name: z.string().max(255).nullable(),
                occasionId: z.string().uuid().nullable(),
                entryMode: z.enum(["occasion_guided", "direct"]),
                status: z
                  .enum([
                    "PROCESS_CREATED",
                    "CLASSIFICATION_STARTED",
                    "CLASSIFICATION_COMPLETED",
                    "VARIANT_SELECTED",
                    "TONE_SELECTED",
                    "GIFT_SET_SELECTED",
                    "INTENT_RESOLVED",
                    "PARTNER_SELECTED",
                    "VOUCHER_SELECTED",
                    "SHIPPING_ADDRESS_ADDED",
                    "READY_FOR_CHECKOUT",
                    "PREPARING_ORDER",
                    "READY_FOR_FULFILLMENT",
                    "ORDER_CONFIRMED",
                    "SENT_TO_FULFILLMENT",
                    "IN_FULFILLMENT",
                    "SHIPPED",
                    "ON_HOLD",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    "VOUCHER_REFUND_PENDING",
                    "DELIVERED",
                    "COMPLETED",
                    "REFUNDED",
                    "FAILED",
                    "CANCELLED",
                    "SUPERSEDED",
                    "MISSED",
                    null,
                  ])
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                recipientId: z.string().uuid(),
                relationshipId: z.string().uuid(),
                resolvedIntentId: z.string().uuid().nullable(),
                selectedSetId: z.string().uuid().nullable(),
                selectedVariantId: z.string().uuid().nullable(),
                partnerId: z.string().uuid().nullable(),
                selectedVoucherId: z.string().uuid().nullable(),
                selectedVoucherValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                variantRequired: z.boolean(),
                voucherRequired: z.boolean(),
                outcome: z
                  .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                  .nullable(),
                detectionStatus: z
                  .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                  .nullable(),
                currentStep: z
                  .enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    null,
                  ])
                  .nullable(),
                selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                toneRecommendationSrc: z.string().nullable(),
                toneLastChangedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                toneLocked: z.boolean(),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                toneOptionsSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingAddressLine: z.string().max(255).nullable(),
                shippingPostalCode: z.string().max(10).nullable(),
                shippingCity: z.string().max(100).nullable(),
                shippingCountryCode: z.string().max(2).nullable(),
                shippingNotes: z.string().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            isPipelineComplete: z.boolean(),
            currentStepLabel: z.string().nullable(),
            activeStepKey: z
              .enum([
                "CLASSIFICATION",
                "TONE_SELECTION",
                "VARIANTS",
                "ADDRESS",
                "PARTNERS",
                "VOUCHERS",
                null,
              ])
              .nullable(),
            activeStep: z.enum([
              "CLASSIFICATION",
              "AWAITING_VARIANT_SELECTION",
              "AWAITING_TONE_SELECTION",
              "AWAITING_PARTNER_SELECTION",
              "AWAITING_VOUCHER_VALUE",
              "AWAITING_SHIPPING_ADDRESS",
              "ORDER_REVIEW",
              "AWAITING_CHECKOUT",
              "AWAITING_VOUCHER_PAYMENT_RECOVERY",
            ]),
            outcome: z
              .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
              .nullable(),
            progress: z.number().int().gte(0).lte(100),
            pipeline: z.array(
              z
                .object({
                  key: z.enum([
                    "CLASSIFICATION",
                    "TONE_SELECTION",
                    "VARIANTS",
                    "ADDRESS",
                    "PARTNERS",
                    "VOUCHERS",
                  ]),
                  label: z.string().optional(),
                  description: z.string().optional(),
                  icon: z.string().optional(),
                  status: z.enum(["COMPLETED", "IN_PROGRESS", "PENDING"]),
                  outcome: z.enum([
                    "PENDING",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "SELECTED",
                    "SKIPPED",
                  ]),
                  isLocked: z.boolean(),
                  canInteract: z.boolean(),
                })
                .passthrough()
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/select-set",
    alias: "postV1giftProcessProcessIdselectSet",
    description: `Saves chosen template package definitions references directly to system tracks variables matrices.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ selectedSetId: z.string() }).passthrough(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftProcess"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                sourceProcessId: z.string().uuid().nullable(),
                supersededByProcessId: z.string().uuid().nullable(),
                userId: z.string().uuid(),
                name: z.string().max(255).nullable(),
                occasionId: z.string().uuid().nullable(),
                entryMode: z.enum(["occasion_guided", "direct"]),
                status: z
                  .enum([
                    "PROCESS_CREATED",
                    "CLASSIFICATION_STARTED",
                    "CLASSIFICATION_COMPLETED",
                    "VARIANT_SELECTED",
                    "TONE_SELECTED",
                    "GIFT_SET_SELECTED",
                    "INTENT_RESOLVED",
                    "PARTNER_SELECTED",
                    "VOUCHER_SELECTED",
                    "SHIPPING_ADDRESS_ADDED",
                    "READY_FOR_CHECKOUT",
                    "PREPARING_ORDER",
                    "READY_FOR_FULFILLMENT",
                    "ORDER_CONFIRMED",
                    "SENT_TO_FULFILLMENT",
                    "IN_FULFILLMENT",
                    "SHIPPED",
                    "ON_HOLD",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    "VOUCHER_REFUND_PENDING",
                    "DELIVERED",
                    "COMPLETED",
                    "REFUNDED",
                    "FAILED",
                    "CANCELLED",
                    "SUPERSEDED",
                    "MISSED",
                    null,
                  ])
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                recipientId: z.string().uuid(),
                relationshipId: z.string().uuid(),
                resolvedIntentId: z.string().uuid().nullable(),
                selectedSetId: z.string().uuid().nullable(),
                selectedVariantId: z.string().uuid().nullable(),
                partnerId: z.string().uuid().nullable(),
                selectedVoucherId: z.string().uuid().nullable(),
                selectedVoucherValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                variantRequired: z.boolean(),
                voucherRequired: z.boolean(),
                outcome: z
                  .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                  .nullable(),
                detectionStatus: z
                  .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                  .nullable(),
                currentStep: z
                  .enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    null,
                  ])
                  .nullable(),
                selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                toneRecommendationSrc: z.string().nullable(),
                toneLastChangedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                toneLocked: z.boolean(),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                toneOptionsSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingAddressLine: z.string().max(255).nullable(),
                shippingPostalCode: z.string().max(10).nullable(),
                shippingCity: z.string().max(100).nullable(),
                shippingCountryCode: z.string().max(2).nullable(),
                shippingNotes: z.string().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            isPipelineComplete: z.boolean(),
            currentStepLabel: z.string().nullable(),
            activeStepKey: z
              .enum([
                "CLASSIFICATION",
                "TONE_SELECTION",
                "VARIANTS",
                "ADDRESS",
                "PARTNERS",
                "VOUCHERS",
                null,
              ])
              .nullable(),
            activeStep: z.enum([
              "CLASSIFICATION",
              "AWAITING_VARIANT_SELECTION",
              "AWAITING_TONE_SELECTION",
              "AWAITING_PARTNER_SELECTION",
              "AWAITING_VOUCHER_VALUE",
              "AWAITING_SHIPPING_ADDRESS",
              "ORDER_REVIEW",
              "AWAITING_CHECKOUT",
              "AWAITING_VOUCHER_PAYMENT_RECOVERY",
            ]),
            outcome: z
              .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
              .nullable(),
            progress: z.number().int().gte(0).lte(100),
            pipeline: z.array(
              z
                .object({
                  key: z.enum([
                    "CLASSIFICATION",
                    "TONE_SELECTION",
                    "VARIANTS",
                    "ADDRESS",
                    "PARTNERS",
                    "VOUCHERS",
                  ]),
                  label: z.string().optional(),
                  description: z.string().optional(),
                  icon: z.string().optional(),
                  status: z.enum(["COMPLETED", "IN_PROGRESS", "PENDING"]),
                  outcome: z.enum([
                    "PENDING",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "SELECTED",
                    "SKIPPED",
                  ]),
                  isLocked: z.boolean(),
                  canInteract: z.boolean(),
                })
                .passthrough()
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/select-tone",
    alias: "postV1giftProcessProcessIdselectTone",
    description: `Updates runtime tracking status by locking the target brand text parameters.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1giftProcessProcessIdselectTone_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftProcess"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                sourceProcessId: z.string().uuid().nullable(),
                supersededByProcessId: z.string().uuid().nullable(),
                userId: z.string().uuid(),
                name: z.string().max(255).nullable(),
                occasionId: z.string().uuid().nullable(),
                entryMode: z.enum(["occasion_guided", "direct"]),
                status: z
                  .enum([
                    "PROCESS_CREATED",
                    "CLASSIFICATION_STARTED",
                    "CLASSIFICATION_COMPLETED",
                    "VARIANT_SELECTED",
                    "TONE_SELECTED",
                    "GIFT_SET_SELECTED",
                    "INTENT_RESOLVED",
                    "PARTNER_SELECTED",
                    "VOUCHER_SELECTED",
                    "SHIPPING_ADDRESS_ADDED",
                    "READY_FOR_CHECKOUT",
                    "PREPARING_ORDER",
                    "READY_FOR_FULFILLMENT",
                    "ORDER_CONFIRMED",
                    "SENT_TO_FULFILLMENT",
                    "IN_FULFILLMENT",
                    "SHIPPED",
                    "ON_HOLD",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    "VOUCHER_REFUND_PENDING",
                    "DELIVERED",
                    "COMPLETED",
                    "REFUNDED",
                    "FAILED",
                    "CANCELLED",
                    "SUPERSEDED",
                    "MISSED",
                    null,
                  ])
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                recipientId: z.string().uuid(),
                relationshipId: z.string().uuid(),
                resolvedIntentId: z.string().uuid().nullable(),
                selectedSetId: z.string().uuid().nullable(),
                selectedVariantId: z.string().uuid().nullable(),
                partnerId: z.string().uuid().nullable(),
                selectedVoucherId: z.string().uuid().nullable(),
                selectedVoucherValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                variantRequired: z.boolean(),
                voucherRequired: z.boolean(),
                outcome: z
                  .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                  .nullable(),
                detectionStatus: z
                  .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                  .nullable(),
                currentStep: z
                  .enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    null,
                  ])
                  .nullable(),
                selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                toneRecommendationSrc: z.string().nullable(),
                toneLastChangedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                toneLocked: z.boolean(),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                toneOptionsSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingAddressLine: z.string().max(255).nullable(),
                shippingPostalCode: z.string().max(10).nullable(),
                shippingCity: z.string().max(100).nullable(),
                shippingCountryCode: z.string().max(2).nullable(),
                shippingNotes: z.string().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            isPipelineComplete: z.boolean(),
            currentStepLabel: z.string().nullable(),
            activeStepKey: z
              .enum([
                "CLASSIFICATION",
                "TONE_SELECTION",
                "VARIANTS",
                "ADDRESS",
                "PARTNERS",
                "VOUCHERS",
                null,
              ])
              .nullable(),
            activeStep: z.enum([
              "CLASSIFICATION",
              "AWAITING_VARIANT_SELECTION",
              "AWAITING_TONE_SELECTION",
              "AWAITING_PARTNER_SELECTION",
              "AWAITING_VOUCHER_VALUE",
              "AWAITING_SHIPPING_ADDRESS",
              "ORDER_REVIEW",
              "AWAITING_CHECKOUT",
              "AWAITING_VOUCHER_PAYMENT_RECOVERY",
            ]),
            outcome: z
              .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
              .nullable(),
            progress: z.number().int().gte(0).lte(100),
            pipeline: z.array(
              z
                .object({
                  key: z.enum([
                    "CLASSIFICATION",
                    "TONE_SELECTION",
                    "VARIANTS",
                    "ADDRESS",
                    "PARTNERS",
                    "VOUCHERS",
                  ]),
                  label: z.string().optional(),
                  description: z.string().optional(),
                  icon: z.string().optional(),
                  status: z.enum(["COMPLETED", "IN_PROGRESS", "PENDING"]),
                  outcome: z.enum([
                    "PENDING",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "SELECTED",
                    "SKIPPED",
                  ]),
                  isLocked: z.boolean(),
                  canInteract: z.boolean(),
                })
                .passthrough()
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/select-variant",
    alias: "postV1giftProcessProcessIdselectVariant",
    description: `Locks primary inventory variations properties to the active item tracker structure parameters.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ variantId: z.string().uuid() }).passthrough(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftProcess"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                sourceProcessId: z.string().uuid().nullable(),
                supersededByProcessId: z.string().uuid().nullable(),
                userId: z.string().uuid(),
                name: z.string().max(255).nullable(),
                occasionId: z.string().uuid().nullable(),
                entryMode: z.enum(["occasion_guided", "direct"]),
                status: z
                  .enum([
                    "PROCESS_CREATED",
                    "CLASSIFICATION_STARTED",
                    "CLASSIFICATION_COMPLETED",
                    "VARIANT_SELECTED",
                    "TONE_SELECTED",
                    "GIFT_SET_SELECTED",
                    "INTENT_RESOLVED",
                    "PARTNER_SELECTED",
                    "VOUCHER_SELECTED",
                    "SHIPPING_ADDRESS_ADDED",
                    "READY_FOR_CHECKOUT",
                    "PREPARING_ORDER",
                    "READY_FOR_FULFILLMENT",
                    "ORDER_CONFIRMED",
                    "SENT_TO_FULFILLMENT",
                    "IN_FULFILLMENT",
                    "SHIPPED",
                    "ON_HOLD",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    "VOUCHER_REFUND_PENDING",
                    "DELIVERED",
                    "COMPLETED",
                    "REFUNDED",
                    "FAILED",
                    "CANCELLED",
                    "SUPERSEDED",
                    "MISSED",
                    null,
                  ])
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                recipientId: z.string().uuid(),
                relationshipId: z.string().uuid(),
                resolvedIntentId: z.string().uuid().nullable(),
                selectedSetId: z.string().uuid().nullable(),
                selectedVariantId: z.string().uuid().nullable(),
                partnerId: z.string().uuid().nullable(),
                selectedVoucherId: z.string().uuid().nullable(),
                selectedVoucherValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                variantRequired: z.boolean(),
                voucherRequired: z.boolean(),
                outcome: z
                  .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                  .nullable(),
                detectionStatus: z
                  .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                  .nullable(),
                currentStep: z
                  .enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    null,
                  ])
                  .nullable(),
                selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                toneRecommendationSrc: z.string().nullable(),
                toneLastChangedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                toneLocked: z.boolean(),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                toneOptionsSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingAddressLine: z.string().max(255).nullable(),
                shippingPostalCode: z.string().max(10).nullable(),
                shippingCity: z.string().max(100).nullable(),
                shippingCountryCode: z.string().max(2).nullable(),
                shippingNotes: z.string().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            isPipelineComplete: z.boolean(),
            currentStepLabel: z.string().nullable(),
            activeStepKey: z
              .enum([
                "CLASSIFICATION",
                "TONE_SELECTION",
                "VARIANTS",
                "ADDRESS",
                "PARTNERS",
                "VOUCHERS",
                null,
              ])
              .nullable(),
            activeStep: z.enum([
              "CLASSIFICATION",
              "AWAITING_VARIANT_SELECTION",
              "AWAITING_TONE_SELECTION",
              "AWAITING_PARTNER_SELECTION",
              "AWAITING_VOUCHER_VALUE",
              "AWAITING_SHIPPING_ADDRESS",
              "ORDER_REVIEW",
              "AWAITING_CHECKOUT",
              "AWAITING_VOUCHER_PAYMENT_RECOVERY",
            ]),
            outcome: z
              .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
              .nullable(),
            progress: z.number().int().gte(0).lte(100),
            pipeline: z.array(
              z
                .object({
                  key: z.enum([
                    "CLASSIFICATION",
                    "TONE_SELECTION",
                    "VARIANTS",
                    "ADDRESS",
                    "PARTNERS",
                    "VOUCHERS",
                  ]),
                  label: z.string().optional(),
                  description: z.string().optional(),
                  icon: z.string().optional(),
                  status: z.enum(["COMPLETED", "IN_PROGRESS", "PENDING"]),
                  outcome: z.enum([
                    "PENDING",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "SELECTED",
                    "SKIPPED",
                  ]),
                  isLocked: z.boolean(),
                  canInteract: z.boolean(),
                })
                .passthrough()
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/select-voucher",
    alias: "postV1giftProcessProcessIdselectVoucher",
    description: `Selects a voucher value in cents. Values matching an active preset retain that product&#x27;s metadata; other values create a custom voucher order.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ valueCents: z.number().int().gte(500).lte(50000) })
          .passthrough(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("voucherOrder"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                voucherProductId: z.string().uuid().nullable(),
                partnerId: z.string().uuid(),
                processId: z.string().uuid(),
                orderItemId: z.string().uuid().nullable(),
                state: z.enum([
                  "draft",
                  "paid",
                  "vouchers_issued",
                  "failed",
                  "cancelled",
                ]),
                currency: z.string().max(3),
                expectedTotalCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647),
                holdReason: z.string().nullable(),
                holdDetails: z.unknown().nullish(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                setId: z.string().uuid().nullable(),
                createdBy: z.string().uuid().nullable(),
                updatedBy: z.string().uuid().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            isPipelineComplete: z.boolean(),
            currentStepLabel: z.string().nullable(),
            activeStepKey: z
              .enum([
                "CLASSIFICATION",
                "TONE_SELECTION",
                "VARIANTS",
                "ADDRESS",
                "PARTNERS",
                "VOUCHERS",
                null,
              ])
              .nullable(),
            activeStep: z.enum([
              "CLASSIFICATION",
              "AWAITING_VARIANT_SELECTION",
              "AWAITING_TONE_SELECTION",
              "AWAITING_PARTNER_SELECTION",
              "AWAITING_VOUCHER_VALUE",
              "AWAITING_SHIPPING_ADDRESS",
              "ORDER_REVIEW",
              "AWAITING_CHECKOUT",
              "AWAITING_VOUCHER_PAYMENT_RECOVERY",
            ]),
            outcome: z
              .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
              .nullable(),
            progress: z.number().int().gte(0).lte(100),
            pipeline: z.array(
              z
                .object({
                  key: z.enum([
                    "CLASSIFICATION",
                    "TONE_SELECTION",
                    "VARIANTS",
                    "ADDRESS",
                    "PARTNERS",
                    "VOUCHERS",
                  ]),
                  label: z.string().optional(),
                  description: z.string().optional(),
                  icon: z.string().optional(),
                  status: z.enum(["COMPLETED", "IN_PROGRESS", "PENDING"]),
                  outcome: z.enum([
                    "PENDING",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "SELECTED",
                    "SKIPPED",
                  ]),
                  isLocked: z.boolean(),
                  canInteract: z.boolean(),
                })
                .passthrough()
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gift-process/:processId/set-options",
    alias: "getV1giftProcessProcessIdsetOptions",
    description: `Returns curated set item aggregation variations that are viable recommendations under the specified parameters.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/skip-partners",
    alias: "postV1giftProcessProcessIdskipPartners",
    description: `Moves progress index forward past optional context steps without mapping specific external brands profiles metrics.`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftProcess"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                sourceProcessId: z.string().uuid().nullable(),
                supersededByProcessId: z.string().uuid().nullable(),
                userId: z.string().uuid(),
                name: z.string().max(255).nullable(),
                occasionId: z.string().uuid().nullable(),
                entryMode: z.enum(["occasion_guided", "direct"]),
                status: z
                  .enum([
                    "PROCESS_CREATED",
                    "CLASSIFICATION_STARTED",
                    "CLASSIFICATION_COMPLETED",
                    "VARIANT_SELECTED",
                    "TONE_SELECTED",
                    "GIFT_SET_SELECTED",
                    "INTENT_RESOLVED",
                    "PARTNER_SELECTED",
                    "VOUCHER_SELECTED",
                    "SHIPPING_ADDRESS_ADDED",
                    "READY_FOR_CHECKOUT",
                    "PREPARING_ORDER",
                    "READY_FOR_FULFILLMENT",
                    "ORDER_CONFIRMED",
                    "SENT_TO_FULFILLMENT",
                    "IN_FULFILLMENT",
                    "SHIPPED",
                    "ON_HOLD",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    "VOUCHER_REFUND_PENDING",
                    "DELIVERED",
                    "COMPLETED",
                    "REFUNDED",
                    "FAILED",
                    "CANCELLED",
                    "SUPERSEDED",
                    "MISSED",
                    null,
                  ])
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                recipientId: z.string().uuid(),
                relationshipId: z.string().uuid(),
                resolvedIntentId: z.string().uuid().nullable(),
                selectedSetId: z.string().uuid().nullable(),
                selectedVariantId: z.string().uuid().nullable(),
                partnerId: z.string().uuid().nullable(),
                selectedVoucherId: z.string().uuid().nullable(),
                selectedVoucherValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                variantRequired: z.boolean(),
                voucherRequired: z.boolean(),
                outcome: z
                  .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                  .nullable(),
                detectionStatus: z
                  .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                  .nullable(),
                currentStep: z
                  .enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    null,
                  ])
                  .nullable(),
                selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                toneRecommendationSrc: z.string().nullable(),
                toneLastChangedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                toneLocked: z.boolean(),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                toneOptionsSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingAddressLine: z.string().max(255).nullable(),
                shippingPostalCode: z.string().max(10).nullable(),
                shippingCity: z.string().max(100).nullable(),
                shippingCountryCode: z.string().max(2).nullable(),
                shippingNotes: z.string().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            isPipelineComplete: z.boolean(),
            currentStepLabel: z.string().nullable(),
            activeStepKey: z
              .enum([
                "CLASSIFICATION",
                "TONE_SELECTION",
                "VARIANTS",
                "ADDRESS",
                "PARTNERS",
                "VOUCHERS",
                null,
              ])
              .nullable(),
            activeStep: z.enum([
              "CLASSIFICATION",
              "AWAITING_VARIANT_SELECTION",
              "AWAITING_TONE_SELECTION",
              "AWAITING_PARTNER_SELECTION",
              "AWAITING_VOUCHER_VALUE",
              "AWAITING_SHIPPING_ADDRESS",
              "ORDER_REVIEW",
              "AWAITING_CHECKOUT",
              "AWAITING_VOUCHER_PAYMENT_RECOVERY",
            ]),
            outcome: z
              .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
              .nullable(),
            progress: z.number().int().gte(0).lte(100),
            pipeline: z.array(
              z
                .object({
                  key: z.enum([
                    "CLASSIFICATION",
                    "TONE_SELECTION",
                    "VARIANTS",
                    "ADDRESS",
                    "PARTNERS",
                    "VOUCHERS",
                  ]),
                  label: z.string().optional(),
                  description: z.string().optional(),
                  icon: z.string().optional(),
                  status: z.enum(["COMPLETED", "IN_PROGRESS", "PENDING"]),
                  outcome: z.enum([
                    "PENDING",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "SELECTED",
                    "SKIPPED",
                  ]),
                  isLocked: z.boolean(),
                  canInteract: z.boolean(),
                })
                .passthrough()
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/skip-variants",
    alias: "postV1giftProcessProcessIdskipVariants",
    description: `Clears the variant requirement and moves the process past variant selection, leaving the voucher as the only fulfilment path.`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftProcess"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                sourceProcessId: z.string().uuid().nullable(),
                supersededByProcessId: z.string().uuid().nullable(),
                userId: z.string().uuid(),
                name: z.string().max(255).nullable(),
                occasionId: z.string().uuid().nullable(),
                entryMode: z.enum(["occasion_guided", "direct"]),
                status: z
                  .enum([
                    "PROCESS_CREATED",
                    "CLASSIFICATION_STARTED",
                    "CLASSIFICATION_COMPLETED",
                    "VARIANT_SELECTED",
                    "TONE_SELECTED",
                    "GIFT_SET_SELECTED",
                    "INTENT_RESOLVED",
                    "PARTNER_SELECTED",
                    "VOUCHER_SELECTED",
                    "SHIPPING_ADDRESS_ADDED",
                    "READY_FOR_CHECKOUT",
                    "PREPARING_ORDER",
                    "READY_FOR_FULFILLMENT",
                    "ORDER_CONFIRMED",
                    "SENT_TO_FULFILLMENT",
                    "IN_FULFILLMENT",
                    "SHIPPED",
                    "ON_HOLD",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    "VOUCHER_REFUND_PENDING",
                    "DELIVERED",
                    "COMPLETED",
                    "REFUNDED",
                    "FAILED",
                    "CANCELLED",
                    "SUPERSEDED",
                    "MISSED",
                    null,
                  ])
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                recipientId: z.string().uuid(),
                relationshipId: z.string().uuid(),
                resolvedIntentId: z.string().uuid().nullable(),
                selectedSetId: z.string().uuid().nullable(),
                selectedVariantId: z.string().uuid().nullable(),
                partnerId: z.string().uuid().nullable(),
                selectedVoucherId: z.string().uuid().nullable(),
                selectedVoucherValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                variantRequired: z.boolean(),
                voucherRequired: z.boolean(),
                outcome: z
                  .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                  .nullable(),
                detectionStatus: z
                  .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                  .nullable(),
                currentStep: z
                  .enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    null,
                  ])
                  .nullable(),
                selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                toneRecommendationSrc: z.string().nullable(),
                toneLastChangedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                toneLocked: z.boolean(),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                toneOptionsSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingAddressLine: z.string().max(255).nullable(),
                shippingPostalCode: z.string().max(10).nullable(),
                shippingCity: z.string().max(100).nullable(),
                shippingCountryCode: z.string().max(2).nullable(),
                shippingNotes: z.string().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            isPipelineComplete: z.boolean(),
            currentStepLabel: z.string().nullable(),
            activeStepKey: z
              .enum([
                "CLASSIFICATION",
                "TONE_SELECTION",
                "VARIANTS",
                "ADDRESS",
                "PARTNERS",
                "VOUCHERS",
                null,
              ])
              .nullable(),
            activeStep: z.enum([
              "CLASSIFICATION",
              "AWAITING_VARIANT_SELECTION",
              "AWAITING_TONE_SELECTION",
              "AWAITING_PARTNER_SELECTION",
              "AWAITING_VOUCHER_VALUE",
              "AWAITING_SHIPPING_ADDRESS",
              "ORDER_REVIEW",
              "AWAITING_CHECKOUT",
              "AWAITING_VOUCHER_PAYMENT_RECOVERY",
            ]),
            outcome: z
              .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
              .nullable(),
            progress: z.number().int().gte(0).lte(100),
            pipeline: z.array(
              z
                .object({
                  key: z.enum([
                    "CLASSIFICATION",
                    "TONE_SELECTION",
                    "VARIANTS",
                    "ADDRESS",
                    "PARTNERS",
                    "VOUCHERS",
                  ]),
                  label: z.string().optional(),
                  description: z.string().optional(),
                  icon: z.string().optional(),
                  status: z.enum(["COMPLETED", "IN_PROGRESS", "PENDING"]),
                  outcome: z.enum([
                    "PENDING",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "SELECTED",
                    "SKIPPED",
                  ]),
                  isLocked: z.boolean(),
                  canInteract: z.boolean(),
                })
                .passthrough()
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/skip-vouchers",
    alias: "postV1giftProcessProcessIdskipVouchers",
    description: `Terminates the SET_AND_VOUCHER process as SUPERSEDED and creates a SET_ONLY continuation (linked via source_process_id) that resumes at order review, dropping the partner and voucher selections. Responds with the superseding continuation — not the requested process — so clients can route into the new flow.`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftProcess"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                sourceProcessId: z.string().uuid().nullable(),
                supersededByProcessId: z.string().uuid().nullable(),
                userId: z.string().uuid(),
                name: z.string().max(255).nullable(),
                occasionId: z.string().uuid().nullable(),
                entryMode: z.enum(["occasion_guided", "direct"]),
                status: z
                  .enum([
                    "PROCESS_CREATED",
                    "CLASSIFICATION_STARTED",
                    "CLASSIFICATION_COMPLETED",
                    "VARIANT_SELECTED",
                    "TONE_SELECTED",
                    "GIFT_SET_SELECTED",
                    "INTENT_RESOLVED",
                    "PARTNER_SELECTED",
                    "VOUCHER_SELECTED",
                    "SHIPPING_ADDRESS_ADDED",
                    "READY_FOR_CHECKOUT",
                    "PREPARING_ORDER",
                    "READY_FOR_FULFILLMENT",
                    "ORDER_CONFIRMED",
                    "SENT_TO_FULFILLMENT",
                    "IN_FULFILLMENT",
                    "SHIPPED",
                    "ON_HOLD",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    "VOUCHER_REFUND_PENDING",
                    "DELIVERED",
                    "COMPLETED",
                    "REFUNDED",
                    "FAILED",
                    "CANCELLED",
                    "SUPERSEDED",
                    "MISSED",
                    null,
                  ])
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                recipientId: z.string().uuid(),
                relationshipId: z.string().uuid(),
                resolvedIntentId: z.string().uuid().nullable(),
                selectedSetId: z.string().uuid().nullable(),
                selectedVariantId: z.string().uuid().nullable(),
                partnerId: z.string().uuid().nullable(),
                selectedVoucherId: z.string().uuid().nullable(),
                selectedVoucherValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                variantRequired: z.boolean(),
                voucherRequired: z.boolean(),
                outcome: z
                  .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
                  .nullable(),
                detectionStatus: z
                  .enum(["OCCASION_DETECTED", "DECISION_WINDOW_OPEN", null])
                  .nullable(),
                currentStep: z
                  .enum([
                    "CLASSIFICATION",
                    "AWAITING_VARIANT_SELECTION",
                    "AWAITING_TONE_SELECTION",
                    "AWAITING_PARTNER_SELECTION",
                    "AWAITING_VOUCHER_VALUE",
                    "AWAITING_SHIPPING_ADDRESS",
                    "ORDER_REVIEW",
                    "AWAITING_CHECKOUT",
                    "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                    null,
                  ])
                  .nullable(),
                selectedToneCode: z.enum(["A", "B", "C", null]).nullable(),
                toneRecommendationSrc: z.string().nullable(),
                toneLastChangedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                toneLocked: z.boolean(),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                toneOptionsSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                shippingAddressLine: z.string().max(255).nullable(),
                shippingPostalCode: z.string().max(10).nullable(),
                shippingCity: z.string().max(100).nullable(),
                shippingCountryCode: z.string().max(2).nullable(),
                shippingNotes: z.string().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            isPipelineComplete: z.boolean(),
            currentStepLabel: z.string().nullable(),
            activeStepKey: z
              .enum([
                "CLASSIFICATION",
                "TONE_SELECTION",
                "VARIANTS",
                "ADDRESS",
                "PARTNERS",
                "VOUCHERS",
                null,
              ])
              .nullable(),
            activeStep: z.enum([
              "CLASSIFICATION",
              "AWAITING_VARIANT_SELECTION",
              "AWAITING_TONE_SELECTION",
              "AWAITING_PARTNER_SELECTION",
              "AWAITING_VOUCHER_VALUE",
              "AWAITING_SHIPPING_ADDRESS",
              "ORDER_REVIEW",
              "AWAITING_CHECKOUT",
              "AWAITING_VOUCHER_PAYMENT_RECOVERY",
            ]),
            outcome: z
              .enum(["SET_AND_VOUCHER", "SET_ONLY", "VOUCHER_ONLY", null])
              .nullable(),
            progress: z.number().int().gte(0).lte(100),
            pipeline: z.array(
              z
                .object({
                  key: z.enum([
                    "CLASSIFICATION",
                    "TONE_SELECTION",
                    "VARIANTS",
                    "ADDRESS",
                    "PARTNERS",
                    "VOUCHERS",
                  ]),
                  label: z.string().optional(),
                  description: z.string().optional(),
                  icon: z.string().optional(),
                  status: z.enum(["COMPLETED", "IN_PROGRESS", "PENDING"]),
                  outcome: z.enum([
                    "PENDING",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "SELECTED",
                    "SKIPPED",
                  ]),
                  isLocked: z.boolean(),
                  canInteract: z.boolean(),
                })
                .passthrough()
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/gift-process/:processId/status",
    alias: "postV1giftProcessProcessIdstatus",
    description: `Transitions the order associated with the gift process through the fulfillment statuses (fulfillmentStatusEnum). Writes an order timeline entry and regenerates the fulfillment export when moving to sent_to_fulfillment. Admin only.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1giftProcessProcessIdstatus_Body,
      },
      {
        name: "processId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gift-process/:processId/tone-options",
    alias: "getV1giftProcessProcessIdtoneOptions",
    description: `Returns descriptive structural personality classifications to customize written components within the order.`,
    requestFormat: "json",
    parameters: [
      {
        name: "processId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("toneOption"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  ref: z.string(),
                  setId: z.string(),
                  label: z.string(),
                  recommended: z.boolean(),
                  rationale: z.string().optional(),
                  icon: z.string().nullish(),
                  color: z.string().nullish(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
            selectedToneCode: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gift-process/:processId/variants",
    alias: "getV1giftProcessProcessIdvariants",
    description: `Returns variations containing alternative material compositions or direct options matching configuration filters.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gift-process/:processId/voucher-options",
    alias: "getV1giftProcessProcessIdvoucherOptions",
    description: `Returns the available voucher presets for the selected partner channel together with the custom amount limits and the current selection.`,
    requestFormat: "json",
    parameters: [
      {
        name: "processId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("voucherProduct"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  partnerId: z.string().uuid().nullable(),
                  name: z.string(),
                  description: z.string().nullable(),
                  valueCents: z.number().int().gte(-2147483648).lte(2147483647),
                  currency: z.string().max(3),
                  isActive: z.boolean(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  stripePriceId: z.string().max(255).nullable(),
                  createdBy: z.string().uuid().nullable(),
                  updatedBy: z.string().uuid().nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
            selectedVoucherId: z.string().uuid().nullish(),
            selectedVoucherValueCents: z.number().int().nullish(),
            currency: z.string().min(3).max(3),
            minValueCents: z.number().int().gt(0),
            maxValueCents: z.number().int().gt(0),
            stepCents: z.number().int().gt(0),
            defaultValueCents: z.number().int().gt(0),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gift-process/countries",
    alias: "getV1giftProcesscountries",
    description: `Returns EU member countries with ISO alpha-2 codes and English names, sorted by name, for address dropdowns. Returns the full list without pagination.`,
    requestFormat: "json",
    response: CountryCollectionResponse,
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gift-process/intent-options",
    alias: "getV1giftProcessintentOptions",
    description: `Returns baseline categorical tracking properties configuring target gift-giving milestones.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gift-process/questions",
    alias: "getV1giftProcessquestions",
    description: `Fetches static or dynamic structured evaluation questionnaire templates used to begin a gift process configuration flow.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gifts",
    alias: "getV1gifts",
    description: `Returns a collection list of all available global gift items.`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("gift"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  setId: z.string().uuid(),
                  label: z.string().max(255),
                  variantId: z.string().uuid(),
                  imageUrl: z.string().nullable(),
                  isActive: z.boolean(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "get",
    path: "/v1/gifts/:id",
    alias: "getV1giftsId",
    description: `Returns data for an individual gift node matching the given identifier.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("gift"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                setId: z.string().uuid(),
                label: z.string().max(255),
                variantId: z.string().uuid(),
                imageUrl: z.string().nullable(),
                isActive: z.boolean(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gifts/intents/all",
    alias: "getV1giftsintentsall",
    description: `Returns baseline configuration context records available across application filter options templates.`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("giftIntent"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  name: z.string().max(255),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "get",
    path: "/v1/gifts/templates/:setId",
    alias: "getV1giftstemplatesSetId",
    description: `Returns metadata for a designated grouping blueprint reference framework structural map block.`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftSetTemplate"),
            id: z.string().uuid(),
            attributes: z
              .object({
                setId: z.string().uuid(),
                intentId: z.string().uuid(),
                proximity: z.enum(["A", "B", "C"]),
                label: z.string(),
                rationale: z.string(),
                icon: z.string().nullable(),
                color: z.string().max(7).nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gifts/templates/intents/:intentId",
    alias: "getV1giftstemplatesintentsIntentId",
    description: `Returns predefined collection group matrix matching an explicit layout filtering intent context flag.`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("giftSetTemplate"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  setId: z.string().uuid(),
                  intentId: z.string().uuid(),
                  proximity: z.enum(["A", "B", "C"]),
                  label: z.string(),
                  rationale: z.string(),
                  icon: z.string().nullable(),
                  color: z.string().max(7).nullable(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "get",
    path: "/v1/gifts/variants/:id",
    alias: "getV1giftsvariantsId",
    description: `Returns single node variant configurations for the targeted parameter reference identifier.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("giftVariant"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                intentId: z.string().uuid(),
                intensity: z.enum(["light", "noticeable", "deep"]),
                label: z.string(),
                priceInCents: z.number().int().gte(-2147483648).lte(2147483647),
                description: z.string(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/gifts/variants/all",
    alias: "getV1giftsvariantsall",
    description: `Returns a collection list of available asset modifications, stock sizes, or options.`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("giftVariant"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  intentId: z.string().uuid(),
                  intensity: z.enum(["light", "noticeable", "deep"]),
                  label: z.string(),
                  priceInCents: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647),
                  description: z.string(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "get",
    path: "/v1/notifications",
    alias: "getV1notifications",
    description: `Returns a list of all notifications ordered by creation date (newest first).`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("notification"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  userId: z.string().uuid().nullable(),
                  recipientEmail: z.string().max(255).nullable(),
                  type: z.string().max(100),
                  channel: z.enum(["in_app", "email", "push"]),
                  recipientType: z.enum([
                    "sender",
                    "fulfillment_partner",
                    "admin",
                  ]),
                  title: z.string().max(255),
                  message: z.string(),
                  actionUrl: z.string().nullable(),
                  occasionId: z.string().nullable(),
                  processId: z.string().nullable(),
                  scheduledAt: z.string().datetime({ offset: true }),
                  sentAt: z.string().datetime({ offset: true }).nullable(),
                  deliveredAt: z.string().datetime({ offset: true }).nullable(),
                  status: z.enum([
                    "notification_pending",
                    "notification_sent",
                    "notification_delivered",
                    "notification_opened",
                    "notification_failed",
                  ]),
                  failureReason: z
                    .enum([
                      "provider_error",
                      "invalid_target",
                      "rejected",
                      "blocked",
                      null,
                    ])
                    .nullable(),
                  metadata: z.union([
                    z.string(),
                    z.number(),
                    z.boolean(),
                    z.unknown(),
                    z.record(z.unknown().nullable()),
                    z.array(z.unknown().nullable()),
                  ]),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  templateKey: z.string().max(100).nullable(),
                  entityId: z.string().max(255).nullable(),
                  isRead: z.boolean(),
                  readAt: z.string().datetime({ offset: true }).nullable(),
                  isActioned: z.boolean(),
                  actionedAt: z.string().datetime({ offset: true }).nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "patch",
    path: "/v1/notifications/:id/read",
    alias: "patchV1notificationsIdread",
    description: `Marks a specific notification as read and updates the internal read timestamp.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("notification"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                userId: z.string().uuid().nullable(),
                recipientEmail: z.string().max(255).nullable(),
                type: z.string().max(100),
                channel: z.enum(["in_app", "email", "push"]),
                recipientType: z.enum([
                  "sender",
                  "fulfillment_partner",
                  "admin",
                ]),
                title: z.string().max(255),
                message: z.string(),
                actionUrl: z.string().nullable(),
                occasionId: z.string().nullable(),
                processId: z.string().nullable(),
                scheduledAt: z.string().datetime({ offset: true }),
                sentAt: z.string().datetime({ offset: true }).nullable(),
                deliveredAt: z.string().datetime({ offset: true }).nullable(),
                status: z.enum([
                  "notification_pending",
                  "notification_sent",
                  "notification_delivered",
                  "notification_opened",
                  "notification_failed",
                ]),
                failureReason: z
                  .enum([
                    "provider_error",
                    "invalid_target",
                    "rejected",
                    "blocked",
                    null,
                  ])
                  .nullable(),
                metadata: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                templateKey: z.string().max(100).nullable(),
                entityId: z.string().max(255).nullable(),
                isRead: z.boolean(),
                readAt: z.string().datetime({ offset: true }).nullable(),
                isActioned: z.boolean(),
                actionedAt: z.string().datetime({ offset: true }).nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/notifications/preferences",
    alias: "getV1notificationspreferences",
    description: `Returns the detailed configuration notification preferences layout for the authenticated user.`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("notification-preferences"),
            id: z.string().uuid(),
            attributes: z
              .object({
                userId: z.string().uuid(),
                category: z.string().nullable(),
                emailEnabled: z.boolean().nullable(),
                pushEnabled: z.boolean().nullable(),
                inAppEnabled: z.boolean().nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "patch",
    path: "/v1/notifications/read-all",
    alias: "patchV1notificationsreadAll",
    description: `Marks all notifications for the authenticated user session owner context as read.`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("notification"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  userId: z.string().uuid().nullable(),
                  recipientEmail: z.string().max(255).nullable(),
                  type: z.string().max(100),
                  channel: z.enum(["in_app", "email", "push"]),
                  recipientType: z.enum([
                    "sender",
                    "fulfillment_partner",
                    "admin",
                  ]),
                  title: z.string().max(255),
                  message: z.string(),
                  actionUrl: z.string().nullable(),
                  occasionId: z.string().nullable(),
                  processId: z.string().nullable(),
                  scheduledAt: z.string().datetime({ offset: true }),
                  sentAt: z.string().datetime({ offset: true }).nullable(),
                  deliveredAt: z.string().datetime({ offset: true }).nullable(),
                  status: z.enum([
                    "notification_pending",
                    "notification_sent",
                    "notification_delivered",
                    "notification_opened",
                    "notification_failed",
                  ]),
                  failureReason: z
                    .enum([
                      "provider_error",
                      "invalid_target",
                      "rejected",
                      "blocked",
                      null,
                    ])
                    .nullable(),
                  metadata: z.union([
                    z.string(),
                    z.number(),
                    z.boolean(),
                    z.unknown(),
                    z.record(z.unknown().nullable()),
                    z.array(z.unknown().nullable()),
                  ]),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  templateKey: z.string().max(100).nullable(),
                  entityId: z.string().max(255).nullable(),
                  isRead: z.boolean(),
                  readAt: z.string().datetime({ offset: true }).nullable(),
                  isActioned: z.boolean(),
                  actionedAt: z.string().datetime({ offset: true }).nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/occasions",
    alias: "getV1occasions",
    description: `Returns a list of all available occasions, optionally filtered by status or upcoming date and sorted by date, name or creation time.`,
    requestFormat: "json",
    parameters: [
      {
        name: "status",
        type: "Query",
        schema: z.enum(["created", "upcoming", "active", "passed"]).optional(),
      },
      {
        name: "upcoming",
        type: "Query",
        schema: z.boolean().nullish(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().nullish().default(10),
      },
      {
        name: "sortBy",
        type: "Query",
        schema: z
          .enum(["date", "name", "createdAt"])
          .optional()
          .default("date"),
      },
      {
        name: "sortOrder",
        type: "Query",
        schema: z.enum(["asc", "desc"]).optional().default("asc"),
      },
    ],
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("occasion"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  name: z.string(),
                  description: z.string().nullable(),
                  date: z.string().datetime({ offset: true }),
                  recurrenceType: z.enum([
                    "none",
                    "daily",
                    "weekly",
                    "monthly",
                    "yearly",
                  ]),
                  recurrenceInterval: z.string().nullable(),
                  parentId: z.string().uuid().nullable(),
                  organizerId: z.string().uuid(),
                  status: z.enum(["created", "upcoming", "active", "passed"]),
                  createdAt: z.string().datetime({ offset: true }).nullable(),
                  updatedAt: z.string().datetime({ offset: true }).nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/occasions",
    alias: "postV1occasions",
    description: `Creates a new occasion. The date must be today or later in the Europe/Berlin timezone.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1occasions_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("occasion"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                name: z.string(),
                description: z.string().nullable(),
                date: z.string().datetime({ offset: true }),
                recurrenceType: z.enum([
                  "none",
                  "daily",
                  "weekly",
                  "monthly",
                  "yearly",
                ]),
                recurrenceInterval: z.string().nullable(),
                parentId: z.string().uuid().nullable(),
                organizerId: z.string().uuid(),
                status: z.enum(["created", "upcoming", "active", "passed"]),
                createdAt: z.string().datetime({ offset: true }).nullable(),
                updatedAt: z.string().datetime({ offset: true }).nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/occasions/:id",
    alias: "getV1occasionsId",
    description: `Returns a single occasion by their ID`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("occasion"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                name: z.string(),
                description: z.string().nullable(),
                date: z.string().datetime({ offset: true }),
                recurrenceType: z.enum([
                  "none",
                  "daily",
                  "weekly",
                  "monthly",
                  "yearly",
                ]),
                recurrenceInterval: z.string().nullable(),
                parentId: z.string().uuid().nullable(),
                organizerId: z.string().uuid(),
                status: z.enum(["created", "upcoming", "active", "passed"]),
                createdAt: z.string().datetime({ offset: true }).nullable(),
                updatedAt: z.string().datetime({ offset: true }).nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "put",
    path: "/v1/occasions/:id",
    alias: "putV1occasionsId",
    description: `Updates an entire occasion by ID`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putV1occasionsId_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("occasion"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                name: z.string(),
                description: z.string().nullable(),
                date: z.string().datetime({ offset: true }),
                recurrenceType: z.enum([
                  "none",
                  "daily",
                  "weekly",
                  "monthly",
                  "yearly",
                ]),
                recurrenceInterval: z.string().nullable(),
                parentId: z.string().uuid().nullable(),
                organizerId: z.string().uuid(),
                status: z.enum(["created", "upcoming", "active", "passed"]),
                createdAt: z.string().datetime({ offset: true }).nullable(),
                updatedAt: z.string().datetime({ offset: true }).nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/occasions/:occasionId/recipients",
    alias: "getV1occasionsOccasionIdrecipients",
    description: `Returns a list of recipients for a specific occasion with user data`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("Recipient"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  occasionId: z.string().uuid(),
                  userId: z.string().uuid().nullable(),
                  relationshipId: z.string().uuid().nullable(),
                  email: z.string().nullable(),
                  joinedAt: z.string().datetime({ offset: true }).nullable(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  id: z.string(),
                  user: z
                    .object({
                      id: z.string().uuid(),
                      name: z.string().max(255).nullable(),
                      emailVerifiedAt: z
                        .string()
                        .datetime({ offset: true })
                        .nullable(),
                      firstName: z.string().max(255).nullable(),
                      lastName: z.string().max(255).nullable(),
                      preferredName: z.string().max(255).nullable(),
                      email: z.string().max(255),
                      dob: z.string().nullable(),
                      country: z.string().max(255).nullable(),
                      city: z.string().max(255).nullable(),
                      preferredLanguage: z.string().max(50),
                      interests: z.union([
                        z.string(),
                        z.number(),
                        z.boolean(),
                        z.unknown(),
                        z.record(z.unknown().nullable()),
                        z.array(z.unknown().nullable()),
                      ]),
                      giftingStatements: z.union([
                        z.string(),
                        z.number(),
                        z.boolean(),
                        z.unknown(),
                        z.record(z.unknown().nullable()),
                        z.array(z.unknown().nullable()),
                      ]),
                      role: z.enum(["admin", "user", "partner"]),
                      stripeCustomerId: z.string().max(255).nullable(),
                      stripeAccountId: z.string().max(255).nullable(),
                      avatarUrl: z.string().max(2048).nullable(),
                      createdAt: z.string().datetime({ offset: true }),
                      updatedAt: z.string().datetime({ offset: true }),
                      isFirstLogin: z.boolean(),
                      isOnboarded: z.boolean(),
                      sid: z.string().optional(),
                    })
                    .passthrough()
                    .nullable(),
                  relations: z
                    .object({
                      id: z.string().uuid(),
                      userId: z.string().uuid(),
                      relatedUserId: z.string().uuid().nullable(),
                      email: z.string().nullable(),
                      nickname: z.string().nullable(),
                      firstName: z.string().nullable(),
                      lastName: z.string().nullable(),
                      avatarUrl: z.string().max(2048).nullable(),
                      birthday: z.string().nullable(),
                      relationshipType: z.string(),
                      createdAt: z.string().datetime({ offset: true }),
                      updatedAt: z.string().datetime({ offset: true }),
                      needsRefinement: z.boolean(),
                      quizCompletedAt: z
                        .string()
                        .datetime({ offset: true })
                        .nullable(),
                    })
                    .passthrough()
                    .nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "delete",
    path: "/v1/occasions/:occasionId/recipients/:participantId",
    alias: "deleteV1occasionsOccasionIdrecipientsParticipantId",
    description: `Removes a recipient from an existing occasion`,
    requestFormat: "json",
    response: z
      .object({ data: z.object({ success: z.boolean() }).passthrough() })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/occasions/:occasionId/reminders",
    alias: "getV1occasionsOccasionIdreminders",
    description: `Returns all reminders for a specific occasion`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("reminder"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  occasionInstanceId: z.string().uuid(),
                  reminderType: z.enum([
                    "initial",
                    "decision_warning",
                    "final_alert",
                  ]),
                  scheduledFor: z.string().datetime({ offset: true }),
                  sentAt: z.string().datetime({ offset: true }).nullable(),
                  status: z.enum([
                    "scheduled",
                    "sent",
                    "failed",
                    "snoozed",
                    "disabled",
                  ]),
                  deliveryAttempts: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647)
                    .nullable(),
                  maxDeliveryAttempts: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647)
                    .nullable(),
                  lastDeliveryAttempt: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  deliveryFailureReason: z.string().nullable(),
                  userSnoozeUntil: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  userDisabledAt: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/occasions/:occasionId/reminders/:reminderId",
    alias: "getV1occasionsOccasionIdremindersReminderId",
    description: `Returns a single reminder for a specific occasion`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("reminder"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                occasionInstanceId: z.string().uuid(),
                reminderType: z.enum([
                  "initial",
                  "decision_warning",
                  "final_alert",
                ]),
                scheduledFor: z.string().datetime({ offset: true }),
                sentAt: z.string().datetime({ offset: true }).nullable(),
                status: z.enum([
                  "scheduled",
                  "sent",
                  "failed",
                  "snoozed",
                  "disabled",
                ]),
                deliveryAttempts: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                maxDeliveryAttempts: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                lastDeliveryAttempt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                deliveryFailureReason: z.string().nullable(),
                userSnoozeUntil: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                userDisabledAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "delete",
    path: "/v1/occasions/:occasionId/reminders/:reminderId",
    alias: "deleteV1occasionsOccasionIdremindersReminderId",
    description: `Cancels (soft-disables) a single reminder for an occasion`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("reminder"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                occasionInstanceId: z.string().uuid(),
                reminderType: z.enum([
                  "initial",
                  "decision_warning",
                  "final_alert",
                ]),
                scheduledFor: z.string().datetime({ offset: true }),
                sentAt: z.string().datetime({ offset: true }).nullable(),
                status: z.enum([
                  "scheduled",
                  "sent",
                  "failed",
                  "snoozed",
                  "disabled",
                ]),
                deliveryAttempts: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                maxDeliveryAttempts: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                lastDeliveryAttempt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                deliveryFailureReason: z.string().nullable(),
                userSnoozeUntil: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                userDisabledAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/occasions/:occasionId/reminders/disable",
    alias: "postV1occasionsOccasionIdremindersdisable",
    description: `Permanently disables an occasion&#x27;s pending reminders`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("reminder"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  occasionInstanceId: z.string().uuid(),
                  reminderType: z.enum([
                    "initial",
                    "decision_warning",
                    "final_alert",
                  ]),
                  scheduledFor: z.string().datetime({ offset: true }),
                  sentAt: z.string().datetime({ offset: true }).nullable(),
                  status: z.enum([
                    "scheduled",
                    "sent",
                    "failed",
                    "snoozed",
                    "disabled",
                  ]),
                  deliveryAttempts: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647)
                    .nullable(),
                  maxDeliveryAttempts: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647)
                    .nullable(),
                  lastDeliveryAttempt: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  deliveryFailureReason: z.string().nullable(),
                  userSnoozeUntil: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  userDisabledAt: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/occasions/:occasionId/reminders/reschedule",
    alias: "postV1occasionsOccasionIdremindersreschedule",
    description: `Recomputes reminder timing from the occasion date and reactivates snoozed/disabled reminders`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("reminder"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  occasionInstanceId: z.string().uuid(),
                  reminderType: z.enum([
                    "initial",
                    "decision_warning",
                    "final_alert",
                  ]),
                  scheduledFor: z.string().datetime({ offset: true }),
                  sentAt: z.string().datetime({ offset: true }).nullable(),
                  status: z.enum([
                    "scheduled",
                    "sent",
                    "failed",
                    "snoozed",
                    "disabled",
                  ]),
                  deliveryAttempts: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647)
                    .nullable(),
                  maxDeliveryAttempts: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647)
                    .nullable(),
                  lastDeliveryAttempt: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  deliveryFailureReason: z.string().nullable(),
                  userSnoozeUntil: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  userDisabledAt: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/occasions/:occasionId/reminders/snooze",
    alias: "postV1occasionsOccasionIdreminderssnooze",
    description: `Pauses an occasion&#x27;s pending reminders until the specified date`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1occasionsOccasionIdreminderssnooze_Body,
      },
    ],
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("reminder"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  occasionInstanceId: z.string().uuid(),
                  reminderType: z.enum([
                    "initial",
                    "decision_warning",
                    "final_alert",
                  ]),
                  scheduledFor: z.string().datetime({ offset: true }),
                  sentAt: z.string().datetime({ offset: true }).nullable(),
                  status: z.enum([
                    "scheduled",
                    "sent",
                    "failed",
                    "snoozed",
                    "disabled",
                  ]),
                  deliveryAttempts: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647)
                    .nullable(),
                  maxDeliveryAttempts: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647)
                    .nullable(),
                  lastDeliveryAttempt: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  deliveryFailureReason: z.string().nullable(),
                  userSnoozeUntil: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  userDisabledAt: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/occasions/recipients",
    alias: "postV1occasionsrecipients",
    description: `Adds a recipient to an existing occasion`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1occasionsrecipients_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("Recipient"),
            id: z.string().uuid(),
            attributes: z
              .object({
                occasionId: z.string().uuid(),
                userId: z.string().uuid().nullable(),
                relationshipId: z.string().uuid().nullable(),
                email: z.string().nullable(),
                joinedAt: z.string().datetime({ offset: true }).nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                id: z.string(),
                user: z
                  .object({
                    id: z.string().uuid(),
                    name: z.string().max(255).nullable(),
                    emailVerifiedAt: z
                      .string()
                      .datetime({ offset: true })
                      .nullable(),
                    firstName: z.string().max(255).nullable(),
                    lastName: z.string().max(255).nullable(),
                    preferredName: z.string().max(255).nullable(),
                    email: z.string().max(255),
                    dob: z.string().nullable(),
                    country: z.string().max(255).nullable(),
                    city: z.string().max(255).nullable(),
                    preferredLanguage: z.string().max(50),
                    interests: z.union([
                      z.string(),
                      z.number(),
                      z.boolean(),
                      z.unknown(),
                      z.record(z.unknown().nullable()),
                      z.array(z.unknown().nullable()),
                    ]),
                    giftingStatements: z.union([
                      z.string(),
                      z.number(),
                      z.boolean(),
                      z.unknown(),
                      z.record(z.unknown().nullable()),
                      z.array(z.unknown().nullable()),
                    ]),
                    role: z.enum(["admin", "user", "partner"]),
                    stripeCustomerId: z.string().max(255).nullable(),
                    stripeAccountId: z.string().max(255).nullable(),
                    avatarUrl: z.string().max(2048).nullable(),
                    createdAt: z.string().datetime({ offset: true }),
                    updatedAt: z.string().datetime({ offset: true }),
                    isFirstLogin: z.boolean(),
                    isOnboarded: z.boolean(),
                    sid: z.string().optional(),
                  })
                  .passthrough()
                  .nullable(),
                relations: z
                  .object({
                    id: z.string().uuid(),
                    userId: z.string().uuid(),
                    relatedUserId: z.string().uuid().nullable(),
                    email: z.string().nullable(),
                    nickname: z.string().nullable(),
                    firstName: z.string().nullable(),
                    lastName: z.string().nullable(),
                    avatarUrl: z.string().max(2048).nullable(),
                    birthday: z.string().nullable(),
                    relationshipType: z.string(),
                    createdAt: z.string().datetime({ offset: true }),
                    updatedAt: z.string().datetime({ offset: true }),
                    needsRefinement: z.boolean(),
                    quizCompletedAt: z
                      .string()
                      .datetime({ offset: true })
                      .nullable(),
                  })
                  .passthrough()
                  .nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/options/:processId/suggestions",
    alias: "getV1optionsProcessIdsuggestions",
    description: `Returns a collection of gift suggestions for the specified process`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("gift"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  setId: z.string().uuid(),
                  label: z.string().max(255),
                  variantId: z.string().uuid(),
                  imageUrl: z.string().nullable(),
                  isActive: z.boolean(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/orders",
    alias: "getV1orders",
    description: `Returns one page of orders, newest first. Query: page, limit (max 100), status (pending, a fulfillment status, or refunded). Metadata includes total, page, limit and totalPages.`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("order"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  code: z.string(),
                  userId: z.string().uuid(),
                  processId: z.string().uuid(),
                  totalAmountCents: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647),
                  currency: z.string().max(3),
                  stripeSessionId: z.string().max(255).nullable(),
                  stripePaymentIntentId: z.string().max(255).nullable(),
                  paidAt: z.string().datetime({ offset: true }).nullable(),
                  status: z.enum(["pending", "paid", "failed", "refunded"]),
                  fulfillmentStatus: z
                    .enum([
                      "sent_to_fulfillment",
                      "confirmed",
                      "shipped",
                      "delivered",
                      "completed",
                      "hold",
                      "failed",
                      "cancelled",
                      "missed",
                      null,
                    ])
                    .nullable(),
                  deliverySnapshot: z
                    .object({
                      recipientName: z.string(),
                      recipientAddress: z
                        .object({
                          street: z.string(),
                          city: z.string(),
                          postalCode: z.string(),
                          country: z.string(),
                        })
                        .passthrough(),
                      deliveryInstructions: z.string().optional(),
                      contactPhone: z.string().optional(),
                      estimatedDeliveryDate: z.string().optional(),
                    })
                    .passthrough()
                    .nullish(),
                  fulfillmentExport: z
                    .object({
                      gift_reference: z.string().min(1),
                      purchase_configuration: z
                        .object({
                          outcome: z.enum([
                            "SET_AND_VOUCHER",
                            "SET_ONLY",
                            "VOUCHER_ONLY",
                          ]),
                          resolvedIntentId: z.string().uuid().nullish(),
                          selectedSetId: z.string().uuid().nullish(),
                          selectedVariantId: z.string().uuid().nullish(),
                          selectedToneCode: z.string().nullish(),
                          partnerId: z.string().uuid().nullish(),
                          selectedVoucherId: z.string().uuid().nullish(),
                          selectedVoucherValueCents: z.number().int().nullish(),
                          variantRequired: z.boolean(),
                          voucherRequired: z.boolean(),
                        })
                        .passthrough(),
                      recipient_name: z.string().min(1),
                      address_line_1: z.string().min(1),
                      address_line_2: z.string().nullable(),
                      postal_code: z.string().min(1),
                      city: z.string().min(1),
                      country: z.string().min(2).max(2),
                      variant_sku: z.string().nullable(),
                      item_skus: z.array(z.string()).nullable(),
                      fragile: z.boolean().nullable(),
                      packaging_fit: z.string().nullable(),
                      set_pack_list_path: z.string().nullable(),
                      voucher_insert_asset_path: z.string().nullable(),
                      voucher_package_asset_path: z.string().nullable(),
                      shipping_snapshot_path: z.string().nullable(),
                      personal_message_text: z.string().nullable(),
                      delivery_deadline: z.string().datetime({ offset: true }),
                      carrier_preference: z
                        .string()
                        .min(1)
                        .optional()
                        .default("DHL_EXPRESS"),
                      export_version: z
                        .number()
                        .int()
                        .gt(0)
                        .optional()
                        .default(1),
                    })
                    .passthrough()
                    .nullish(),
                  plannedDeliveryDate: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  carrier: z.string().max(100).nullable(),
                  trackingNumber: z.string().max(100).nullable(),
                  trackingUrl: z.string().nullable(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  updatedBy: z.string().uuid().nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/orders/:id",
    alias: "getV1ordersId",
    description: `Returns an order with its items, timeline, customer, gift context and the fulfillment statuses it can move to next.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("order"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                code: z.string(),
                userId: z.string().uuid(),
                processId: z.string().uuid(),
                totalAmountCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647),
                currency: z.string().max(3),
                stripeSessionId: z.string().max(255).nullable(),
                stripePaymentIntentId: z.string().max(255).nullable(),
                paidAt: z.string().datetime({ offset: true }).nullable(),
                status: z.enum(["pending", "paid", "failed", "refunded"]),
                fulfillmentStatus: z
                  .enum([
                    "sent_to_fulfillment",
                    "confirmed",
                    "shipped",
                    "delivered",
                    "completed",
                    "hold",
                    "failed",
                    "cancelled",
                    "missed",
                    null,
                  ])
                  .nullable(),
                deliverySnapshot: z
                  .object({
                    recipientName: z.string(),
                    recipientAddress: z
                      .object({
                        street: z.string(),
                        city: z.string(),
                        postalCode: z.string(),
                        country: z.string(),
                      })
                      .passthrough(),
                    deliveryInstructions: z.string().optional(),
                    contactPhone: z.string().optional(),
                    estimatedDeliveryDate: z.string().optional(),
                  })
                  .passthrough()
                  .nullish(),
                fulfillmentExport: z
                  .object({
                    gift_reference: z.string().min(1),
                    purchase_configuration: z
                      .object({
                        outcome: z.enum([
                          "SET_AND_VOUCHER",
                          "SET_ONLY",
                          "VOUCHER_ONLY",
                        ]),
                        resolvedIntentId: z.string().uuid().nullish(),
                        selectedSetId: z.string().uuid().nullish(),
                        selectedVariantId: z.string().uuid().nullish(),
                        selectedToneCode: z.string().nullish(),
                        partnerId: z.string().uuid().nullish(),
                        selectedVoucherId: z.string().uuid().nullish(),
                        selectedVoucherValueCents: z.number().int().nullish(),
                        variantRequired: z.boolean(),
                        voucherRequired: z.boolean(),
                      })
                      .passthrough(),
                    recipient_name: z.string().min(1),
                    address_line_1: z.string().min(1),
                    address_line_2: z.string().nullable(),
                    postal_code: z.string().min(1),
                    city: z.string().min(1),
                    country: z.string().min(2).max(2),
                    variant_sku: z.string().nullable(),
                    item_skus: z.array(z.string()).nullable(),
                    fragile: z.boolean().nullable(),
                    packaging_fit: z.string().nullable(),
                    set_pack_list_path: z.string().nullable(),
                    voucher_insert_asset_path: z.string().nullable(),
                    voucher_package_asset_path: z.string().nullable(),
                    shipping_snapshot_path: z.string().nullable(),
                    personal_message_text: z.string().nullable(),
                    delivery_deadline: z.string().datetime({ offset: true }),
                    carrier_preference: z
                      .string()
                      .min(1)
                      .optional()
                      .default("DHL_EXPRESS"),
                    export_version: z
                      .number()
                      .int()
                      .gt(0)
                      .optional()
                      .default(1),
                  })
                  .passthrough()
                  .nullish(),
                plannedDeliveryDate: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                carrier: z.string().max(100).nullable(),
                trackingNumber: z.string().max(100).nullable(),
                trackingUrl: z.string().nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                updatedBy: z.string().uuid().nullable(),
                items: z.array(
                  z
                    .object({
                      id: z.string().uuid(),
                      orderId: z.string().uuid(),
                      type: z.enum([
                        "GIFT_KIT",
                        "VOUCHER",
                        "SERVICE_FEE",
                        "SHIPPING_FEE",
                      ]),
                      priceCents: z
                        .number()
                        .int()
                        .gte(-2147483648)
                        .lte(2147483647),
                      metadata: OrderItemMetadata.optional(),
                    })
                    .passthrough()
                ),
                timeline: z.array(
                  z
                    .object({
                      id: z.string().uuid(),
                      orderId: z.string().uuid(),
                      processId: z.string().uuid(),
                      fromStatus: z
                        .enum([
                          "sent_to_fulfillment",
                          "confirmed",
                          "shipped",
                          "delivered",
                          "completed",
                          "hold",
                          "failed",
                          "cancelled",
                          "missed",
                          null,
                        ])
                        .nullable(),
                      toStatus: z
                        .enum([
                          "sent_to_fulfillment",
                          "confirmed",
                          "shipped",
                          "delivered",
                          "completed",
                          "hold",
                          "failed",
                          "cancelled",
                          "missed",
                          null,
                        ])
                        .nullable(),
                      actor: z.string().max(100),
                      notes: z.string().nullable(),
                      metadata: z.union([
                        z.string(),
                        z.number(),
                        z.boolean(),
                        z.unknown(),
                        z.record(z.unknown().nullable()),
                        z.array(z.unknown().nullable()),
                      ]),
                      createdAt: z.string().datetime({ offset: true }),
                      updatedAt: z.string().datetime({ offset: true }),
                    })
                    .passthrough()
                ),
                user: z
                  .object({
                    id: z.string().uuid(),
                    firstName: z.string().max(255).nullable(),
                    lastName: z.string().max(255).nullable(),
                    preferredName: z.string().max(255).nullable(),
                    email: z.string().max(255),
                    avatarUrl: z.string().max(2048).nullable(),
                  })
                  .passthrough()
                  .nullable(),
                process: z
                  .object({
                    id: z.string().uuid(),
                    name: z.string().max(255).nullable(),
                    status: z
                      .enum([
                        "PROCESS_CREATED",
                        "CLASSIFICATION_STARTED",
                        "CLASSIFICATION_COMPLETED",
                        "VARIANT_SELECTED",
                        "TONE_SELECTED",
                        "GIFT_SET_SELECTED",
                        "INTENT_RESOLVED",
                        "PARTNER_SELECTED",
                        "VOUCHER_SELECTED",
                        "SHIPPING_ADDRESS_ADDED",
                        "READY_FOR_CHECKOUT",
                        "PREPARING_ORDER",
                        "READY_FOR_FULFILLMENT",
                        "ORDER_CONFIRMED",
                        "SENT_TO_FULFILLMENT",
                        "IN_FULFILLMENT",
                        "SHIPPED",
                        "ON_HOLD",
                        "AWAITING_VOUCHER_PAYMENT_RECOVERY",
                        "VOUCHER_REFUND_PENDING",
                        "DELIVERED",
                        "COMPLETED",
                        "REFUNDED",
                        "FAILED",
                        "CANCELLED",
                        "SUPERSEDED",
                        "MISSED",
                        null,
                      ])
                      .nullable(),
                    occasion: z
                      .object({
                        id: z.string().uuid(),
                        name: z.string(),
                        date: z.string().datetime({ offset: true }),
                      })
                      .passthrough()
                      .nullable(),
                    relationship: z
                      .object({
                        id: z.string().uuid(),
                        firstName: z.string().nullable(),
                        lastName: z.string().nullable(),
                        nickname: z.string().nullable(),
                        email: z.string().nullable(),
                        relationshipType: z.string(),
                      })
                      .passthrough()
                      .nullable(),
                    partner: z
                      .object({
                        id: z.string().uuid(),
                        name: z.string().max(255),
                        city: z.string().max(255),
                      })
                      .passthrough()
                      .nullable(),
                  })
                  .passthrough()
                  .nullable(),
                allowedTransitions: z.array(
                  z.enum([
                    "sent_to_fulfillment",
                    "confirmed",
                    "shipped",
                    "delivered",
                    "completed",
                    "hold",
                    "failed",
                    "cancelled",
                    "missed",
                  ])
                ),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/orders/:id/fulfillment-export",
    alias: "getV1ordersIdfulfillmentExport",
    description: `Generates (or reuses the cached) fulfillment export payload, uploads the JSON and an enriched PDF to object storage, and returns signed download URLs for both.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        pdf: z
          .object({ key: z.string().min(1), signedUrl: z.string().url() })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 503,
        description: `The server is currently unable to handle the request due to temporary overloading or maintenance.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/orders/:id/hold-resolution",
    alias: "postV1ordersIdholdResolution",
    description: `Transitions a held order to its resolved state — release (preparing for fulfillment), cancel (optionally with a refund by-product), fail, or refund as a last resort.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1ordersIdholdResolution_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/orders/:id/notes",
    alias: "postV1ordersIdnotes",
    description: `Inserts structured context markers or metadata entries straight to an order&#x27;s historical timeline record.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1ordersIdnotes_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("orderTimeline"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                orderId: z.string().uuid(),
                processId: z.string().uuid(),
                fromStatus: z
                  .enum([
                    "sent_to_fulfillment",
                    "confirmed",
                    "shipped",
                    "delivered",
                    "completed",
                    "hold",
                    "failed",
                    "cancelled",
                    "missed",
                    null,
                  ])
                  .nullable(),
                toStatus: z
                  .enum([
                    "sent_to_fulfillment",
                    "confirmed",
                    "shipped",
                    "delivered",
                    "completed",
                    "hold",
                    "failed",
                    "cancelled",
                    "missed",
                    null,
                  ])
                  .nullable(),
                actor: z.string().max(100),
                notes: z.string().nullable(),
                metadata: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 500,
        description: `An unexpected condition was encountered and no more specific message is suitable.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "patch",
    path: "/v1/orders/:id/state",
    alias: "patchV1ordersIdstate",
    description: `Moves the order to a new status and/or sets its carrier, tracking number and tracking URL. Each change is written to the order timeline.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: patchV1ordersIdstate_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/orders/:id/timeline",
    alias: "getV1ordersIdtimeline",
    description: `Returns an ordered sequence of status milestones and log activities associated with an order identifier.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("orderTimeline"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  orderId: z.string().uuid(),
                  processId: z.string().uuid(),
                  fromStatus: z
                    .enum([
                      "sent_to_fulfillment",
                      "confirmed",
                      "shipped",
                      "delivered",
                      "completed",
                      "hold",
                      "failed",
                      "cancelled",
                      "missed",
                      null,
                    ])
                    .nullable(),
                  toStatus: z
                    .enum([
                      "sent_to_fulfillment",
                      "confirmed",
                      "shipped",
                      "delivered",
                      "completed",
                      "hold",
                      "failed",
                      "cancelled",
                      "missed",
                      null,
                    ])
                    .nullable(),
                  actor: z.string().max(100),
                  notes: z.string().nullable(),
                  metadata: z.union([
                    z.string(),
                    z.number(),
                    z.boolean(),
                    z.unknown(),
                    z.record(z.unknown().nullable()),
                    z.array(z.unknown().nullable()),
                  ]),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/orders/track/:token",
    alias: "getV1orderstrackToken",
    description: `Publicly accessible order status lookup resolved through a secure order tracking token. Intended for unauthenticated gift recipients viewing their order status.`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("order"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                code: z.string(),
                userId: z.string().uuid(),
                processId: z.string().uuid(),
                totalAmountCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647),
                currency: z.string().max(3),
                stripeSessionId: z.string().max(255).nullable(),
                stripePaymentIntentId: z.string().max(255).nullable(),
                paidAt: z.string().datetime({ offset: true }).nullable(),
                status: z.enum(["pending", "paid", "failed", "refunded"]),
                fulfillmentStatus: z
                  .enum([
                    "sent_to_fulfillment",
                    "confirmed",
                    "shipped",
                    "delivered",
                    "completed",
                    "hold",
                    "failed",
                    "cancelled",
                    "missed",
                    null,
                  ])
                  .nullable(),
                deliverySnapshot: z
                  .object({
                    recipientName: z.string(),
                    recipientAddress: z
                      .object({
                        street: z.string(),
                        city: z.string(),
                        postalCode: z.string(),
                        country: z.string(),
                      })
                      .passthrough(),
                    deliveryInstructions: z.string().optional(),
                    contactPhone: z.string().optional(),
                    estimatedDeliveryDate: z.string().optional(),
                  })
                  .passthrough()
                  .nullish(),
                fulfillmentExport: z
                  .object({
                    gift_reference: z.string().min(1),
                    purchase_configuration: z
                      .object({
                        outcome: z.enum([
                          "SET_AND_VOUCHER",
                          "SET_ONLY",
                          "VOUCHER_ONLY",
                        ]),
                        resolvedIntentId: z.string().uuid().nullish(),
                        selectedSetId: z.string().uuid().nullish(),
                        selectedVariantId: z.string().uuid().nullish(),
                        selectedToneCode: z.string().nullish(),
                        partnerId: z.string().uuid().nullish(),
                        selectedVoucherId: z.string().uuid().nullish(),
                        selectedVoucherValueCents: z.number().int().nullish(),
                        variantRequired: z.boolean(),
                        voucherRequired: z.boolean(),
                      })
                      .passthrough(),
                    recipient_name: z.string().min(1),
                    address_line_1: z.string().min(1),
                    address_line_2: z.string().nullable(),
                    postal_code: z.string().min(1),
                    city: z.string().min(1),
                    country: z.string().min(2).max(2),
                    variant_sku: z.string().nullable(),
                    item_skus: z.array(z.string()).nullable(),
                    fragile: z.boolean().nullable(),
                    packaging_fit: z.string().nullable(),
                    set_pack_list_path: z.string().nullable(),
                    voucher_insert_asset_path: z.string().nullable(),
                    voucher_package_asset_path: z.string().nullable(),
                    shipping_snapshot_path: z.string().nullable(),
                    personal_message_text: z.string().nullable(),
                    delivery_deadline: z.string().datetime({ offset: true }),
                    carrier_preference: z
                      .string()
                      .min(1)
                      .optional()
                      .default("DHL_EXPRESS"),
                    export_version: z
                      .number()
                      .int()
                      .gt(0)
                      .optional()
                      .default(1),
                  })
                  .passthrough()
                  .nullish(),
                plannedDeliveryDate: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                carrier: z.string().max(100).nullable(),
                trackingNumber: z.string().max(100).nullable(),
                trackingUrl: z.string().nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                updatedBy: z.string().uuid().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/partners",
    alias: "getV1partners",
    description: `Returns a list of partners with filtering and sorting options`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("partner"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  externalId: z.string().max(50).nullable(),
                  name: z.string().max(255),
                  category: z.string().max(100),
                  voucherType: z.string().max(100),
                  city: z.string().max(255),
                  postalCode: z.string().max(5),
                  countryCode: z.string().max(2),
                  latitude: z
                    .number()
                    .gte(-140737488355328)
                    .lte(140737488355327)
                    .nullable(),
                  longitude: z
                    .number()
                    .gte(-140737488355328)
                    .lte(140737488355327)
                    .nullable(),
                  energyLevel: z
                    .enum(["calm", "balanced", "active", null])
                    .nullable(),
                  socialMode: z
                    .enum(["solo", "duo", "social", null])
                    .nullable(),
                  coverage: z.enum(["none", "low", "high"]),
                  active: z.boolean(),
                  priority: z.number().int().gte(-2147483648).lte(2147483647),
                  source: z.string().max(50).nullable(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  createdBy: z.string().uuid().nullable(),
                  updatedBy: z.string().uuid().nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/partners",
    alias: "postV1partners",
    description: `Creates a new partner store`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1partners_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("partner"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                externalId: z.string().max(50).nullable(),
                name: z.string().max(255),
                category: z.string().max(100),
                voucherType: z.string().max(100),
                city: z.string().max(255),
                postalCode: z.string().max(5),
                countryCode: z.string().max(2),
                latitude: z
                  .number()
                  .gte(-140737488355328)
                  .lte(140737488355327)
                  .nullable(),
                longitude: z
                  .number()
                  .gte(-140737488355328)
                  .lte(140737488355327)
                  .nullable(),
                energyLevel: z
                  .enum(["calm", "balanced", "active", null])
                  .nullable(),
                socialMode: z.enum(["solo", "duo", "social", null]).nullable(),
                coverage: z.enum(["none", "low", "high"]),
                active: z.boolean(),
                priority: z.number().int().gte(-2147483648).lte(2147483647),
                source: z.string().max(50).nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                createdBy: z.string().uuid().nullable(),
                updatedBy: z.string().uuid().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/partners/:id",
    alias: "getV1partnersId",
    description: `Returns a single partner by their ID`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("partner"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                externalId: z.string().max(50).nullable(),
                name: z.string().max(255),
                category: z.string().max(100),
                voucherType: z.string().max(100),
                city: z.string().max(255),
                postalCode: z.string().max(5),
                countryCode: z.string().max(2),
                latitude: z
                  .number()
                  .gte(-140737488355328)
                  .lte(140737488355327)
                  .nullable(),
                longitude: z
                  .number()
                  .gte(-140737488355328)
                  .lte(140737488355327)
                  .nullable(),
                energyLevel: z
                  .enum(["calm", "balanced", "active", null])
                  .nullable(),
                socialMode: z.enum(["solo", "duo", "social", null]).nullable(),
                coverage: z.enum(["none", "low", "high"]),
                active: z.boolean(),
                priority: z.number().int().gte(-2147483648).lte(2147483647),
                source: z.string().max(50).nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                createdBy: z.string().uuid().nullable(),
                updatedBy: z.string().uuid().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "delete",
    path: "/v1/partners/:id",
    alias: "deleteV1partnersId",
    description: `Deletes a partner by their ID`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "patch",
    path: "/v1/partners/:id",
    alias: "patchV1partnersId",
    description: `Updates partner information partially`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: patchV1partnersId_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("partner"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                externalId: z.string().max(50).nullable(),
                name: z.string().max(255),
                category: z.string().max(100),
                voucherType: z.string().max(100),
                city: z.string().max(255),
                postalCode: z.string().max(5),
                countryCode: z.string().max(2),
                latitude: z
                  .number()
                  .gte(-140737488355328)
                  .lte(140737488355327)
                  .nullable(),
                longitude: z
                  .number()
                  .gte(-140737488355328)
                  .lte(140737488355327)
                  .nullable(),
                energyLevel: z
                  .enum(["calm", "balanced", "active", null])
                  .nullable(),
                socialMode: z.enum(["solo", "duo", "social", null]).nullable(),
                coverage: z.enum(["none", "low", "high"]),
                active: z.boolean(),
                priority: z.number().int().gte(-2147483648).lte(2147483647),
                source: z.string().max(50).nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                createdBy: z.string().uuid().nullable(),
                updatedBy: z.string().uuid().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/partners/:partnerId/connect-onboarding",
    alias: "postV1partnersPartnerIdconnectOnboarding",
    description: `Returns a Stripe Express onboarding link for the partner&#x27;s connected account, creating the account on first call`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("connect_onboarding"),
            id: z.string().uuid(),
            attributes: ConnectOnboarding,
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/partners/:partnerId/connect-status",
    alias: "getV1partnersPartnerIdconnectStatus",
    description: `Returns the partner&#x27;s Stripe Connect onboarding and payout readiness status`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("connect_status"),
            id: z.string().uuid(),
            attributes: ConnectAccountStatus,
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/partners/:partnerId/earnings",
    alias: "getV1partnersPartnerIdearnings",
    description: `Returns aggregated earnings, payout history, and per-gift transaction ledger for a partner`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("earnings"),
            id: z.string().uuid(),
            attributes: PartnerEarnings,
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/partners/:partnerId/invites",
    alias: "getV1partnersPartnerIdinvites",
    description: `Returns the pending invitations for a partner organization (active members or admins)`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("partner_invite"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  partnerId: z.string().uuid(),
                  email: z.string().max(255),
                  role: z.enum(["owner", "staff"]),
                  status: z.enum(["pending", "accepted", "revoked"]),
                  acceptedByUserId: z.string().uuid().nullable(),
                  expiresAt: z.string().datetime({ offset: true }),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/partners/:partnerId/invites",
    alias: "postV1partnersPartnerIdinvites",
    description: `Invites a new member to a partner organization by email (owner or admin only)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1partnersPartnerIdmembers_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("partner_invite"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                partnerId: z.string().uuid(),
                email: z.string().max(255),
                role: z.enum(["owner", "staff"]),
                status: z.enum(["pending", "accepted", "revoked"]),
                acceptedByUserId: z.string().uuid().nullable(),
                expiresAt: z.string().datetime({ offset: true }),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/partners/:partnerId/members",
    alias: "getV1partnersPartnerIdmembers",
    description: `Returns the members of a partner organization (active members or admins)`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("partner_member"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  partnerId: z.string().uuid(),
                  userId: z.string().uuid(),
                  role: z.enum(["owner", "staff"]),
                  status: z.enum(["active", "suspended"]),
                  name: z.string().nullable(),
                  email: z.string().nullable(),
                  avatarUrl: z.string().nullable(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/partners/:partnerId/members",
    alias: "postV1partnersPartnerIdmembers",
    description: `Adds an already-registered user to a partner organization (owner or admin only)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1partnersPartnerIdmembers_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("partner_member"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                partnerId: z.string().uuid(),
                userId: z.string().uuid(),
                role: z.enum(["owner", "staff"]),
                status: z.enum(["active", "suspended"]),
                name: z.string().nullable(),
                email: z.string().nullable(),
                avatarUrl: z.string().nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/partners/create-organization",
    alias: "postV1partnerscreateOrganization",
    description: `Lets a partner user create their own organization and automatically links them as its owner`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1partnerscreateOrganization_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("partner"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                externalId: z.string().max(50).nullable(),
                name: z.string().max(255),
                category: z.string().max(100),
                voucherType: z.string().max(100),
                city: z.string().max(255),
                postalCode: z.string().max(5),
                countryCode: z.string().max(2),
                latitude: z
                  .number()
                  .gte(-140737488355328)
                  .lte(140737488355327)
                  .nullable(),
                longitude: z
                  .number()
                  .gte(-140737488355328)
                  .lte(140737488355327)
                  .nullable(),
                energyLevel: z
                  .enum(["calm", "balanced", "active", null])
                  .nullable(),
                socialMode: z.enum(["solo", "duo", "social", null]).nullable(),
                coverage: z.enum(["none", "low", "high"]),
                active: z.boolean(),
                priority: z.number().int().gte(-2147483648).lte(2147483647),
                source: z.string().max(50).nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                createdBy: z.string().uuid().nullable(),
                updatedBy: z.string().uuid().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/partners/lookup-voucher",
    alias: "postV1partnerslookupVoucher",
    description: `Returns voucher details for a given claim code`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ voucherCode: z.string().min(1) }).passthrough(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("voucher"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                userId: z.string().uuid(),
                claimCode: z.string(),
                voucherOrderId: z.string().uuid(),
                partnerId: z.string().uuid(),
                faceValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647),
                remainingCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647),
                status: z.enum([
                  "active",
                  "operational_expired",
                  "legal_expired",
                  "exhausted",
                  "cancelled",
                ]),
                storageKey: z.string().nullable(),
                operationalExpiresAt: z.string().datetime({ offset: true }),
                legalExpiresAt: z.string().datetime({ offset: true }),
                sequence: z.number().int().gte(-2147483648).lte(2147483647),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                updatedBy: z.string().uuid().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/partners/me",
    alias: "getV1partnersme",
    description: `Returns the partner organizations the authenticated partner user belongs to`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("partner"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  externalId: z.string().max(50).nullable(),
                  name: z.string().max(255),
                  category: z.string().max(100),
                  voucherType: z.string().max(100),
                  city: z.string().max(255),
                  postalCode: z.string().max(5),
                  countryCode: z.string().max(2),
                  latitude: z
                    .number()
                    .gte(-140737488355328)
                    .lte(140737488355327)
                    .nullable(),
                  longitude: z
                    .number()
                    .gte(-140737488355328)
                    .lte(140737488355327)
                    .nullable(),
                  energyLevel: z
                    .enum(["calm", "balanced", "active", null])
                    .nullable(),
                  socialMode: z
                    .enum(["solo", "duo", "social", null])
                    .nullable(),
                  coverage: z.enum(["none", "low", "high"]),
                  active: z.boolean(),
                  priority: z.number().int().gte(-2147483648).lte(2147483647),
                  source: z.string().max(50).nullable(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  createdBy: z.string().uuid().nullable(),
                  updatedBy: z.string().uuid().nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/partners/redeem-voucher",
    alias: "postV1partnersredeemVoucher",
    description: `Redeems a voucher and updates the remaining balance`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1partnersredeemVoucher_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("voucher"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                userId: z.string().uuid(),
                claimCode: z.string(),
                voucherOrderId: z.string().uuid(),
                partnerId: z.string().uuid(),
                faceValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647),
                remainingCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647),
                status: z.enum([
                  "active",
                  "operational_expired",
                  "legal_expired",
                  "exhausted",
                  "cancelled",
                ]),
                storageKey: z.string().nullable(),
                operationalExpiresAt: z.string().datetime({ offset: true }),
                legalExpiresAt: z.string().datetime({ offset: true }),
                sequence: z.number().int().gte(-2147483648).lte(2147483647),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                updatedBy: z.string().uuid().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/partners/validate-voucher/:code",
    alias: "getV1partnersvalidateVoucherCode",
    description: `Validates a voucher code without redeeming it, returning status, remaining value, and expiration`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("validation"),
            id: z.string().uuid(),
            attributes: z
              .object({
                valid: z.boolean(),
                value_cents: z.number(),
                expires_at: z.string().datetime({ offset: true }).nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/payments/checkout-session/:sessionId",
    alias: "getV1paymentscheckoutSessionSessionId",
    description: `Retrieves the sanitized domain status, payment type, and onboarding details from a raw Stripe session id.`,
    requestFormat: "json",
    parameters: [
      {
        name: "sessionId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("checkout_session_status"),
            id: z.string().uuid(),
            attributes: z
              .object({
                status: z.enum(["completed", "processing"]),
                type: z.enum(["subscription", "order", "voucher"]),
                details: z
                  .object({
                    planName: z.string().optional(),
                    orderNumber: z.string().optional(),
                    nextStepUrl: z.string(),
                  })
                  .passthrough(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/products",
    alias: "getV1products",
    description: `Returns a list of products with filtering and sorting options`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("product"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  name: z.string().max(255),
                  description: z.string().nullable(),
                  sku: z.string().max(100),
                  categoryId: z.string().uuid(),
                  basePrice: z.string(),
                  imageUrl: z.string().nullable(),
                  bestsellerRank: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647)
                    .nullable(),
                  active: z.boolean(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/products/:id",
    alias: "getV1productsId",
    description: `Returns a single product by their ID`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("product"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                name: z.string().max(255),
                description: z.string().nullable(),
                sku: z.string().max(100),
                categoryId: z.string().uuid(),
                basePrice: z.string(),
                imageUrl: z.string().nullable(),
                bestsellerRank: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                active: z.boolean(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/relationships",
    alias: "postV1relationships",
    description: `Creates a new relationship between users by email reference fields.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1relationships_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("relationship-with-user"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                userId: z.string().uuid(),
                relatedUserId: z.string().uuid().nullable(),
                email: z.string().nullable(),
                nickname: z.string().nullable(),
                firstName: z.string().nullable(),
                lastName: z.string().nullable(),
                avatarUrl: z.string().max(2048).nullable(),
                birthday: z.string().nullable(),
                relationshipType: z.string(),
                needsRefinement: z.boolean(),
                quizCompletedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                user: z
                  .object({
                    id: z.string().uuid(),
                    name: z.string().max(255).nullable(),
                    emailVerifiedAt: z
                      .string()
                      .datetime({ offset: true })
                      .nullable(),
                    firstName: z.string().max(255).nullable(),
                    lastName: z.string().max(255).nullable(),
                    preferredName: z.string().max(255).nullable(),
                    email: z.string().max(255),
                    dob: z.string().nullable(),
                    country: z.string().max(255).nullable(),
                    city: z.string().max(255).nullable(),
                    preferredLanguage: z.string().max(50),
                    interests: z.union([
                      z.string(),
                      z.number(),
                      z.boolean(),
                      z.unknown(),
                      z.record(z.unknown().nullable()),
                      z.array(z.unknown().nullable()),
                    ]),
                    giftingStatements: z.union([
                      z.string(),
                      z.number(),
                      z.boolean(),
                      z.unknown(),
                      z.record(z.unknown().nullable()),
                      z.array(z.unknown().nullable()),
                    ]),
                    role: z.enum(["admin", "user", "partner"]),
                    stripeCustomerId: z.string().max(255).nullable(),
                    stripeAccountId: z.string().max(255).nullable(),
                    avatarUrl: z.string().max(2048).nullable(),
                    createdAt: z.string().datetime({ offset: true }),
                    updatedAt: z.string().datetime({ offset: true }),
                    isFirstLogin: z.boolean(),
                    isOnboarded: z.boolean(),
                    sid: z.string().optional(),
                  })
                  .passthrough()
                  .nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/relationships",
    alias: "getV1relationships",
    description: `Returns a collection array of active user relationships.`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("relationship-with-user"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  userId: z.string().uuid(),
                  relatedUserId: z.string().uuid().nullable(),
                  email: z.string().nullable(),
                  nickname: z.string().nullable(),
                  firstName: z.string().nullable(),
                  lastName: z.string().nullable(),
                  avatarUrl: z.string().max(2048).nullable(),
                  birthday: z.string().nullable(),
                  relationshipType: z.string(),
                  needsRefinement: z.boolean(),
                  quizCompletedAt: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  user: z
                    .object({
                      id: z.string().uuid(),
                      name: z.string().max(255).nullable(),
                      emailVerifiedAt: z
                        .string()
                        .datetime({ offset: true })
                        .nullable(),
                      firstName: z.string().max(255).nullable(),
                      lastName: z.string().max(255).nullable(),
                      preferredName: z.string().max(255).nullable(),
                      email: z.string().max(255),
                      dob: z.string().nullable(),
                      country: z.string().max(255).nullable(),
                      city: z.string().max(255).nullable(),
                      preferredLanguage: z.string().max(50),
                      interests: z.union([
                        z.string(),
                        z.number(),
                        z.boolean(),
                        z.unknown(),
                        z.record(z.unknown().nullable()),
                        z.array(z.unknown().nullable()),
                      ]),
                      giftingStatements: z.union([
                        z.string(),
                        z.number(),
                        z.boolean(),
                        z.unknown(),
                        z.record(z.unknown().nullable()),
                        z.array(z.unknown().nullable()),
                      ]),
                      role: z.enum(["admin", "user", "partner"]),
                      stripeCustomerId: z.string().max(255).nullable(),
                      stripeAccountId: z.string().max(255).nullable(),
                      avatarUrl: z.string().max(2048).nullable(),
                      createdAt: z.string().datetime({ offset: true }),
                      updatedAt: z.string().datetime({ offset: true }),
                      isFirstLogin: z.boolean(),
                      isOnboarded: z.boolean(),
                      sid: z.string().optional(),
                    })
                    .passthrough()
                    .nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "put",
    path: "/v1/relationships/:id",
    alias: "putV1relationshipsId",
    description: `Updates editable fields of an existing relationship`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putV1relationshipsId_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("relationship-with-user"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                userId: z.string().uuid(),
                relatedUserId: z.string().uuid().nullable(),
                email: z.string().nullable(),
                nickname: z.string().nullable(),
                firstName: z.string().nullable(),
                lastName: z.string().nullable(),
                avatarUrl: z.string().max(2048).nullable(),
                birthday: z.string().nullable(),
                relationshipType: z.string(),
                needsRefinement: z.boolean(),
                quizCompletedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                user: z
                  .object({
                    id: z.string().uuid(),
                    name: z.string().max(255).nullable(),
                    emailVerifiedAt: z
                      .string()
                      .datetime({ offset: true })
                      .nullable(),
                    firstName: z.string().max(255).nullable(),
                    lastName: z.string().max(255).nullable(),
                    preferredName: z.string().max(255).nullable(),
                    email: z.string().max(255),
                    dob: z.string().nullable(),
                    country: z.string().max(255).nullable(),
                    city: z.string().max(255).nullable(),
                    preferredLanguage: z.string().max(50),
                    interests: z.union([
                      z.string(),
                      z.number(),
                      z.boolean(),
                      z.unknown(),
                      z.record(z.unknown().nullable()),
                      z.array(z.unknown().nullable()),
                    ]),
                    giftingStatements: z.union([
                      z.string(),
                      z.number(),
                      z.boolean(),
                      z.unknown(),
                      z.record(z.unknown().nullable()),
                      z.array(z.unknown().nullable()),
                    ]),
                    role: z.enum(["admin", "user", "partner"]),
                    stripeCustomerId: z.string().max(255).nullable(),
                    stripeAccountId: z.string().max(255).nullable(),
                    avatarUrl: z.string().max(2048).nullable(),
                    createdAt: z.string().datetime({ offset: true }),
                    updatedAt: z.string().datetime({ offset: true }),
                    isFirstLogin: z.boolean(),
                    isOnboarded: z.boolean(),
                    sid: z.string().optional(),
                  })
                  .passthrough()
                  .nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/relationships/:id/addresses",
    alias: "postV1relationshipsIdaddresses",
    description: `Adds a dynamic shipping location address linked directly to a specific user relationship identifier.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1relationshipsIdaddresses_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("relation-address"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                relationshipId: z.string().uuid().nullable(),
                addressLine: z.string().max(255),
                postalCode: z.string().max(10),
                city: z.string().max(100),
                countryCode: z.string().max(2),
                notes: z.string().nullable(),
                isDefault: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/relationships/:id/addresses",
    alias: "getV1relationshipsIdaddresses",
    description: `Retrieves the assigned location shipping address configurations for a single specific relationship profile.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("relation-address"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                relationshipId: z.string().uuid().nullable(),
                addressLine: z.string().max(255),
                postalCode: z.string().max(10),
                city: z.string().max(100),
                countryCode: z.string().max(2),
                notes: z.string().nullable(),
                isDefault: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "put",
    path: "/v1/relationships/:id/addresses/:addressId",
    alias: "putV1relationshipsIdaddressesAddressId",
    description: `Updates data blocks inside a specific shipping address container attached to a parent relationship framework.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1relationshipsIdaddresses_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("relation-address"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                relationshipId: z.string().uuid().nullable(),
                addressLine: z.string().max(255),
                postalCode: z.string().max(10),
                city: z.string().max(100),
                countryCode: z.string().max(2),
                notes: z.string().nullable(),
                isDefault: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647)
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/relationships/:id/avatar",
    alias: "postV1relationshipsIdavatar",
    description: `Uploads a recipient profile picture (JPEG, PNG, or WebP, up to 5MB) and stores its public URL on the relationship. Multipart form field: file.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("relationship-with-user"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                userId: z.string().uuid(),
                relatedUserId: z.string().uuid().nullable(),
                email: z.string().nullable(),
                nickname: z.string().nullable(),
                firstName: z.string().nullable(),
                lastName: z.string().nullable(),
                avatarUrl: z.string().max(2048).nullable(),
                birthday: z.string().nullable(),
                relationshipType: z.string(),
                needsRefinement: z.boolean(),
                quizCompletedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                user: z
                  .object({
                    id: z.string().uuid(),
                    name: z.string().max(255).nullable(),
                    emailVerifiedAt: z
                      .string()
                      .datetime({ offset: true })
                      .nullable(),
                    firstName: z.string().max(255).nullable(),
                    lastName: z.string().max(255).nullable(),
                    preferredName: z.string().max(255).nullable(),
                    email: z.string().max(255),
                    dob: z.string().nullable(),
                    country: z.string().max(255).nullable(),
                    city: z.string().max(255).nullable(),
                    preferredLanguage: z.string().max(50),
                    interests: z.union([
                      z.string(),
                      z.number(),
                      z.boolean(),
                      z.unknown(),
                      z.record(z.unknown().nullable()),
                      z.array(z.unknown().nullable()),
                    ]),
                    giftingStatements: z.union([
                      z.string(),
                      z.number(),
                      z.boolean(),
                      z.unknown(),
                      z.record(z.unknown().nullable()),
                      z.array(z.unknown().nullable()),
                    ]),
                    role: z.enum(["admin", "user", "partner"]),
                    stripeCustomerId: z.string().max(255).nullable(),
                    stripeAccountId: z.string().max(255).nullable(),
                    avatarUrl: z.string().max(2048).nullable(),
                    createdAt: z.string().datetime({ offset: true }),
                    updatedAt: z.string().datetime({ offset: true }),
                    isFirstLogin: z.boolean(),
                    isOnboarded: z.boolean(),
                    sid: z.string().optional(),
                  })
                  .passthrough()
                  .nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/relationships/:relationshipId/occasions",
    alias: "getV1relationshipsRelationshipIdoccasions",
    description: `Returns the occasions a relationship takes part in. Scoped to the authenticated user, so a relationship belonging to somebody else reads as an empty collection. Unfiltered by default.`,
    requestFormat: "json",
    parameters: [
      {
        name: "relationshipId",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "upcoming",
        type: "Query",
        schema: z.boolean().nullish(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["created", "upcoming", "active", "passed"]).optional(),
      },
      {
        name: "sortBy",
        type: "Query",
        schema: z
          .enum(["date", "name", "createdAt"])
          .optional()
          .default("date"),
      },
      {
        name: "sortOrder",
        type: "Query",
        schema: z.enum(["asc", "desc"]).optional().default("asc"),
      },
    ],
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("occasion"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  name: z.string(),
                  description: z.string().nullable(),
                  date: z.string().datetime({ offset: true }),
                  recurrenceType: z.enum([
                    "none",
                    "daily",
                    "weekly",
                    "monthly",
                    "yearly",
                  ]),
                  recurrenceInterval: z.string().nullable(),
                  parentId: z.string().uuid().nullable(),
                  organizerId: z.string().uuid(),
                  status: z.enum(["created", "upcoming", "active", "passed"]),
                  createdAt: z.string().datetime({ offset: true }).nullable(),
                  updatedAt: z.string().datetime({ offset: true }).nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/relationships/contacts",
    alias: "postV1relationshipscontacts",
    description: `Bulk-imports device contacts as new relationships. Returns the successfully imported relationships plus per-email errors in the metadata.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1relationshipscontacts_Body,
      },
    ],
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("relationship-with-user"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  userId: z.string().uuid(),
                  relatedUserId: z.string().uuid().nullable(),
                  email: z.string().nullable(),
                  nickname: z.string().nullable(),
                  firstName: z.string().nullable(),
                  lastName: z.string().nullable(),
                  avatarUrl: z.string().max(2048).nullable(),
                  birthday: z.string().nullable(),
                  relationshipType: z.string(),
                  needsRefinement: z.boolean(),
                  quizCompletedAt: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  user: z
                    .object({
                      id: z.string().uuid(),
                      name: z.string().max(255).nullable(),
                      emailVerifiedAt: z
                        .string()
                        .datetime({ offset: true })
                        .nullable(),
                      firstName: z.string().max(255).nullable(),
                      lastName: z.string().max(255).nullable(),
                      preferredName: z.string().max(255).nullable(),
                      email: z.string().max(255),
                      dob: z.string().nullable(),
                      country: z.string().max(255).nullable(),
                      city: z.string().max(255).nullable(),
                      preferredLanguage: z.string().max(50),
                      interests: z.union([
                        z.string(),
                        z.number(),
                        z.boolean(),
                        z.unknown(),
                        z.record(z.unknown().nullable()),
                        z.array(z.unknown().nullable()),
                      ]),
                      giftingStatements: z.union([
                        z.string(),
                        z.number(),
                        z.boolean(),
                        z.unknown(),
                        z.record(z.unknown().nullable()),
                        z.array(z.unknown().nullable()),
                      ]),
                      role: z.enum(["admin", "user", "partner"]),
                      stripeCustomerId: z.string().max(255).nullable(),
                      stripeAccountId: z.string().max(255).nullable(),
                      avatarUrl: z.string().max(2048).nullable(),
                      createdAt: z.string().datetime({ offset: true }),
                      updatedAt: z.string().datetime({ offset: true }),
                      isFirstLogin: z.boolean(),
                      isOnboarded: z.boolean(),
                      sid: z.string().optional(),
                    })
                    .passthrough()
                    .nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
            importedCount: z.number().int().gte(0),
            errors: z.array(
              z.object({ email: z.string(), reason: z.string() }).passthrough()
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/subscription-plans",
    alias: "getV1subscriptionPlans",
    description: `Returns a list of all available subscription plans with pricing and entitlements`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("plan"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  tier: z.enum(["free", "ivyi_care"]),
                  name: z.string().max(255),
                  priceMonthly: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647),
                  stripePriceIdMonthly: z.string().max(255).nullable(),
                  priceYearly: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647),
                  stripePriceIdAnnual: z.string().max(255).nullable(),
                  leadTime: z.number().int().gte(-2147483648).lte(2147483647),
                  createdAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/subscription-plans/:id/subscribe",
    alias: "postV1subscriptionPlansIdsubscribe",
    description: `Creates a Stripe checkout session for subscribing to a specific plan`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ priceId: z.string().min(1) }).passthrough(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/subscription-plans/cancel",
    alias: "postV1subscriptionPlanscancel",
    description: `Cancels the user&#x27;s active subscription at the end of the billing period`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("subscription"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                userId: z.string().uuid(),
                planId: z.string().uuid(),
                stripeSubscriptionId: z.string().max(255).nullable(),
                billingCycle: z.enum(["monthly", "yearly", null]).nullable(),
                stripeCustomerId: z.string().max(255).nullable(),
                status: z.enum([
                  "active",
                  "canceled",
                  "incomplete",
                  "incomplete_expired",
                  "past_due",
                  "paused",
                  "trialing",
                  "unpaid",
                ]),
                currentPeriodStart: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                currentPeriodEnd: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                cancelAtPeriodEnd: z.boolean(),
                pausedAt: z.string().datetime({ offset: true }).nullable(),
                pauseResumesAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                canceledAt: z.string().datetime({ offset: true }).nullable(),
                gracePeriodEndsAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/subscription-plans/populate",
    alias: "postV1subscriptionPlanspopulate",
    description: `Seeds the database with subscription plans (for development/testing)`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("plan"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  tier: z.enum(["free", "ivyi_care"]),
                  name: z.string().max(255),
                  priceMonthly: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647),
                  stripePriceIdMonthly: z.string().max(255).nullable(),
                  priceYearly: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647),
                  stripePriceIdAnnual: z.string().max(255).nullable(),
                  leadTime: z.number().int().gte(-2147483648).lte(2147483647),
                  createdAt: z.string().datetime({ offset: true }),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 500,
        description: `An unexpected condition was encountered and no more specific message is suitable.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/subscription-plans/reactivate",
    alias: "postV1subscriptionPlansreactivate",
    description: `Reverses a scheduled cancellation so the user&#x27;s subscription continues past the current billing period`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("subscription"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                userId: z.string().uuid(),
                planId: z.string().uuid(),
                stripeSubscriptionId: z.string().max(255).nullable(),
                billingCycle: z.enum(["monthly", "yearly", null]).nullable(),
                stripeCustomerId: z.string().max(255).nullable(),
                status: z.enum([
                  "active",
                  "canceled",
                  "incomplete",
                  "incomplete_expired",
                  "past_due",
                  "paused",
                  "trialing",
                  "unpaid",
                ]),
                currentPeriodStart: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                currentPeriodEnd: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                cancelAtPeriodEnd: z.boolean(),
                pausedAt: z.string().datetime({ offset: true }).nullable(),
                pauseResumesAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                canceledAt: z.string().datetime({ offset: true }).nullable(),
                gracePeriodEndsAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/subscription-plans/subscription",
    alias: "getV1subscriptionPlanssubscription",
    description: `Returns the current user&#x27;s subscription information`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("subscription"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                userId: z.string().uuid(),
                planId: z.string().uuid(),
                stripeSubscriptionId: z.string().max(255).nullable(),
                billingCycle: z.enum(["monthly", "yearly", null]).nullable(),
                stripeCustomerId: z.string().max(255).nullable(),
                status: z.enum([
                  "active",
                  "canceled",
                  "incomplete",
                  "incomplete_expired",
                  "past_due",
                  "paused",
                  "trialing",
                  "unpaid",
                ]),
                currentPeriodStart: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                currentPeriodEnd: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                cancelAtPeriodEnd: z.boolean(),
                pausedAt: z.string().datetime({ offset: true }).nullable(),
                pauseResumesAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                canceledAt: z.string().datetime({ offset: true }).nullable(),
                gracePeriodEndsAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                checkoutSnapshot: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/users",
    alias: "getV1users",
    description: `Returns a collection list of users.`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("user"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  name: z.string().max(255).nullable(),
                  emailVerifiedAt: z
                    .string()
                    .datetime({ offset: true })
                    .nullable(),
                  firstName: z.string().max(255).nullable(),
                  lastName: z.string().max(255).nullable(),
                  preferredName: z.string().max(255).nullable(),
                  email: z.string().max(255),
                  dob: z.string().nullable(),
                  country: z.string().max(255).nullable(),
                  city: z.string().max(255).nullable(),
                  preferredLanguage: z.string().max(50),
                  interests: z.union([
                    z.string(),
                    z.number(),
                    z.boolean(),
                    z.unknown(),
                    z.record(z.unknown().nullable()),
                    z.array(z.unknown().nullable()),
                  ]),
                  giftingStatements: z.union([
                    z.string(),
                    z.number(),
                    z.boolean(),
                    z.unknown(),
                    z.record(z.unknown().nullable()),
                    z.array(z.unknown().nullable()),
                  ]),
                  role: z.enum(["admin", "user", "partner"]),
                  stripeCustomerId: z.string().max(255).nullable(),
                  stripeAccountId: z.string().max(255).nullable(),
                  avatarUrl: z.string().max(2048).nullable(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  isFirstLogin: z.boolean(),
                  isOnboarded: z.boolean(),
                  sid: z.string().optional(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
            hello: z.literal("world"),
            queryDurationMs: z.number().optional(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/users",
    alias: "postV1users",
    description: `Registers a new user record profile.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1users_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("user"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                name: z.string().max(255).nullable(),
                emailVerifiedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                firstName: z.string().max(255).nullable(),
                lastName: z.string().max(255).nullable(),
                preferredName: z.string().max(255).nullable(),
                email: z.string().max(255),
                dob: z.string().nullable(),
                country: z.string().max(255).nullable(),
                city: z.string().max(255).nullable(),
                preferredLanguage: z.string().max(50),
                interests: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                giftingStatements: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                role: z.enum(["admin", "user", "partner"]),
                stripeCustomerId: z.string().max(255).nullable(),
                stripeAccountId: z.string().max(255).nullable(),
                avatarUrl: z.string().max(2048).nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                isFirstLogin: z.boolean(),
                isOnboarded: z.boolean(),
                sid: z.string().optional(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 409,
        description: `The request could not be completed due to a conflict with the current state of the target resource.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/users/:id",
    alias: "getV1usersId",
    description: `Returns a single user by their ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("user"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                name: z.string().max(255).nullable(),
                emailVerifiedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                firstName: z.string().max(255).nullable(),
                lastName: z.string().max(255).nullable(),
                preferredName: z.string().max(255).nullable(),
                email: z.string().max(255),
                dob: z.string().nullable(),
                country: z.string().max(255).nullable(),
                city: z.string().max(255).nullable(),
                preferredLanguage: z.string().max(50),
                interests: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                giftingStatements: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                role: z.enum(["admin", "user", "partner"]),
                stripeCustomerId: z.string().max(255).nullable(),
                stripeAccountId: z.string().max(255).nullable(),
                avatarUrl: z.string().max(2048).nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                isFirstLogin: z.boolean(),
                isOnboarded: z.boolean(),
                sid: z.string().optional(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            hello: z.literal("world"),
            queryDurationMs: z.number().optional(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "patch",
    path: "/v1/users/:id",
    alias: "patchV1usersId",
    description: `Updates details inside an existing individual user profile entry.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: patchV1usersId_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("user"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                name: z.string().max(255).nullable(),
                emailVerifiedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                firstName: z.string().max(255).nullable(),
                lastName: z.string().max(255).nullable(),
                preferredName: z.string().max(255).nullable(),
                email: z.string().max(255),
                dob: z.string().nullable(),
                country: z.string().max(255).nullable(),
                city: z.string().max(255).nullable(),
                preferredLanguage: z.string().max(50),
                interests: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                giftingStatements: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                role: z.enum(["admin", "user", "partner"]),
                stripeCustomerId: z.string().max(255).nullable(),
                stripeAccountId: z.string().max(255).nullable(),
                avatarUrl: z.string().max(2048).nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                isFirstLogin: z.boolean(),
                isOnboarded: z.boolean(),
                sid: z.string().optional(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "delete",
    path: "/v1/users/:id",
    alias: "deleteV1usersId",
    description: `Permanently purges an individual user account profile node from active tables.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/users/:id/profile-picture",
    alias: "postV1usersIdprofilePicture",
    description: `Uploads a profile picture for the specified user. Accepts multipart/form-data with a single &#x27;file&#x27; field (JPEG, PNG, WebP, max 5MB).`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ file: z.instanceof(File) }).passthrough(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("user"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                name: z.string().max(255).nullable(),
                emailVerifiedAt: z
                  .string()
                  .datetime({ offset: true })
                  .nullable(),
                firstName: z.string().max(255).nullable(),
                lastName: z.string().max(255).nullable(),
                preferredName: z.string().max(255).nullable(),
                email: z.string().max(255),
                dob: z.string().nullable(),
                country: z.string().max(255).nullable(),
                city: z.string().max(255).nullable(),
                preferredLanguage: z.string().max(50),
                interests: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                giftingStatements: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                role: z.enum(["admin", "user", "partner"]),
                stripeCustomerId: z.string().max(255).nullable(),
                stripeAccountId: z.string().max(255).nullable(),
                avatarUrl: z.string().max(2048).nullable(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                isFirstLogin: z.boolean(),
                isOnboarded: z.boolean(),
                sid: z.string().optional(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/users/me/stats",
    alias: "getV1usersmestats",
    description: `Counts saved loved ones, distinct occasion series, and paid orders with completed fulfillment for the authenticated user.`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("profile-stats"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                lovedOnesCount: z.number(),
                occasionsCreatedCount: z.number(),
                giftsCompletedCount: z.number(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/users/me/tour",
    alias: "getV1usersmetour",
    description: `Returns computed app tour step completion for the authenticated user, derived from existing recipients, occasions, and gifting processes.`,
    requestFormat: "json",
    response: z
      .object({
        data: z
          .object({
            type: z.literal("tour"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                steps: z
                  .object({
                    "add-recipient": z
                      .object({ completed: z.boolean() })
                      .passthrough(),
                    "create-occasion": z
                      .object({ completed: z.boolean() })
                      .passthrough(),
                    "send-gift": z
                      .object({ completed: z.boolean() })
                      .passthrough(),
                  })
                  .passthrough(),
                progress: z
                  .object({
                    completedCount: z.number(),
                    totalSteps: z.number(),
                    isComplete: z.boolean(),
                  })
                  .passthrough(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/users/onboarding",
    alias: "postV1usersonboarding",
    description: `Submits step 1 blueprint data and step 2 gifting statements to fully register and onboard the authenticated identity node.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1usersonboarding_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("onboarding"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                userId: z.string().uuid(),
                firstName: z.string().max(255),
                lastName: z.string().max(255).nullable(),
                preferredName: z.string().max(255).nullable(),
                dob: z.string(),
                country: z.string().max(100),
                city: z.string().max(100).nullable(),
                preferredLanguage: z.string().max(50),
                interests: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                giftingStatements: z.union([
                  z.string(),
                  z.number(),
                  z.boolean(),
                  z.unknown(),
                  z.record(z.unknown().nullable()),
                  z.array(z.unknown().nullable()),
                ]),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/vouchers",
    alias: "postV1vouchers",
    description: `Creates an operational voucher with unique claim codes tracking specific monetary value.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1vouchers_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("voucher"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                userId: z.string().uuid(),
                claimCode: z.string(),
                voucherOrderId: z.string().uuid(),
                partnerId: z.string().uuid(),
                faceValueCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647),
                remainingCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647),
                status: z.enum([
                  "active",
                  "operational_expired",
                  "legal_expired",
                  "exhausted",
                  "cancelled",
                ]),
                storageKey: z.string().nullable(),
                operationalExpiresAt: z.string().datetime({ offset: true }),
                legalExpiresAt: z.string().datetime({ offset: true }),
                sequence: z.number().int().gte(-2147483648).lte(2147483647),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                updatedBy: z.string().uuid().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 503,
        description: `The server is currently unable to handle the request due to temporary overloading or maintenance.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/vouchers",
    alias: "getV1vouchers",
    description: `Returns a JSON:API compliant collection wrapper of system-wide generated vouchers.`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("voucher"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  userId: z.string().uuid(),
                  claimCode: z.string(),
                  voucherOrderId: z.string().uuid(),
                  partnerId: z.string().uuid(),
                  faceValueCents: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647),
                  remainingCents: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647),
                  status: z.enum([
                    "active",
                    "operational_expired",
                    "legal_expired",
                    "exhausted",
                    "cancelled",
                  ]),
                  storageKey: z.string().nullable(),
                  operationalExpiresAt: z.string().datetime({ offset: true }),
                  legalExpiresAt: z.string().datetime({ offset: true }),
                  sequence: z.number().int().gte(-2147483648).lte(2147483647),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  updatedBy: z.string().uuid().nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/vouchers/orders",
    alias: "postV1vouchersorders",
    description: `Initiates a tracking container order for generating multiple partner vouchers.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1vouchersorders_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("voucher-order"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                voucherProductId: z.string().uuid().nullable(),
                partnerId: z.string().uuid(),
                processId: z.string().uuid(),
                orderItemId: z.string().uuid().nullable(),
                state: z.enum([
                  "draft",
                  "paid",
                  "vouchers_issued",
                  "failed",
                  "cancelled",
                ]),
                currency: z.string().max(3),
                expectedTotalCents: z
                  .number()
                  .int()
                  .gte(-2147483648)
                  .lte(2147483647),
                holdReason: z.string().nullable(),
                holdDetails: z.unknown().nullish(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                setId: z.string().uuid().nullable(),
                createdBy: z.string().uuid().nullable(),
                updatedBy: z.string().uuid().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 503,
        description: `The server is currently unable to handle the request due to temporary overloading or maintenance.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/vouchers/pdf",
    alias: "postV1voucherspdf",
    description: `Processes specified active voucher configurations or sequences into a secure printable format wrapper.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 500,
        description: `An unexpected condition was encountered and no more specific message is suitable.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/vouchers/process/:processId",
    alias: "getV1vouchersprocessProcessId",
    description: `Returns the vouchers issued for a gift process, each including a presigned PDF download URL when the voucher has been issued.`,
    requestFormat: "json",
    parameters: [
      {
        name: "processId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("voucher"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  userId: z.string().uuid(),
                  claimCode: z.string(),
                  voucherOrderId: z.string().uuid(),
                  partnerId: z.string().uuid(),
                  faceValueCents: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647),
                  remainingCents: z
                    .number()
                    .int()
                    .gte(-2147483648)
                    .lte(2147483647),
                  status: z.enum([
                    "active",
                    "operational_expired",
                    "legal_expired",
                    "exhausted",
                    "cancelled",
                  ]),
                  storageKey: z.string().nullable(),
                  operationalExpiresAt: z.string().datetime({ offset: true }),
                  legalExpiresAt: z.string().datetime({ offset: true }),
                  sequence: z.number().int().gte(-2147483648).lte(2147483647),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  updatedBy: z.string().uuid().nullable(),
                  downloadUrl: z.string().url().nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "post",
    path: "/v1/vouchers/products",
    alias: "postV1vouchersproducts",
    description: `Registers a new voucher package option inside the inventory master table.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postV1vouchersproducts_Body,
      },
    ],
    response: z
      .object({
        data: z
          .object({
            type: z.literal("voucher-product"),
            id: z.string().uuid(),
            attributes: z
              .object({
                id: z.string().uuid(),
                partnerId: z.string().uuid().nullable(),
                name: z.string(),
                description: z.string().nullable(),
                valueCents: z.number().int().gte(-2147483648).lte(2147483647),
                currency: z.string().max(3),
                isActive: z.boolean(),
                createdAt: z.string().datetime({ offset: true }),
                updatedAt: z.string().datetime({ offset: true }),
                stripePriceId: z.string().max(255).nullable(),
                createdBy: z.string().uuid().nullable(),
                updatedBy: z.string().uuid().nullable(),
              })
              .passthrough(),
            relationships: z.record(z.unknown().nullable()).optional(),
            meta: z.record(z.unknown().nullable()).optional(),
            links: z.record(z.string()).optional(),
          })
          .passthrough(),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z.record(z.unknown().nullable()),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `The request could not be understood or was missing required parameters.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
  {
    method: "get",
    path: "/v1/vouchers/products",
    alias: "getV1vouchersproducts",
    description: `Fetches a collection of available catalog product offerings, optionally filtered by a specific partner identifier parameter.`,
    requestFormat: "json",
    response: z
      .object({
        data: z.array(
          z
            .object({
              type: z.literal("voucher-product"),
              id: z.string().uuid(),
              attributes: z
                .object({
                  id: z.string().uuid(),
                  partnerId: z.string().uuid().nullable(),
                  name: z.string(),
                  description: z.string().nullable(),
                  valueCents: z.number().int().gte(-2147483648).lte(2147483647),
                  currency: z.string().max(3),
                  isActive: z.boolean(),
                  createdAt: z.string().datetime({ offset: true }),
                  updatedAt: z.string().datetime({ offset: true }),
                  stripePriceId: z.string().max(255).nullable(),
                  createdBy: z.string().uuid().nullable(),
                  updatedBy: z.string().uuid().nullable(),
                })
                .passthrough(),
              relationships: z.record(z.unknown().nullable()).optional(),
              meta: z.record(z.unknown().nullable()).optional(),
              links: z.record(z.string()).optional(),
            })
            .passthrough()
        ),
        links: z.object({ self: z.string() }).passthrough(),
        metadata: z
          .object({
            requestId: z.string(),
            timestamp: z.string(),
            total: z.number().int().gte(0),
            page: z.number().int().gt(0),
            limit: z.number().int().gt(0),
            totalPages: z.number().int().gte(0),
            availableFilters: z
              .record(z.unknown().nullable())
              .optional()
              .default({}),
            sortOptions: z
              .object({
                fields: z.array(z.string()),
                default: z.string(),
                direction: z.enum(["asc", "desc"]),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication failed or user doesn&#x27;t have permissions for the requested operation.`,
        schema: JsonApiErrorResponse,
      },
      {
        status: 403,
        description: `The server understood the request but refuses to authorize it.`,
        schema: JsonApiErrorResponse,
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
