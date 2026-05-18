import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://iboren.se"),
  title: "Iboren – Smart städbokning med AI i Sverige",
  description: "Boka hemstädning, flyttstädning och kontorsstädning med Iboren. CleanAI hjälper dig skapa en tydlig bokningsförfrågan steg för steg.",
  applicationName: "Iboren",
  keywords: ["Iboren", "städbokning", "hemstädning", "flyttstädning", "kontorsstädning", "CleanAI"],
  openGraph: {
    title: "Iboren – Smart städbokning med AI",
    description: "En lyxig, enkel och AI-assisterad bokningsupplevelse för städtjänster i Sverige.",
    url: "https://iboren.se",
    siteName: "Iboren",
    locale: "sv_SE",
    type: "website",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Iboren" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Iboren – Smart städbokning med AI",
    description: "Boka städning smartare med CleanAI by Iboren.",
    images: ["/og.svg"]
  },
  alternates: { canonical: "https://iboren.se" },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F5F0E8"
};

const brandHeaderPatch = `
(function () {
  function applyBrandHeader() {
    var headerLink = document.querySelector('header a[href="#top"]');
    if (!headerLink || headerLink.getAttribute('data-brand-ready') === '1') return;
    var mark = headerLink.querySelector('span.grid');
    if (!mark) return;
    mark.innerHTML = '<img src="/favicon.svg" alt="IB" class="h-9 w-9 rounded-full" />';
    mark.className = 'grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-[#49D8EA]/35 bg-[#06131A] shadow-lg';
    headerLink.setAttribute('data-brand-ready', '1');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyBrandHeader);
  else applyBrandHeader();

  var observer = new MutationObserver(applyBrandHeader);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
`;

const cinematicImagePatch = `
(function () {
  var cinematicImages = [
    "/cinematic/01-home-before.webp",
    "/cinematic/02-home-cleaner.webp",
    "/cinematic/03-home-after.webp",
    "/cinematic/04-office-before.webp",
    "/cinematic/05-office-cleaner.webp",
    "/cinematic/06-office-after.webp"
  ];

  function applyCinematicImages() {
    var heroImage = document.querySelector('#top img');
    if (heroImage) heroImage.setAttribute('src', '/cinematic/03-home-after.webp');

    var images = document.querySelectorAll('#cinematic-scroll img');
    images.forEach(function (image, index) {
      if (cinematicImages[index]) image.setAttribute('src', cinematicImages[index]);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyCinematicImages);
  } else {
    applyCinematicImages();
  }

  var observer = new MutationObserver(applyCinematicImages);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
`;

const bookingAuthPatch = `
(function () {
  function getAccessToken() {
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i) || '';
      if (!key.includes('auth-token')) continue;
      try {
        var data = JSON.parse(localStorage.getItem(key) || '{}');
        var token = data && data.access_token;
        if (token) return token;
      } catch (e) {}
    }
    return '';
  }

  var originalFetch = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();

    if (url.includes('/api/bookings') && method === 'POST') {
      var token = getAccessToken();
      var headers = new Headers((init && init.headers) || (input && input.headers) || {});
      if (token && !headers.has('Authorization')) headers.set('Authorization', 'Bearer ' + token);
      init = Object.assign({}, init || {}, { headers: headers });
    }

    return originalFetch(input, init);
  };
})();
`;

const bookingLoginGuardPatch = `
(function () {
  function isLoggedIn() {
    var header = document.querySelector('header');
    var profileLinks = header ? Array.from(header.querySelectorAll('a[href="/profile"]')) : [];
    var hasHeaderProfileLink = profileLinks.some(function (link) {
      return /Min profil/i.test(link.textContent || '');
    });
    var top = document.querySelector('#top');
    var hasLoggedInText = top ? /Inloggad som/i.test(top.textContent || '') : false;
    return hasHeaderProfileLink || hasLoggedInText;
  }

  function buildLoginCard() {
    var card = document.createElement('div');
    card.id = 'iboren-login-required';
    card.className = 'rounded-[2rem] border border-gold/20 bg-cream p-7 text-ink shadow-2xl md:p-9';
    card.innerHTML = '' +
      '<p class="text-xs font-black uppercase tracking-[.28em] text-burgundy/60">Logga in krävs</p>' +
      '<h3 class="display mt-3 text-4xl font-bold leading-none text-burgundy">Logga in för att boka.</h3>' +
      '<p class="mt-5 leading-8 text-ink/68">För att undvika felaktiga bokningar behöver du logga in med Google, Microsoft eller LinkedIn innan du fyller i bokningsformuläret.</p>' +
      '<div class="mt-6 flex flex-col gap-3 sm:flex-row">' +
      '<a href="/login" class="inline-flex items-center justify-center rounded-full bg-burgundy px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-porcelain">Logga in / Skapa konto</a>' +
      '<a href="/privacy" class="inline-flex items-center justify-center rounded-full border border-burgundy/15 bg-porcelain px-5 py-3 text-sm font-bold text-burgundy">Privacy</a>' +
      '</div>';
    return card;
  }

  function applyBookingLoginGuard() {
    var section = document.querySelector('#booking');
    if (!section) return;
    var form = section.querySelector('form');
    var aside = section.querySelector('aside');
    if (!form) return;

    if (!form.getAttribute('data-login-guarded')) {
      form.setAttribute('data-login-guarded', '1');
      form.addEventListener('submit', function (event) {
        if (!isLoggedIn()) {
          event.preventDefault();
          window.location.href = '/login';
        }
      }, true);
    }

    var existingCard = section.querySelector('#iboren-login-required');

    if (isLoggedIn()) {
      form.style.display = '';
      if (aside) aside.style.display = '';
      if (existingCard) existingCard.remove();
      return;
    }

    form.style.display = 'none';
    if (aside) aside.style.display = 'none';

    if (!existingCard) {
      var parent = form.parentElement || section;
      parent.insertBefore(buildLoginCard(), form);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBookingLoginGuard);
  } else {
    applyBookingLoginGuard();
  }

  var observer = new MutationObserver(applyBookingLoginGuard);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: brandHeaderPatch }} />
        <script dangerouslySetInnerHTML={{ __html: cinematicImagePatch }} />
        <script dangerouslySetInnerHTML={{ __html: bookingAuthPatch }} />
        <script dangerouslySetInnerHTML={{ __html: bookingLoginGuardPatch }} />
      </body>
    </html>
  );
}
