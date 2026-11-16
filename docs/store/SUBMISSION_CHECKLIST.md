# Block Quest — Store Submission Checklist

**Hard rule:** Do **not** publish, upload, or submit until the product owner explicitly approves.

## Pre-submit gates

- [ ] `npm test` green
- [ ] `npm run build` green
- [ ] Phase 8 manual checklist B–D completed (`docs/QA_CHECKLIST.md`)
- [ ] Android device/emulator section F completed
- [ ] No Phase 7 ads/analytics unless separately approved
- [ ] Privacy policy draft reviewed (`docs/store/PRIVACY.md`) and hosted URL ready
- [ ] Support email / developer name filled in (no placeholders)
- [ ] Listing copy finalized (`docs/store/STORE_LISTING.md`)
- [ ] Screenshots captured (`docs/store/SCREENSHOTS.md`)
- [ ] Feature graphic prepared
- [ ] Icons/splash are Block Quest branded (not Capacitor defaults)
- [ ] `versionCode` incremented for this upload
- [ ] Signed release AAB built and smoke-tested (`docs/store/RELEASE_BUILDS.md`)

## Google Play Console (when approved)

- [ ] Create/select app `Block Quest`
- [ ] Package name matches `com.blockquest.game`
- [ ] Store listing (title, short + full description)
- [ ] Graphics (icon, feature graphic, phone screenshots)
- [ ] Categorization + content rating questionnaire
- [ ] Target audience / news apps declarations as applicable
- [ ] Privacy policy URL
- [ ] Data safety form (current build: mostly no collected data; local storage only — answer carefully)
- [ ] App access / ads declaration (**no ads** in current build)
- [ ] Upload signed AAB to internal/closed testing first
- [ ] Internal test pass signed off
- [ ] Production release only after owner approval

## Apple App Store (later — Phase 6+)

- [ ] iOS project created on macOS
- [ ] Bundle ID configured
- [ ] Archive + TestFlight
- [ ] App Privacy labels match reality
- [ ] Screenshots for required device sizes
- [ ] Submit only after owner approval

## Post-submit

- [ ] Record versionCode / versionName / build date in changelog
- [ ] Monitor crash reports (when Play console available)
- [ ] Do not enable ads/analytics without a new approved phase
