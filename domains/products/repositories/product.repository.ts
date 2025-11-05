/**
 * Products Repository
 * 
 * All queries are automatically filtered by the authenticated user's account.
 * Products belong to accounts through the 'accountId' field.
 */

'use server';

import { getUserWithAccount } from '@/domains/users/repositories/user.repository';
import { Database } from '@/domains/core/database/firestore.client';
import { FieldValue } from 'firebase-admin/firestore';
import type { Product } from '../types/product.types';

const PRODUCTS_COLLECTION = 'products';

/**
 * Creates a new product for the authenticated user's account
 * 
 * @example
 * const product = await createProduct({
 *   name: 'Buquê de Rosas',
 *   description: 'Arranjo com 12 rosas vermelhas',
 *   ingredients: [...]
 * });
 */
export async function createProduct(
  data: Omit<Product, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>
): Promise<Product> {
  // 1. Get authenticated user and account from session
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  const { account } = userAccount;

  const db = await Database();
  const productRef = db.collection(PRODUCTS_COLLECTION).doc();

  const productData = {
    ...data,
    accountId: account.id, // ← Product belongs to account
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await productRef.set(productData);

  return {
    id: productRef.id,
    ...productData,
  } as Product;
}

/**
 * Gets all products for the authenticated user's account
 * 
 * @example
 * const products = await getProducts();
 * // Returns only products where accountId = current user's account
 */
export async function getProducts(): Promise<Product[]> {
  // 1. Get authenticated user and account
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    return [];
  }

  const { account } = userAccount;

  const db = await Database();

  // 2. Query filtered by accountId
  const snapshot = await db
    .collection(PRODUCTS_COLLECTION)
    .where('accountId', '==', account.id) // ← Only account's products
    .orderBy('createdAt', 'desc')
    .get();

  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}

/**
 * Gets a single product by ID
 * Validates that the product belongs to the authenticated user's account
 * 
 * @example
 * const product = await getProductById('product-123');
 * // Returns null if product doesn't exist or doesn't belong to account
 */
export async function getProductById(
  productId: string
): Promise<Product | null> {
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    return null;
  }

  const { account } = userAccount;

  const db = await Database();
  const productDoc = await db
    .collection(PRODUCTS_COLLECTION)
    .doc(productId)
    .get();

  if (!productDoc.exists) {
    return null;
  }

  const product = productDoc.data() as Product;

  // Validate account ownership
  if (product.accountId !== account.id) {
    console.warn(
      `[Security] Account ${account.id} tried to access product ${productId} owned by account ${product.accountId}`
    );
    return null;
  }

  return {
    ...product,
    id: productDoc.id,
  };
}

/**
 * Updates a product
 * Validates account ownership before updating
 * 
 * @example
 * await updateProduct('product-123', {
 *   name: 'Novo nome',
 *   price: 150.00
 * });
 */
export async function updateProduct(
  productId: string,
  data: Partial<Omit<Product, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  const { account } = userAccount;

  const db = await Database();
  const productRef = db.collection(PRODUCTS_COLLECTION).doc(productId);

  // 1. Get product to validate ownership
  const productDoc = await productRef.get();
  if (!productDoc.exists) {
    throw new Error('Product not found');
  }

  const product = productDoc.data() as Product;

  // 2. Validate account ownership
  if (product.accountId !== account.id) {
    throw new Error(
      'Forbidden: You do not have permission to update this product'
    );
  }

  // 3. Update
  await productRef.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Deletes a product
 * Validates account ownership before deleting
 * 
 * @example
 * await deleteProduct('product-123');
 */
export async function deleteProduct(productId: string): Promise<void> {
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  const { account } = userAccount;

  const db = await Database();
  const productRef = db.collection(PRODUCTS_COLLECTION).doc(productId);

  // 1. Get product to validate ownership
  const productDoc = await productRef.get();
  if (!productDoc.exists) {
    throw new Error('Product not found');
  }

  const product = productDoc.data() as Product;

  // 2. Validate account ownership
  if (product.accountId !== account.id) {
    throw new Error(
      'Forbidden: You do not have permission to delete this product'
    );
  }

  // 3. Delete
  await productRef.delete();
}

/**
 * Gets products that need price recalculation
 * (when ingredients changed)
 * 
 * @example
 * const outdated = await getProductsNeedingRecalculation();
 */
export async function getProductsNeedingRecalculation(): Promise<Product[]> {
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    return [];
  }

  const { account } = userAccount;

  const db = await Database();

  // Query products with needsRecalculation flag
  const snapshot = await db
    .collection(PRODUCTS_COLLECTION)
    .where('accountId', '==', account.id) // ← Always filter by account
    .where('needsRecalculation', '==', true)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}
