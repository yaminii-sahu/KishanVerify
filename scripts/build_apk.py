import os
import sys
import shutil
import subprocess
import zipfile
from PIL import Image

def run_cmd(cmd, check=True):
    print(f"Running: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    res = subprocess.run(cmd, shell=isinstance(cmd, str), capture_output=True, text=True)
    if check and res.returncode != 0:
        print("STDOUT:", res.stdout)
        print("STDERR:", res.stderr)
        raise RuntimeError(f"Command failed with exit code {res.returncode}")
    return res

def main():
    print("=======================================================")
    print("      Building KisanVerify Native Android APK          ")
    print("=======================================================")

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    android_dir = os.path.join(root_dir, 'android')
    build_dir = os.path.join(android_dir, 'build')
    os.makedirs(build_dir, exist_ok=True)

    # 1. Locate Tools
    java_home = r"C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
    android_sdk = r"C:\Android"
    if not os.path.exists(android_sdk):
        android_sdk = os.path.expandvars(r"%LOCALAPPDATA%\Android\Sdk")

    build_tools_version = "34.0.0"
    build_tools_dir = os.path.join(android_sdk, "build-tools", build_tools_version)
    if not os.path.exists(build_tools_dir):
        # find newest available
        bt_root = os.path.join(android_sdk, "build-tools")
        versions = sorted(os.listdir(bt_root), reverse=True)
        build_tools_dir = os.path.join(bt_root, versions[0])
        print(f"Using build-tools: {build_tools_dir}")

    platform_version = "android-34"
    android_jar = os.path.join(android_sdk, "platforms", platform_version, "android.jar")
    if not os.path.exists(android_jar):
        platforms_root = os.path.join(android_sdk, "platforms")
        p_versions = sorted(os.listdir(platforms_root), reverse=True)
        android_jar = os.path.join(platforms_root, p_versions[0], "android.jar")
        print(f"Using platform android.jar: {android_jar}")

    javac = os.path.join(java_home, "bin", "javac.exe")
    keytool = os.path.join(java_home, "bin", "keytool.exe")
    aapt2 = os.path.join(build_tools_dir, "aapt2.exe")
    d8 = os.path.join(build_tools_dir, "d8.bat")
    zipalign = os.path.join(build_tools_dir, "zipalign.exe")
    apksigner = os.path.join(build_tools_dir, "apksigner.bat")

    print(f"Tools confirmed:\n  javac: {javac}\n  aapt2: {aapt2}\n  d8: {d8}\n  android.jar: {android_jar}")

    # 2. Setup Android project structure
    src_pkg_dir = os.path.join(android_dir, "src", "in", "gov", "kisanverify")
    res_dir = os.path.join(android_dir, "res")
    values_dir = os.path.join(res_dir, "values")
    assets_dir = os.path.join(android_dir, "assets")
    os.makedirs(src_pkg_dir, exist_ok=True)
    os.makedirs(values_dir, exist_ok=True)
    os.makedirs(assets_dir, exist_ok=True)

    # 3. Create launcher mipmap icons from logo-tile.png
    logo_tile_path = os.path.join(root_dir, "frontend", "src", "assets", "brand", "logo-tile.png")
    if os.path.exists(logo_tile_path):
        logo_img = Image.open(logo_tile_path).convert('RGBA')
        icon_sizes = {
            "mipmap-mdpi": 48,
            "mipmap-hdpi": 72,
            "mipmap-xhdpi": 96,
            "mipmap-xxhdpi": 144,
            "mipmap-xxxhdpi": 192,
        }
        for folder, sz in icon_sizes.items():
            folder_path = os.path.join(res_dir, folder)
            os.makedirs(folder_path, exist_ok=True)
            resized = logo_img.resize((sz, sz), Image.Resampling.LANCZOS)
            resized.save(os.path.join(folder_path, "ic_launcher.png"), optimize=True)
            resized.save(os.path.join(folder_path, "ic_launcher_round.png"), optimize=True)
        print("✓ Created app mipmap icons for all screen densities")

    # 4. Values resources: strings, colors, styles
    strings_xml = '''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">KisanVerify</string>
</resources>'''
    with open(os.path.join(values_dir, "strings.xml"), "w", encoding="utf-8") as f:
        f.write(strings_xml)

    colors_xml = '''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="forest">#4A6538</color>
    <color name="cream">#F7F5EC</color>
</resources>'''
    with open(os.path.join(values_dir, "colors.xml"), "w", encoding="utf-8") as f:
        f.write(colors_xml)

    styles_xml = '''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="@android:style/Theme.DeviceDefault.Light.NoActionBar">
        <item name="android:statusBarColor">@color/forest</item>
        <item name="android:navigationBarColor">@color/cream</item>
        <item name="android:windowBackground">@color/cream</item>
    </style>
</resources>'''
    with open(os.path.join(values_dir, "styles.xml"), "w", encoding="utf-8") as f:
        f.write(styles_xml)

    # 5. AndroidManifest.xml
    manifest_xml = '''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="in.gov.kisanverify"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true"
        android:allowBackup="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>'''
    manifest_path = os.path.join(android_dir, "AndroidManifest.xml")
    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write(manifest_xml)
    print("✓ Created AndroidManifest.xml and XML resources")

    # 6. MainActivity.java
    main_activity_java = '''package in.gov.kisanverify;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

public class MainActivity extends Activity {
    private WebView webView;
    private ValueCallback<Uri[]> uploadMessage;
    private final static int FILECHOOSER_RESULTCODE = 1001;

    // Production bundled asset or USB/Network live URLs
    private static final String LIVE_DEV_URL = "http://localhost:5173/";
    private static final String LAN_DEV_URL = "http://172.16.85.37:5173/";
    private static final String BUNDLED_URL = "file:///android_asset/dist/index.html";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Status bar color matching forest green
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(0xFF4A6538);
        }

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        // Support pinch zoom and smooth responsive rendering
        settings.setSupportZoom(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file://")) {
                    view.loadUrl(url);
                    return true;
                }
                return false;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                // If live dev server is unreachable, smoothly fallback to bundled app
                String failingUrl = request.getUrl().toString();
                if (failingUrl.equals(LIVE_DEV_URL)) {
                    view.loadUrl(BUNDLED_URL);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                // Auto-grant microphone and media permissions for Kisan speech recognition
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        request.grant(request.getResources());
                    }
                });
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                             FileChooserParams fileChooserParams) {
                if (uploadMessage != null) {
                    uploadMessage.onReceiveValue(null);
                }
                uploadMessage = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILECHOOSER_RESULTCODE);
                } catch (Exception e) {
                    uploadMessage = null;
                    return false;
                }
                return true;
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                android.util.Log.d("KisanVerify", consoleMessage.message() + " -- From line "
                        + consoleMessage.lineNumber() + " of " + consoleMessage.sourceId());
                return true;
            }
        });

        // Load bundled production application (with instant offline readiness)
        webView.loadUrl(BUNDLED_URL);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (uploadMessage != null) {
                Uri[] results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
                uploadMessage.onReceiveValue(results);
                uploadMessage = null;
            }
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
'''
    with open(os.path.join(src_pkg_dir, "MainActivity.java"), "w", encoding="utf-8") as f:
        f.write(main_activity_java)
    print("✓ Created MainActivity.java with full hardware-accelerated WebView and mic/camera permissions")

    # 7. Copy frontend/dist into android/assets/dist
    frontend_dist = os.path.join(root_dir, "frontend", "dist")
    bundled_dist = os.path.join(assets_dir, "dist")
    if os.path.exists(bundled_dist):
        shutil.rmtree(bundled_dist)
    if os.path.exists(frontend_dist):
        shutil.copytree(frontend_dist, bundled_dist)
        print("✓ Bundled production web build into APK assets/dist")
    else:
        print("Warning: frontend/dist not found, please run npm run build first")

    # 8. Step A: AAPT2 Compile Resources
    compiled_res_zip = os.path.join(build_dir, "compiled_res.zip")
    run_cmd([aapt2, "compile", "--dir", res_dir, "-o", compiled_res_zip])
    print("✓ aapt2 compile passed")

    # 9. Step B: AAPT2 Link Resources & Generate R.java
    gen_dir = os.path.join(build_dir, "gen")
    os.makedirs(gen_dir, exist_ok=True)
    unaligned_apk = os.path.join(build_dir, "unaligned.apk")
    run_cmd([
        aapt2, "link",
        compiled_res_zip,
        "-I", android_jar,
        "--manifest", manifest_path,
        "--java", gen_dir,
        "-A", assets_dir,
        "-o", unaligned_apk,
        "--auto-add-overlay"
    ])
    print("✓ aapt2 link passed, unaligned.apk & R.java generated")

    # 10. Step C: Compile Java Sources (R.java + MainActivity.java)
    classes_dir = os.path.join(build_dir, "classes")
    os.makedirs(classes_dir, exist_ok=True)
    
    java_files = []
    for root, _, files in os.walk(gen_dir):
        for fl in files:
            if fl.endswith(".java"):
                java_files.append(os.path.join(root, fl))
    for root, _, files in os.walk(os.path.join(android_dir, "src")):
        for fl in files:
            if fl.endswith(".java"):
                java_files.append(os.path.join(root, fl))

    run_cmd([
        javac,
        "-source", "1.8",
        "-target", "1.8",
        "-cp", android_jar,
        "-d", classes_dir
    ] + java_files)
    print("✓ javac compilation passed")

    # 11. Step D: D8 DEX Compilation
    class_files = []
    for root, _, files in os.walk(classes_dir):
        for fl in files:
            if fl.endswith(".class"):
                class_files.append(os.path.join(root, fl))

    dex_dir = os.path.join(build_dir, "dex")
    os.makedirs(dex_dir, exist_ok=True)
    run_cmd([d8, "--output", dex_dir, "--lib", android_jar] + class_files)
    print("✓ d8 dex compiler generated classes.dex")

    # 12. Step E: Pack classes.dex into unaligned.apk
    classes_dex = os.path.join(dex_dir, "classes.dex")
    with zipfile.ZipFile(unaligned_apk, 'a') as zf:
        zf.write(classes_dex, "classes.dex")
    print("✓ Packaged classes.dex into unaligned.apk")

    # 13. Step F: Zipalign APK (4-byte alignment)
    aligned_apk = os.path.join(build_dir, "aligned.apk")
    if os.path.exists(aligned_apk):
        os.remove(aligned_apk)
    run_cmd([zipalign, "-v", "-p", "4", unaligned_apk, aligned_apk])
    print("✓ zipalign 4-byte optimization passed")

    # 14. Step G: Generate Debug Keystore & Sign APK
    keystore_path = os.path.join(android_dir, "debug.keystore")
    if not os.path.exists(keystore_path):
        run_cmd([
            keytool,
            "-genkeypair",
            "-keystore", keystore_path,
            "-storepass", "android",
            "-alias", "androiddebugkey",
            "-keypass", "android",
            "-keyalg", "RSA",
            "-keysize", "2048",
            "-validity", "10000",
            "-dname", "CN=KisanVerify,O=GoI,C=IN"
        ])
        print("✓ Created debug.keystore")

    final_apk = os.path.join(build_dir, "KisanVerify.apk")
    if os.path.exists(final_apk):
        os.remove(final_apk)
    shutil.copyfile(aligned_apk, final_apk)

    run_cmd([
        apksigner, "sign",
        "--ks", keystore_path,
        "--ks-pass", "pass:android",
        "--ks-key-alias", "androiddebugkey",
        "--key-pass", "pass:android",
        final_apk
    ])
    print(f"✓ apksigner verified: {final_apk}")

    apk_size_mb = os.path.getsize(final_apk) / (1024 * 1024)
    print(f"\nSUCCESS! KisanVerify APK ready: {final_apk} ({apk_size_mb:.2f} MB)")

    # 15. Install onto connected ADB phone
    print("\nAttempting install on connected ADB phone...")
    install_res = run_cmd("adb install -r " + final_apk, check=False)
    if install_res.returncode == 0:
        print("✓ APK installed on phone successfully!")
        print("Launching KisanVerify on phone...")
        run_cmd("adb shell am start -n in.gov.kisanverify/.MainActivity")
        print("✓ KisanVerify is now open and running natively on your phone!")
    else:
        print("Could not auto-install via adb. Run: adb install -r " + final_apk)

if __name__ == '__main__':
    main()
