import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/content-store";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

// Plain-language starting point — have it reviewed for your jurisdiction before relying on it.
const UPDATED: Record<Locale, string> = { en: "15 October 2026", ar: "15 تشرين الأول 2026" };

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).meta.privacy, alternates: alternates(lang, "/privacy") };
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const s = await getSettings();
  const mail = <a href={`mailto:${s.email}`} dir="ltr">{s.email}</a>;

  if (lang === "ar") {
    return (
      <main>
        <section className="wrap page-head">
          <p className="label">قانوني</p>
          <h1 className="heading-lg">سياسة الخصوصية</h1>
          <p className="caption">آخر تحديث: {UPDATED.ar}</p>
        </section>
        <article className="wrap prose">
          <p>توضّح هذه السياسة المعلومات التي تجمعها NexoraIT («نحن») عبر هذا الموقع، وكيف نستخدمها، والخيارات المتاحة لك.</p>
          <h2>المعلومات التي نجمعها</h2>
          <p>عند استخدام نموذج التواصل نجمع البيانات التي تختار مشاركتها: الاسم والبريد الإلكتروني واسم الشركة والخدمة التي تهمّك ورسالتك. ونحتفظ أيضًا بإحصاءات زيارات مجهولة الهوية (الصفحات التي تمت زيارتها ولغتها) دون ملفات تعريف الارتباط ودون حفظ عناوين IP.</p>
          <p>لا نستخدم ملفات تعريف ارتباط إعلانية أو تحليلية على هذا الموقع.</p>
          <h2>كيف نستخدمها</h2>
          <ul>
            <li>للرد على استفسارك ومناقشة مشروعك.</li>
            <li>لإعداد العروض، وفي حال أصبحت عميلًا، لتقديم خدماتنا.</li>
            <li>لحماية الموقع من الرسائل المزعجة وإساءة الاستخدام.</li>
          </ul>
          <p>لا نبيع معلوماتك أبدًا ولا نشاركها لأغراض تسويقية لشركات أخرى.</p>
          <h2>مع من نشاركها</h2>
          <p>فقط مع مزوّدي الخدمات الذين يساعدوننا في تشغيل الموقع والبريد الإلكتروني (مثل مزوّد الاستضافة والبريد)، مع التزامهم بحمايتها واستخدامها نيابة عنا فقط — أو عندما يفرض القانون ذلك.</p>
          <h2>مدة الاحتفاظ</h2>
          <p>نحتفظ بالاستفسارات طوال المدة اللازمة للرد والمتابعة، ولمدة تصل إلى سنتين بعد ذلك، ما لم تصبح عميلًا أو تطلب حذفها قبل ذلك.</p>
          <h2>حقوقك</h2>
          <p>يمكنك في أي وقت أن تطلب الاطلاع على معلوماتك لدينا أو تصحيحها أو حذفها. راسلنا على {mail} وسنرد عليك سريعًا.</p>
          <h2>التغييرات</h2>
          <p>إذا غيّرنا هذه السياسة فسنحدّث التاريخ في أعلى هذه الصفحة.</p>
          <h2>التواصل</h2>
          <p>NexoraIT، {s.location.ar} · {mail}</p>
        </article>
      </main>
    );
  }

  return (
    <main>
      <section className="wrap page-head">
        <p className="label">Legal</p>
        <h1 className="heading-lg">Privacy policy</h1>
        <p className="caption">Last updated {UPDATED.en}</p>
      </section>
      <article className="wrap prose">
        <p>This policy explains what information NexoraIT (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects through this website, how we use it and the choices you have.</p>
        <h2>Information we collect</h2>
        <p>
          When you use our contact form we collect the details you choose to give us: your name, email address,
          company name, the service you&apos;re interested in and your message. We also keep anonymous visit statistics
          (which pages were viewed and in which language) without cookies and without storing IP addresses.
        </p>
        <p>We do not use advertising or analytics cookies on this website.</p>
        <h2>How we use it</h2>
        <ul>
          <li>To reply to your enquiry and discuss your project.</li>
          <li>To prepare proposals and, if you become a client, to deliver our services.</li>
          <li>To protect this website against spam and misuse.</li>
        </ul>
        <p>We never sell your information or share it for other companies&apos; marketing.</p>
        <h2>Who we share it with</h2>
        <p>
          Only service providers that help us run this website and our email (for example our hosting and
          email providers), under obligations to keep it secure and use it only on our behalf — or where the
          law requires us to.
        </p>
        <h2>How long we keep it</h2>
        <p>
          Enquiries are kept for as long as needed to respond and follow up, and for up to two years afterwards
          unless you become a client or ask us to delete them sooner.
        </p>
        <h2>Your rights</h2>
        <p>You can ask us at any time to see, correct or delete the information we hold about you. Email {mail} and we&apos;ll respond promptly.</p>
        <h2>Changes</h2>
        <p>If we change this policy we&apos;ll update the date at the top of this page.</p>
        <h2>Contact</h2>
        <p>NexoraIT, {s.location.en} · {mail}</p>
      </article>
    </main>
  );
}
