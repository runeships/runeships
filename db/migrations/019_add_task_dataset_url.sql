-- Optional starter dataset attached to a task. Tasks that ship with
-- raw input data (e.g. the Veganuño Excel exercise) point students
-- at a downloadable file via dataset_url; the task detail page
-- surfaces a 'Starter dataset' panel above the brief when these
-- columns are set.
--
-- Both nullable so existing tasks keep working untouched.
--
-- Run AFTER 018.

alter table public.tasks
  add column if not exists dataset_url text;

alter table public.tasks
  add column if not exists dataset_label text;

-- Attach the Veganuño operational dataset to the property-ops task
-- and append a "Starter dataset" callout to the brief so students
-- know to look for the download in the panel above.
update public.tasks
set
  dataset_url = '/datasets/veganuno-dataset.xlsx',
  dataset_label = 'Veganuño raw operational data — 11 sheets, ~3,000 rows',
  brief = $brief$# Real estate operations workbook — Veganuño

Veganuño is a property management firm operating residential and mixed-use properties across Madrid. Our portfolio currently spans roughly 40 units across 7 buildings, with tenants ranging from long-term residential leases to short-term rentals.

Right now the team tracks incidents — leaks, broken doors, internet issues, humidity problems — on a single-sheet Excel that one of our property managers, Pedro, maintains manually. It started simple: address, tenant, incident description, action taken, payment status. But as the portfolio has grown, that single sheet has become inadequate. We can't easily see:

- Total maintenance spend per property
- Which buildings have recurring issues
- Which vendors and contractors handled what work
- Rent collection status alongside maintenance health
- Upcoming insurance renewals or capex events

We need someone to design and build a comprehensive property operations workbook in Excel that consolidates these workflows into one well-structured deliverable. The output should look like something a property management firm would actually use day-to-day — not a spreadsheet exercise, but a working operational system.

## Starter dataset

We've shared a sample of our actual operational data — download it via the link at the top of this page. The file contains 11 raw sheets: Properties (25), Units (71), Tenants (69), Payments (414 rows), Maintenance (180 tickets), Vendors (20), Mortgages (24), Expenses (1,484 rows), Insurance (25 policies), Cash Flow (300 rows), and a README.

The structure is intentionally rough — column names vary, dates come in different formats, IDs reference across sheets without enforced integrity. That's the point. Your job is to use this raw input as the basis for the polished, formula-driven workbook described below. Don't paste the data verbatim; design tabs that consume it cleanly and add the calculations, formatting, and dashboards on top.

## What we need

Design and build a multi-tab Excel workbook with the following sections:

**1. Portfolio Overview (dashboard)** — A summary tab that pulls from all other tabs. At a glance: total units, occupancy rate, monthly rent roll, YTD maintenance spend, open incidents, upcoming events. Use formulas to pull live from the underlying tabs — no hardcoded values.

**2. Property Register** — Master list of all properties. Columns: address, type (residential / commercial / mixed), year built, total units, total square meters, owner contact, building manager or concierge contact, insurance policy reference, and any building-level notes.

**3. Tenant Register** — Per-unit tenant tracking. Columns: property reference, unit number, tenant name, contact info, contract start and end dates, monthly rent, deposit held, payment frequency, and special arrangements.

**4. Incident Log** — Expanded version of the current single sheet. Per-incident tracking with property/unit, date, tenant, incident category (water damage, electrical, structural, HVAC, common area, other), severity, description, photos/videos link field, action taken, vendor used, status (open / in progress / resolved), insurance involvement, total cost, and resolution date.

**5. Rent Roll & Payments** — Monthly payment tracking per tenant. Months across columns, tenants down rows, status indicators (paid / late / outstanding). Include formulas for collection rates per property.

**6. Vendor & Contractor Directory** — List of vendors used (plumbers, electricians, cleaning services, locksmiths, insurance brokers, etc.) with contact info, specialty, typical rates, and a running record of jobs completed for us.

**7. Maintenance Budget vs. Actual** — Annual budget per property for routine maintenance, with month-by-month tracking of actual spend against budget. Highlight overages.

**8. Insurance & Renewals Tracker** — Insurance policies per property, renewal dates, premiums, claims history. Auto-flag policies expiring in the next 60 days using conditional formatting.

**9. Documentation & Notes** — Brief tab explaining how the workbook is structured, formula conventions used, and how to add new entries. Treat this as the "README" of the workbook.

## Quality criteria

- All calculations driven by formulas, not hardcoded values
- Consistent formatting throughout — currency in EUR, dates in DD/MM/YYYY
- Use of data validation (dropdowns for category fields, statuses, etc.)
- Cross-tab references that update dynamically
- A working dashboard that genuinely summarizes the rest of the workbook
- Conditional formatting for actionable things: overdue payments, expiring policies, high-cost incidents, properties exceeding maintenance budget
- Realistic example data populated across all tabs — not empty templates. Use the starter dataset above as your raw input, and feel free to extend or clean it as needed

## Submission

Upload your completed workbook to Google Drive (Sheets or Excel format), Microsoft OneDrive, or Dropbox. Set sharing to "Anyone with the link can view" — and importantly, make sure readers can inspect your formulas, not just see calculated outputs. Submit the public link in the submission field.

We'd rather see careful, well-structured work than a fast surface-level deliverable. The point isn't to produce something that looks complete — it's to produce something Pedro could actually use on Monday morning.$brief$
where slug = 'uk-launch-plan';
