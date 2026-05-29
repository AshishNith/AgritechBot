import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { SelectField } from "../components/ui/SelectField";
import { Button } from "../components/ui/Button";
import { TextareaField } from "../components/ui/TextareaField";
import { Loader } from "../components/ui/Loader";
import { ErrorState } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";
import { useProduct, useProductMutations } from "../hooks/useProducts";
import type { ProductPayload } from "../types/api";
import { formatNumber } from "../utils/format";

const initialPayload: ProductPayload = {
  name: "",
  brand: "",
  nameHi: "",
  nameGu: "",
  namePa: "",
  description: "",
  descriptionHi: "",
  descriptionGu: "",
  descriptionPa: "",
  category: "Fertilizers",
  categoryHi: "",
  categoryGu: "",
  categoryPa: "",
  subCategory: "",
  subCategoryHi: "",
  subCategoryGu: "",
  subCategoryPa: "",
  price: 0,
  unit: "kg",
  unitHi: "",
  unitGu: "",
  unitPa: "",
  images: [],
  inStock: true,
  quantity: 0,
  seller: {
    name: "Anaaj Farm Solutions",
    phone: "",
    rating: 4.8,
    location: ""
  }
};

export const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";

  const { data: product, isLoading, isError } = useProduct(id || "");
  const { create, update } = useProductMutations();

  const [form, setForm] = useState<ProductPayload>(initialPayload);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "i18n" | "seller">("basic");

  useEffect(() => {
    if (isEdit && product) {
      setForm({
        name: product.name,
        brand: product.brand,
        nameHi: product.nameHi,
        nameGu: product.nameGu,
        namePa: product.namePa,
        description: product.description,
        descriptionHi: product.descriptionHi,
        descriptionGu: product.descriptionGu,
        descriptionPa: product.descriptionPa,
        category: product.category,
        categoryHi: product.categoryHi,
        categoryGu: product.categoryGu,
        categoryPa: product.categoryPa,
        subCategory: product.subCategory,
        subCategoryHi: product.subCategoryHi,
        subCategoryGu: product.subCategoryGu,
        subCategoryPa: product.subCategoryPa,
        price: product.price,
        unit: product.unit,
        unitHi: product.unitHi,
        unitGu: product.unitGu,
        unitPa: product.unitPa,
        images: product.images,
        inStock: product.inStock,
        quantity: product.quantity,
        seller: {
          name: product.seller?.name || "Anaaj Farm Solutions",
          phone: product.seller?.phone || "",
          rating: product.seller?.rating ?? 4.8,
          location: product.seller?.location || ""
        }
      });
      setImages(product.images || []);
    } else if (!isEdit) {
      setForm(initialPayload);
      setImages([]);
    }
  }, [isEdit, product]);

  const handleAddImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (images.includes(trimmed)) {
      alert("This image URL has already been added to the product.");
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMakePrimary = (indexToPromote: number) => {
    setImages((prev) => {
      const item = prev[indexToPromote];
      const remaining = prev.filter((_, idx) => idx !== indexToPromote);
      return [item, ...remaining];
    });
  };

  const onSave = async () => {
    if (!form.name.trim() || !form.description.trim() || form.price <= 0) {
      setFormError("Product name, description, and a positive price are required.");
      return;
    }

    setFormError("");

    const payload: ProductPayload = {
      ...form,
      images: images
    };

    try {
      if (isEdit && id) {
        await update.mutateAsync({ productId: id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      navigate("/products");
    } catch {
      setFormError("Failed to save product. Please try again.");
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isEdit && isError) {
    return (
      <div className="p-6">
        <ErrorState message="Could not fetch product details. Please return to list." />
        <Button className="mt-4" onClick={() => navigate("/products")}>
          Back to Products
        </Button>
      </div>
    );
  }

  const previewImage = images[0];

  return (
    <div className="space-y-6">
      {/* Header and Back Action */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold mb-1"
          >
            ← Back to Products List
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? `Edit Product: ${product?.name}` : "Create New Product"}
          </h1>
          <p className="text-xs text-slate-500">
            {isEdit ? "Update details, stock pricing, and multi-lingual descriptions for this catalog item." : "Create and publish a new item into the agricultural marketplace catalog."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/products")}>
            Cancel
          </Button>
          <Button onClick={onSave} isLoading={create.isPending || update.isPending}>
            Save Product
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Form Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            {/* Tab buttons */}
            <div className="flex border-b overflow-x-auto scrollbar-none mb-4">
              <button
                onClick={() => setActiveTab("basic")}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all whitespace-nowrap ${
                  activeTab === "basic"
                    ? "border-brand-600 text-brand-600 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                📦 Basic Info
              </button>
              <button
                onClick={() => setActiveTab("pricing")}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all whitespace-nowrap ${
                  activeTab === "pricing"
                    ? "border-brand-600 text-brand-600 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                💰 Pricing & Stock
              </button>
              <button
                onClick={() => setActiveTab("i18n")}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all whitespace-nowrap ${
                  activeTab === "i18n"
                    ? "border-brand-600 text-brand-600 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                🌐 Multilingual (i18n)
              </button>
              <button
                onClick={() => setActiveTab("seller")}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all whitespace-nowrap ${
                  activeTab === "seller"
                    ? "border-brand-600 text-brand-600 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                🏢 Seller Info
              </button>
            </div>

            <div className="pt-2">
              {activeTab === "basic" && (
                <div className="grid gap-5">
                  <InputField
                    label="Product Name (English)"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label="Category"
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      options={[
                        { label: "Fertilizers", value: "Fertilizers" },
                        { label: "Seeds", value: "Seeds" },
                        { label: "Pesticides", value: "Pesticides" },
                        { label: "Tools", value: "Tools" }
                      ]}
                    />
                    <InputField
                      label="Subcategory (English)"
                      value={form.subCategory}
                      onChange={(e) => setForm((p) => ({ ...p, subCategory: e.target.value }))}
                    />
                  </div>
                  <InputField
                    label="Brand Name"
                    value={form.brand}
                    onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                  />
                  <TextareaField
                    label="Description (English)"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    rows={5}
                    required
                  />

                  {/* Enhanced Image URL management section */}
                  <div className="border-t pt-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">🖼️ Dynamic Marketplace Gallery</h3>
                      <p className="text-xxs text-slate-500 leading-relaxed">
                        Add stable agricultural URLs one by one. The first image listed acts as the primary cover preview.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          className="w-full text-sm border rounded-lg px-3 py-2 bg-white border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                          placeholder="Paste agricultural image URL here..."
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddImage();
                            }
                          }}
                        />
                      </div>
                      <Button onClick={handleAddImage} type="button">
                        + Add Image
                      </Button>
                    </div>

                    {images.length === 0 ? (
                      <div className="text-center py-6 border border-dashed rounded-lg border-slate-300 text-xs text-slate-400 bg-slate-50">
                        No product images added yet. Add a valid URL above to enrich this listing.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                        {images.map((url, index) => {
                          const isPrimary = index === 0;
                          return (
                            <div
                              key={index}
                              className={`group relative border rounded-xl overflow-hidden shadow-sm bg-white transition-all hover:shadow-md ${
                                isPrimary ? "ring-2 ring-brand-500 border-transparent" : "border-slate-200"
                              }`}
                            >
                              {/* Image preview */}
                              <div className="h-24 w-full bg-slate-50 flex items-center justify-center overflow-hidden">
                                <img
                                  src={url}
                                  alt={`Product image ${index + 1}`}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              </div>

                              {/* Details Overlay / Actions */}
                              <div className="p-1.5 flex justify-between items-center bg-slate-50 border-t border-slate-100 text-xxs">
                                {isPrimary ? (
                                  <span className="font-bold text-brand-600 px-1">Primary Cover</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleMakePrimary(index)}
                                    className="text-slate-500 hover:text-brand-600 font-semibold px-1 py-0.5 hover:bg-white rounded transition-colors"
                                  >
                                    Set Primary
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  className="text-red-500 hover:text-red-700 font-semibold px-1 py-0.5 hover:bg-white rounded transition-colors"
                                >
                                  Remove
                                </button>
                              </div>

                              {/* Index pill overlay */}
                              <div className="absolute top-1.5 left-1.5 bg-black/60 text-white font-mono font-bold text-3xs px-1.5 py-0.5 rounded">
                                #{index + 1}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "pricing" && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Price (₹)"
                      type="number"
                      value={form.price || ""}
                      onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                      required
                    />
                    <InputField
                      label="Unit (e.g. kg, packet, piece)"
                      value={form.unit}
                      onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Stock Quantity Available"
                      type="number"
                      value={form.quantity || ""}
                      onChange={(e) => setForm((p) => ({ ...p, quantity: Number(e.target.value) }))}
                    />
                    <SelectField
                      label="In Stock Status"
                      value={form.inStock ? "true" : "false"}
                      onChange={(e) => setForm((p) => ({ ...p, inStock: e.target.value === "true" }))}
                      options={[
                        { label: "Available / In Stock", value: "true" },
                        { label: "Unavailable / Out of Stock", value: "false" }
                      ]}
                    />
                  </div>
                </div>
              )}

              {activeTab === "i18n" && (
                <div className="space-y-6">
                  <p className="text-xs text-slate-500 italic">Enter translated values to serve Hindi, Gujarati, and Punjabi farmers in their local tongue.</p>
                  
                  <div className="border border-brand-100 rounded-lg p-4 bg-brand-50/20 space-y-3">
                    <h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">Hindi Translations</h4>
                    <InputField label="Name (Hindi)" value={form.nameHi} onChange={(e) => setForm((p) => ({ ...p, nameHi: e.target.value }))} />
                    <InputField label="Category (Hindi)" value={form.categoryHi} onChange={(e) => setForm((p) => ({ ...p, categoryHi: e.target.value }))} />
                    <InputField label="Subcategory (Hindi)" value={form.subCategoryHi} onChange={(e) => setForm((p) => ({ ...p, subCategoryHi: e.target.value }))} />
                    <InputField label="Unit (Hindi)" value={form.unitHi} onChange={(e) => setForm((p) => ({ ...p, unitHi: e.target.value }))} />
                    <TextareaField label="Description (Hindi)" value={form.descriptionHi} onChange={(e) => setForm((p) => ({ ...p, descriptionHi: e.target.value }))} rows={2} />
                  </div>

                  <div className="border border-amber-100 rounded-lg p-4 bg-amber-50/20 space-y-3">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Gujarati Translations</h4>
                    <InputField label="Name (Gujarati)" value={form.nameGu} onChange={(e) => setForm((p) => ({ ...p, nameGu: e.target.value }))} />
                    <InputField label="Category (Gujarati)" value={form.categoryGu} onChange={(e) => setForm((p) => ({ ...p, categoryGu: e.target.value }))} />
                    <InputField label="Subcategory (Gujarati)" value={form.subCategoryGu} onChange={(e) => setForm((p) => ({ ...p, subCategoryGu: e.target.value }))} />
                    <InputField label="Unit (Gujarati)" value={form.unitGu} onChange={(e) => setForm((p) => ({ ...p, unitGu: e.target.value }))} />
                    <TextareaField label="Description (Gujarati)" value={form.descriptionGu} onChange={(e) => setForm((p) => ({ ...p, descriptionGu: e.target.value }))} rows={2} />
                  </div>

                  <div className="border border-purple-100 rounded-lg p-4 bg-purple-50/20 space-y-3">
                    <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider">Punjabi Translations</h4>
                    <InputField label="Name (Punjabi)" value={form.namePa} onChange={(e) => setForm((p) => ({ ...p, namePa: e.target.value }))} />
                    <InputField label="Category (Punjabi)" value={form.categoryPa} onChange={(e) => setForm((p) => ({ ...p, categoryPa: e.target.value }))} />
                    <InputField label="Subcategory (Punjabi)" value={form.subCategoryPa} onChange={(e) => setForm((p) => ({ ...p, subCategoryPa: e.target.value }))} />
                    <InputField label="Unit (Punjabi)" value={form.unitPa} onChange={(e) => setForm((p) => ({ ...p, unitPa: e.target.value }))} />
                    <TextareaField label="Description (Punjabi)" value={form.descriptionPa} onChange={(e) => setForm((p) => ({ ...p, descriptionPa: e.target.value }))} rows={2} />
                  </div>
                </div>
              )}

              {activeTab === "seller" && (
                <div className="grid gap-4">
                  <InputField
                    label="Seller / Brand Provider"
                    value={form.seller.name}
                    onChange={(e) => setForm((p) => ({ ...p, seller: { ...p.seller, name: e.target.value } }))}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Seller Phone"
                      value={form.seller.phone}
                      onChange={(e) => setForm((p) => ({ ...p, seller: { ...p.seller, phone: e.target.value } }))}
                    />
                    <InputField
                      label="Seller Location"
                      value={form.seller.location}
                      onChange={(e) => setForm((p) => ({ ...p, seller: { ...p.seller, location: e.target.value } }))}
                    />
                  </div>
                </div>
              )}
            </div>
            {formError && <div className="mt-4"><ErrorState message={formError} /></div>}
          </Card>
        </div>

        {/* Right Side: Realtime Product Preview Card */}
        <div className="space-y-6">
          <Card title="Live Catalog Preview" description="How the product appears dynamically in listing results.">
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="h-48 w-full bg-slate-100 flex items-center justify-center border-b border-slate-100 overflow-hidden relative">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <span className="text-4xl">🌾</span>
                    <p className="text-xs mt-1">No Image Available</p>
                  </div>
                )}
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <Badge tone="green">{form.category.toUpperCase()}</Badge>
                </div>
                {/* Stock status badge */}
                <div className="absolute top-3 right-3">
                  <Badge tone={form.inStock ? "green" : "red"}>
                    {form.inStock ? "IN STOCK" : "OUT OF STOCK"}
                  </Badge>
                </div>
              </div>

              {/* Product content */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{form.brand || "GENERIC"}</p>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{form.name || "Untitled Product"}</h3>
                  {form.subCategory && <p className="text-xs text-slate-500 font-medium">{form.subCategory}</p>}
                </div>

                <div className="flex items-baseline justify-between border-t border-b py-2 my-2 border-slate-100">
                  <div>
                    <span className="text-2xl font-black text-slate-950">₹{formatNumber(form.price)}</span>
                    <span className="text-xs text-slate-500 ml-1">per {form.unit || "unit"}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 rounded-full px-2 py-0.5">
                    {form.quantity} units avail.
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {form.description || "Add a descriptions in the basic tab to fill this detail."}
                </p>

                <div className="border-t pt-3 flex items-center justify-between text-xxs text-slate-400">
                  <span>Seller: {form.seller.name || "Anaaj Farms"}</span>
                  <span>⭐ {form.seller.rating} Rating</span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Active i18n Status" description="Supported languages check.">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2 text-sm">
                <span className="font-semibold text-slate-700">English</span>
                <Badge tone="green">ACTIVE</Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-2 text-sm">
                <span className="font-semibold text-slate-700">Hindi</span>
                <Badge tone={form.nameHi && form.descriptionHi ? "green" : "amber"}>
                  {form.nameHi && form.descriptionHi ? "ACTIVE" : "INCOMPLETE"}
                </Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-2 text-sm">
                <span className="font-semibold text-slate-700">Gujarati</span>
                <Badge tone={form.nameGu && form.descriptionGu ? "green" : "amber"}>
                  {form.nameGu && form.descriptionGu ? "ACTIVE" : "INCOMPLETE"}
                </Badge>
              </div>
              <div className="flex items-center justify-between pb-1 text-sm">
                <span className="font-semibold text-slate-700">Punjabi</span>
                <Badge tone={form.namePa && form.descriptionPa ? "green" : "amber"}>
                  {form.namePa && form.descriptionPa ? "ACTIVE" : "INCOMPLETE"}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
