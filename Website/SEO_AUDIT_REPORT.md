# 🔍 Comprehensive SEO Audit Report - Anaaj.ai Website

**Audit Date:** April 7, 2026  
**Website:** Anaaj.ai - AI Farming Assistant  
**Technology Stack:** React + Vite + TypeScript (SPA)

---

## 🚨 CRITICAL SEO ISSUES

### 1. **Single Page Application (SPA) - Major SEO Problem**
**Severity: CRITICAL**

Your website is a React SPA, which means:
- Search engines may struggle to crawl JavaScript-rendered content
- All pages share the same `index.html` with a single title and no meta description

**Impact:** Google may only index your homepage, missing all other pages (About, Contact, Sustainability, etc.)

**Fix:**
- Implement **Server-Side Rendering (SSR)** using Next.js or Remix
- OR use **Static Site Generation (SSG)**
- OR implement **pre-rendering** using react-snap or prerender.io

---

### 2. **Missing Meta Tags in index.html**
**Severity: CRITICAL**

**Current state (index.html):**
```html
<title>Anaaj.ai | Your AI Farming Assistant</title>
```

**Missing critical tags:**
- ❌ Meta description
- ❌ Open Graph tags (og:title, og:description, og:image, og:url)
- ❌ Twitter Card tags
- ❌ Canonical URL
- ❌ Robots meta tag
- ❌ Structured data (JSON-LD)

**Recommended Fix - Add to index.html:**
```html
<meta name="description" content="Anaaj.ai is India's first multilingual AI farming assistant. Get real-time crop advice, pest diagnosis, weather alerts, and market prices in Hindi, Punjabi, Gujarati & 12+ languages." />
<meta name="keywords" content="AI farming, agriculture assistant, crop diagnosis, pest detection, farm management, precision agriculture, India farming app, multilingual farm AI" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://anaaj.ai/" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Anaaj.ai | Your AI Farming Assistant" />
<meta property="og:description" content="India's first multilingual AI farming assistant for crop diagnosis, weather alerts & market prices." />
<meta property="og:image" content="https://res.cloudinary.com/dvwpxb2oa/image/upload/v1773932879/Full_Logo_dt1pqi.png" />
<meta property="og:url" content="https://anaaj.ai/" />
<meta property="og:site_name" content="Anaaj.ai" />
<meta property="og:locale" content="en_IN" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Anaaj.ai | Your AI Farming Assistant" />
<meta name="twitter:description" content="India's first multilingual AI farming assistant." />
<meta name="twitter:image" content="https://res.cloudinary.com/dvwpxb2oa/image/upload/v1773932879/Full_Logo_dt1pqi.png" />
```

---

### 3. **No Per-Page Meta Tags (React Helmet Missing)**
**Severity: CRITICAL**

Each page (AboutUs, Contact, Sustainability, etc.) has NO unique:
- Title tag
- Meta description
- Canonical URL
- Structured data

**Fix:** Install and use `react-helmet-async` for dynamic meta tags:

```tsx
// Example for AboutUs.tsx
import { Helmet } from 'react-helmet-async';

export default function AboutUs() {
  return (
    <>
      <Helmet>
        <title>About Us - Anaaj.ai | Empowering Indian Farmers with AI</title>
        <meta name="description" content="Learn about Anaaj.ai's mission to democratize agricultural knowledge through voice-first, multilingual AI technology for farmers across India." />
        <link rel="canonical" href="https://anaaj.ai/about" />
      </Helmet>
      {/* Rest of component */}
    </>
  );
}
```

---

### 4. **Missing robots.txt**
**Severity: HIGH**

No `robots.txt` file found in the `public/` directory.

**Fix - Create `public/robots.txt`:**
```
User-agent: *
Allow: /

Sitemap: https://anaaj.ai/sitemap.xml
```

---

### 5. **Missing XML Sitemap**
**Severity: HIGH**

The `/sitemap` page is an HTML page for users, NOT an XML sitemap for search engines.

