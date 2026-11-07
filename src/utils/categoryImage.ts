import type { CategoryItem, Product } from '../types/store';

// Imported category icons can use a product photo once one is available.
// A category image explicitly chosen by the owner always takes precedence.
export function categoryImage(category: CategoryItem, products: Product[]): string {
  if (category.img && !/^\/images\/catalogue\/excel-(bm|pt)-\d+\.svg$/.test(category.img)) return category.img;
  return products.find(product => product.category === category.name && product.image &&
    !/^\/images\/catalogue\//.test(product.image))?.image || category.img;
}
