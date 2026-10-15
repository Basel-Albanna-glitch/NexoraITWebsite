// Dashboard interface text in English and Arabic. The language is kept in the nx_admin_lang cookie.
import type { Locale } from "./i18n";

export const ADMIN_LANG_COOKIE = "nx_admin_lang";

const en = {
  dashboard: "Dashboard",
  nav: { overview: "Overview", messages: "Messages", projects: "Projects", content: "Website text", settings: "Settings", viewSite: "View site", signOut: "Sign out", menu: "Menu" },
  common: { save: "Save changes", saving: "Saving…", saved: "Saved — the website is updated.", cancel: "Cancel", delete: "Delete", edit: "Edit", back: "Back", english: "English", arabic: "Arabic", error: "Couldn't save. Try again.", signedOut: "You were signed out — sign in again in a new tab, then save.", optional: "optional", onePerLine: "one per line", addRow: "+ Add", remove: "Remove", moveUp: "Move up", moveDown: "Move down" },
  login: { title: "Dashboard", password: "Password", signIn: "Sign in", signingIn: "Signing in…", wrong: "Wrong password.", tooMany: "Too many attempts. Try again in 15 minutes.", noConn: "Couldn't sign in — check your connection.", locked: "The dashboard is locked until a password is set. Add ADMIN_PASSWORD=your-password to the .env.local file in the website folder, then restart the site." },
  overview: {
    title: "Overview", range: "Period", last7: "Last 7 days", last30: "Last 30 days", last90: "Last 90 days",
    visitors: "Visitors", views: "Page views", newMessages: "New messages", liveProjects: "Projects on the site",
    vsPrev: "vs previous period", perDay: "Page views per day", topPages: "Most viewed pages", languages: "Language",
    referrers: "Where visitors came from", direct: "Direct / unknown", byService: "Messages by service",
    recent: "Latest messages", noData: "No visits recorded in this period yet.", noMessages: "No messages yet.",
    showTable: "Show as table", hideTable: "Hide table", date: "Date", page: "Page", count: "Count",
    privacy: "Anonymous stats: no cookies, no IP addresses stored. Your own visits while signed in aren't counted.",
    allMessages: "All messages",
  },
  messages: {
    title: "Messages", all: "All", new: "New", read: "Read", done: "Done", empty: "No messages here.",
    markRead: "Mark as read", markDone: "Mark as done", markNew: "Mark as new", reply: "Reply by email", delete: "Delete",
    confirmDelete: "Delete this message? This can't be undone.", service: "Service", company: "Company", received: "Received",
    language: "Sent from", emailed: "Emailed to you", notEmailed: "Not emailed (email isn't set up) — it's only here.",
    select: "Select a message to read it.", search: "Search name, email or text",
  },
  projects: {
    title: "Projects", count: (n: number) => `${n} project${n === 1 ? "" : "s"} · The order here is the order on the website.`,
    add: "+ Add project", addFirst: "Add your first project", empty: "No projects yet.", live: "Live", hidden: "Hidden",
    hide: "Hide", publish: "Publish", view: "View", videos: (n: number) => `${n} video${n > 1 ? "s" : ""}`, noImage: "No image",
    confirmDelete: (name: string) => `Delete “${name}”? Its uploaded pictures and videos will be deleted too. This can't be undone.`,
    orderError: "Couldn't save the new order. Try again.", updateError: "Couldn't update the project. Open it and check for missing fields.", deleteError: "Couldn't delete the project. Try again.",
    newTitle: "New project", allProjects: "All projects",
  },
  form: {
    basics: "Basics", name: "Project name", kind: "Type of project", client: "Client", headline: "Headline", summary: "Description",
    points: "Key features", namePh: "e.g. Al Aseel Center", kindPh: "e.g. Clinic management system", clientPh: "e.g. Al Aseel Center — Spine & Sports Physical Therapy, Amman",
    headlinePh: "e.g. From paper files to one smart system.", summaryPh: "What was the problem, and what did you build?", pointsPh: "Patient records\nAppointments calendar\nArabic & English",
    arabic: "Arabic version", arabicHint: "Shown on the Arabic site. Leave a field empty to use the English text.",
    services: "Services", servicesHint: "The project also appears on these service pages.",
    picture: "Main picture", pictureHint: "A poster or screenshot. Portrait (4:5) looks best. JPG, PNG or WebP.",
    alt: "Picture description", altHint: "for screen readers & Google", replace: "Replace", choosePicture: "Choose a picture", noPicture: "No picture? The project shows an animated shape instead.",
    videos: "Videos", videosHint: "Reels or demos (MP4 recommended, up to 300 MB each). A preview frame is created automatically.",
    addVideos: "Add videos", severalAtOnce: "You can pick several at once.", videoTitle: "Video title", videoTitleAr: "Arabic title",
    uploading: "Uploading", waitUploads: "Wait for uploads to finish.", fix: "Some fields need attention.",
    show: "Show on website", addProject: "Add project",
    errors: { name: "Give the project a name.", kind: "Say what kind of project it is.", headline: "Add a one-line headline.", summary: "Write at least a sentence or two about the project.", services: "Pick at least one service.", image: "The image upload is invalid — upload it again.", videos: "A video upload is invalid — remove it and upload again." },
  },
  content: {
    title: "Website text", intro: "Edit the words on every page, in English and Arabic. Changes go live as soon as you save.",
    pages: "Pages", services: "Services", editing: "Editing", unsaved: "You have unsaved changes.",
  },
  settings: {
    title: "Settings", contact: "Contact details", email: "Email", phone: "Phone", phoneHint: "international format, e.g. +962 7 9000 0000 — leave empty to hide",
    whatsapp: "WhatsApp number", whatsappHint: "digits only with country code, e.g. 962790000000 — leave empty to hide",
    location: "Location", hours: "Opening hours", social: "Social media", socialHint: "Full profile links starting with https:// — leave empty to hide the icon.",
    invalidEmail: "Enter a valid email address.",
  },
};

