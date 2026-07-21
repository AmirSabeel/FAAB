"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ImagePlus,
  Pencil,
  Trash2,
  Plus,
  Save,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
  ImageIcon,
  Link as LinkIcon,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { adminFetch } from "@/lib/admin-fetch";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  image: string;
  link: string;
  sortOrder: number;
  isActive: boolean;
}

interface Collection {
  id: string;
  name: string;
  image: string;
  itemCount: number;
  link: string;
  sortOrder: number;
  isActive: boolean;
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-medium text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Slide Manager ───────────────────────────────────────────────────────────

function SlideManager() {
  const qc = useQueryClient();
  const { data: slides = [], isLoading } = useQuery<Slide[]>({
    queryKey: ["admin-slides"],
    queryFn: () => adminFetch("/api/admin/homepage/slides").then((r) => r.json()),
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Slide>>({});

  const saveMutation = useMutation({
    mutationFn: (data: Partial<Slide> & { id: string }) =>
      adminFetch("/api/admin/homepage/slides", {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-slides"] });
      setEditing(null);
      setForm({});
      toast.success("Slide updated");
    },
    onError: () => toast.error("Failed to update slide"),
  });

  const addMutation = useMutation({
    mutationFn: (data: Partial<Slide>) =>
      adminFetch("/api/admin/homepage/slides", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-slides"] });
      setForm({});
      toast.success("Slide added");
    },
    onError: () => toast.error("Failed to add slide"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/api/admin/homepage/slides?id=${id}`, { method: "DELETE" }).then(
        (r) => r.json()
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-slides"] });
      toast.success("Slide deleted");
    },
  });

  const startEdit = (slide: Slide) => {
    setEditing(slide.id);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle,
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink,
      image: slide.image,
      sortOrder: slide.sortOrder,
      isActive: slide.isActive,
    });
  };

  const startAdd = () => {
    setEditing("new");
    setForm({
      title: "",
      subtitle: "",
      ctaText: "Shop Now",
      ctaLink: "/shop",
      image: "",
      sortOrder: slides.length,
      isActive: true,
    });
  };

  const isEditing = editing !== null;

  return (
    <div className="space-y-3">
      {!isEditing && (
        <button
          onClick={startAdd}
          className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-gold/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      )}

      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              {editing === "new" ? "New Slide" : "Edit Slide"}
            </h4>
            <button
              onClick={() => {
                setEditing(null);
                setForm({});
              }}
              className="p-1 hover:bg-muted rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Hero Image (1920px wide recommended)
            </label>
            <ImageUpload
              value={form.image || ""}
              onChange={(val) => setForm((f) => ({ ...f, image: val }))}
            />
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Title (use \n for line break)
            </label>
            <textarea
              value={form.title || ""}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:border-gold outline-none resize-none"
              placeholder="The New\nSeason Arrives"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Subtitle
            </label>
            <textarea
              value={form.subtitle || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, subtitle: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:border-gold outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                CTA Text
              </label>
              <input
                value={form.ctaText || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ctaText: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:border-gold outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                CTA Link
              </label>
              <input
                value={form.ctaLink || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ctaLink: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:border-gold outline-none"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (editing === "new") {
                addMutation.mutate(form);
              } else {
                saveMutation.mutate({ id: editing, ...form });
              }
            }}
            disabled={saveMutation.isPending || addMutation.isPending || !form.title || !form.image}
            className="w-full py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-gold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {(saveMutation.isPending || addMutation.isPending) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            <Save className="w-4 h-4" />
            {editing === "new" ? "Add Slide" : "Save Changes"}
          </button>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          {slides.map((slide) => (
            <motion.div
              key={slide.id}
              layout
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/20 transition-colors group"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />

              {/* Thumbnail */}
              <div className="w-24 h-14 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                <Image
                  src={slide.image}
                  alt={slide.title.split("\n")[0]}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {slide.title.split("\n")[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {slide.ctaText} → {slide.ctaLink}
                </p>
              </div>

              {/* Active toggle */}
              <span
                className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full",
                  slide.isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {slide.isActive ? "Active" : "Hidden"}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() =>
                    saveMutation.mutate({
                      id: slide.id,
                      isActive: !slide.isActive,
                    })
                  }
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                  title={slide.isActive ? "Hide" : "Show"}
                >
                  {slide.isActive ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => startEdit(slide)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(slide.id)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Category Manager ────────────────────────────────────────────────────────

function CategoryManager() {
  const qc = useQueryClient();
  const { data: cats = [], isLoading } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: () =>
      adminFetch("/api/admin/homepage/categories").then((r) => r.json()),
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Category>>({});

  const saveMutation = useMutation({
    mutationFn: (data: Partial<Category> & { id: string }) =>
      adminFetch("/api/admin/homepage/categories", {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      setEditing(null);
      setForm({});
      toast.success("Category updated");
    },
    onError: () => toast.error("Failed to update"),
  });

  const addMutation = useMutation({
    mutationFn: (data: Partial<Category>) =>
      adminFetch("/api/admin/homepage/categories", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      setForm({});
      toast.success("Category added");
    },
    onError: () => toast.error("Failed to add"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/api/admin/homepage/categories?id=${id}`, {
        method: "DELETE",
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted");
    },
  });

  const startEdit = (cat: Category) => {
    setEditing(cat.id);
    setForm({ name: cat.name, image: cat.image, link: cat.link });
  };

  const isEditing = editing !== null;

  return (
    <div className="space-y-3">
      {!isEditing && (
        <button
          onClick={() => {
            setEditing("new");
            setForm({ name: "", image: "", link: "", sortOrder: cats.length });
          }}
          className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-gold/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      )}

      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              {editing === "new" ? "New Category" : "Edit Category"}
            </h4>
            <button
              onClick={() => {
                setEditing(null);
                setForm({});
              }}
              className="p-1 hover:bg-muted rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Image (400×400 square)
            </label>
            <ImageUpload
              value={form.image || ""}
              onChange={(val) => setForm((f) => ({ ...f, image: val }))}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Name
            </label>
            <input
              value={form.name || ""}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:border-gold outline-none"
              placeholder="Women's Fashion"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Link (shop filter URL)
            </label>
            <input
              value={form.link || ""}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:border-gold outline-none"
              placeholder="/shop?category=Women's Fashion"
            />
          </div>

          <button
            onClick={() => {
              if (editing === "new") addMutation.mutate(form);
              else saveMutation.mutate({ id: editing, ...form });
            }}
            disabled={
              saveMutation.isPending ||
              addMutation.isPending ||
              !form.name ||
              !form.image
            }
            className="w-full py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-gold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {(saveMutation.isPending || addMutation.isPending) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            <Save className="w-4 h-4" />
            {editing === "new" ? "Add Category" : "Save Changes"}
          </button>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {cats.map((cat) => (
            <motion.div
              key={cat.id}
              layout
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/20 transition-colors group"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0 relative">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{cat.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {cat.link || "/shop"}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(cat)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(cat.id)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Collection Manager ──────────────────────────────────────────────────────

function CollectionManager() {
  const qc = useQueryClient();
  const { data: cols = [], isLoading } = useQuery<Collection[]>({
    queryKey: ["admin-collections"],
    queryFn: () =>
      adminFetch("/api/admin/homepage/collections").then((r) => r.json()),
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Collection>>({});

  const saveMutation = useMutation({
    mutationFn: (data: Partial<Collection> & { id: string }) =>
      adminFetch("/api/admin/homepage/collections", {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-collections"] });
      setEditing(null);
      setForm({});
      toast.success("Collection updated");
    },
    onError: () => toast.error("Failed to update"),
  });

  const addMutation = useMutation({
    mutationFn: (data: Partial<Collection>) =>
      adminFetch("/api/admin/homepage/collections", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-collections"] });
      setForm({});
      toast.success("Collection added");
    },
    onError: () => toast.error("Failed to add"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/api/admin/homepage/collections?id=${id}`, {
        method: "DELETE",
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-collections"] });
      toast.success("Collection deleted");
    },
  });

  const startEdit = (col: Collection) => {
    setEditing(col.id);
    setForm({
      name: col.name,
      image: col.image,
      itemCount: col.itemCount,
      link: col.link,
    });
  };

  const isEditing = editing !== null;

  return (
    <div className="space-y-3">
      {!isEditing && (
        <button
          onClick={() => {
            setEditing("new");
            setForm({
              name: "",
              image: "",
              itemCount: 0,
              link: "/shop",
              sortOrder: cols.length,
            });
          }}
          className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-gold/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Collection
        </button>
      )}

      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              {editing === "new" ? "New Collection" : "Edit Collection"}
            </h4>
            <button
              onClick={() => {
                setEditing(null);
                setForm({});
              }}
              className="p-1 hover:bg-muted rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Image (800×1000 portrait)
            </label>
            <ImageUpload
              value={form.image || ""}
              onChange={(val) => setForm((f) => ({ ...f, image: val }))}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Name
            </label>
            <input
              value={form.name || ""}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:border-gold outline-none"
              placeholder="Summer Essentials"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Item Count
              </label>
              <input
                type="number"
                value={form.itemCount ?? 0}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    itemCount: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:border-gold outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Link
              </label>
              <input
                value={form.link || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, link: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:border-gold outline-none"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (editing === "new") addMutation.mutate(form);
              else saveMutation.mutate({ id: editing, ...form });
            }}
            disabled={
              saveMutation.isPending ||
              addMutation.isPending ||
              !form.name ||
              !form.image
            }
            className="w-full py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-gold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {(saveMutation.isPending || addMutation.isPending) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            <Save className="w-4 h-4" />
            {editing === "new" ? "Add Collection" : "Save Changes"}
          </button>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cols.map((col) => (
            <motion.div
              key={col.id}
              layout
              className="rounded-xl border border-border overflow-hidden hover:bg-muted/20 transition-colors group"
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  className="object-cover"
                  sizes="300px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs text-white/60">{col.itemCount} items</p>
                  <p className="text-sm font-medium text-white">{col.name}</p>
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(col)}
                    className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-foreground" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(col.id)}
                    className="w-8 h-8 bg-red-500/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AdminHomepage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Homepage Manager
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize the hero slider, shop by category, and featured collections
          sections on your storefront homepage.
        </p>
      </div>

      <SectionCard
        title="Hero Slider"
        description={`${3} slides — Add, edit, reorder, or hide hero banners`}
        icon={<ImageIcon className="w-4 h-4" />}
      >
        <SlideManager />
      </SectionCard>

      <SectionCard
        title="Shop by Category"
        description={`${8} categories — Manage category circles with images`}
        icon={<Hash className="w-4 h-4" />}
      >
        <CategoryManager />
      </SectionCard>

      <SectionCard
        title="Featured Collections"
        description={`${3} collections — Edit collection cards with images`}
        icon={<LinkIcon className="w-4 h-4" />}
      >
        <CollectionManager />
      </SectionCard>
    </div>
  );
}