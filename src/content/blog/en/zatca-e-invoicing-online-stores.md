---
title: "ZATCA e-invoicing for online stores, in plain terms"
metaTitle: "ZATCA E-Invoicing for Saudi Online Stores"
description: "What e-invoicing actually requires of a Saudi online store, how the local platforms handle it compared with Shopify, and the mistakes that cause problems."
primaryKeyword: "zatca e-invoicing online store"
secondaryKeywords:
  - "fatoora ecommerce saudi"
  - "electronic invoice saudi arabia store"
  - "zatca requirements ecommerce"
searchIntent: informational
locale: en
translationKey: zatca-stores
cluster: landingEcommerce
tags:
  - ecommerce
  - compliance
readingMinutes: 6
publishedAt: 2026-09-13
updatedAt: 2026-09-13
faq:
  - question: "Does a small store need to comply?"
    answer: "If you are VAT-registered and issuing invoices in Saudi Arabia, the rules apply to you regardless of size. Whether you are in the current integration wave depends on your revenue, and ZATCA notifies businesses directly rather than expecting you to guess."
  - question: "Does my platform handle this automatically?"
    answer: "Salla and Zid handle it natively. On Shopify it is done through an app, which works but is one more integration to configure, keep paid for and keep working. That difference is worth weighing when choosing a platform."
  - question: "What happens if the invoice format is wrong?"
    answer: "Rejected or non-compliant invoices create a reconciliation problem that surfaces at filing time, usually weeks later and usually at the worst moment. It is far cheaper to verify the format once at setup than to correct a quarter of invoices afterwards."
  - question: "Is this the same as a normal receipt?"
    answer: "No. A compliant invoice has a required structure, mandatory fields including a QR code, and must be generated and stored in a specific way. A PDF that looks like an invoice is not automatically one."
---

Every store taking money in Saudi Arabia has e-invoicing obligations, and most merchants meet them by accident — the platform handles it — right up until the day it does not. This explains what is actually required, where the platforms differ, and what goes wrong.

If you are still choosing where to build, [Salla, Zid or Shopify](route:blogPost/salla-vs-zid-vs-shopify) compares them on this and everything else.

## What is actually required

E-invoicing means invoices are generated, stored and transmitted in a structured electronic format rather than as a document that happens to be digital. In practice that means three things for a store:

- Invoices carry **mandatory fields**, including a QR code and your VAT registration details
- They are **generated in a compliant format**, not simply exported as a PDF
- They are **transmitted or reported** to ZATCA according to the phase your business is in

A receipt emailed as a nicely designed PDF is not a compliant invoice. That is the most common misunderstanding.

## Where platforms differ

This is the one area where the local platforms are clearly ahead. **Salla and Zid treat e-invoicing as a native feature**: it is configured in settings, maintained by the platform, and updated when the requirements change.

**Shopify handles it through an app.** The apps work. But an app is a separate subscription, a separate configuration, and a separate thing that can break or lapse without anybody noticing until filing.

For a store selling only inside the Kingdom, this is a genuine reason to prefer a local platform — not the only reason, but a real one. The cost comparison is in [what an online store costs](route:blogPost/ecommerce-website-cost-saudi-arabia).

## What actually goes wrong

**Details that were never filled in.** VAT number missing or wrong in the store settings, so every invoice issued is non-compliant. Trivial to fix, expensive to discover late.

**The app lapsed.** A card expired, the app stopped, invoices carried on being issued in the wrong format for weeks.

**Manual orders.** Sales taken over WhatsApp or the phone and entered by hand often bypass the invoicing flow entirely. If you sell that way, check that path specifically — it is the one nobody tests.

**Refunds and credit notes.** These have their own requirements and are frequently missed, because setup testing usually covers a sale and stops there.

## What to do at setup

Issue one real order, refund it, and inspect both documents. Check the QR code scans, the VAT details are right, and the credit note exists and is correctly formed. Ten minutes at setup avoids a quarter of invoices needing correction.

If you are launching a store and want this verified as part of the build rather than discovered afterwards, that is included in what we do on the [e-commerce development](route:landingEcommerce) page.

## A note on scope

This is a plain-language summary to help you ask the right questions of your platform and your accountant. It is not tax advice, and the phases and thresholds change. For your specific obligations, confirm with a qualified accountant or with ZATCA directly.
