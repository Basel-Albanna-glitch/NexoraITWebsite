// Locales, URL helpers and the fixed interface strings (buttons, labels, form messages).
// Page copy that the owner edits lives in data/content.json instead — see lib/content.ts.

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const isLocale = (s: string): s is Locale => (LOCALES as readonly string[]).includes(s);
export const dirOf = (l: Locale) => (l === "ar" ? "rtl" : "ltr");

/** Public URL for a path in a locale. English has no prefix: href("ar", "/work") → "/ar/work". */
export function href(lang: Locale, path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (lang === DEFAULT_LOCALE) return p;
  return p === "/" ? `/${lang}` : `/${lang}${p}`;
}

/** Strips a locale prefix: "/ar/work" → "/work". */
export function stripLocale(pathname: string) {
  const m = pathname.match(/^\/(en|ar)(?=\/|$)/);
  return m ? pathname.slice(m[0].length) || "/" : pathname;
}

const en = {
  langName: "English",
  switchTo: "العربية",
  switchToShort: "ع",
  nav: { services: "Services", work: "Work", about: "About", contact: "Contact", menuOpen: "Open menu", menuClose: "Close menu", home: "NexoraIT home" },
  cta: { book: "Book a consultation", start: "Start a project", seeWork: "See our work", explore: "Explore services", allProjects: "All projects", learnMore: "Learn more", moreAbout: "More about us", relatedWork: "See related work", freeConsult: "Get a free consultation", backHome: "Back to home" },
  service: {
    breadcrumb: "Services", included: "What's included", endToEnd: "end to end.", audience: "Who it's for",
    deliver: "How we deliver", deliverTitle: "Four steps, no surprises.", related: "Related work",
    relatedTitle: "Built by us.", relatedDim: "Running today.", faq: "Questions, answered.", others: "Other services",
    ctaLabel: "Start your project", ctaText: "Tell us about your business — we'll reply within one business day with a clear plan and a quote.",
  },
  work: { label: "Our work", title: "Built by us.", titleDim: "Running today.", noImageAlt: "Animated constellation", client: "Client" },
  footer: { services: "Services", company: "Company", touch: "Get in touch", ourWork: "Our work", about: "About", contact: "Contact", privacy: "Privacy policy", rights: "All rights reserved." },
  contact: { email: "Email", phone: "Phone", whatsapp: "WhatsApp", chat: "Chat with us", location: "Location", follow: "Follow us", hours: "Hours" },
  form: {
    name: "Name", email: "Work email", company: "Company", optional: "(optional)", need: "I need", choose: "Choose a service",
    message: "Tell us about your project", send: "Send message", sending: "Sending…",
    services: { "Website": "Website", "ERP system": "ERP system", "POS system": "POS system", "Mobile app": "Mobile app", "Something else": "Something else" },
    errors: { name: "Please tell us your name.", email: "Please enter a valid email.", service: "Please choose a service.", message: "Tell us a little more (at least 10 characters).", check: "Please check the highlighted fields.", network: "Network error — please try again.", server: "We couldn't send your message right now. Please try again shortly.", rate: "Too many messages — please try again later." },
    sent: "Thanks — we'll get back to you within one business day.",
  },
  notFound: { title: "Lost in the void.", body: "The page you're looking for doesn't exist or has moved." },
  theme: "Switch between light and dark mode",
  social: (name: string) => `NexoraIT on ${name}`,
  meta: { siteTitle: "NexoraIT — Websites, ERP, POS & Mobile Apps", description: "NexoraIT builds websites, ERP systems, POS solutions and mobile apps designed around how your business actually works.", services: "Services", work: "Our work", about: "About", contact: "Contact", privacy: "Privacy policy" },
};

export type Dictionary = typeof en;

