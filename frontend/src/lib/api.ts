import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Article {
  id: number;
  source: string;
  title: string;
  excerpt: string;
  link: string;
  image_url: string | null;
  published_at: string;
  category: string | null;
}

interface ArticlesResponse {
  count: number;
  articles: Article[];
}

interface Category {
  category: string;
  article_count: number;
}

interface ArchivePeriod {
  period: number;
  article_count: number;
}

export async function fetchArchivePeriods(
  granularity: 'year' | 'month' | 'day',
  year?: number,
  month?: number
): Promise<{ granularity: string; periods: ArchivePeriod[] }> {
  const res = await axios.get(`${API_URL}/archive/periods`, {
    params: { granularity, ...(year ? { year } : {}), ...(month ? { month } : {}) },
  });
  return res.data;
}

export async function submitContactForm(payload: {
  name: string;
  email: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await axios.post(`${API_URL}/contact`, payload);
  return res.data;
}

export async function fetchCategories(): Promise<{ categories: Category[] }> {
  const res = await axios.get(`${API_URL}/categories`);
  return res.data;
}

export async function fetchPopularArticles(limit: number = 8): Promise<ArticlesResponse> {
  const res = await axios.get(`${API_URL}/articles/popular`, {
    params: { limit },
  });
  return res.data;
}

export async function registerView(id: number): Promise<void> {
  await axios.post(`${API_URL}/articles/${id}/view`);
}

interface SourceCount {
  source: string;
  article_count: number;
}

export async function fetchArticles(
  offset: number,
  limit: number = 12,
  source?: string,
  search?: string
): Promise<ArticlesResponse> {
  const res = await axios.get(`${API_URL}/articles`, {
    params: {
      offset,
      limit,
      ...(source ? { source } : {}),
      ...(search ? { search } : {}),
    },
  });
  return res.data;
}

export async function fetchArticleById(id: number): Promise<Article> {
  const res = await axios.get(`${API_URL}/articles/${id}`);
  return res.data;
}

export async function fetchSources(): Promise<{ sources: SourceCount[] }> {
  const res = await axios.get(`${API_URL}/sources`);
  return res.data;
}
