import type { Category } from '../types/Category';

const STORAGE_KEY = 'categories';

export function getCategories(): Category[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as Category[];
  } catch {
    return [];
  }
}

export function saveCategories(categories: Category[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(categories)
  );

  window.dispatchEvent(
    new CustomEvent('categoriesUpdated')
  );
}

export function addCategory(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return false;
  }

  const categories = getCategories();

  const alreadyExists = categories.some(
    (category) =>
      category.name.toLowerCase() ===
      trimmedName.toLowerCase()
  );

  if (alreadyExists) {
    return false;
  }

  const newCategory: Category = {
    id: Date.now(),
    name: trimmedName,
    createdAt: new Date().toISOString(),
  };

  saveCategories([
    ...categories,
    newCategory,
  ]);

  return true;
}

export function updateCategory(
  id: number,
  name: string
) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return false;
  }

  const categories = getCategories();

  const alreadyExists = categories.some(
    (category) =>
      category.id !== id &&
      category.name.toLowerCase() ===
        trimmedName.toLowerCase()
  );

  if (alreadyExists) {
    return false;
  }

  const updatedCategories = categories.map(
    (category) =>
      category.id === id
        ? {
            ...category,
            name: trimmedName,
          }
        : category
  );

  saveCategories(updatedCategories);

  return true;
}

export function deleteCategory(id: number) {
  const categories = getCategories();

  const updatedCategories = categories.filter(
    (category) => category.id !== id
  );

  saveCategories(updatedCategories);
}