/**
 * ConvertPDF â€“ Analytics, AdSense Auto Ads, and Consent Mode v2.
 * Loads GA4 + AdSense after Consent Mode defaults are set.
 * GA4 ID: G-8RV1Y8FVZM | AdSense pub: pub-1745874358886453
 */
(function () {
    'use strict';

    // Step 1: Initialise dataLayer and gtag shim BEFORE any network calls.
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    // Step 2: Set Consent Mode v2 DEFAULTS (deny everything ad-related until user accepts).
    gtag('consent', 'default', {
        ad_storage:           'denied',
        ad_user_data:         'denied',
        ad_personalization:   'denied',
        analytics_storage:    'granted',
        functionality_storage:'granted',
        security_storage:     'granted',
        wait_for_update:       500
    });

    // Step 3: Load GA4 asynchronously.
    var GA_ID = 'G-8RV1Y8FVZM';
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    gaScript.onload = function () {
        gtag('js', new Date());
        gtag('config', GA_ID, {
            anonymize_ip: true,
            send_page_view: true
        });
    };
    gaScript.onerror = function () { /* site works without analytics */ };
    document.head.appendChild(gaScript);

    // Step 4: Load AdSense Auto Ads script asynchronously.
    // Auto ads will only serve personalised ads when ad_storage is 'granted'.
    var adsScript = document.createElement('script');
    adsScript.async = true;
    adsScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1745874358886453';
    adsScript.crossOrigin = 'anonymous';
    adsScript.onerror = function () { /* silent fail; no ads shown */ };
    document.head.appendChild(adsScript);

    // Step 5: Expose helper for consent banner to call after user chooses.
    window.__updateAdConsent = function (choice) {
        if (typeof window.gtag !== 'function') return;
        if (choice === 'all') {
            gtag('consent', 'update', {
                ad_storage:         'granted',
                ad_user_data:       'granted',
                ad_personalization: 'granted',
                analytics_storage:  'granted'
            });
        } else {
            gtag('consent', 'update', {
                ad_storage:         'denied',
                ad_user_data:       'denied',
                ad_personalization: 'denied',
                analytics_storage:  'granted'
            });
        }
    };
})();
