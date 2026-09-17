<p align="center">
  <img src="foco-logo.svg" width="160" alt="Self-Reliance FoCo logo" />
</p>

<h1 align="center">Self-Reliance FoCo</h1>

<p align="center">A free Android app that puts Larimer County help in one place: food, housing, shelter, jobs, child care, dental, disaster recovery, immigrant services, and more. Covers Fort Collins, Loveland, Estes Park, Berthoud, and Wellington.</p>

<p align="center">
  <a href="https://github.com/TheMilkmanJ/SelfReliance-FoCo/releases/latest/download/Self-Reliance-FoCo.apk"><img alt="Download the Android app" src="https://img.shields.io/badge/Download%20v2.22.2%20for%20Android-Self--Reliance--FoCo.apk-522f81?style=for-the-badge&logo=android&logoColor=white" /></a>
  <br />
  <a href="https://github.com/TheMilkmanJ/SelfReliance-FoCo"><img alt="GitHub repository" src="https://img.shields.io/badge/GitHub-TheMilkmanJ%2FSelfReliance--FoCo-3d2261?style=for-the-badge&logo=github&logoColor=white" /></a>
  <a href="https://github.com/TheMilkmanJ/SelfReliance-FoCo/releases/latest"><img alt="GitHub Releases" src="https://img.shields.io/badge/Releases-latest-f5a623?style=for-the-badge" /></a>
</p>

<p align="center"><strong>Current download: v2.22.2</strong> (Highlander Heights is the Friday east-of-College trash listing). About 71 MB. Installs over any earlier FoCo build (versionCode 30).</p>

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
- App config (name, Android package `org.foco.selfreliance`, version **2.22.2** / versionCode **30**): [`app.json`](app.json)
- License: [MIT](LICENSE)

This is an Expo app, not a hand-written Kotlin project. The Gradle tree, `AndroidManifest.xml`, and native Android folders are generated from this source:

```bash
npm install
npx expo prebuild --platform android --no-install
# -> ./android
```

