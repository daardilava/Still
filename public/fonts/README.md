# Fonts

Still uses **Figtree** (SIL Open Font License), served from this folder so no visitor data goes to Google.

1. Download Figtree from https://fonts.google.com/specimen/Figtree ("Get font" › download).
2. Convert the variable `Figtree[wght].ttf` to WOFF2 (e.g. `pip install fonttools brotli && fonttools ttLib.woff2 compress "Figtree[wght].ttf"`).
3. Save it here as `Figtree-Variable.woff2`.

Without the file the app falls back to the phone's system font (SF Pro on iPhone, Roboto on Android).
In the Expo app, bundle the same file with `expo-font`.
