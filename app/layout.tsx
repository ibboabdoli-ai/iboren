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

const bookingDetailsPatch = `
(function () {
  function findBookingForm() {
    var section = document.querySelector('#booking');
    return section ? section.querySelector('form') : null;
  }

  function fieldMarkup() {
    return '' +
      '<div id="iboren-extra-details" class="rounded-[1.5rem] border border-gold/15 bg-night/30 p-4">' +
      '<p class="mb-4 text-xs font-bold uppercase tracking-[.28em] text-gold">Objekt & detaljer</p>' +
      '<div class="grid gap-4 sm:grid-cols-2">' +
      '<label class="block"><span class="mb-2 block text-sm font-bold text-porcelain/80">Typ av objekt</span><select data-extra="Typ av objekt" class="w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink outline-none"><option>Lägenhet</option><option>Villa</option><option>Radhus</option><option>Kontor</option><option>Annat</option></select></label>' +
      '<label class="block"><span class="mb-2 block text-sm font-bold text-porcelain/80">Antal rum</span><input data-extra="Antal rum" class="w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink outline-none" placeholder="3" inputmode="numeric"></label>' +
      '<label class="block"><span class="mb-2 block text-sm font-bold text-porcelain/80">Antal badrum</span><input data-extra="Antal badrum" class="w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink outline-none" placeholder="1" inputmode="numeric"></label>' +
      '<label class="block"><span class="mb-2 block text-sm font-bold text-porcelain/80">Husdjur</span><select data-extra="Husdjur" class="w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink outline-none"><option>Nej</option><option>Ja</option><option>Vet ej</option></select></label>' +
      '<label class="block"><span class="mb-2 block text-sm font-bold text-porcelain/80">Våning</span><input data-extra="Våning" class="w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink outline-none" placeholder="3"></label>' +
      '<label class="block"><span class="mb-2 block text-sm font-bold text-porcelain/80">Hiss</span><select data-extra="Hiss" class="w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink outline-none"><option>Vet ej</option><option>Ja</option><option>Nej</option></select></label>' +
      '<label class="block"><span class="mb-2 block text-sm font-bold text-porcelain/80">Parkering</span><select data-extra="Parkering" class="w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink outline-none"><option>Vet ej</option><option>Ja</option><option>Nej</option></select></label>' +
      '</div>' +
      '<div class="mt-4"><p class="mb-2 block text-sm font-bold text-porcelain/80">Extra tjänster</p><div class="grid grid-cols-2 gap-2 sm:grid-cols-3">' +
      ['Fönsterputs','Ugn','Kyl/frys','Balkong','Grovstädning','Skåp/lådor'].map(function (item) { return '<label class="rounded-2xl border border-porcelain/10 bg-porcelain/6 px-3 py-3 text-sm font-bold text-porcelain/80"><input data-extra-check="Extra tjänster" value="' + item + '" type="checkbox" class="mr-2">' + item + '</label>'; }).join('') +
      '</div></div>' +
      '</div>';
  }

  function applyBookingDetails() {
    var form = findBookingForm();
    if (!form || form.querySelector('#iboren-extra-details')) return;
    var notes = form.querySelector('textarea');
    if (!notes) return;
    var wrapper = document.createElement('div');
    wrapper.innerHTML = fieldMarkup();
    notes.parentElement.insertBefore(wrapper.firstChild, notes);

    form.addEventListener('submit', function (event) {
      if (form.getAttribute('data-extra-prepared') === '1') return;
      event.preventDefault();
      form.setAttribute('data-extra-prepared', '1');

      var lines = ['--- Objekt & detaljer ---'];
      form.querySelectorAll('[data-extra]').forEach(function (input) {
        var label = input.getAttribute('data-extra');
        var value = input.value || '';
        if (value) lines.push(label + ': ' + value);
      });
      var checked = Array.from(form.querySelectorAll('[data-extra-check]:checked')).map(function (input) { return input.value; });
      lines.push('Extra tjänster: ' + (checked.length ? checked.join(', ') : 'Inga valda'));

      var current = notes.value || '';
      var next = lines.join('\n') + (current.trim() ? '\n\n--- Kundens önskemål ---\n' + current.trim() : '');
      notes.value = next;
      notes.dispatchEvent(new Event('input', { bubbles: true }));
      notes.dispatchEvent(new Event('change', { bubbles: true }));

      window.setTimeout(function () {
        if (form.requestSubmit) form.requestSubmit();
        else form.submit();
      }, 80);
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyBookingDetails);
  else applyBookingDetails();

  var observer = new MutationObserver(applyBookingDetails);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: cinematicImagePatch }} />
        <script dangerouslySetInnerHTML={{ __html: bookingDetailsPatch }} />
      </body>
    </html>
  );
}
