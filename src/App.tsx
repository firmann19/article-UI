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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

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

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmEdit, setConfirmEdit] = useState<Article | null>(null);

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

    try {
      if (editArticle) {
        await api.put(`/articles/${editArticle.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Article updated successfully!");
      } else {
        await api.post("/articles", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Article created successfully!");
      }

      dispatch(fetchArticles());
      resetForm();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save article!");
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const handleConfirmDeleteAction = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/articles/${deleteId}`);
      dispatch(fetchArticles());
      toast.success("Article deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete article!");
    }

    setDeleteId(null);
  };

  const handleOpenEditConfirm = (article: Article) => {
    setConfirmEdit(article);
  };

  const handleConfirmEdit = () => {
    if (!confirmEdit) return;
    setEditArticle(confirmEdit);
    setTitle(confirmEdit.title);
    setSummary(confirmEdit.summary);
    setContent(confirmEdit.content);
    setModalOpen(true);
    setConfirmEdit(null);
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <Button
            className="mb-4 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
          >
            <Plus size={18} />
            Create Article
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editArticle ? "Edit Article" : "Create Article"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
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

            <div>
              <p className="text-sm font-medium mb-1">Photos</p>

              <label
                htmlFor="uploadPhotos"
                className="w-full cursor-pointer border rounded-lg flex items-center justify-between px-3 py-2 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 transition"
              >
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {photos?.length
                    ? `${photos.length} file selected`
                    : "Choose photos to upload"}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  className="pointer-events-none"
                >
                  Upload
                </Button>
              </label>

              <input
                id="uploadPhotos"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setPhotos(e.target.files)}
              />

              {photos && photos.length > 0 && (
                <ul className="mt-2 text-xs text-gray-500">
                  {Array.from(photos).map((file, index) => (
                    <li key={index}>• {file.name}</li>
                  ))}
                </ul>
              )}
            </div>

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

              <Button className="bg-blue-600 hover:bg-blue-700" type="submit">
                {editArticle ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!photoPreview} onOpenChange={() => setPhotoPreview(null)}>
        <DialogContent className="max-w-[700px] p-0 overflow-hidden">
          <img
            src={photoPreview || ""}
            className="w-full h-auto object-contain"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Article?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600">
            This action cannot be undone. Are you sure you want to delete it?
          </p>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmDeleteAction}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmEdit} onOpenChange={() => setConfirmEdit(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Article?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600">
            Do you want to edit this article?
          </p>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setConfirmEdit(null)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleConfirmEdit}
            >
              Edit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="border rounded-xl overflow-hidden shadow-lg mt-4">
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-gray-800 border-b">
            <TableRow>
              <TableHead className="w-[50px] text-center font-bold">
                No
              </TableHead>
              <TableHead className="w-[200px] text-center font-bold">
                Title
              </TableHead>
              <TableHead className="w-[300px] text-center font-bold">
                Summary
              </TableHead>
              <TableHead className="w-[300px] text-center font-bold">
                Content
              </TableHead>
              <TableHead className="text-center font-bold">Photos</TableHead>
              <TableHead className="text-center font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {articles.map((article, idx) => (
              <TableRow key={article.id}>
                <TableCell className="text-center">{idx + 1}</TableCell>

                <TableCell className="text-center font-semibold max-w-[200px] truncate">
                  {article.title}
                </TableCell>

                <TableCell className="text-center text-sm max-w-[300px]">
                  {article.summary}
                </TableCell>

                <TableCell className="text-center text-sm max-w-[300px] truncate">
                  {article.content}
                </TableCell>

                <TableCell className="text-center">
                  <div className="flex flex-wrap justify-center items-center gap-2">
                    {article.photos?.slice(0, 3).map((p, pIdx) => (
                      <img
                        key={pIdx}
                        src={`http://localhost:8081${p.url}`}
                        alt={`Photo ${pIdx + 1}`}
                        onClick={() =>
                          setPhotoPreview(`http://localhost:8081${p.url}`)
                        }
                        className="w-12 h-12 object-cover rounded-lg border cursor-pointer hover:scale-105 transition-transform"
                      />
                    ))}

                    {article.photos && article.photos.length > 3 && (
                      <span className="text-xs">
                        +{article.photos.length - 3}
                      </span>
                    )}

                    {(!article.photos || article.photos.length === 0) && (
                      <span className="text-xs italic text-gray-400 pt-3">
                        No Photo
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <div className="flex justify-center gap-2 pt-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleOpenEditConfirm(article)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => handleDelete(article.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {articles.length === 0 && (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-b-xl">
            <p className="text-lg font-medium">No articles found.</p>
            <p className="text-sm">
              Click 'Create Article' to add new content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
