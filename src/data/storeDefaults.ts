import type { Product, SlideItem, CategoryItem, CompanySettings, MediaItem, PromoBannerItem, PartnerItem } from '../types/store';

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Premium Basmati Long Grain Rice (50kg Bag)',
    category: 'Foodstuffs & Commodities',
    price: '$34.50',
    oldPrice: '$39.00',
    numericPrice: 34.50,
    rating: 5,
    reviews: 99,
    image: '/images/hero_global_shipping_1793690292263.jpg',
    origin: 'Direct Import via Dubai & Karachi',
    specs: 'Top Grade 1121 XXL • Double Polished • Bulk Pallets & Containers',
    isFeatured: true
  },
  {
    id: 2,
    name: 'High-Tensile Deformed Steel Rebar Grade 60 (12mm-32mm)',
    category: 'Construction Steel & Cement',
    price: '$680.00',
    oldPrice: '$740.00',
    numericPrice: 680.00,
    rating: 5,
    reviews: 142,
    image: '/images/bosaso_port_trade_1793690293064.jpg',
    origin: 'Turkish & UAE Certified Steel Mills',
    specs: 'ASTM A615 Grade 60 • Standard Length 12m • Direct Port Offload',
    isFeatured: true
  },
  {
    id: 3,
    name: 'Commercial Solar Panel Monocrystalline 550W Tier 1',
    category: 'Electronics & Solar Power',
    price: '$115.00',
    oldPrice: '$135.00',
    numericPrice: 115.00,
    rating: 5,
    reviews: 84,
    image: '/images/quality_inspection_1793690293588.jpg',
    origin: 'Tier-1 International Manufacturer',
    specs: 'High Efficiency 21.3% • Anti-PID • 25 Year Performance Warranty',
    isFeatured: true
  },
  {
    id: 4,
    name: 'Refined Pure Sunflower Cooking Oil (20 Litre Jerrycan)',
    category: 'Foodstuffs & Commodities',
    price: '$28.00',
    oldPrice: '$32.00',
    numericPrice: 28.00,
    rating: 4,
    reviews: 76,
    image: '/images/dubai_trade_hub_1793690293266.jpg',
    origin: 'Imported via Jebel Ali Corridor',
    specs: '100% Grade A Refined • Enriched with Vitamins A & D • Wholesale Lots',
    isFeatured: true
  },
  {
    id: 5,
    name: 'Portland Cement Type 1 / 42.5R (50kg Bag)',
    category: 'Construction Steel & Cement',
    price: '$7.80',
    oldPrice: '$9.20',
    numericPrice: 7.80,
    rating: 5,
    reviews: 210,
    image: '/images/bosaso_port_trade_1793690293064.jpg',
    origin: 'Oman / UAE Bulk Clinker',
    specs: 'High Strength 42.5R • Moisture Resistant Packaging • Bosaso Stock',
    isFeatured: false
  },
  {
    id: 6,
    name: 'Heavy Duty Diesel Generator 50kVA Silent Enclosure',
    category: 'Electronics & Solar Power',
    price: '$6,450.00',
    oldPrice: '$7,200.00',
    numericPrice: 6450.00,
    rating: 5,
    reviews: 38,
    image: '/images/quality_inspection_1793690293588.jpg',
    origin: 'Cummins / Perkins Engine Platform',
    specs: '3 Phase 400V • Soundproof Canopy • Auto Transfer Switch Included',
    isFeatured: false
  },
  {
    id: 7,
    name: 'Refined White Cane Sugar ICUMSA 45 (50kg Bag)',
    category: 'Foodstuffs & Commodities',
    price: '$38.00',
    oldPrice: '$42.50',
    numericPrice: 38.00,
    rating: 5,
    reviews: 115,
    image: '/images/hero_global_shipping_1793690292263.jpg',
    origin: 'Direct Sourced from Brazil / India Mills',
    specs: 'Sparkling White Crystals • Moisture 0.04% Max • Direct Shipments',
    isFeatured: false
  },
  {
    id: 8,
    name: 'Heavy Truck Radial Tyres 315/80R22.5 All-Position',
    category: 'Heavy Machinery & Auto Parts',
    price: '$185.00',
    oldPrice: '$210.00',
    numericPrice: 185.00,
    rating: 4,
    reviews: 62,
    image: '/images/dubai_trade_hub_1793690293266.jpg',
    origin: 'Certified Commercial Plant',
    specs: 'Reinforced 20PR • Deep Tread Pattern • Somalia Terrain Tested',
    isFeatured: false
  },
  {
    id: 9,
    name: 'Premium Wheat Flour Baker Grade (50kg Bag)',
    category: 'Foodstuffs & Commodities',
    price: '$29.50',
    oldPrice: '$33.00',
    numericPrice: 29.50,
    rating: 5,
    reviews: 88,
    image: '/images/hero_global_shipping_1793690292263.jpg',
    origin: 'Direct Import via Dubai & Turkey Mills',
    specs: 'Fine Milled • High Gluten 11.5% • Premium Bakery Standard',
    isFeatured: false
  },
  {
    id: 10,
    name: 'Glazed Porcelain Floor Tiles 60x60cm (Box of 4)',
    category: 'Construction Steel & Cement',
    price: '$16.50',
    oldPrice: '$19.00',
    numericPrice: 16.50,
    rating: 5,
    reviews: 54,
    image: '/images/bosaso_port_trade_1793690293064.jpg',
    origin: 'Direct Import Spain & India',
    specs: 'Anti-Slip R10 • Polished Nano Coating • Heavy Foot Traffic',
    isFeatured: false
  },
  {
    id: 11,
    name: 'Deep Cycle Solar Gel Battery 12V 200Ah',
    category: 'Electronics & Solar Power',
    price: '$210.00',
    oldPrice: '$245.00',
    numericPrice: 210.00,
    rating: 5,
    reviews: 92,
    image: '/images/quality_inspection_1793690293588.jpg',
    origin: 'German Engineering Standard',
    specs: 'Maintenance-Free • 1500 Cycles at 50% DOD • 3 Year Warranty',
    isFeatured: false
  },
  {
    id: 12,
    name: 'Corrugated Galvanized Iron Roofing Sheets 0.40mm',
    category: 'Construction Steel & Cement',
    price: '$12.80',
    oldPrice: '$15.00',
    numericPrice: 12.80,
    rating: 4,
    reviews: 41,
    image: '/images/bosaso_port_trade_1793690293064.jpg',
    origin: 'Certified Regional Mills',
    specs: 'Zinc Coated 120g/m² • Rust Resistant • Standard 3m Length',
    isFeatured: false
  },
  {
    id: 13,
    name: 'Heavy Commercial Hydraulic Oil ISO VG 68 (208L Drum)',
    category: 'Heavy Machinery & Auto Parts',
    price: '$360.00',
    oldPrice: '$410.00',
    numericPrice: 360.00,
    rating: 5,
    reviews: 36,
    image: '/images/dubai_trade_hub_1793690293266.jpg',
    origin: 'UAE Blended / API Certified',
    specs: 'Anti-Wear AW68 • High Thermal Stability • Cranes & Heavy Plant',
    isFeatured: false
  },
  {
    id: 14,
    name: 'Pure Palm Olein Cooking Oil CP8 / CP10 (20L Jerrycan)',
    category: 'Foodstuffs & Commodities',
    price: '$24.50',
    oldPrice: '$27.50',
    numericPrice: 24.50,
    rating: 5,
    reviews: 104,
    image: '/images/dubai_trade_hub_1793690293266.jpg',
    origin: 'Direct Import Malaysia / Indonesia',
    specs: 'Cholesterol Free • Triple Refined • Commercial Food Service Lots',
    isFeatured: false
  }
];

