import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/article";

interface Photo {
  url: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  published_at: string;
  photos: Photo[];
}

interface ArticleState {
  articles: Article[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ArticleState = {
  articles: [],
  status: "idle",
  error: null,
};

export const fetchArticles = createAsyncThunk("articles/fetchAll", async () => {
  const response = await api.get("/articles");
  return response.data.data;
});

const articleSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchArticles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.articles = action.payload;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to fetch articles";
      });
  },
});

export default articleSlice.reducer;
