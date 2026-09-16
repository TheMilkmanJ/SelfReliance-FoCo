<p align="center">
  <img src="foco-logo.svg" width="160" alt="Self-Reliance FoCo logo" />
</p>

<h1 align="center">Self-Reliance FoCo</h1>

<p align="center">A free Android app that puts Larimer County help in one place: food, housing, shelter, jobs, child care, dental, disaster recovery, immigrant services, and more. Covers Fort Collins, Loveland, Estes Park, Berthoud, and Wellington.</p>

<p align="center">
  <a href="https://github.com/TheMilkmanJ/SelfReliance-FoCo/releases/latest/download/Self-Reliance-FoCo.apk"><img alt="Download the Android app" src="https://img.shields.io/badge/Download%20v2.11.0%20for%20Android-Self--Reliance--FoCo.apk-522f81?style=for-the-badge&logo=android&logoColor=white" /></a>
  <br />
  <a href="https://github.com/TheMilkmanJ/SelfReliance-FoCo"><img alt="GitHub repository" src="https://img.shields.io/badge/GitHub-TheMilkmanJ%2FSelfReliance--FoCo-3d2261?style=for-the-badge&logo=github&logoColor=white" /></a>
  <a href="https://github.com/TheMilkmanJ/SelfReliance-FoCo/releases/latest"><img alt="GitHub Releases" src="https://img.shields.io/badge/Releases-latest-f5a623?style=for-the-badge" /></a>
</p>

<p align="center"><strong>Current download: v2.11.0</strong> (large-print layout so older phones with big text do not clip chips and headers). About 41 MB. Installs over any earlier FoCo build (versionCode 17).</p>

<p align="center">
  Scan to <a href="https://github.com/TheMilkmanJ/SelfReliance-FoCo/releases/latest/download/Self-Reliance-FoCo.apk">download the APK</a>:<br/>
  <a href="https://github.com/TheMilkmanJ/SelfReliance-FoCo/releases/latest/download/Self-Reliance-FoCo.apk"><img src="download-qr.svg" width="220" height="220" alt="QR code that downloads the Android APK" /></a>
</p>

## Links

- **Android APK:** https://github.com/TheMilkmanJ/SelfReliance-FoCo/releases/latest/download/Self-Reliance-FoCo.apk
- **This repository:** https://github.com/TheMilkmanJ/SelfReliance-FoCo
- **Releases:** https://github.com/TheMilkmanJ/SelfReliance-FoCo/releases/latest

## Source

This repository is the application. Clone it, fork it, or download the ZIP.

- App UI and logic: [`src/`](src/) (TypeScript / React Native / Expo)
- Listings: [`src/data/resources.json`](src/data/resources.json)
- App config (name, Android package `org.foco.selfreliance`, version **2.11.0** / versionCode **17**): [`app.json`](app.json)
- License: [MIT](LICENSE)

This is an Expo app, not a hand-written Kotlin project. The Gradle tree, `AndroidManifest.xml`, and native Android folders are generated from this source:

```bash
npm install
npx expo prebuild --platform android --no-install
# -> ./android
```

