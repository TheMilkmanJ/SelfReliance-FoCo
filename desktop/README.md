# Desktop (Electron)

Wraps the Expo web export in a native window for Windows and Mac.

## Build locally

```bash
npm install
npm run desktop:export   # expo export --platform web -> dist-web
npm run desktop:pack     # electron-builder (host OS)
```

CI builds Windows (Setup.exe) and Mac (DMG) separately and attaches both to the GitHub Release.