const DEFAULT_SLIDES: SlideItem[] = [
  {
    title: "IDO GENERAL TRADING CO.",
    subtitle: "Global Sourcing, Ocean Imports & Reliable Port Delivery",
    badge: "Bosaso HQ & Dubai Corridor",
    desc: "IDO General Trading Company is a global trading partner that sources, imports, and distributes a diverse range of goods backed by ethical sourcing and regulatory compliance.",
    image: "/images/hero_global_shipping_1793690292263.jpg",
    offer: "Save 10% On Bulk Consignments"
  },
  {
    title: "FOODSTUFFS & COMMODITIES",
    subtitle: "Bulk Rice, Sugar, Cooking Oils & Wheat Flour",
    badge: "High Grade Bulk Consignments",
    desc: "Supplying premier commodities directly to wholesalers, retailers, and distribution networks in Puntland and Somalia with direct vessel offload in Bosaso Port.",
    image: "/images/bosaso_port_trade_1793690293064.jpg",
    offer: "Direct Vessel Offload In Bosaso"
  },
  {
    title: "BUILDING STEEL & SOLAR SYSTEMS",
    subtitle: "Grade 60 Steel Rebar, Cement & Commercial Solar Power",
    badge: "Certified Construction Quality",
    desc: "Heavy-duty building materials, structural beams, and tier-1 solar energy equipment backed by international certifications and strict quality control.",
    image: "/images/quality_inspection_1793690293588.jpg",
    offer: "Full Regulatory & Quality Compliance"
  }
];

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { name: 'Foodstuffs & Commodities', count: '120 Products', id: 'food', img: '/images/hero_global_shipping_1793690292263.jpg' },
  { name: 'Construction Steel & Cement', count: '85 Products', id: 'steel', img: '/images/bosaso_port_trade_1793690293064.jpg' },
  { name: 'Electronics & Solar Power', count: '94 Products', id: 'solar', img: '/images/quality_inspection_1793690293588.jpg' },
  { name: 'Heavy Machinery & Auto Parts', count: '65 Products', id: 'machinery', img: '/images/dubai_trade_hub_1793690293266.jpg' },
  { name: 'Ceramics, Tiles & Sanitary', count: '45 Products', id: 'tiles', img: '/images/bosaso_port_trade_1793690293064.jpg' },
  { name: 'General Cargo & Wholesale Goods', count: '150 Products', id: 'general', img: '/images/dubai_trade_hub_1793690293266.jpg' }
];