export type AdminDict = typeof en;

const ar: AdminDict = {
  dashboard: "لوحة التحكم",
  nav: { overview: "نظرة عامة", messages: "الرسائل", projects: "المشاريع", content: "نصوص الموقع", settings: "الإعدادات", viewSite: "عرض الموقع", signOut: "تسجيل الخروج", menu: "القائمة" },
  common: { save: "حفظ التغييرات", saving: "جارٍ الحفظ…", saved: "تم الحفظ — تم تحديث الموقع.", cancel: "إلغاء", delete: "حذف", edit: "تعديل", back: "رجوع", english: "الإنجليزية", arabic: "العربية", error: "تعذّر الحفظ. حاول مرة أخرى.", signedOut: "تم تسجيل خروجك — سجّل الدخول من جديد في تبويب آخر ثم احفظ.", optional: "اختياري", onePerLine: "واحد في كل سطر", addRow: "+ إضافة", remove: "إزالة", moveUp: "للأعلى", moveDown: "للأسفل" },
  login: { title: "لوحة التحكم", password: "كلمة المرور", signIn: "تسجيل الدخول", signingIn: "جارٍ الدخول…", wrong: "كلمة المرور غير صحيحة.", tooMany: "محاولات كثيرة. حاول بعد 15 دقيقة.", noConn: "تعذّر تسجيل الدخول — تحقق من الاتصال.", locked: "لوحة التحكم مقفلة حتى تُضبط كلمة مرور. أضف ADMIN_PASSWORD=كلمة-المرور إلى ملف ‎.env.local‎ في مجلد الموقع، ثم أعد تشغيل الموقع." },
  overview: {
    title: "نظرة عامة", range: "الفترة", last7: "آخر 7 أيام", last30: "آخر 30 يومًا", last90: "آخر 90 يومًا",
    visitors: "الزوار", views: "مشاهدات الصفحات", newMessages: "رسائل جديدة", liveProjects: "مشاريع على الموقع",
    vsPrev: "مقارنة بالفترة السابقة", perDay: "مشاهدات الصفحات يوميًا", topPages: "الصفحات الأكثر مشاهدة", languages: "اللغة",
    referrers: "من أين جاء الزوار", direct: "مباشر / غير معروف", byService: "الرسائل حسب الخدمة",
    recent: "أحدث الرسائل", noData: "لا توجد زيارات مسجّلة في هذه الفترة بعد.", noMessages: "لا توجد رسائل بعد.",
    showTable: "عرض كجدول", hideTable: "إخفاء الجدول", date: "التاريخ", page: "الصفحة", count: "العدد",
    privacy: "إحصاءات مجهولة الهوية: بلا ملفات تعريف ارتباط ودون حفظ عناوين IP. زياراتك أثناء تسجيل الدخول لا تُحتسب.",
    allMessages: "كل الرسائل",
  },
  messages: {
    title: "الرسائل", all: "الكل", new: "جديدة", read: "مقروءة", done: "منجزة", empty: "لا توجد رسائل هنا.",
    markRead: "تعليم كمقروءة", markDone: "تعليم كمنجزة", markNew: "تعليم كجديدة", reply: "الرد بالبريد", delete: "حذف",
    confirmDelete: "حذف هذه الرسالة؟ لا يمكن التراجع عن ذلك.", service: "الخدمة", company: "الشركة", received: "تاريخ الاستلام",
    language: "أُرسلت من", emailed: "أُرسلت إلى بريدك", notEmailed: "لم تُرسل بالبريد (البريد غير مُعدّ) — موجودة هنا فقط.",
    select: "اختر رسالة لقراءتها.", search: "ابحث بالاسم أو البريد أو النص",
  },
  projects: {
    title: "المشاريع", count: (n: number) => `${n} ${n === 1 ? "مشروع" : n === 2 ? "مشروعان" : n <= 10 ? "مشاريع" : "مشروعًا"} · الترتيب هنا هو ترتيبها على الموقع.`,
    add: "+ إضافة مشروع", addFirst: "أضف مشروعك الأول", empty: "لا توجد مشاريع بعد.", live: "منشور", hidden: "مخفي",
    hide: "إخفاء", publish: "نشر", view: "عرض", videos: (n: number) => `${n} ${n === 1 ? "فيديو" : "فيديوهات"}`, noImage: "بلا صورة",
    confirmDelete: (name: string) => `حذف «${name}»؟ سيتم حذف صوره وفيديوهاته المرفوعة أيضًا. لا يمكن التراجع عن ذلك.`,
    orderError: "تعذّر حفظ الترتيب الجديد. حاول مرة أخرى.", updateError: "تعذّر تحديث المشروع. افتحه وتحقق من الحقول الناقصة.", deleteError: "تعذّر حذف المشروع. حاول مرة أخرى.",
    newTitle: "مشروع جديد", allProjects: "كل المشاريع",
  },
  form: {
    basics: "الأساسيات", name: "اسم المشروع", kind: "نوع المشروع", client: "العميل", headline: "العنوان", summary: "الوصف",
    points: "أبرز الميزات", namePh: "مثال: Al Aseel Center", kindPh: "مثال: Clinic management system", clientPh: "مثال: Al Aseel Center — Amman",
    headlinePh: "مثال: From paper files to one smart system.", summaryPh: "ما المشكلة، وماذا بنيتم؟", pointsPh: "Patient records\nAppointments calendar",
    arabic: "النسخة العربية", arabicHint: "تظهر على الموقع العربي. اترك الحقل فارغًا لاستخدام النص الإنجليزي.",
    services: "الخدمات", servicesHint: "يظهر المشروع أيضًا في صفحات هذه الخدمات.",
    picture: "الصورة الرئيسية", pictureHint: "ملصق أو لقطة شاشة. الاتجاه العمودي (4:5) هو الأفضل. JPG أو PNG أو WebP.",
    alt: "وصف الصورة", altHint: "لقارئات الشاشة وGoogle", replace: "استبدال", choosePicture: "اختر صورة", noPicture: "بلا صورة؟ سيظهر شكل متحرك بدلًا منها.",
    videos: "الفيديوهات", videosHint: "ريلز أو عروض (يُفضّل MP4، حتى 300 ميغابايت لكل فيديو). تُنشأ صورة المعاينة تلقائيًا.",
    addVideos: "أضف فيديوهات", severalAtOnce: "يمكنك اختيار أكثر من فيديو.", videoTitle: "عنوان الفيديو", videoTitleAr: "العنوان بالعربية",
    uploading: "جارٍ رفع", waitUploads: "انتظر حتى يكتمل الرفع.", fix: "بعض الحقول تحتاج إلى مراجعة.",
    show: "إظهار على الموقع", addProject: "إضافة المشروع",
    errors: { name: "أدخل اسم المشروع.", kind: "حدّد نوع المشروع.", headline: "أضف عنوانًا من سطر واحد.", summary: "اكتب جملة أو جملتين على الأقل عن المشروع.", services: "اختر خدمة واحدة على الأقل.", image: "رفع الصورة غير صالح — ارفعها مرة أخرى.", videos: "رفع أحد الفيديوهات غير صالح — احذفه وارفعه مرة أخرى." },
  },
  content: {
    title: "نصوص الموقع", intro: "عدّل الكلمات في كل صفحة بالعربية والإنجليزية. تظهر التغييرات فور الحفظ.",
    pages: "الصفحات", services: "الخدمات", editing: "تعديل", unsaved: "لديك تغييرات غير محفوظة.",
  },
  settings: {
    title: "الإعدادات", contact: "بيانات التواصل", email: "البريد الإلكتروني", phone: "الهاتف", phoneHint: "بالصيغة الدولية، مثل ‎+962 7 9000 0000‎ — اتركه فارغًا لإخفائه",
    whatsapp: "رقم واتساب", whatsappHint: "أرقام فقط مع رمز الدولة، مثل 962790000000 — اتركه فارغًا لإخفائه",
    location: "الموقع", hours: "ساعات العمل", social: "وسائل التواصل الاجتماعي", socialHint: "روابط كاملة تبدأ بـ https://‎ — اتركها فارغة لإخفاء الأيقونة.",
    invalidEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
  },
};

export const getAdminDict = (lang: Locale) => (lang === "ar" ? ar : en);
