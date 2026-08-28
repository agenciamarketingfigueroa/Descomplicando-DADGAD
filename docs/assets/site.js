const menuButton = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');

menuButton?.addEventListener('click', () => {
  const open = menu?.classList.toggle('is-open') ?? false;
  menuButton.setAttribute('aria-expanded', String(open));
});

menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('[data-event]').forEach((element) => {
  element.addEventListener('click', () => {
    const detail = { event: element.dataset.event, label: element.dataset.label || element.textContent.trim() };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(detail);
  });
});

document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });

const ATTRIBUTION_PARAMETERS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_id',
  'sck',
  'src',
  'fbclid'
];
const ATTRIBUTION_STORAGE_KEY = 'dadgad_attribution_v1';
const ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CONSENT_COOKIE = 'dadgad_marketing_consent';
const CONSENT_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;
const COURSE_CHECKOUT_SELECTOR = '.course-sales-page a[href*="pay.hotmart.com"]';
const isCourseSalesPage = document.body.classList.contains('course-sales-page');

function getCookie(name) {
  const prefix = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie.split('; ').find((item) => item.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function setConsentCookie(value) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(CONSENT_COOKIE)}=${encodeURIComponent(value)}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

function readIncomingAttribution() {
  const query = new URLSearchParams(window.location.search);
  return ATTRIBUTION_PARAMETERS.reduce((result, parameter) => {
    const value = query.get(parameter);
    if (value) result[parameter] = value;
    return result;
  }, {});
}

function hasAttribution(parameters) {
  return Object.keys(parameters).length > 0;
}

function readStoredAttribution() {
  try {
    const record = JSON.parse(window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY));
    if (!record || !Number.isFinite(record.expiresAt) || record.expiresAt <= Date.now()) {
      window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
      return {};
    }

    return ATTRIBUTION_PARAMETERS.reduce((result, parameter) => {
      const value = record.parameters?.[parameter];
      if (typeof value === 'string' && value) result[parameter] = value;
      return result;
    }, {});
  } catch {
    window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
    return {};
  }
}

function storeAttribution(parameters) {
  if (!hasAttribution(parameters)) return;

  try {
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify({
      parameters,
      expiresAt: Date.now() + ATTRIBUTION_TTL_MS
    }));
  } catch {
    // Checkout forwarding still works for the current page if storage is unavailable.
  }
}

function clearStoredAttribution() {
  try {
    window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
  } catch {
    // Storage may be blocked by the browser; there is nothing else to clear.
  }
}

function updateCheckoutLinks(parameters) {
  if (!isCourseSalesPage || !hasAttribution(parameters)) return;

  document.querySelectorAll(COURSE_CHECKOUT_SELECTOR).forEach((link) => {
    const checkoutUrl = new URL(link.href, window.location.href);
    ATTRIBUTION_PARAMETERS.forEach((parameter) => {
      const value = parameters[parameter];
      if (value) checkoutUrl.searchParams.set(parameter, value);
    });
    link.href = checkoutUrl.toString();
  });
}

let pixelRequested = false;

function loadMetaPixel() {
  const pixelId = document.body.dataset.metaPixelId;
  if (!pixelId || pixelRequested || window.fbq) return;

  pixelRequested = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = '/assets/meta-pixel.js?v=20260827-2';
  document.head.appendChild(script);
}

const incomingAttribution = isCourseSalesPage ? readIncomingAttribution() : {};
let marketingConsent = getCookie(CONSENT_COOKIE);
let activeAttribution = hasAttribution(incomingAttribution)
  ? incomingAttribution
  : marketingConsent === 'granted'
    ? readStoredAttribution()
    : {};

if (isCourseSalesPage) {
  updateCheckoutLinks(activeAttribution);

  if (marketingConsent === 'granted') {
    if (hasAttribution(incomingAttribution)) storeAttribution(incomingAttribution);
    loadMetaPixel();
  } else if (marketingConsent === 'denied') {
    clearStoredAttribution();
  }
}

function updateConsentStatus(value) {
  document.querySelectorAll('[data-consent-status]').forEach((status) => {
    status.textContent = value === 'granted'
      ? 'Cookies de marketing permitidos neste navegador.'
      : value === 'denied'
        ? 'Cookies de marketing recusados neste navegador.'
        : 'Nenhuma preferência de marketing foi registrada neste navegador.';
  });
}

function applyMarketingConsent(value) {
  marketingConsent = value;
  setConsentCookie(value);

  if (value === 'granted') {
    if (hasAttribution(incomingAttribution)) {
      activeAttribution = incomingAttribution;
      storeAttribution(incomingAttribution);
    } else {
      activeAttribution = readStoredAttribution();
    }

    updateCheckoutLinks(activeAttribution);
    if (isCourseSalesPage) loadMetaPixel();
  } else {
    clearStoredAttribution();
  }

  document.querySelector('[data-consent-banner]')?.remove();
  updateConsentStatus(value);
}

function bindConsentControls(scope = document) {
  scope.querySelectorAll('[data-marketing-consent]').forEach((button) => {
    button.addEventListener('click', () => applyMarketingConsent(button.dataset.marketingConsent));
  });
}

function showConsentBanner() {
  if (!isCourseSalesPage || marketingConsent === 'granted' || marketingConsent === 'denied') return;

  const banner = document.createElement('aside');
  banner.className = 'consent-banner';
  banner.dataset.consentBanner = '';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Preferências de privacidade');
  banner.innerHTML = `
    <div class="consent-banner-copy">
      <strong>Privacidade e medição</strong>
      <p>Com sua permissão, usamos o Pixel da Meta para medir visitas das campanhas. Você pode aceitar ou recusar sem impedir o acesso ao site. <a href="/privacidade/">Saiba mais</a>.</p>
    </div>
    <div class="consent-banner-actions">
      <button type="button" class="btn secondary" data-marketing-consent="denied">Recusar</button>
      <button type="button" class="btn" data-marketing-consent="granted">Aceitar marketing</button>
    </div>`;
  document.body.appendChild(banner);
  bindConsentControls(banner);
}

bindConsentControls();
updateConsentStatus(marketingConsent);
showConsentBanner();
