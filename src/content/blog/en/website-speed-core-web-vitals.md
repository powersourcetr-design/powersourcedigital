---
title: "What a slow website actually costs you"
metaTitle: "Website Speed and Core Web Vitals Explained"
description: "Why a four-second load loses customers who never appear in your analytics, what Core Web Vitals measure, and the fixes that make the biggest difference."
primaryKeyword: "website speed optimization"
secondaryKeywords:
  - "core web vitals"
  - "slow website saudi arabia"
  - "improve website loading speed"
searchIntent: informational
locale: en
translationKey: site-speed
cluster: landingWebDesign
tags:
  - web design
  - performance
readingMinutes: 6
publishedAt: 2026-09-12
updatedAt: 2026-09-12
faq:
  - question: "How fast is fast enough?"
    answer: "Aim for the main content appearing within 2.5 seconds on a mid-range phone on mobile data, not on your office wifi on a laptop. That is the condition most of your visitors are actually in."
  - question: "Does speed affect Google rankings?"
    answer: "It is a ranking factor, but a modest one compared with relevance. The bigger effect is on conversion: people leave slow pages, and a visitor who left never becomes an enquiry regardless of where you ranked."
  - question: "What usually makes a site slow?"
    answer: "In order: oversized images, too many third-party scripts, and heavy page builders that ship far more code than the page uses. The first is the most common and the easiest to fix."
  - question: "Can a slow site be fixed without a rebuild?"
    answer: "Often, yes. Compressing images, removing unused scripts and fixing caching can transform a site without touching its design. That is worth checking before paying for a rebuild you may not need."
---

Most of your visitors arrive on a phone, often on mobile data, often while doing something else. A site that takes four seconds to become usable loses a large share of them before they see anything at all.

The cruel part is that those people **never appear in your analytics as a lost enquiry**. They were never a session worth counting. So the cost is invisible, which is why it goes unfixed for years.

## What Core Web Vitals actually measure

Google's three metrics are less abstract than they sound. Each corresponds to something a visitor feels.

- **Largest Contentful Paint** — how long until the main thing on the page appears. Target under 2.5 seconds.
- **Interaction to Next Paint** — how long the page takes to respond when tapped. Target under 200 milliseconds.
- **Cumulative Layout Shift** — how much the page jumps around while loading. Target under 0.1.

Layout shift is the one businesses underrate. A page that moves as it loads causes mis-taps, and a customer who tapped the wrong thing twice does not try a third time.

## The four things that usually fix it

**Images.** By a distance the most common cause. A 3MB photograph scaled down by the browser still downloads at 3MB. Serving modern formats at the size actually displayed routinely halves total page weight on its own.

**Third-party scripts.** Chat widgets, analytics, pixels, embedded maps. Each is small on its own and they compound. Load them after the content, and delete the ones nobody reads the data from.

**Fonts.** Self-hosted and subset, so text is readable immediately rather than after a flash of nothing. A bilingual site should never send Arabic glyphs to an English page — that is what a unicode range is for.

**Reserved space.** Give images and embeds explicit dimensions so the page cannot jump while they load.

## Test it the way your customers experience it

Testing on office wifi on a desktop tells you almost nothing. Use a throttled mobile connection, and look at field data from real visitors rather than only lab scores.

A site can score well in a lab test and still be slow for a customer in Jeddah on a busy network. The field data is the number that corresponds to lost enquiries.

## When speed is not your problem

If your pages load in two seconds and you still get no enquiries, speed is not what is wrong. Look at whether the pages answer the question the visitor arrived with, and whether the next step is obvious.

Spending on performance when the real issue is thin content is a common and expensive misdiagnosis — the same trap described in [what a website costs](route:blogPost/website-design-cost-saudi-arabia).

## Where this fits

We build against these metrics from the start rather than optimising afterwards, because retrofitting speed onto a heavy site costs more than building it light. What that involves is set out on the [web design](route:landingWebDesign) page, and if search is your bigger concern, [local SEO in Riyadh](route:blogPost/local-seo-riyadh) is the better starting point.