**Fix - Create `public/sitemap.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://anaaj.ai/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://anaaj.ai/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://anaaj.ai/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://anaaj.ai/sustainability</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://anaaj.ai/download</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://anaaj.ai/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://anaaj.ai/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

---

## ⚠️ HIGH-PRIORITY SEO ISSUES

### 6. **Missing Structured Data (Schema.org / JSON-LD)**
**Severity: HIGH**

No structured data for:
- Organization
- LocalBusiness
- Product/SoftwareApplication
- FAQPage
- BreadcrumbList

**Fix - Add to index.html (Organization Schema):**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Anaaj.ai",
  "alternateName": "Anaaj AI Precision Ltd",
  "url": "https://anaaj.ai",
  "logo": "https://res.cloudinary.com/dvwpxb2oa/image/upload/v1773932879/Full_Logo_dt1pqi.png",
  "description": "India's first multilingual AI farming assistant providing crop diagnosis, pest detection, weather alerts and market prices.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Agro-Tech Hub, Level 4, Sector 82",
    "addressLocality": "Mohali",
    "addressRegion": "Punjab",
    "postalCode": "140308",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-1800-247-4100",
    "contactType": "customer service",
    "email": "support@anaajai.com",
    "availableLanguage": ["English", "Hindi", "Punjabi", "Gujarati"]
  },
  "sameAs": []
}
</script>
```

**Add FAQ Schema to PricingFAQ.tsx:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does Anaaj.ai work without internet?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Anaaj.ai supports offline caching for weather and basic advisory tips. Voice interactions require a basic 2G connection for cloud processing."
      }
    },
    {
      "@type": "Question",
      "name": "Is my data safe with Anaaj.ai?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. We never sell farmer data to third parties. Your soil history is encrypted and used only to provide better advice to you."
      }
    },
    {
      "@type": "Question",
      "name": "Which languages does Anaaj.ai support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We currently support Hindi, Gujarati, Punjabi, Marathi, Telugu, Tamil, and English. We are adding new languages every month."
      }
    }
  ]
}
</script>
```

---

### 7. **Poor Image SEO**
**Severity: HIGH**

**Issues Found:**

| Location | Problem |
|----------|---------|
| `Features.tsx` | Generic alt text: "Modern farm management dashboard" |
| `Sustainability.tsx` | Image alt: "Farmer checking soil" - okay but not keyword-rich |
| `Footer.tsx` | **EMPTY alt text:** `<img ... alt="" />` ❌ |
| Multiple components | External Cloudinary/Unsplash images without descriptive alt text |

**Fix Examples:**
```tsx
// Footer.tsx - Line 9
<img src="..." alt="Anaaj.ai Logo - AI Farming Assistant" />

// Features.tsx - Line 23
alt="Anaaj.ai precision farming dashboard showing soil health, pest risk, yield estimates and water usage for Indian farms"

// Sustainability.tsx - Line 89
alt="Indian farmer using Anaaj.ai app to check soil health on smartphone in Punjab field"
```

---

### 8. **Missing Heading Hierarchy Issues**
**Severity: MEDIUM-HIGH**

**Issues:**
- Multiple H1 tags on homepage (Hero has H1, then H2s that visually look like H1s)
- Some pages skip heading levels (H1 → H3)
- LiveChat.tsx uses H2 but no H1 context (it's a section on homepage)

**Best Practice:**
- ONE H1 per page
- Sequential heading hierarchy: H1 → H2 → H3 → H4

---

## 🔶 MEDIUM-PRIORITY SEO ISSUES

### 9. **Content Issues Affecting SEO**

#### a) **Thin Content on Some Pages**
- **Contact.tsx:** Only 150 words, mostly contact details
- **Sitemap.tsx:** Just a list of links

**Recommendation:** Add more descriptive content or merge thin pages.

#### b) **Keyword Optimization Missing**
Target keywords not naturally integrated:
- "AI farming assistant India"
- "crop disease detection app"
- "multilingual agriculture AI"
- "farm management app Hindi"
- "pest detection for farmers"
- "precision agriculture India"

#### c) **Internal Linking Weak**
- Footer has good links but page content lacks contextual internal links
- No breadcrumb navigation
- Blog/content section missing entirely

---

### 10. **Missing Hreflang Tags for Multilingual Support**
**Severity: MEDIUM**

Since Anaaj.ai supports Hindi, Punjabi, Gujarati, etc., you should add hreflang if you plan localized content:

```html
<link rel="alternate" hreflang="en-in" href="https://anaaj.ai/" />
<link rel="alternate" hreflang="hi-in" href="https://anaaj.ai/hi/" />
<link rel="alternate" hreflang="pa-in" href="https://anaaj.ai/pa/" />
<link rel="alternate" hreflang="x-default" href="https://anaaj.ai/" />
```

---

### 11. **External Links Missing rel="noopener noreferrer"**
**Severity: LOW-MEDIUM**

Some external links (YouTube, Maps) are missing security attributes:
```tsx
// YouTubeSection.tsx - Line 90
target="_blank"
rel="noopener noreferrer"  // ✅ Already has this - GOOD
```

Verify all `target="_blank"` links have proper rel attributes.

---

### 12. **Social Media Links Incomplete**
**Severity: LOW-MEDIUM**

Footer.tsx has placeholder social icons but no actual links:
```tsx
<button className="...">
  <span className="material-symbols-outlined">public</span>
