# Services and monthly transactions

`Service` defines an income or expense linked to an existing BusinessPartner. `ServiceTransaction` stores the actual expected or completed payment amount, period and payment status. Transaction outputs populate the service and its business partner; type, partner and frequency are not copied into transaction records.

## Recurring generation

`RunServiceTransactionJob` starts with the API (`back/src/index.ts`), generates the current month's transactions immediately, and checks again every minute. It uses `America/Argentina/Buenos_Aires`, matching the Command Center. Each tick reuses the idempotent ServiceTransaction service generation, so services created or activated during the month are picked up on the next tick. Overlapping ticks are skipped; failures are logged and retried on the next tick. Closing the API stops the timer and waits for an in-flight run.

The scheduler follows the options pattern of `RunTaskScheduleJob`: `SERVICE_TRANSACTION_INTERVAL_MS` optionally changes the interval and `SERVICE_TRANSACTION_RUN_ON_START=false` skips only the immediate startup run. It generates only the current month, with no historical backfill.

Manual generation remains available through `POST /api/service-transactions/generate/YYYY-MM` with ServiceTransaction create or manage permission, including past/future months. Reads never create transactions.

With no start-month field, recurrence is calendar-aligned:

| Frequency | Generated periods |
| --- | --- |
| MONTHLY | Every month |
| BIMONTHLY | January, March, May, July, September, November |
| QUARTERLY | January, April, July, October |
| YEARLY | January |
| ON_DEMAND | Never generated; create transactions manually |

Only currently active services are generated. This endpoint returns existing or newly created transactions for services due in the requested period. Repeating it does not overwrite actual amounts, statuses or payment dates. It does not infer historical activity or backfill other periods.

A recurring service can have only one transaction per period, including manual transactions. On-demand services can have multiple transactions for the same period. Changing an on-demand service to recurring is rejected if it already has duplicate periods. Deactivation leaves existing transactions available.

## CRUD and payment state

- Services: `/api/services`.
- Transactions: `/api/service-transactions`.
- Transaction create accepts `service`, `period`, optional `amount`, and optional `status`. Missing amount uses the current service reference amount; missing status uses `PENDING`.
- Transaction amounts can subsequently be edited independently of the service amount.
- `paidAt` is server-managed and not accepted in write inputs. Entering `PAID` sets the current date; entering `PENDING` clears it. Editing an already-paid transaction without changing status preserves its payment date.
- PATCH applies only supplied fields, without injecting create defaults.

The frontend exposes both CRUDs through permission-gated menus, with English and Spanish labels. The Command Center has one **Services** tab with **Services** and **Transactions** subviews, active/inactive and pending/paid filters, and navigation between a service and its transactions. A **Pending transactions** card counts all `PENDING` transactions across all periods, including inactive services, and opens that filtered list when clicked. Each subview and the card respect their entity permissions. Counts refresh with the Command Center refresh action and after CRUD changes.

Transaction forms default the amount from the selected service and allow editing it. Payment dates are read-only.

## Monthly tracking

Call `GET /api/service-transactions/monthly/YYYY-MM` with ServiceTransaction view or manage permission. It returns:

```json
{
  "expectedIncome": 0,
  "collectedIncome": 0,
  "pendingIncome": 0,
  "expectedExpenses": 0,
  "paidExpenses": 0,
  "pendingExpenses": 0,
  "transactions": []
}
```

Expected totals include both pending and paid transactions stored for that period. Collected/paid totals include `PAID`; pending totals include `PENDING`. All calculations use actual transaction amounts. Reads never generate missing obligations; the job generates the current month, while other months can be generated manually. The transaction period, not the payment date, determines its tracking month. Classification uses the service's current type; no historical snapshots are introduced.

## Database compatibility

Both MongoDB and SQLite are supported. MongoDB works without a replica set: Service and ServiceTransaction repository writes share one in-process queue to prevent concurrent recurring duplicates.

**MongoDB requires a single API writer process for this guarantee.** Multiple API processes, separate workers/scripts, or direct database writes are not coordinated by this queue. The current deployment example uses one API instance; `RunServiceTransactionJob` is deliberately started in that API process, not the separate `index-job.ts` process, so automatic and manual writes share the same queue. Before introducing additional writers, replace this coordination with a database-enforced strategy. SQLite uses immediate write transactions and duplicate-protection triggers.

## Validation

Focused tests are in `back/test/modules/lifeops/service/service.test.ts` and run against SQLite and standalone in-memory MongoDB:

```sh
node --import tsx --test test/modules/lifeops/service/service.test.ts
```

Run this command from `back/`. Scheduler tests use Vitest:

```sh
npx vitest run test/modules/lifeops/service/service-transaction-job.test.ts
```

Frontend Command Center assertions run from `front/`:

```sh
node test/command-center.assertions.mjs
```
