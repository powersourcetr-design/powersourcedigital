/**
 * Pages Functions adapter for the lead endpoint.
 *
 * All of the logic lives in `src/server/lead.ts` as a plain
 * `(Request, Env) => Response`, so if this project is ever redeployed as a
 * Worker with static assets — see DECISIONS 16, which is ambiguous about which
 * of the two it currently is — the same handler mounts there unchanged and
 * nothing has to be rewritten or kept in sync.
 */

import { handleLead, type LeadEnv } from '../../src/server/lead'

interface PagesContext {
  request: Request
  env: LeadEnv
}

/** Catch-all: `handleLead` does its own method guard and answers 405 itself. */
export const onRequest = (context: PagesContext): Promise<Response> =>
  handleLead(context.request, context.env)
