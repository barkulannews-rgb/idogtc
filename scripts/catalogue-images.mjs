import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as icons from 'lucide-react';

const data = JSON.parse(fs.readFileSync('catalogue/idogtc-catalogue-2026-11.json', 'utf8'));
const symbols = ['BrickWall','Mountain','Hammer','ShowerHead','Plug','Layers','DoorOpen','ShieldCheck','TreePine','HardHat','PaintRoller','House','PaintBucket','Paintbrush','Factory','Droplets','Layers','Wrench'];
const captions = ['CEMENT & STRUCTURE','SAND & AGGREGATES','HARDWARE & TOOLS','PLUMBING & SANITARY','ELECTRICAL','FLOORING & FINISHES','ROOFING & DOORS','INSULATION','TIMBER & FORMWORK','MACHINERY & SAFETY','INTERIOR PAINTS','EXTERIOR PAINTS','PRIMERS & SEALERS','METAL & WOOD COATINGS','INDUSTRIAL COATINGS','WATERPROOFING','FILLERS & PUTTY','PAINTING TOOLS'];
fs.mkdirSync('public/images/catalogue', { recursive: true });
for (const [index, category] of data.categories.entries()) {
  const Icon = icons[symbols[index]] || icons.Package;
  const icon = renderToStaticMarkup(React.createElement(Icon, { width: 132, height: 132, color: '#3D464D', strokeWidth: 1.25 }));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><rect width="640" height="480" fill="#F5F5F5"/><circle cx="320" cy="205" r="116" fill="#FFF3C4"/><g transform="translate(254 139)">${icon}</g><text x="320" y="370" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#3D464D">${captions[index].replaceAll('&','&amp;')}</text><text x="320" y="410" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="#6C757D">IDO GTC · ILLUSTRATION</text></svg>`;
  fs.writeFileSync(`public/images/catalogue/${category.id}.svg`, svg);
}
console.log(`Created ${data.categories.length} clearly labelled category illustrations.`);
