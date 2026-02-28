export function createId(prefix = 'item') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function createSiteManagementDefaults() {
  return {
    homepage: {
      hero: {
        title: 'Faith-centered learning. Disciplined formation. Service with purpose.',
        subtitle:
          'A private Catholic school committed to Christian values, compassion, and academic excellence for every learner.',
        ctaPrimaryText: 'Enroll Now',
        ctaPrimaryLink: '/admissions',
        ctaSecondaryText: 'Book a Visit',
        ctaSecondaryLink: '/contact#visit',
        backgroundImage: '',
        focusLabel: 'Campus Focus',
        focusText: 'Faith, Discipline, and Service in every classroom.',
        focusImage: '',
        enableAnimatedCounters: true,
        enableParallax: true,
        statCards: [
          { id: 'hero-stat-1', label: 'Departments', value: '2', icon: 'school', isVisible: true },
          { id: 'hero-stat-2', label: 'Catholic Education', value: '100', icon: 'shield', isVisible: true },
          { id: 'hero-stat-3', label: 'Dedicated Faculty', value: '20+', icon: 'users', isVisible: true },
        ],
      },
      trustBadges: [
        { id: 'trust-1', label: 'Accredited Institution', icon: 'award', image: '', isVisible: true },
        { id: 'trust-2', label: 'Faith-based Curriculum', icon: 'book', image: '', isVisible: true },
        { id: 'trust-3', label: 'Safe Campus', icon: 'shield', image: '', isVisible: true },
        { id: 'trust-4', label: 'Transportation Support', icon: 'bus', image: '', isVisible: true },
      ],
      sections: [
        {
          id: 'home-section-1',
          type: 'Highlight',
          title: 'Why families choose DMSB',
          content: 'Clear values, steady formation, and practical support for learners.',
          image: '',
          ctaText: '',
          ctaLink: '',
          isPublished: true,
        },
      ],
      featuredNews: {
        showFeatured: true,
        layoutStyle: 'cards',
        postsPerPage: 6,
        enableCategoryFilters: true,
        paginationSize: 6,
      },
      testimonials: {
        isVisible: true,
        title: 'Parent and guardian testimonials',
        subtitle: 'Feedback from families in our school community.',
      },
    },
    aboutPage: {
      intro: 'A faith-centered school community committed to discipline, compassion, and service.',
      timeline: [
        {
          id: 'about-timeline-1',
          year: '',
          description: 'Founded to provide faith-centered education in Bukidnon.',
          isVisible: true,
        },
      ],
      mission: 'Guiding students through values-based and academically sound formation.',
      vision: 'A compassionate and disciplined school community for lifelong learning.',
      principalMessage:
        'Together with families, we form students who lead with competence and compassion.',
      coreValues: [
        { id: 'core-value-1', value: 'Faith', isVisible: true },
        { id: 'core-value-2', value: 'Discipline', isVisible: true },
        { id: 'core-value-3', value: 'Service', isVisible: true },
      ],
      showFacultySection: true,
      servingUnderserved: {
        title: 'Serving the underserved',
        content:
          'We prioritize support for learners facing distance and financial barriers through transport and community care programs.',
        image: '',
        isVisible: true,
      },
    },
    academicsPage: {
      programTabs: [
        {
          id: 'program-tab-1',
          key: 'junior',
          title: 'Junior High',
          description: 'Foundation courses with values formation and skills building.',
          image: '',
          isVisible: true,
        },
        {
          id: 'program-tab-2',
          key: 'senior',
          title: 'Senior High',
          description: 'Academic strands and pathways for college and careers.',
          image: '',
          isVisible: true,
        },
      ],
      curriculumBlocks: [
        {
          id: 'curriculum-1',
          title: 'Core subjects with mastery support',
          description: 'Teachers align this area with clear outcomes and regular feedback.',
          isVisible: true,
        },
      ],
      facilitySections: [
        {
          id: 'facility-1',
          title: 'Computer Lab',
          description: 'Digital literacy and research skills training.',
          image: '',
          isVisible: true,
        },
      ],
    },
    admissionsPage: {
      steps: [
        {
          id: 'admission-step-1',
          title: 'Inquiry',
          description: 'Contact admissions for orientation and schedule.',
          isVisible: true,
        },
      ],
      requirements: [
        {
          id: 'admission-requirement-1',
          value: 'Birth certificate (copy)',
          isVisible: true,
        },
      ],
      forms: [
        { id: 'admission-form-1', label: 'Enrollment Form', url: '', isVisible: true },
      ],
      transportation: {
        title: 'Transportation Assistance',
        subtitle: 'Support for distance and financial barriers',
        cards: [
          {
            id: 'transport-card-1',
            title: 'Distance Support',
            description: 'For learners who live far from campus.',
            isVisible: true,
          },
          {
            id: 'transport-card-2',
            title: 'Financial Relief',
            description: 'For families with transport affordability concerns.',
            isVisible: true,
          },
          {
            id: 'transport-card-3',
            title: 'Safe Commute',
            description: 'Reliable daily travel for better attendance.',
            isVisible: true,
          },
        ],
      },
      cta: {
        title: 'Need help with enrollment?',
        subtitle: 'Our admissions team can guide your family step by step.',
        primaryText: 'Contact Admissions',
        primaryLink: '/contact',
        secondaryText: 'Back to Home',
        secondaryLink: '/',
      },
      highlightCards: [
        {
          id: 'admission-highlight-1',
          title: 'Guided Enrollment',
          description: 'A clear enrollment path with support at every step.',
          isVisible: true,
        },
      ],
    },
    eventsSettings: {
      featuredEventId: '',
      showFeaturedEvent: true,
      enableCountdown: true,
      layout: 'timeline',
      showAddToCalendar: true,
      defaultDateRange: 'upcoming',
      eventBannerImage: '',
      featuredEventOrder: [],
    },
    gallerySettings: {
      categories: [
        { id: 'gallery-category-1', name: 'All', slug: 'all', isVisible: true },
      ],
      featuredGalleryTitle: 'Campus highlights and memories',
      featuredGalleryDescription: 'Moments from school life, events, and learning activities.',
      featuredImage: '',
      layout: 'masonry',
      enableLightbox: true,
      defaultCaption: 'Campus memory',
    },
    contactPage: {
      address: 'Bukidnon, Philippines',
      phone: '+63 000 000 0000',
      email: 'info@dmsb.example',
      officeHours: 'Mon-Fri, 8:00 AM - 5:00 PM',
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.0589883963135!2d125.3919950747659!3d7.783570792236212!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32fec2d955555555%3A0x5e4a52a129c2ee46!2sDivine%20Mercy%20School%20of%20Buikidnon%2C%20Inc.!5e0!3m2!1sen!2sph!4v1771298618796!5m2!1sen!2sph',
      messengerLink: 'https://m.me/dmsb',
      enrollmentFormLink: '/forms/Admissions-Form.pdf',
      recipientEmail: 'info@dmsb.example',
      showFloatingMessenger: true,
    },
    footer: {
      description:
        'A private Catholic school committed to faith-based education, discipline, and service. We bring education closer to every child.',
      socialLinks: [
        { id: 'footer-social-1', platform: 'Facebook', url: 'https://www.facebook.com/dmsbherald', isVisible: true },
        { id: 'footer-social-2', platform: 'YouTube', url: 'https://www.youtube.com/', isVisible: true },
        { id: 'footer-social-3', platform: 'Instagram', url: 'https://www.instagram.com/', isVisible: true },
      ],
      navLinks: [
        { id: 'footer-nav-1', label: 'About', path: '/about', isVisible: true },
        { id: 'footer-nav-2', label: 'Academics', path: '/academics', isVisible: true },
        { id: 'footer-nav-3', label: 'Admissions', path: '/admissions', isVisible: true },
        { id: 'footer-nav-4', label: 'Updates', path: '/news', isVisible: true },
      ],
      copyrightText: 'Divine Mercy School of Bukidnon, Inc. All rights reserved.',
      showDeveloperCredit: true,
      developerCredit: 'Developed by Javy M. Rodillon',
    },
    globalSettings: {
      schoolName: 'Divine Mercy School of Bukidnon, Inc.',
      logoUrl: '/logo.png',
      faviconUrl: '/logo.png',
      primaryColor: '#b91c1c',
      secondaryColor: '#fb7185',
      enableDarkMode: false,
      enableAnimations: true,
      announcement: {
        isVisible: false,
        text: '',
        link: '',
      },
      maintenanceMode: {
        enabled: false,
        message: 'The site is currently under scheduled maintenance. Please check back later.',
      },
      seo: {
        defaultTitle: 'Divine Mercy School of Bukidnon',
        defaultDescription: 'Faith-centered education, discipline, and service for every learner.',
        defaultOgImage: '',
      },
    },
  }
}
