const translations = {
  sv: {
    // Navigation
    "nav.home": "Hem",
    "nav.about": "Om oss",
    "nav.services": "Tjänster",
    "nav.gallery": "Galleri",
    "nav.faq": "FAQ",
    "nav.contact": "Kontakt",
    "nav.blog": "Blogg",
    "nav.chat": "Chatt",
    "nav.contactUs": "Kontakta oss",
    "nav.menu": "Meny",

    // Section labels
    "section.about": "Om oss",
    "section.features": "Fördelar",
    "section.services": "Vad vi erbjuder",
    "section.process": "Process",
    "section.testimonials": "Recensioner",
    "section.team": "Vårt team",
    "section.gallery": "Galleri",
    "section.faq": "FAQ",
    "section.contact": "Kontakt",

    // Hero
    "hero.badge": "Professionellt & pålitligt",
    "hero.readMore": "Läs mer om oss",

    // About
    "about.readMore": "Läs mer om oss",

    // Services
    "services.viewAll": "Se alla tjänster",
    "services.empty": "Inga tjänster att visa just nu.",

    // Gallery
    "gallery.empty": "Inga bilder att visa just nu.",

    // FAQ
    "faq.empty": "Inga vanliga frågor att visa just nu.",

    // Contact
    "contact.email": "E-post",
    "contact.phone": "Telefon",
    "contact.address": "Adress",
    "contact.contactUs": "Kontakta oss",
    "contact.form.name": "Ditt namn",
    "contact.form.email": "Din e-post",
    "contact.form.message": "Meddelande",
    "contact.form.send": "Skicka meddelande",
    "contact.form.sending": "Skickar...",
    "contact.form.success": "Tack! Ditt meddelande har skickats.",
    "contact.form.error": "Något gick fel. Försök igen eller kontakta oss direkt.",
    "contact.form.title": "Skicka ett meddelande",

    // Footer
    "footer.pages": "Sidor",
    "footer.contact": "Kontakt",
    "footer.social": "Sociala medier",
    "footer.rights": "Alla rättigheter förbehållna.",

    // Bookings
    "nav.bookings": "Boka",
    "booking.title": "Boka tid",
    "booking.selectService": "Välj tjänst",
    "booking.yourDetails": "Dina uppgifter",
    "booking.name": "Namn",
    "booking.email": "E-post",
    "booking.phone": "Telefon",
    "booking.date": "Datum",
    "booking.paymentMethod": "Betalningsmetod",
    "booking.payOnSite": "Betala på plats",
    "booking.payWithCard": "Kortbetalning",
    "booking.klarna": "Klarna",
    "booking.swish": "Swish",
    "booking.submit": "Boka nu",
    "booking.success": "Bokningen är mottagen!",
    "booking.successMessage": "Du kommer att få en bekräftelse via e-post.",
    "booking.error": "Något gick fel. Försök igen.",
    "booking.required": "Obligatoriskt",
    "booking.duration": "min",
    "booking.price": "Pris",
    "booking.free": "Gratis",
    "booking.backToHome": "Tillbaka",

    // Editor
    "editor.edit": "Redigera",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.about": "About",
    "nav.services": "Services",
    "nav.gallery": "Gallery",
    "nav.faq": "FAQ",
    "nav.contact": "Contact",
    "nav.blog": "Blog",
    "nav.chat": "Chat",
    "nav.contactUs": "Contact us",
    "nav.menu": "Menu",

    // Section labels
    "section.about": "About us",
    "section.features": "Benefits",
    "section.services": "What we offer",
    "section.process": "Process",
    "section.testimonials": "Reviews",
    "section.team": "Our team",
    "section.gallery": "Gallery",
    "section.faq": "FAQ",
    "section.contact": "Contact",

    // Hero
    "hero.badge": "Professional & reliable",
    "hero.readMore": "Read more about us",

    // About
    "about.readMore": "Read more about us",

    // Services
    "services.viewAll": "View all services",
    "services.empty": "No services to display at this time.",

    // Gallery
    "gallery.empty": "No images to display at this time.",

    // FAQ
    "faq.empty": "No frequently asked questions to display at this time.",

    // Contact
    "contact.email": "Email",
    "contact.phone": "Phone",
    "contact.address": "Address",
    "contact.contactUs": "Contact us",
    "contact.form.name": "Your name",
    "contact.form.email": "Your email",
    "contact.form.message": "Message",
    "contact.form.send": "Send message",
    "contact.form.sending": "Sending...",
    "contact.form.success": "Thank you! Your message has been sent.",
    "contact.form.error": "Something went wrong. Please try again or contact us directly.",
    "contact.form.title": "Send a message",

    // Footer
    "footer.pages": "Pages",
    "footer.contact": "Contact",
    "footer.social": "Social media",
    "footer.rights": "All rights reserved.",

    // Bookings
    "nav.bookings": "Book",
    "booking.title": "Book an appointment",
    "booking.selectService": "Select a service",
    "booking.yourDetails": "Your details",
    "booking.name": "Name",
    "booking.email": "Email",
    "booking.phone": "Phone",
    "booking.date": "Date",
    "booking.paymentMethod": "Payment method",
    "booking.payOnSite": "Pay on site",
    "booking.payWithCard": "Pay with card",
    "booking.klarna": "Klarna",
    "booking.swish": "Swish",
    "booking.submit": "Book now",
    "booking.success": "Booking received!",
    "booking.successMessage": "You will receive a confirmation by email.",
    "booking.error": "Something went wrong. Please try again.",
    "booking.required": "Required",
    "booking.duration": "min",
    "booking.price": "Price",
    "booking.free": "Free",
    "booking.backToHome": "Back",

    // Editor
    "editor.edit": "Edit",
  },
} as const;

type TranslationKey = keyof (typeof translations)["sv"];

export function t(key: TranslationKey, lang?: string): string {
  const locale = lang === "en" ? "en" : "sv";
  return translations[locale][key] || translations.sv[key] || key;
}
