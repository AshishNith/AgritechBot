import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getBlogPostBySlug, getRecentPosts, BlogPost, blogPosts } from '../data/blogPosts';

const categoryColors: Record<BlogPost['category'], string> = {
  'how-to': 'bg-blue-500/10 text-blue-600 border-blue-200',
  'success-story': 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  'education': 'bg-purple-500/10 text-purple-600 border-purple-200',
  'news': 'bg-orange-500/10 text-orange-600 border-orange-200'
};

const categoryIcons: Record<BlogPost['category'], string> = {
  'how-to': 'construction',
  'success-story': 'emoji_events',
  'education': 'school',
  'news': 'newspaper'
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = getBlogPostBySlug(slug || '');
  const relatedPosts = blogPosts.filter(p => p.slug !== slug && p.category === post?.category).slice(0, 3);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://anaaj.ai/blog/${post?.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-surface pt-32 pb-24 flex flex-col items-center justify-center px-6">
        <Helmet>
          <title>Article Not Found - Anaaj.ai Blog</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-red-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-500 text-4xl">search_off</span>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">Article Not Found</h1>
          <p className="text-on-surface-variant mb-8 max-w-md">The article you're looking for doesn't exist or has been moved.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Blog
          </Link>
        </motion.div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image,
    "author": {
      "@type": "Person",
      "name": post.author,
      "jobTitle": post.authorRole
    },
    "publisher": {
      "@type": "Organization",
      "name": "Anaaj.ai",
      "logo": {
        "@type": "ImageObject",
        "url": "https://res.cloudinary.com/dvwpxb2oa/image/upload/v1773932879/Full_Logo_dt1pqi.png"
      }
    },
    "datePublished": post.publishedDate,
    "dateModified": post.publishedDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://anaaj.ai/blog/${post.slug}`
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <Helmet>
        <title>{post.title} | Anaaj.ai Blog</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://anaaj.ai/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
        <meta property="og:url" content={`https://anaaj.ai/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.publishedDate} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.categoryLabel} />
        {post.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={post.image} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Immersive Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2 }}
          src={post.image} 
          alt={post.imageAlt}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent"></div>
        
        {/* Floating Navigation */}
        <div className="absolute top-20 left-0 right-0 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-white/95 backdrop-blur-xl px-5 py-2.5 rounded-full font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all border border-white/50"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span className="hidden sm:inline">Back</span>
            </motion.button>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <button 
                onClick={handleCopyLink}
                className="flex items-center gap-2 bg-white/95 backdrop-blur-xl px-4 py-2.5 rounded-full font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all border border-white/50"
              >
                <span className="material-symbols-outlined text-lg">{copied ? 'check' : 'link'}</span>
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-8 md:pb-12">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            {/* Category Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 border backdrop-blur-md ${categoryColors[post.category]}`}>
              <span className="material-symbols-outlined text-base">{categoryIcons[post.category]}</span>
              {post.categoryLabel}
            </div>
            
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-white leading-[1.1] mb-6 drop-shadow-2xl">
              {post.title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <span className="material-symbols-outlined text-lg">person</span>
                </div>
                <div>
                  <p className="font-bold text-sm">{post.author}</p>
                  <p className="text-xs text-white/70">{post.authorRole}</p>
                </div>
              </div>
              <div className="h-8 w-px bg-white/30 hidden sm:block"></div>
              <div className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-lg">calendar_month</span>
                {new Date(post.publishedDate).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-lg">schedule</span>
                {post.readTime}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Sticky Sidebar - Left */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-32 flex flex-col items-center gap-4">
              <div className="flex flex-col gap-3 p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://anaaj.ai/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all group"
                  title="Share on Twitter"
                >
                  <span className="material-symbols-outlined text-xl">share</span>
                </a>
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + `https://anaaj.ai/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"
                  title="Share on WhatsApp"
                >
                  <span className="material-symbols-outlined text-xl">chat</span>
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://anaaj.ai/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                  title="Share on Facebook"
                >
                  <span className="material-symbols-outlined text-xl">thumb_up</span>
                </a>
                <button 
                  onClick={handleCopyLink}
                  className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all"
                  title="Copy Link"
                >
                  <span className="material-symbols-outlined text-xl">{copied ? 'check' : 'link'}</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Article Content */}
          <main className="lg:col-span-7">
            {/* Excerpt Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary/5 to-tertiary-fixed/5 rounded-3xl p-6 md:p-8 mb-10 border border-primary/10"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl">lightbulb</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Key Takeaway</p>
                  <p className="text-lg text-on-surface-variant leading-relaxed">{post.excerpt}</p>
                </div>
              </div>
            </motion.div>

            {/* Article Content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="prose prose-lg prose-stone max-w-none
                prose-headings:font-headline prose-headings:text-primary prose-headings:font-bold prose-headings:scroll-mt-24
                prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-outline-variant/20
                prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-10 prose-h3:mb-4
                prose-h4:text-lg prose-h4:mt-8 prose-h4:mb-3 prose-h4:text-primary/80
                prose-p:text-on-surface-variant prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-base prose-p:md:text-lg
                prose-a:text-tertiary-fixed-variant prose-a:font-semibold prose-a:no-underline prose-a:border-b-2 prose-a:border-tertiary-fixed/30 hover:prose-a:border-tertiary-fixed hover:prose-a:text-tertiary-fixed prose-a:transition-all
                prose-strong:text-on-surface prose-strong:font-bold
                prose-ul:my-6 prose-ul:space-y-3 prose-ul:pl-0
                prose-ol:my-6 prose-ol:space-y-3 prose-ol:pl-0
                prose-li:text-on-surface-variant prose-li:pl-8 prose-li:relative prose-li:list-none
                prose-blockquote:border-l-4 prose-blockquote:border-tertiary-fixed prose-blockquote:bg-gradient-to-r prose-blockquote:from-tertiary-fixed/10 prose-blockquote:to-transparent prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:text-on-surface prose-blockquote:my-10 prose-blockquote:shadow-sm
                prose-table:my-10 prose-table:w-full prose-table:rounded-2xl prose-table:overflow-hidden prose-table:shadow-lg prose-table:border prose-table:border-outline-variant/20
                prose-thead:bg-primary
                prose-th:text-on-primary prose-th:p-4 prose-th:text-left prose-th:font-bold prose-th:text-sm prose-th:uppercase prose-th:tracking-wider
                prose-td:p-4 prose-td:border-b prose-td:border-outline-variant/10 prose-td:bg-surface-container-lowest
                prose-code:bg-primary/10 prose-code:text-primary prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                prose-hr:my-16 prose-hr:border-outline-variant/30
                prose-img:rounded-2xl prose-img:shadow-xl
              "
              dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
            />

            {/* Tags Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-16 pt-8 border-t border-outline-variant/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">sell</span>
                <h3 className="font-bold text-primary text-lg">Topics Covered</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-4 py-2 bg-surface-container-lowest rounded-full text-sm text-on-surface-variant border border-outline-variant/20 hover:bg-primary hover:text-on-primary hover:border-primary transition-all cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Mobile Share Section */}
            <div className="lg:hidden mt-10 p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
              <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">share</span>
                Share this article
              </h3>
              <div className="flex gap-3">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://anaaj.ai/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
                >
                  <span className="material-symbols-outlined">share</span>
                  Twitter
                </a>
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + `https://anaaj.ai/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors"
                >
                  <span className="material-symbols-outlined">chat</span>
                  WhatsApp
                </a>
                <button 
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-container text-on-surface font-bold hover:bg-primary hover:text-on-primary transition-colors border border-outline-variant/20"
                >
                  <span className="material-symbols-outlined">{copied ? 'check' : 'link'}</span>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Author Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 p-6 md:p-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-lg"
            >
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="material-symbols-outlined text-white text-3xl md:text-4xl">person</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Written by</p>
                  <h4 className="text-xl md:text-2xl font-bold text-primary mb-1">{post.author}</h4>
                  <p className="text-on-surface-variant mb-4">{post.authorRole}</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Expert contributor at Anaaj.ai, helping Indian farmers adopt modern agricultural practices through AI-powered insights and guidance.
                  </p>
                </div>
              </div>
            </motion.div>
          </main>

          {/* Sidebar - Right */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              
              {/* Download CTA Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-emerald-800 p-6 md:p-8 text-white shadow-2xl"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 opacity-10">
                  <span className="material-symbols-outlined text-[180px] -mt-10 -mr-10">agriculture</span>
                </div>
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-5 border border-white/30">
                    <span className="material-symbols-outlined text-2xl">smartphone</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-headline font-bold mb-3">
                    Get Expert Advice Anytime
                  </h3>
                  <p className="text-white/80 text-sm mb-6 leading-relaxed">
                    Ask questions in Hindi, Punjabi, Gujarati or English. Our AI assistant gives instant, personalized farming advice.
                  </p>
                  <Link 
                    to="/download" 
                    className="flex items-center justify-center gap-2 w-full bg-tertiary-fixed text-on-tertiary-fixed py-4 rounded-2xl font-bold hover:scale-[1.02] hover:shadow-xl transition-all"
                  >
                    <span className="material-symbols-outlined">download</span>
                    Download Free App
                  </Link>
                </div>
              </motion.div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/10 shadow-sm"
                >
                  <h3 className="font-bold text-primary text-lg mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined">auto_stories</span>
                    Related Articles
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost, index) => (
                      <Link 
                        key={relatedPost.id} 
                        to={`/blog/${relatedPost.slug}`} 
                        className="group flex gap-4 p-3 -mx-3 rounded-2xl hover:bg-surface-container transition-all"
                      >
                        <img 
                          src={relatedPost.image} 
                          alt={relatedPost.imageAlt}
                          className="w-20 h-20 object-cover rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex flex-col justify-center min-w-0">
                          <h4 className="font-bold text-primary text-sm group-hover:text-tertiary-fixed-variant transition-colors line-clamp-2 leading-snug">
                            {relatedPost.title}
                          </h4>
                          <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {relatedPost.readTime}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link 
                    to="/blog" 
                    className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-primary/20 text-primary font-bold hover:bg-primary hover:text-on-primary transition-all"
                  >
                    View All Articles
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </motion.div>
              )}

              {/* Quick Contact */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/10"
              >
                <h3 className="font-bold text-primary text-lg mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">help</span>
                  Need Help?
                </h3>
                <p className="text-sm text-on-surface-variant mb-4">
                  Have questions about this article or need personalized advice for your farm?
                </p>
                <Link 
                  to="/contact" 
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-surface-container text-primary font-bold hover:bg-primary hover:text-on-primary transition-all border border-outline-variant/20"
                >
                  <span className="material-symbols-outlined">mail</span>
                  Contact Our Experts
                </Link>
              </motion.div>

            </div>
          </aside>

        </div>
      </div>

      {/* Full-width CTA Section */}
      <section className="bg-surface-container-low py-16 md:py-20 mt-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tertiary-fixed/10 text-tertiary-fixed mb-6">
              <span className="material-symbols-outlined">trending_up</span>
              <span className="text-sm font-bold">Join 500K+ Farmers</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary mb-6">
              Transform Your Farming with AI
            </h2>
            <p className="text-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">
              Get personalized crop advice, disease detection, weather alerts, and market prices—all in your native language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/download" 
                className="inline-flex items-center justify-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl"
              >
                <span className="material-symbols-outlined">download</span>
                Download Anaaj.ai
              </Link>
              <Link 
                to="/blog" 
                className="inline-flex items-center justify-center gap-3 bg-surface-container-lowest text-primary px-8 py-4 rounded-2xl font-bold text-lg hover:bg-surface-container transition-colors border border-outline-variant/20"
              >
                <span className="material-symbols-outlined">article</span>
                Read More Articles
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Enhanced markdown-to-HTML converter
function formatContent(content: string): string {
  let html = content
    // Headers with IDs for linking
    .replace(/^### (.*$)/gim, (match, p1) => `<h3 id="${slugify(p1)}">${p1}</h3>`)
    .replace(/^## (.*$)/gim, (match, p1) => `<h2 id="${slugify(p1)}">${p1}</h2>`)
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Blockquotes with special styling
    .replace(/^> (.*$)/gim, '<blockquote><p>$1</p></blockquote>')
    // Unordered lists with custom bullets
    .replace(/^- (.*$)/gim, '<li><span class="absolute left-0 top-2 w-2 h-2 rounded-full bg-tertiary-fixed"></span>$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.*$)/gim, '<li><span class="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">•</span>$1</li>')
    // Tables
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      const isHeader = cells.some(c => c.includes('---'));
      if (isHeader) return '';
      return `<tr>${cells.map(c => `<td>${c.trim()}</td>`).join('')}</tr>`;
    })
    // Horizontal rule
    .replace(/^---$/gim, '<hr>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br>');

  return html;
}

// Helper to create URL-safe slugs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}
