import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./app/hook";
import { fetchArticles } from "./feature/articles/articleSlice";
import api from "./api/article";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

interface Photo {
  url: string;
}

interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  photos?: Photo[];
}

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { articles, status } = useAppSelector((state) => state.articles);

  const [modalOpen, setModalOpen] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | null>(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<FileList | null>(null);

  useEffect(() => {
    dispatch(fetchArticles());
  }, [dispatch]);

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setContent("");
    setPhotos(null);
    setEditArticle(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("summary", summary);
    formData.append("content", content);
    if (photos)
      Array.from(photos).forEach((photo) => formData.append("photos[]", photo));

    if (editArticle) {
      await api.put(`/articles/${editArticle.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await api.post("/articles", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    dispatch(fetchArticles());
    resetForm();
    setModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure to delete this article?")) {
      await api.delete(`/articles/${id}`);
      dispatch(fetchArticles());
    }
  };

  const handleEdit = (article: Article) => {
    setEditArticle(article);
    setTitle(article.title);
    setSummary(article.summary);
    setContent(article.content);
    setModalOpen(true);
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4 bg-green-600 text-white">
            + Create Article
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editArticle ? "Edit Article" : "Create Article"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              placeholder="Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
            <Textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <input
              type="file"
              multiple
              onChange={(e) => setPhotos(e.target.files)}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{editArticle ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <Card key={article.id} className="border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {article.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{article.summary}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {article.photos?.map((p, idx) => (
                  <img
                    key={idx}
                    src={`http://localhost:8081${p.url}`}
                    alt={article.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEdit(article)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(article.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
