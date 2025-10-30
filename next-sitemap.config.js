/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_ADMIN_BASE_URL || 'https://admin.enlivesalon.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/api/*', '/_next/*', '/auth/admin/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/auth/admin/'],
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_ADMIN_BASE_URL || 'https://admin.enlivesalon.com'}/sitemap.xml`,
    ],
  },
  transform: async (config, path) => {
    // Custom transform for different admin page types
    const customConfig = {
      loc: path,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    };

    // Admin dashboard gets highest priority
    if (path === '/') {
      customConfig.priority = 1.0;
      customConfig.changefreq = 'daily';
    }

    // Booking management pages get high priority
    if (path.includes('/bookings') || path.includes('/booking-calendar') || path.includes('/booking-analytics')) {
      customConfig.priority = 0.9;
      customConfig.changefreq = 'daily';
    }

    // Service and stylist management get high priority
    if (path.includes('/services') || path.includes('/stylists')) {
      customConfig.priority = 0.9;
      customConfig.changefreq = 'weekly';
    }

    // Customer and membership management get medium-high priority
    if (path.includes('/customers') || path.includes('/memberships')) {
      customConfig.priority = 0.8;
      customConfig.changefreq = 'daily';
    }

    // Reviews and enquiries get medium priority
    if (path.includes('/reviews') || path.includes('/enquiries')) {
      customConfig.priority = 0.7;
      customConfig.changefreq = 'daily';
    }

    // Gallery gets lower priority
    if (path.includes('/gallery')) {
      customConfig.priority = 0.6;
      customConfig.changefreq = 'weekly';
    }

    return customConfig;
  },
};

