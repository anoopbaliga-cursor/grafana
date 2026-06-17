---
name: add-panel-option
description: Add a new option to a Grafana panel plugin end to end (schema/options model, options builder UI, migration, and test). Use when asked to add or change a configurable option on a panel.
paths: public/app/plugins/panel/**
---

# Add a new panel option

A repeatable workflow for adding a configurable option to a panel plugin. Use the Stat
panel (`public/app/plugins/panel/stat/`) as the reference implementation.

## Steps

1. **Locate the panel.** Options live under `public/app/plugins/panel/<panel>/`. Key
   files:
   - `panelcfg.gen.ts` / `panelcfg.cue` — the `Options` type and `defaultOptions`.
   - `module.tsx` — registers the panel and builds the options UI via
     `setPanelOptions((builder) => { ... })`.
   - `*Migrations.ts` — handles migrating old saved panels.

2. **Add the option to the model.** If the panel has a CUE schema (`panelcfg.cue`), add
   the field there and regenerate with `make gen-cue`. Otherwise add it to the generated
   `Options` type and to `defaultOptions`.

3. **Add the UI control** in `module.tsx` using the builder. Match the existing style:
   - Use `builder.addBooleanSwitch` / `addSelect` / `addRadio` / `addTextInput` etc.
   - Set `path`, `name`, optional `description`, a `category`, and `defaultValue`.
   - Wrap all `name`/`description`/labels with `t()` from `@grafana/i18n`.
   - Use `showIf` to conditionally display the control when relevant.

4. **Use the option** in the panel component (`<Panel>.tsx`), reading it from
   `props.options`.

5. **Migration.** If existing saved dashboards must keep working, update the panel's
   change/migration handler so the new option gets a sensible default.

6. **Test.** Add/extend a colocated test and run:

   ```bash
   yarn jest --no-watch public/app/plugins/panel/<panel>/
   ```

7. **i18n.** Run `make i18n-extract` to pick up new strings.

## Definition of done

- New option appears in the panel editor, is persisted, has a default, old dashboards
  still load, and tests pass.