Read `src/` to see what the app does (no analytics, no account, listings plus tap-to-call / maps). The signed release APK on [Releases](https://github.com/TheMilkmanJ/SelfReliance-FoCo/releases/latest) is built from this tree. A SHA-256 checksum lets you confirm you have that same file. It does not replace reading the source.

The release keystore is **not** in this repo. Anyone can build a debug APK. A Play-style upgrade over the public v2.11.0 APK needs that same key and versionCode 18+.

## Install on your phone (about 2 minutes)

1. On your Android phone, tap the **Download for Android** button above, or use the latest `Self-Reliance-FoCo.apk` on [Releases](https://github.com/TheMilkmanJ/SelfReliance-FoCo/releases/latest).
2. When the download finishes, tap the notification (or open **Files** / **Downloads** and tap the file).
3. Android will say something like *"For your security, your phone is not allowed to install unknown apps from this source."* Tap **Settings**, turn on **Allow from this source**, then go back.
4. Tap **Install**. If Google Play Protect shows a warning, tap **More details** and then **Install anyway** (this happens for any app that is not from the Play Store).
5. Open **Self-Reliance FoCo**. The bottom tabs should be **Resources**, **Students**, **Homeless**, and **Have a disability?** Identification, pets, LGBTQ+, heat and cold, reentry, and furniture are on the Resources home tiles.

**Already have Self-Reliance FoCo?** Install this over it. Same app, same key. If the bottom tabs still say Jobs, Housing, and Clothes, you still have v2.6.0 or older — delete the old APK from Downloads and grab v2.11.0 again. If you have Students but no Homeless tab, you are on v2.8.x. If you have Homeless but the home tiles stop at Disaster, you are on v2.9.x. If chips and headers clip with large print, you are on v2.10.x — install this over it.

**Have the older church Self-Reliance app?** Uninstall that one first. Android will not let this install over it.

**iPhone:** the Expo project has an iOS bundle id (`org.foco.selfreliance`), but there is no App Store build yet.

## What is in the app (v2.11.0, versionCode 17)

- **Resources** tab: 339 listings. Search by name, need, or town. Pick **FoCo**, **Loveland**, **Estes Park**, **Berthoud**, or **Wellington** to narrow everything (county-wide, statewide, and national programs still show). Home tiles include **Identification**, **Pets**, **LGBTQ+**, **Heat & Cold**, **Reentry**, and **Furniture & Household**, plus the older tiles for jobs, housing, clothes, child care, immigrants, recovery, special needs, holiday, dental, and disaster. Certificates you can finish at no cost show a **Free** label next to the title. 2-1-1 still covers everything this list does not.
- **Students** tab: FAFSA and CASFA, College Opportunity Fund, CSU and Front Range pantries, McKinney-Vento school liaisons, school meals, SUN Bucks, GED testing, campus health and counseling, TRIO / Access Center, libraries, Transfort, and RamRide. Filter by College, K–12, Money, Food, Jobs, or Health.
- **Homeless** tab: Murphy Center day services, Rescue Mission and Catholic Charities overnight beds, Family Housing Network, Loveland Resource Center, Matthews House youth shelter, Outreach Fort Collins, Coordinated Entry, Neighbor to Neighbor rent help, pantries, and McKinney-Vento school liaisons. Filter by Overnight, Day help, Food, Housing, Families, or Youth.
- **Have a disability?** tab: Med-9 / Aid to the Needy Disabled, glasses, Get FoCo therapy-pool rec passes, the resource desk downstairs at UCHealth Family Medicine on Pennock Place, Adaptive Recreation (Fort Collins and Loveland), Dial-A-Ride, DVR, SWAP, SSI/SSDI, Colorado ABLE, HCBS waivers, Medicaid Buy-In, Home Care Allowance, Deaf/hard-of-hearing phones, talking books, Aftersight/NEWSLINE, Hearts & Horses, Disability Law Colorado, Civil Rights Division, ADA line, parking placards, CSU RAM Scholars, FRCC DSS, and kids' special-needs programs.
- **Large print:** headers, search, town chips, and filters wrap onto the next line instead of getting cut off when the phone’s font size is turned up. The bottom tab still says **Have a disability?** for screen readers; on large print it shows **Disability** so it fits.
- Quick-dial **2-1-1** and **9-8-8** on the home screen.
- **Dark mode:** tap the moon (or sun) in the top-right of the header.
- Tap a number to call, tap a card for hours, address, website, and directions.

No account, no sign-in, no income form, no tracking.

## Run it locally

Requires Node 20+.

```bash
npm install
npx expo start --web      # browser preview
npx expo start            # Expo Go on a phone
npm run validate          # check resources.json
npm run typecheck
```

## Build an Android APK

Requires JDK 17+, the Android SDK (`ANDROID_HOME`), and (for a release that upgrades the public app) the release keystore.

```bash
npx expo prebuild --platform android --no-install
# optional: FOCO_KEYSTORE, FOCO_KEYSTORE_PASSWORD, FOCO_KEY_ALIAS, FOCO_KEY_PASSWORD
cd android && ./gradlew assembleRelease
# -> android/app/build/outputs/apk/release/app-release.apk
```

Without the keystore variables the build signs with the debug key, which is fine for review and cannot update the installed public release.

## Updating the resource list

Edit `src/data/resources.json`. Each entry:

```json
{
  "id": "unique-kebab-case",
  "name": "Organization or program",
  "category": "food | housing | shelter | employment | reentry | benefits | utilities | health | transportation | phone | legal | identification | seniors_disability | family_children | veterans | education | crisis | clothing | household | pets | childcare | immigrant_refugee | lgbtq | addiction | special_needs | holiday | dental | disaster | weather",
  "description": "One or two plain sentences.",
  "phone": "970-555-0100 or null",
  "url": "https://... or null",
  "address": "street, city, CO zip or null",
  "hours": "short string or null",
  "area": "Fort Collins | Loveland | Estes Park | Berthoud | Wellington | Larimer County | Colorado (statewide) | National",
  "tags": ["keywords", "for", "search"],
  "certGroup": "optional: work_ready | coding | it_cloud | marketing | government | business | digital_basics"
}
```

Run `npm run validate` after editing. Phone numbers and hours change. If something is wrong, open an issue or send a pull request.

## Privacy

Nothing you tap is sent anywhere. City and dark-mode choices stay on your phone.

## Checksum (v2.11.0)

To verify the published APK: `sha256  798d653666747d8cdeb561337e26f912ea9a61ea8f7d30466d95ae7d3da66a22`

## Questions or problems

Open an issue on this repo, or reply on the Nextdoor post where you found it.