const DEFAULT_SETTINGS: CompanySettings = {
  name: 'IDO GENERAL TRADING COMPANY',
  shortName: 'IDO GTC',
  domain: 'https://idogtc.com/',
  bosasoPhone: '+252 90 512 4444',
  dubaiPhone: '+971 50 150 7332',
  email: 'idogtc2003@gmail.com',
  bosasoAddress: 'Main Commercial District, Bosaso Port Corridor, Puntland State, Somalia',
  dubaiAddress: 'Deira Commercial Zone & Jebel Ali Freezone Partner Logistics, Dubai, UAE',
  aboutText: 'IDO General Trading Company is a global trading partner that sources, imports, and distributes a diverse range of goods. We partner with manufacturers to deliver high-quality products at competitive prices with reliable service, backed by ethical sourcing and regulatory compliance.'
};

const DEFAULT_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'med-1',
    title: 'Cargo Ship & Global Sourcing (Hero)',
    url: '/images/hero_global_shipping_1793690292263.jpg',
    category: 'Logistics & Ocean Freight',
    date: '2026-11-01',
    isSystem: true
  },
  {
    id: 'med-2',
    title: 'Bosaso Port Offload & Steel Rebar',
    url: '/images/bosaso_port_trade_1793690293064.jpg',
    category: 'Port Facilities & Construction',
    date: '2026-11-01',
    isSystem: true
  },
  {
    id: 'med-3',
    title: 'Solar Quality Testing & Monocrystalline Modules',
    url: '/images/quality_inspection_1793690293588.jpg',
    category: 'Solar Energy & Electronics',
    date: '2026-11-01',
    isSystem: true
  },
  {
    id: 'med-4',
    title: 'Dubai Regional Trade Hub & Heavy Machinery',
    url: '/images/dubai_trade_hub_1793690293266.jpg',
    category: 'Dubai Trade Corridor',
    date: '2026-11-01',
    isSystem: true
  },
  {
    id: 'med-5',
    title: 'Commercial Cargo & Bento Presentation',
    url: '/images/design_option_bento_grid_1793872584356.jpg',
    category: 'Warehouse & Stock',
    date: '2026-11-01',
    isSystem: true
  },
  {
    id: 'med-6',
    title: 'Corporate Navy Trade Header',
    url: '/images/design_option_corporate_navy_1793872584467.jpg',
    category: 'Corporate Branding',
    date: '2026-11-01',
    isSystem: true
  },
  {
    id: 'med-7',
    title: 'Minimal Port & Offloading Terminal',
    url: '/images/design_option_minimal_hero_1793872584611.jpg',
    category: 'Port Terminal',
    date: '2026-11-01',
    isSystem: true
  }
];

