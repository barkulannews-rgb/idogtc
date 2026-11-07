import { LOGO_DATA_URL } from './logoData';

/**
 * Generates exact standalone index.html code matching HTML Codex MultiShop template (item=1479)
 * with IDO GTC branding, commodities, steel, solar products, and WhatsApp links.
 */
export function generateStandaloneHtmlCode(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>IDO General Trading Company | idogtc.com</title>
  <meta content="width=device-width, initial-scale=1.0" name="viewport">
  <meta content="IDO General Trading Company, Sourcing, Import, Export, Bosaso, Somalia, Dubai" name="keywords">
  <meta content="IDO General Trading Company is a global trading partner that sources, imports, and distributes a diverse range of goods." name="description">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">  
  <style>
    body { font-family: 'Roboto', sans-serif; background-color: #F5F5F5; color: #3D464D; }
    .bg-primary { background-color: #FFD333 !important; }
    .text-primary { color: #FFD333 !important; }
    .bg-dark { background-color: #3D464D !important; }
  </style>
</head>
<body>

  <!-- Topbar Start -->
  <div class="bg-[#F5F5F5] border-b border-[#E5E5E5] text-xs py-2 px-4 hidden md:block">
    <div class="max-w-7xl mx-auto flex justify-between items-center text-[#6C757D]">
      <div class="flex items-center gap-4">
        <span>About Us</span> | <span>Contact</span> | <span>Help</span> | <span>FAQs</span>
      </div>
      <div class="flex items-center gap-4 font-mono text-[#3D464D]">
        <span>📞 Bosaso HQ: +252 90 512 4444</span> | 
        <span>🏢 Dubai Hub: +971 50 150 7332</span> | 
        <span>✉️ idogtc2003@gmail.com</span>
      </div>
    </div>
  </div>

  <!-- Logo and Search Start -->
  <div class="bg-white py-4 px-4 border-b border-[#E5E5E5]">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-full p-1 bg-[#FFD333]">
          <img src="${LOGO_DATA_URL}" alt="IDO GTC Logo" class="w-full h-full object-contain rounded-full bg-white" />
        </div>
        <div>
          <a href="#" class="text-3xl font-extrabold uppercase text-[#3D464D]">
            <span class="bg-[#3D464D] text-[#FFD333] px-2 py-0.5 mr-1">IDO</span><span>GTC</span>
          </a>
          <span class="block text-[10px] font-bold tracking-widest text-[#6C757D] uppercase">
            General Trading Company • Bosaso & Dubai
          </span>
        </div>
      </div>
      <div class="w-full md:w-1/2 flex">
        <input type="text" placeholder="Search for commodities, steel, food, electronics..." class="w-full p-2.5 border border-[#ced4da] rounded-l text-sm outline-none">
        <button class="bg-[#FFD333] text-[#3D464D] px-5 font-bold rounded-r">Search</button>
      </div>
      <div class="hidden lg:block text-right">
        <span class="block text-xs text-[#6C757D]">Customer Service:</span>
        <span class="block text-sm font-bold font-mono text-[#3D464D]">+252 90 512 4444</span>
      </div>
    </div>
  </div>

  <!-- Navbar Start -->
  <div class="bg-[#3D464D] text-white">
    <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-stretch">
      <div class="bg-[#FFD333] text-[#3D464D] px-6 py-4 font-bold text-sm uppercase flex items-center justify-between md:w-64">
        <span>Categories</span>
        <span>▼</span>
      </div>
      <nav class="flex-1 flex items-center px-4 py-3 md:py-0 text-sm font-semibold uppercase gap-6 text-[#E5E5E5]">
        <a href="#" class="text-[#FFD333]">Home</a>
        <a href="#featured" class="hover:text-[#FFD333]">Shop</a>
        <a href="#about" class="hover:text-[#FFD333]">About</a>
        <a href="#contact" class="hover:text-[#FFD333]">Contact</a>
      </nav>
      <div class="py-2">
        <a href="https://wa.me/252905124444" target="_blank" class="bg-[#FFD333] text-[#3D464D] px-4 py-2 rounded text-xs font-bold uppercase inline-block">WhatsApp HQ</a>
      </div>
    </div>
  </div>

  <!-- Carousel / Hero Start -->
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 bg-[#3D464D] text-white p-8 sm:p-12 rounded relative overflow-hidden flex items-center min-h-[400px]">
        <div class="relative z-10 max-w-xl space-y-4">
          <span class="bg-[#FFD333] text-[#3D464D] text-xs font-bold uppercase px-3 py-1 rounded">Sourcing & Distribution</span>
          <h1 class="text-4xl sm:text-5xl font-extrabold uppercase">IDO GENERAL TRADING CO.</h1>
          <p class="text-sm text-[#E5E5E5] leading-relaxed">
            IDO General Trading Company is a global trading partner that sources, imports, and distributes a diverse range of goods. We partner with manufacturers to deliver high-quality products at competitive prices with reliable service, backed by ethical sourcing and regulatory compliance.
          </p>
          <a href="https://wa.me/252905124444" target="_blank" class="inline-block bg-[#FFD333] text-[#3D464D] font-extrabold text-xs uppercase px-6 py-3 rounded">Inquire Wholesale</a>
        </div>
      </div>
      <div class="lg:col-span-4 flex flex-col gap-6">
        <div class="bg-[#1E293B] text-white p-6 rounded flex-1 flex flex-col justify-end border border-[#334155]">
          <span class="text-xs text-[#FFD333] font-bold uppercase">Bosaso Port HQ</span>
          <h3 class="text-xl font-bold uppercase">Port Cargo Delivery</h3>
          <p class="text-xs text-[#CBD5E1] my-1">Somalia Phone: +252 90 512 4444</p>
          <a href="tel:+252905124444" class="inline-block bg-[#FFD333] text-[#3D464D] text-xs font-bold px-3 py-1.5 rounded uppercase mt-2 w-max">Call HQ</a>
        </div>
        <div class="bg-[#1E293B] text-white p-6 rounded flex-1 flex flex-col justify-end border border-[#334155]">
          <span class="text-xs text-[#FFD333] font-bold uppercase">Dubai Hub</span>
          <h3 class="text-xl font-bold uppercase">UAE Sourcing Center</h3>
          <p class="text-xs text-[#CBD5E1] my-1">Dubai Phone: +971 50 150 7332</p>
          <a href="tel:+971501507332" class="inline-block bg-[#FFD333] text-[#3D464D] text-xs font-bold px-3 py-1.5 rounded uppercase mt-2 w-max">Call Dubai</a>
        </div>
      </div>
    </div>
  </div>

  <!-- Featured Products Start -->
  <div id="featured" class="max-w-7xl mx-auto px-4 py-8">
    <h2 class="text-2xl font-extrabold uppercase text-[#3D464D] mb-6 flex items-center gap-3">
      <span class="bg-[#3D464D] text-[#FFD333] px-3 py-1">FEATURED PRODUCTS</span>
      <span class="h-0.5 bg-[#E5E5E5] flex-1"></span>
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <div class="bg-white p-4 shadow-sm border border-[#E5E5E5] text-center space-y-2">
        <div class="h-44 bg-[#F5F5F5] rounded flex items-center justify-center text-4xl">🍚</div>
        <h3 class="font-bold text-sm text-[#3D464D]">Basmati Long Grain Rice (50kg)</h3>
        <p class="text-base font-extrabold text-[#3D464D]">$34.50 <span class="text-xs text-[#6C757D] line-through">$39.00</span></p>
        <a href="https://wa.me/252905124444" target="_blank" class="block bg-[#3D464D] text-white py-2 text-xs font-bold uppercase rounded hover:bg-[#FFD333] hover:text-[#3D464D]">Order WhatsApp</a>
      </div>

      <div class="bg-white p-4 shadow-sm border border-[#E5E5E5] text-center space-y-2">
        <div class="h-44 bg-[#F5F5F5] rounded flex items-center justify-center text-4xl">🏗️</div>
        <h3 class="font-bold text-sm text-[#3D464D]">Steel Rebar Grade 60 (Per Ton)</h3>
        <p class="text-base font-extrabold text-[#3D464D]">$680.00 <span class="text-xs text-[#6C757D] line-through">$740.00</span></p>
        <a href="https://wa.me/252905124444" target="_blank" class="block bg-[#3D464D] text-white py-2 text-xs font-bold uppercase rounded hover:bg-[#FFD333] hover:text-[#3D464D]">Order WhatsApp</a>
      </div>

      <div class="bg-white p-4 shadow-sm border border-[#E5E5E5] text-center space-y-2">
        <div class="h-44 bg-[#F5F5F5] rounded flex items-center justify-center text-4xl">⚡</div>
        <h3 class="font-bold text-sm text-[#3D464D]">Solar Panel Monocrystalline 550W</h3>
        <p class="text-base font-extrabold text-[#3D464D]">$115.00 <span class="text-xs text-[#6C757D] line-through">$135.00</span></p>
        <a href="https://wa.me/252905124444" target="_blank" class="block bg-[#3D464D] text-white py-2 text-xs font-bold uppercase rounded hover:bg-[#FFD333] hover:text-[#3D464D]">Order WhatsApp</a>
      </div>

      <div class="bg-white p-4 shadow-sm border border-[#E5E5E5] text-center space-y-2">
        <div class="h-44 bg-[#F5F5F5] rounded flex items-center justify-center text-4xl">🌻</div>
        <h3 class="font-bold text-sm text-[#3D464D]">Sunflower Cooking Oil (20L)</h3>
        <p class="text-base font-extrabold text-[#3D464D]">$28.00 <span class="text-xs text-[#6C757D] line-through">$32.00</span></p>
        <a href="https://wa.me/252905124444" target="_blank" class="block bg-[#3D464D] text-white py-2 text-xs font-bold uppercase rounded hover:bg-[#FFD333] hover:text-[#3D464D]">Order WhatsApp</a>
      </div>

    </div>
  </div>

  <!-- Footer Start -->
  <footer class="bg-[#3D464D] text-[#E5E5E5] py-10 mt-12 text-xs">
    <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h4 class="text-sm font-bold text-[#FFD333] uppercase mb-2">IDO General Trading Co.</h4>
        <p>Global trading partner that sources, imports, and distributes goods with reliable service.</p>
        <p class="mt-2 text-[#94A3B8]">Domain: https://idogtc.com/</p>
      </div>
      <div>
        <h4 class="text-sm font-bold text-[#FFD333] uppercase mb-2">Bosaso Headquarter (Somalia)</h4>
        <p>Main Commercial Street, Bosaso Port District, Puntland.</p>
        <p class="font-mono mt-1">Phone: +252 90 512 4444</p>
      </div>
      <div>
        <h4 class="text-sm font-bold text-[#FFD333] uppercase mb-2">Dubai Hub (UAE)</h4>
        <p>Deira & Jebel Ali Freezone Trading Corridor, Dubai, UAE.</p>
        <p class="font-mono mt-1">Phone: +971 50 150 7332</p>
        <p class="mt-1">Email: idogtc2003@gmail.com</p>
      </div>
    </div>
    <div class="text-center text-[#94A3B8] border-t border-[#525D66] mt-8 pt-4">
      © 2026 IDO General Trading Company. All Rights Reserved. MultiShop Template Design.
    </div>
  </footer>

</body>
</html>`;
}
