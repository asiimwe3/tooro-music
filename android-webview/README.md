# Tooro Music — Android WebView App

Lightweight Android shell (≈80 KB) that wraps the live Tooro Music web app
(https://tooro-music-ten.vercel.app). No Expo, no React Native — pure Java.

## Build (no Gradle required)

Requires JDK 17 and Android SDK (platform 34, build-tools 34.0.0):

```
BT=$ANDROID_HOME/build-tools/34.0.0
AJ=$ANDROID_HOME/platforms/android-34/android.jar
$BT/aapt2 compile --dir res -o res.zip
$BT/aapt2 link -o base.apk -I $AJ --manifest AndroidManifest.xml res.zip --java gen \
    --min-sdk-version 21 --target-sdk-version 34 --version-code 1 --version-name 1.0.0
javac -source 8 -target 8 -bootclasspath $AJ -classpath $AJ gen/app/tooro/music/R.java MainActivity.java -d classes
$BT/d8 --release --lib $AJ --output . $(find classes -name "*.class")
# add classes.dex to base.apk, zipalign, apksigner sign
```

Bumping versions: update `versionCode`/`versionName` in the aapt2 link command.
Keep `tooro.keystore` (not committed) to sign updates for package `app.tooro.music`.