Read `src/` to see what the app does (no analytics, no account, listings plus tap-to-call / maps). The signed release APK on [Releases](https://github.com/TheMilkmanJ/SelfReliance-FoCo/releases/latest) is built from this tree. A SHA-256 checksum lets you confirm you have that same file. It does not replace reading the source.

The release keystore is **not** in this repo. Anyone can build a debug APK. A Play-style upgrade over the public v2.22.2 APK needs that same key and versionCode 31+.

## Install on your phone (about 2 minutes)

1. On your Android phone, tap the **Download for Android** button above, or use the latest `Self-Reliance-FoCo.apk` on [Releases](https://github.com/TheMilkmanJ/SelfReliance-FoCo/releases/latest).
2. When the download finishes, tap the notification (or open **Files** / **Downloads** and tap the file).
3. Android will say something like *"For your security, your phone is not allowed to install unknown apps from this source."* Tap **Settings**, turn on **Allow from this source**, then go back.
4. Tap **Install**. If Google Play Protect shows a warning, tap **More details** and then **Install anyway** (this happens for any app that is not from the Play Store).
5. Open **Self-Reliance FoCo**. The bottom tabs should be **Resources**, **Students**, **Homeless**, and **Have a disability?** Identification, pets, LGBTQ+, heat and cold, reentry, and furniture are on the Resources home tiles.

**Already have Self-Reliance FoCo?** Install this over it. Same app, same key. If the bottom tabs still say Jobs, Housing, and Clothes, you still have v2.6.0 or older — delete the old APK from Downloads and grab v2.22.2 again. If Clothes only shows three cards, you are on v2.13.x or older — install this over it. If there is no Trash day card on Resources home, you are on v2.14.0 or older. If there is no Offline maps card, you are on v2.15.0 or older. If there is no Give, need, volunteer card, you are on v2.16.0 or older. If Trash day has weekday chips but no Highlander Heights dropdown, you are on v2.18.0 or older. If there is no **Pregnancy & Birth** tile, you are on v2.19.0 or older. If there is no **Voters** tile, you are on v2.20.0 or older. If Trash day only lists Fort Collins neighborhoods, you are on v2.21.0 or older. If Families & Kids does not open with Poudre Valley Early Head Start first, you are on v2.22.0 or older. If Trash day still says **East of College, north of Drake** instead of Highlander Heights, you are on v2.22.1 or older.

**Have the older church Self-Reliance app?** Uninstall that one first. Android will not let this install over it.

**iPhone:** the Expo project has an iOS bundle id (`org.foco.selfreliance`), but there is no App Store build yet.

## What is in the app (v2.22.2, versionCode 30)

- **Resources** tab: 429 listings. Search by name, need, or town. Pick **FoCo**, **Loveland**, **Estes Park**, **Berthoud**, or **Wellington** to narrow everything (county-wide, statewide, and national programs still show). Home tiles include **Voters**, **Pregnancy & Birth**, **Identification**, **Pets**, **LGBTQ+**, **Heat & Cold**, **Reentry**, and **Furniture & Household**, plus the older tiles for jobs, housing, clothes, child care, immigrants, recovery, special needs, holiday, dental, and disaster. **Voters** is for the Nov 3, 2026 general election: register, 24-hour ballot boxes, vote centers, rides (Transfort is fare-free; South Transit Center has a drop box), ADA and language help, military/overseas, and what’s on the ballot. Transfort, COLT, SAINT, and the DMV stay on their original tiles and also show here. **Pregnancy & Birth** filters by hospital, water birth, HypnoBirthing, midwife/home, doula, prenatal & WIC, and diapers. PVH and MCR list jacuzzi labor tubs, not water birth of the baby; home water birth is True North and Golden Hour. WIC, Nurse-Family Partnership, Birthline, and Gabriel House stay on their original tiles and also show here. **Families** includes Poudre Valley Early Head Start (prenatal through age 3, Larimer County, apply at PSD Early Childhood) and El Nidito’s center-based classroom. Thin tiles now have a working group of desks (about 9–11 each) instead of two or three cards: Salvation Army and HNS clothing, Community Corrections / parole / probation, VA clinics, SAVA, Adult Protective Services, weatherization in Berthoud, library hotspots, and Salud dental in Estes Park. **Pets** includes Until They’re Home, Animal Friends’ Taft Hill adoptions, NOCO Humane lost-pet shelter, CSU’s 24/7 ER, TNR for community cats, and Estes Park animal help. **Rides** includes Transfort’s trip planner, route maps you can save, MAX, FLEX to Boulder, and how to download Fort Collins inside Google Maps. Certificates you can finish at no cost show a **Free** label next to the title. 2-1-1 still covers everything this list does not.
- **Trash day** (Resources home): One dropdown lists trash-day regions for Fort Collins, Loveland, Estes Park, Berthoud, Wellington, and unincorporated Larimer. **Highlander Heights is Friday** on Republic’s 2026 map — that row is the east-of-College listing (Lemay, Prospect, Pitkin, Emigh, north of Drake). Loveland neighborhoods (Centerra, Campion, Namaqua, downtown) are listed; the weekday comes from Recollect — this app does not invent Loveland days. Estes, Berthoud, and Wellington list neighborhoods or licensed haulers; pickup day is on the bill. Unincorporated Larimer has no county curbside route (landfill self-haul or a private hauler). Trash cart, recycling, and yard trimmings use the same purple row as Call / Look up, with **Not today** on the title line so it does not sit in the wrapped sentence. The phone remembers the region and delays Fort Collins Republic routes one day for the six observed weekday holidays. Carts out by 7am in FoCo. Extra-small trash carts are every other week; recycling is still weekly.
- **Open now** (Resources home): Meals, showers, beds, indoor heat/AC, and crisis lines with clock hours. Filter by what you need and by Open now / Later today. Call to confirm; hours change.
- **Give, need, volunteer** (Resources home): Three chips for people who need something, have something to donate, or can show up and help. Not a classifieds feed — these are desks already in the directory. **People Helping People** (Suzanne Barslund, 970-391-9039) is first for free furniture, donations, and volunteer lifting. Clothes closets, food banks, Habitat ReStore donation pickup, and FoCo Cafe sit on the matching chip.
- **Offline maps** (Resources home): Google does not let this app store Google’s map. The card walks you through downloading your town inside the Google Maps app so walking and driving can work with no signal. Transfort route PDFs are the bus fallback. The 429 listings, trash day, open now, and give/need already work offline after install.
- **Students** tab: FAFSA and CASFA, College Opportunity Fund, CSU and Front Range pantries, McKinney-Vento school liaisons, school meals, SUN Bucks, GED testing, campus health and counseling, TRIO / Access Center, libraries, Transfort, FLEX, MAX, RamRide, CSU child care waitlist, FRCC CCAMPIS child-care help, and Poudre Valley Early Head Start (prenatal through age 3). Filter by College, K–12, Money, Food, Jobs, or Health.
- **Homeless** tab: Murphy Center day services, Rescue Mission and Catholic Charities overnight beds, Family Housing Network, Loveland Resource Center, Matthews House youth shelter, Outreach Fort Collins, Coordinated Entry, Neighbor to Neighbor rent help, pantries, Transfort / FLEX, McKinney-Vento school liaisons, Early Head Start / Head Start, SAVA, Care Closet, People Helping People furniture, and parole / public defender desks. Filter by Overnight, Day help, Food, Housing, Families, or Youth.
- **Have a disability?** tab: Med-9 / Aid to the Needy Disabled, glasses, Get FoCo therapy-pool rec passes, the resource desk downstairs at UCHealth Family Medicine on Pennock Place, Adaptive Recreation (Fort Collins and Loveland), Dial-A-Ride, DVR, SWAP, SSI/SSDI, Colorado ABLE, HCBS waivers, Medicaid Buy-In, Home Care Allowance, Deaf/hard-of-hearing phones, talking books, Aftersight/NEWSLINE, Hearts & Horses, Disability Law Colorado, Civil Rights Division, ADA line, parking placards, CSU RAM Scholars, FRCC DSS, and kids' special-needs programs.
- **Large print:** headers, search, town chips, and filters wrap onto the next line instead of getting cut off when the phone’s font size is turned up. The bottom tab still says **Have a disability?** for screen readers; on large print it shows **Disability** so it fits.
- Quick-dial **2-1-1** and **9-8-8** on the home screen.
- **Dark mode:** tap the moon (or sun) in the top-right of the header.
- Tap a number to call. Tap a card for hours, address, website, **Get directions** (Google Maps from where you are), and **Bus directions** when there is a street address. This app does not store Google’s map. Bus times need a signal.

No account, no sign-in, no income form, no tracking.

## Run it locally

Requires Node 20+.

```bash
npm install
npx expo start --web      # browser preview
npx expo start            # Expo Go on a phone
npm run validate          # check resources.json
npm run typecheck
npm run check:trash       # Republic holiday bump
npm run check:open        # overnight open-now windows
npm run check:give        # Give / need / volunteer ids
npm run check:ehs         # Early Head Start on Families
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
  "category": "food | housing | shelter | employment | reentry | benefits | utilities | health | transportation | phone | legal | identification | voting | seniors_disability | family_children | pregnancy | veterans | education | crisis | clothing | household | pets | childcare | immigrant_refugee | lgbtq | addiction | special_needs | holiday | dental | disaster | weather",
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

## Checksum (v2.22.2)

`sha256: ddac06ffb5e26fc04c133526d4dd1ac19c53d9a2fc81860220070348bc4d5f4b`

## Questions or problems

Open an issue on this repo, or reply on the Nextdoor post where you found it.