const DEFAULT_PROMO_BANNERS: PromoBannerItem[] = [
  {
    id: 'promo-1',
    badge: 'Certified Quality Check',
    badgeSo: 'Tayo La Hubiyay',
    title: 'Direct Factory Contracts',
    titleSo: 'Heshiisyo Toos Warshadaha',
    description: 'We partner directly with audited manufacturers globally to guarantee genuine quality and wholesale factory prices.',
    descriptionSo: 'Waxaan toos ula shaqaynaa warshadaha ugu waaweyn dunida si aan u damaanad-qaadno tayo sugan iyo qiimo tartan geli kara.',
    image: '/images/quality_inspection_1793690293588.jpg',
    buttonText: 'Learn More',
    buttonTextSo: 'Wax Dheeraad Ah',
    buttonLink: 'about'
  },
  {
    id: 'promo-2',
    badge: 'Ocean Container Shipping',
    badgeSo: 'Rarka Maraakiibta & Kunteenarada',
    title: 'Bosaso & Dubai Delivery',
    titleSo: 'Keenista Boosaaso & Dubai',
    description: 'Full customs clearance management, port offloading, and regional transport across Puntland & Somalia markets.',
    descriptionSo: 'Maamul buuxa oo dhinaca kastamka, dejinta dekadda, iyo gaarsiinta suuqyada Puntland iyo Soomaaliya.',
    image: '/images/bosaso_port_trade_1793690293064.jpg',
    buttonText: 'Contact Us',
    buttonTextSo: 'Xiriirka',
    buttonLink: 'contact'
  }
];

const DEFAULT_PARTNERS: PartnerItem[] = [
  { id: 'part-1', name: 'BOSASO PORT', tag: 'Puntland Corridor', tagSo: 'Marfada Boosaaso', iconType: 'port' },
  { id: 'part-2', name: 'DP WORLD', tag: 'Dubai Trade Hub', tagSo: 'Xarunta Dubai', iconType: 'globe' },
  { id: 'part-3', name: 'ISO 9001', tag: 'Quality Assurance', tagSo: 'Tayo La Hubiyay', iconType: 'iso' },
  { id: 'part-4', name: 'TIER-1 SOLAR', tag: 'Direct Procurement', tagSo: 'Keenid Toos Ah', iconType: 'solar' },
  { id: 'part-5', name: 'COMMODITIES', tag: 'Bulk Food Sourcing', tagSo: 'Rarka Raashinka', iconType: 'food' },
  { id: 'part-6', name: 'OCEAN FREIGHT', tag: 'Container Logistics', tagSo: 'Kunteenarada Maraakiibta', iconType: 'freight' }
];


export const DEFAULT_STATE = { products: DEFAULT_PRODUCTS, slides: DEFAULT_SLIDES, categories: DEFAULT_CATEGORIES, companySettings: DEFAULT_SETTINGS, mediaItems: DEFAULT_MEDIA_ITEMS, promoBanners: DEFAULT_PROMO_BANNERS, partners: DEFAULT_PARTNERS };
