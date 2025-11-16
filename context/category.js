'use client';
import { createContext, useState, useContext } from 'react';
import toast from 'react-hot-toast';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [updatingCategory, setUpdatingCategory] = useState(null);

  // ------------------------------
  // 1️⃣ إنشاء تصنيف جديد
  // ------------------------------
  const createCategory = async () => {
    if (!name.trim()) return toast.error('من فضلك أدخل اسم التصنيف');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/category`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('خطأ عند إنشاء التصنيف:', errorData);
        return toast.error(errorData.err || 'فشل إنشاء التصنيف');
      }

      const newlyCreatedCategory = await response.json();
      setCategories([newlyCreatedCategory, ...categories]);
      setName('');
      toast.success('تم إنشاء التصنيف بنجاح');
    } catch (err) {
      console.error('❌ فشل إنشاء التصنيف:', err);
      toast.error('حدث خطأ أثناء إنشاء التصنيف');
    }
  };

  // ------------------------------
  // 2️⃣ جلب كل التصنيفات
  // ------------------------------
  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/category`
      );
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('❌ خطأ في جلب التصنيفات:', err);
      toast.error('حدث خطأ أثناء جلب التصنيفات');
    }
  };

  // ------------------------------
  // 3️⃣ تحديث تصنيف
  // ------------------------------
  const updateCategory = async () => {
    if (!updatingCategory) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/category/${updatingCategory._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: updatingCategory.name }),
        }
      );

      if (!response.ok) throw new Error('Network response was not ok');

      const updatedCategory = await response.json();

      setCategories((prev) =>
        prev.map((c) => (c._id === updatedCategory._id ? updatedCategory : c))
      );
      setUpdatingCategory(null);
      toast.success('تم تحديث التصنيف بنجاح');
    } catch (err) {
      console.error('❌ فشل تحديث التصنيف:', err);
      toast.error('حدث خطأ أثناء تحديث التصنيف');
    }
  };

  // ------------------------------
  // 4️⃣ حذف تصنيف
  // ------------------------------
  const deleteCategory = async () => {
    if (!updatingCategory) return;
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/category/${updatingCategory._id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Network response was not ok');

      const deletedCategory = await response.json();

      setCategories((prev) =>
        prev.filter((c) => c._id !== deletedCategory._id)
      );
      setUpdatingCategory(null);
      toast.success('تم حذف التصنيف بنجاح');
    } catch (err) {
      console.error('❌ فشل حذف التصنيف:', err);
      toast.error('حدث خطأ أثناء حذف التصنيف');
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        name,
        setName,
        categories,
        setCategories,
        updatingCategory,
        setUpdatingCategory,
        createCategory,
        fetchCategories,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => useContext(CategoryContext);
