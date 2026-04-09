import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogPosts, BlogPost, getFeaturedPosts, getRecentPosts } from '../data/blogPosts';

const categoryColors: Record<BlogPost['category'], string> = {
  'how-to': 'bg-blue-100 text-blue-800',
  'success-story': 'bg-green-100 text-green-800',
  'education': 'bg-purple-100 text-purple-800',
  'news': 'bg-orange-100 text-orange-800'
};

const categoryIcons: Record<BlogPost['category'], string> = {
  'how-to': 'build',
  'success-story': 'emoji_events',
  'education': 'school',
  'news': 'newspaper'
};

export default function Blog() {
  const { t } = useTranslation();
  const featuredPost = getFeaturedPosts()[0];
  const recentPosts = getRecentPosts(8).filter(p => p.id !== featuredPost?.id);

  const howToGuides = blogPosts.filter(p => p.category === 'how-to');
  const successStories = blogPosts.filter(p => p.category === 'success-story');
  const educational = blogPosts.filter(p => p.category === 'education');

  return (
    <div className="pt-28 pb-24 bg-surface min-h-screen">
      <Helmet>
        <title>{t('pages.blog.title')}</title>
        <meta name="description" content={t('pages.blog.metaDesc')} />
        <link rel="canonical" href="https://anaaj.ai/blog" />
        <meta property="og:title" content={t('pages.blog.title')} />
        <meta property="og:description" content={t('pages.blog.metaDesc')} />
        <meta property="og:url" content="https://anaaj.ai/blog" />
        <meta property="og:type" content="blog" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-tertiary-fixed w-fit mb-6 shadow-sm">
            <span className="material-symbols-outlined text-sm">article</span>
            <span className="text-xs font-bold uppercase tracking-widest font-label">{t('blog.label')}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-4">
            {t('blog.titleLine1')} <span className="text-tertiary-fixed-variant italic">{t('blog.titleLine2')}</span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl">
            {t('blog.description')}
          </p>
        </motion.div>

        {/* Featured Post */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-20"
          >
            <Link to={`/blog/${featuredPost.slug}`} className="group">
              <div className="relative rounded-[2rem] overflow-hidden bg-surface-container-lowest border border-outline-variant/10 shadow-xl hover:shadow-2xl transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-64 lg:h-auto lg:min-h-[400px]">
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.imageAlt}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-tertiary-fixed text-on-tertiary-fixed px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                        {t('blog.featured')}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColors[featuredPost.category]}`}>
                        {featuredPost.categoryLabel}
                      </span>
                      <span className="text-on-surface-variant text-sm">{featuredPost.readTime}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary mb-4 group-hover:text-tertiary-fixed-variant transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-on-surface-variant mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm">person</span>
                      </div>
                      <div>
                        <p className="font-bold text-primary text-sm">{featuredPost.author}</p>
                        <p className="text-xs text-on-surface-variant">{featuredPost.authorRole}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Category Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { category: 'how-to', label: t('blog.categories.howTo'), count: howToGuides.length },
            { category: 'success-story', label: t('blog.categories.successStory'), count: successStories.length },
            { category: 'education', label: t('blog.categories.education'), count: educational.length },
            { category: 'news', label: t('blog.categories.news'), count: blogPosts.filter(p => p.category === 'news').length }
          ].map((cat, i) => (
            <motion.a
              key={cat.category}
              href={`#${cat.category}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10 hover:bg-surface-container hover:shadow-lg transition-all group"
            >
              <span className={`material-symbols-outlined text-2xl mb-3 ${categoryColors[cat.category as BlogPost['category']].split(' ')[1]}`}>
                {categoryIcons[cat.category as BlogPost['category']]}
              </span>
              <h3 className="font-bold text-primary group-hover:text-tertiary-fixed-variant transition-colors">{cat.label}</h3>
              <p className="text-sm text-on-surface-variant">{t('blog.articlesCount', { count: cat.count })}</p>
            </motion.a>
          ))}
        </div>

        {/* Recent Posts Grid */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary mb-8">{t('blog.latestArticles')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.slice(0, 6).map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/blog/${post.slug}`} className="group block">
                  <div className="rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.imageAlt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${categoryColors[post.category]}`}>
                          {post.categoryLabel}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-primary mb-2 line-clamp-2 group-hover:text-tertiary-fixed-variant transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-on-surface-variant">
                        <span>{post.author}</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How-To Guides Section */}
        <section id="how-to" className="mb-20 scroll-mt-32">
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-3xl text-blue-600">build</span>
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary">{t('blog.categories.howTo')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {howToGuides.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <div className="flex gap-4 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 hover:shadow-lg transition-all">
                  <img 
                    src={post.image} 
                    alt={post.imageAlt}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex flex-col justify-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold w-fit mb-2 ${categoryColors[post.category]}`}>
                      {post.categoryLabel}
                    </span>
                    <h3 className="font-bold text-primary group-hover:text-tertiary-fixed-variant transition-colors line-clamp-2 mb-1">
                      {post.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant">{post.readTime}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Success Stories Section */}
        <section id="success-story" className="mb-20 scroll-mt-32">
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-3xl text-green-600">emoji_events</span>
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary">{t('blog.categories.successStory')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {successStories.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <div className="relative rounded-2xl overflow-hidden h-64 md:h-80">
                  <img 
                    src={post.image} 
                    alt={post.imageAlt}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${categoryColors[post.category]}`}>
                      {post.categoryLabel}
                    </span>
                    <h3 className="font-bold text-white text-xl mt-3 group-hover:text-tertiary-fixed transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-white/70 text-sm mt-2">{post.readTime}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Educational Section */}
        <section id="education" className="mb-20 scroll-mt-32">
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-3xl text-purple-600">school</span>
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary">{t('blog.categories.education')}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {educational.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <div className="flex gap-4 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 hover:shadow-lg transition-all">
                  <img 
                    src={post.image} 
                    alt={post.imageAlt}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex flex-col justify-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold w-fit mb-2 ${categoryColors[post.category]}`}>
                      {post.categoryLabel}
                    </span>
                    <h3 className="font-bold text-primary group-hover:text-tertiary-fixed-variant transition-colors line-clamp-2 mb-1">
                      {post.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant">{post.readTime}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* News Section */}
        <section id="news" className="mb-20 scroll-mt-32">
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-3xl text-orange-600">newspaper</span>
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary">{t('blog.categories.news')}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {blogPosts.filter(p => p.category === 'news').map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <div className="flex gap-4 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 hover:shadow-lg transition-all">
                  <img 
                    src={post.image} 
                    alt={post.imageAlt}
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex flex-col justify-center flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${categoryColors[post.category]}`}>
                        {post.categoryLabel}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {new Date(post.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-bold text-primary group-hover:text-tertiary-fixed-variant transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant line-clamp-1">{post.excerpt}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] bg-primary p-8 md:p-12 text-center"
        >
          <h2 className="text-2xl md:text-4xl font-headline font-bold text-white mb-4">
            {t('blog.cta.title')}
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            {t('blog.cta.desc')}
          </p>
          <Link 
            to="/download" 
            className="inline-flex items-center gap-2 bg-tertiary-fixed text-on-tertiary-fixed px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl"
          >
            <span className="material-symbols-outlined">download</span>
            {t('blog.cta.button')}
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