const ar: Dictionary = {
  langName: "العربية",
  switchTo: "English",
  switchToShort: "EN",
  nav: { services: "خدماتنا", work: "أعمالنا", about: "من نحن", contact: "تواصل معنا", menuOpen: "فتح القائمة", menuClose: "إغلاق القائمة", home: "الصفحة الرئيسية لـ NexoraIT" },
  cta: { book: "احجز استشارة", start: "ابدأ مشروعك", seeWork: "شاهد أعمالنا", explore: "تصفّح الخدمات", allProjects: "كل المشاريع", learnMore: "اعرف المزيد", moreAbout: "المزيد عنّا", relatedWork: "أعمال ذات صلة", freeConsult: "احصل على استشارة مجانية", backHome: "العودة للرئيسية" },
  service: {
    breadcrumb: "خدماتنا", included: "ماذا يشمل", endToEnd: "من البداية إلى النهاية.", audience: "لمن هذه الخدمة",
    deliver: "كيف ننفّذ", deliverTitle: "أربع خطوات، دون مفاجآت.", related: "أعمال ذات صلة",
    relatedTitle: "صنعناها بأيدينا.", relatedDim: "وتعمل اليوم.", faq: "أسئلة وأجوبة.", others: "خدمات أخرى",
    ctaLabel: "ابدأ مشروعك", ctaText: "أخبرنا عن أعمالك — وسنرد خلال يوم عمل واحد بخطة واضحة وعرض سعر.",
  },
  work: { label: "أعمالنا", title: "صنعناها بأيدينا.", titleDim: "وتعمل اليوم.", noImageAlt: "تشكيل متحرك", client: "العميل" },
  footer: { services: "الخدمات", company: "الشركة", touch: "تواصل معنا", ourWork: "أعمالنا", about: "من نحن", contact: "تواصل معنا", privacy: "سياسة الخصوصية", rights: "جميع الحقوق محفوظة." },
  contact: { email: "البريد الإلكتروني", phone: "الهاتف", whatsapp: "واتساب", chat: "راسلنا", location: "الموقع", follow: "تابعنا", hours: "ساعات العمل" },
  form: {
    name: "الاسم", email: "البريد الإلكتروني", company: "الشركة", optional: "(اختياري)", need: "أحتاج إلى", choose: "اختر خدمة",
    message: "أخبرنا عن مشروعك", send: "أرسل الرسالة", sending: "جارٍ الإرسال…",
    services: { "Website": "موقع إلكتروني", "ERP system": "نظام ERP", "POS system": "نظام نقاط بيع", "Mobile app": "تطبيق جوال", "Something else": "شيء آخر" },
    errors: { name: "يرجى كتابة اسمك.", email: "يرجى إدخال بريد إلكتروني صحيح.", service: "يرجى اختيار خدمة.", message: "أخبرنا أكثر قليلًا (10 أحرف على الأقل).", check: "يرجى مراجعة الحقول المحددة.", network: "خطأ في الاتصال — يرجى المحاولة مرة أخرى.", server: "تعذّر إرسال رسالتك الآن. يرجى المحاولة بعد قليل.", rate: "رسائل كثيرة — يرجى المحاولة لاحقًا." },
    sent: "شكرًا لك — سنرد عليك خلال يوم عمل واحد.",
  },
  notFound: { title: "ضائع في الفراغ.", body: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها." },
  theme: "التبديل بين الوضع الفاتح والداكن",
  social: (name: string) => `NexoraIT على ${name}`,
  meta: { siteTitle: "NexoraIT — مواقع وأنظمة ERP ونقاط بيع وتطبيقات جوال", description: "تبني NexoraIT المواقع الإلكترونية وأنظمة ERP وأنظمة نقاط البيع وتطبيقات الجوال، مصمَّمة حول طريقة عمل شركتك فعلًا.", services: "خدماتنا", work: "أعمالنا", about: "من نحن", contact: "تواصل معنا", privacy: "سياسة الخصوصية" },
};

const DICTS: Record<Locale, Dictionary> = { en, ar };
export const getDictionary = (lang: Locale) => DICTS[lang];
