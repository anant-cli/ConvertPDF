/**
 * ConvertPDF – Google tag with Consent Mode defaults (before config).
 * Replace G-8RV1Y8FVZM if you change the GA4 property.
 */
(function () {
    'use strict';
    var GA_ID = 'G-8RV1Y8FVZM'; // Extracted for easy configuration

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied', // Changed to denied for better GDPR compliance
        functionality_storage: 'granted',
        security_storage: 'granted',
        wait_for_update: 500
    });

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    s.onload = function () {
        gtag('js', new Date());
        gtag('config', GA_ID, { anonymize_ip: true });
    };
    s.onerror = function () { /* silent; site works without analytics */ };
    document.head.appendChild(s);
})();
