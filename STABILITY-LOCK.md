# TINTAXIS STABILITY LOCK
**Effective: 2026-04-26**

---

## POLICY

Tintaxis is in **production stability mode**. No automatic updates, no new features, no breaking changes without explicit approval.

---

## LOCKED DEPENDENCIES

All dependencies in `package.json` are pinned to exact versions (no `^` or `~`):

### Production Dependencies
- `@pdf-lib/fontkit`: 1.1.1 (PDF font embedding)
- `@supabase/supabase-js`: 2.45.4 (Database)
- `@vercel/analytics`: 2.0.1 (Analytics)
- `@vercel/speed-insights`: 2.0.0 (Performance monitoring)
- `clsx`: 2.1.1 (Class utilities)
- `framer-motion`: 11.3.19 (Animations)
- `next`: 14.2.5 (Framework)
- `pdf-lib`: 1.17.1 (PDF generation)
- `react`: 18.3.1 (UI framework)
- `react-dom`: 18.3.1 (React DOM)
- `stripe`: 16.12.0 (Payments)

### Dev Dependencies
- `@types/node`: 20.14.14
- `@types/react`: 18.3.3
- `@types/react-dom`: 18.3.0
- `autoprefixer`: 10.4.19
- `eslint`: 8.57.0
- `eslint-config-next`: 14.2.5
- `postcss`: 8.4.40
- `tailwindcss`: 3.4.6
- `typescript`: 5.5.4

---

## WHAT THIS MEANS

✅ **Safe:**
- Bug fixes by manually updating specific packages (requires testing first)
- Security patches (after review)
- Content updates (books, metadata, copy)
- Database migrations (with backups)

❌ **FORBIDDEN:**
- Automatic dependency updates (npm/yarn auto-upgrade)
- Major version updates (Next.js 15, React 19, etc.)
- New npm packages without explicit approval
- New feature development
- CSS/JavaScript changes that aren't bug fixes

---

## PROCESS FOR UPDATES

If an update is needed:

1. **Identify the issue** — What's broken? What needs updating?
2. **Test locally** — Update the package, run `npm install`, test in dev (`npm run dev`)
3. **Run tests** — `npm run build` must succeed
4. **Deploy to staging** — Verify on Vercel preview
5. **Approve & deploy** — Only then deploy to production

**No auto-merges. No CI/CD auto-deploy. Manual approval every time.**

---

## WHEN TO UPDATE

Only update if:
- **Critical security vulnerability** discovered
- **Production bug** affecting revenue/users
- **Explicit request** from Jose with testing approval

---

## AUTOMATED SERVICES DISABLED

- ❌ Dependabot (GitHub dependency updates)
- ❌ Renovate (automated PR updates)
- ❌ npm auto-update
- ❌ Vercel auto-rebuild on dependency changes
- ❌ New feature deployments

---

## VERIFICATION

To verify stability is locked:

```bash
# Check all dependencies are pinned (no ^ or ~)
grep -E "\^|~" package.json

# Should return: (empty)
```

If any caret (^) or tilde (~) appears, that package can auto-update. Fix it:

```bash
# Re-pin all dependencies
npm ci --package-lock-only
```

---

## EMERGENCY OVERRIDE

If production crashes and manual updates can't fix it fast enough:

1. Contact Jose immediately
2. Document the issue
3. Apply emergency patch
4. Post-mortem + lock improvement

---

**Status:** LOCKED  
**Last verified:** 2026-04-26  
**Next review:** 2026-07-26 (quarterly)