</button>
```

**Fix:** Add actual social media profile links for:
- Facebook
- Twitter/X
- Instagram
- LinkedIn
- YouTube (you have a channel!)

---

## 📱 TECHNICAL SEO ISSUES

### 13. **Performance Concerns (Indirect SEO Impact)**

**Issues:**
- Hero.tsx preloads 192 image frames for scroll animation - heavy load
- Multiple large external images from Unsplash/Cloudinary
- No lazy loading on below-fold images

**Recommendations:**
- Implement `loading="lazy"` for images
- Use modern image formats (WebP, AVIF)
- Consider using `srcset` for responsive images
- Optimize frame animation or use video instead

---

### 14. **URL Structure**
**Current:** ✅ Clean URLs (`/about`, `/contact`, `/sustainability`)

**Issues:**
- `/vendor/:id` - Dynamic vendor pages need proper handling for SEO
- `/checkout/:paymentOrderId` - Should be noindex

---

### 15. **Missing 404 Page**
No custom 404 error page for broken links.

---

## 📝 CONTENT RECOMMENDATIONS

### Homepage (Home.tsx)
**Current H1:** "Your AI Farming Assistant"
**Recommended H1:** "Anaaj.ai - India's #1 Multilingual AI Farming Assistant"

**Add keyword-rich content sections about:**
- How AI helps Indian farmers
- Supported crops and regions
- Success stories/testimonials
- Statistics (use the ones from Sustainability)

### About Page
**Missing:** 
- Team section
- Company history timeline
- Awards/recognition
- Press mentions

### Create New Pages:
1. **Blog/Resources** - For SEO content marketing
2. **How It Works** - Detailed feature explanations
3. **Pricing** - Dedicated pricing page (currently buried in FAQ)
4. **Case Studies** - Farmer success stories
5. **Regional Pages** - `/punjab`, `/gujarat`, etc.

---

## 🎯 PRIORITY ACTION PLAN

### Immediate (Week 1)
1. ✅ Add meta description to index.html
2. ✅ Add Open Graph tags
3. ✅ Create robots.txt
4. ✅ Create sitemap.xml
5. ✅ Fix empty alt tags

### Short-term (Week 2-3)
1. Install react-helmet-async
2. Add unique titles/descriptions per page
3. Add Organization JSON-LD schema
4. Add FAQ schema to pricing section
5. Implement breadcrumbs

### Medium-term (Month 1-2)
1. Evaluate SSR/SSG migration (Next.js)
2. Add blog/content section
3. Improve internal linking
4. Create regional landing pages
5. Performance optimization

### Long-term (Quarter 1)
1. Full Next.js migration
2. Multilingual content pages
3. Comprehensive content strategy
4. Link building campaign

---

## 📊 SEO SCORE SUMMARY

| Category | Score | Status |
|----------|-------|--------|
| Meta Tags | 2/10 | 🔴 Critical |
| Structured Data | 0/10 | 🔴 Critical |
| Content Quality | 6/10 | 🟡 Needs Work |
| Technical SEO | 4/10 | 🔴 Poor |
| Image SEO | 3/10 | 🔴 Poor |
| Mobile Friendliness | 8/10 | 🟢 Good |
| URL Structure | 7/10 | 🟢 Good |
| Internal Linking | 4/10 | 🟡 Needs Work |

**Overall SEO Health: 34/80 (42.5%) - NEEDS SIGNIFICANT IMPROVEMENT**

---

## 🛠️ FILES TO CREATE/MODIFY

1. **index.html** - Add meta tags, OG tags, JSON-LD
2. **public/robots.txt** - Create new
3. **public/sitemap.xml** - Create new
4. **Install:** `npm install react-helmet-async`
5. **All page components** - Add Helmet with unique meta
6. **Footer.tsx** - Fix empty alt tag
7. **Features.tsx, Sustainability.tsx** - Improve alt tags

---

*Report generated for Anaaj.ai Website SEO Audit*
