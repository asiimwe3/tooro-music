package app.tooro.music;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    private static final String HOME = "https://tooro-music-ten.vercel.app";
    private WebView web;
    private LinearLayout offline;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.parseColor("#080811"));

        web = new WebView(this);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setMediaPlaybackRequiresUserGesture(true);
        web.getSettings().setSupportZoom(false);
        web.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                String host = u.getHost() == null ? "" : u.getHost();
                if (host.contains("vercel.app") || host.contains("tooro")) return false; // stay in app
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, u)); // wa.me, external links
                } catch (Exception ignored) {}
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                offline.setVisibility(View.GONE);
                web.setVisibility(View.VISIBLE);
            }
        });
        LinearLayout.LayoutParams wp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT);
        web.setLayoutParams(wp);
        web.setBackgroundColor(Color.parseColor("#080811"));
        root.addView(web);

        // Offline fallback view
        offline = new LinearLayout(this);
        offline.setOrientation(LinearLayout.VERTICAL);
        offline.setGravity(android.view.Gravity.CENTER);
        LinearLayout.LayoutParams op = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT);
        offline.setLayoutParams(op);
        offline.setBackgroundColor(Color.parseColor("#080811"));
        TextView t1 = new TextView(this);
        t1.setText("\uD83C\uDFB5");
        t1.setTextSize(40);
        t1.setGravity(android.view.Gravity.CENTER);
        TextView t2 = new TextView(this);
        t2.setText("Tooro Music\nNo internet connection");
        t2.setTextSize(14);
        t2.setTextColor(Color.parseColor("#B9A8E0"));
        t2.setGravity(android.view.Gravity.CENTER);
        TextView t3 = new TextView(this);
        t3.setText("  RETRY  ");
        t3.setTextSize(13);
        t3.setTextColor(Color.WHITE);
        t3.setBackgroundColor(Color.parseColor("#7C3AED"));
        t3.setPadding(40, 24, 40, 24);
        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        bp.topMargin = 40;
        t3.setLayoutParams(bp);
        t3.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { load(); }
        });
        offline.addView(t1);
        offline.addView(t2);
        offline.addView(t3);
        offline.setVisibility(View.GONE);
        root.addView(offline);

        setContentView(root);
        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else load();
    }

    private void load() {
        if (isOnline()) { offline.setVisibility(View.GONE); web.loadUrl(HOME); }
        else { web.setVisibility(View.GONE); offline.setVisibility(View.VISIBLE); }
    }

    private boolean isOnline() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo n = cm.getActiveNetworkInfo();
        return n != null && n.isConnected();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
}
