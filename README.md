<p align="center">
  <img src="foco-logo.svg" width="160" alt="Self-Reliance FoCo logo" />
</p>

<h1 align="center">Self-Reliance FoCo</h1>

<p align="center">A free Android app that puts Larimer County help in one place: food, housing and rent assistance, emergency shelter, jobs, benefits, utility bills, health, transportation, clothes, and more. Covers Fort Collins, Loveland, Estes Park, Berthoud, and Wellington.</p>

<p align="center">
  <a href="https://github.com/TheMilkmanJ/SelfReliance-FoCo/releases/latest/download/Self-Reliance-FoCo.apk"><img alt="Download the Android app" src="https://img.shields.io/badge/Download%20v2.3.0%20for%20Android-Self--Reliance--FoCo.apk-522f81?style=for-the-badge&logo=android&logoColor=white" /></a>
</p>

<p align="center"><strong>Current download: v2.3.0</strong> (Clothes tab). About 41 MB. Installs over any earlier FoCo build.</p>

<p align="center">Or scan on your phone:<br/><img src="download-qr.svg" width="200" alt="QR code for the download link" /></p>

## Source

This repository is the application. Clone it, fork it, or download the ZIP.

- App UI and logic: [`src/`](src/) (TypeScript / React Native / Expo)
- Listings: [`src/data/resources.json`](src/data/resources.json)
- App config (name, Android package `org.foco.selfreliance`, version **2.3.0** / versionCode **6**): [`app.json`](app.json)
- License: [MIT](LICENSE)

This is an Expo app, not a hand-written Kotlin project. The Gradle tree, `AndroidManifest.xml`, and native Android folders are generated from this source:

```bash
npm install
npx expo prebuild --platform android --no-install
# -> ./android
```

Read `src/` to see what the app does (no analytics, no account, listings plus tap-to-call / maps). The signed release APK on [Releases](https://github.com/TheMilkmanJ/SelfReliance-FoCo/releases/latest) is built from this tree. A SHA-256 checksum lets you confirm you have that same file. It does not replace reading the source.

The release keystore is **not** in this repo. Anyone can build a debug APK. A Play-style upgrade over the public v2.3.0 build needs that same key.

## Install on your phone (about 2 minutes)

1. On your Android phone, tap the **Download v2.3.0 for Android** button above, or use the latest `Self-Reliance-FoCo.apk` on [Releases](https://github.com/TheMilkmanJ/SelfReliance-FoCo/releases/latest).
2. When the download finishes, tap the notification (or open **Files** / **Downloads** and tap the file).
3. Android will say something like *"For your security, your phone is not allowed to install unknown apps from this source."* Tap **Settings**, turn on **Allow from this source**, then go back.
4. Tap **Install**. If Google Play Protect shows a warning, tap **More details** and then **Install anyway** (this happens for any app that is not from the Play Store).
5. Open **Self-Reliance FoCo**. The bottom tabs should be Resources, Jobs, Housing, and **Clothes**.

**Already have Self-Reliance FoCo?** Install this over it. Same app, same key. If you still only see three tabs, you still have v2.2.0 — delete the old APK from Downloads and grab v2.3.0 again.

**Have the older church Self-Reliance app?** Uninstall that one first. Android will not let this install over it.

**iPhone:** the Expo project has an iOS bundle id (`org.foco.selfreliance`), but there is no App Store build yet.

## What is in the app (v2.3.0)

- **Resources** tab: 144 listings. Search by name, need, or town. Pick **FoCo**, **Loveland**, **Estes Park**, **Berthoud**, or **Wellington** to narrow everything (county-wide, statewide, and national programs still show).
- **Jobs** and **Housing** tabs use the same city pick. Jobs includes free national certificates (freeCodeCamp, Google Skillshop, HubSpot, IBM SkillsBuild, and others).
- **Clothes** tab: free clothing closets, kids and baby clothes, interview outfits, and pantries that also hand out clothes. Includes Food Not Bombs and Clothe the People (Oak Street church is closed; those cards point at Instagram / clothethepeople.com).
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
  "category": "food | housing | shelter | employment | benefits | utilities | health | transportation | phone | legal | seniors_disability | family_children | veterans | education | crisis | clothing",
  "description": "One or two plain sentences.",
  "phone": "970-555-0100 or null",
  "url": "https://... or null",
  "address": "street, city, CO zip or null",
  "hours": "short string or null",
  "area": "Fort Collins | Loveland | Estes Park | Berthoud | Wellington | Larimer County | Colorado (statewide) | National",
  "tags": ["keywords", "for", "search"]
}
```

Run `npm run validate` after editing. Phone numbers and hours change. If something is wrong, open an issue or send a pull request.

## Privacy

Nothing you tap is sent anywhere. City and dark-mode choices stay on your phone.

## Checksum (v2.3.0)

To verify the published APK: `sha256  2acfa7af7c627c2b1859b0bf7520aebf1d7d5158d4646def349da291320cf396`

## Questions or problems

Open an issue on this repo, or reply on the Nextdoor post where you found it.
