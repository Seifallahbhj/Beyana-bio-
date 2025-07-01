import { useEffect, useState } from "react";
import apiService from "../services/api";

export interface Category {
  _id: string;
  name: string;
}

export default function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    apiService.get("/categories").then(res => {
      setCategories(res.data.data.categories);
    });
  }, []);
  return categories;
}
