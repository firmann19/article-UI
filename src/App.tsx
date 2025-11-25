import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./app/hook";
import { fetchArticles } from "./feature/articles/articleSlice";
import api from "./api/article";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { articles, status } = useAppSelector((state) => state.articles);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<FileList | null>(null);

  useEffect(() => {
    dispatch(fetchArticles());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("summary", summary);
    formData.append("content", content);
    if (photos) {
      Array.from(photos).forEach((photo) => formData.append("photos[]", photo));
    }

    await api.post("/articles", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    dispatch(fetchArticles());
    setTitle("");
    setSummary("");
    setContent("");
    setPhotos(null);
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Articles Admin</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="file"
          multiple
          onChange={(e) => setPhotos(e.target.files)}
          className="mb-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Article
        </button>
      </form>

      <ul>
        {articles.map((a) => (
          <li key={a.id} className="mb-4 border p-2 rounded">
            <h2 className="font-semibold">{a.title}</h2>
            {a.photos?.map((p, idx) => (
              <img
                key={idx}
                src={`http://localhost:8081${p.url}`}
                alt={a.title}
                className="w-32 h-20 object-cover mr-2"
              />
            ))}
            <p>{a.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
