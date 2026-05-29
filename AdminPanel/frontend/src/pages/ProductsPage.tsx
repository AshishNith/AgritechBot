import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { SelectField } from "../components/ui/SelectField";
import { Button } from "../components/ui/Button";
import { DataTable, type Column } from "../components/ui/DataTable";
import { Loader } from "../components/ui/Loader";
import { ErrorState } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";
import { useProductMutations, useProducts } from "../hooks/useProducts";
import type { ProductItem } from "../types/api";
import { formatNumber } from "../utils/format";

// We fetch all products (large limit) as requested
const MAX_LIMIT = 100000;

export const ProductsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState<"all" | "inStock" | "outOfStock">("all");

  const productsQuery = useProducts({
    page: 1,
    limit: MAX_LIMIT,
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    stockStatus
  });

  const { remove } = useProductMutations();

  const onDelete = async (product: ProductItem) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      try {
        await remove.mutateAsync(product.id);
      } catch {
        alert("Failed to delete product.");
      }
    }
  };

  const columns: Array<Column<ProductItem>> = useMemo(
    () => [
      {
        key: "product",
        header: "Product Detail",
        cell: (product) => (
          <div className="flex items-center gap-3">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-10 w-10 rounded object-cover border border-slate-200"
              />
            ) : (
              <div className="h-10 w-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                No Img
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900">{product.name}</p>
              <p className="text-xs text-slate-500">{product.brand || "Generic"}</p>
            </div>
          </div>
        )
      },
      {
        key: "category",
        header: "Category",
        cell: (product) => (
          <div>
            <Badge tone="slate">{product.category}</Badge>
            {product.subCategory && <p className="text-xs text-slate-500 mt-0.5">{product.subCategory}</p>}
          </div>
        )
      },
      {
        key: "pricing",
        header: "Pricing",
        cell: (product) => (
          <div>
            <p className="font-medium text-slate-900 font-semibold">₹{formatNumber(product.price)}</p>
            <p className="text-xs text-slate-500 font-medium">per {product.unit}</p>
          </div>
        )
      },
      {
        key: "stock",
        header: "Inventory",
        cell: (product) => (
          <div>
            <p className="text-sm font-semibold text-slate-800">{product.quantity} units</p>
            <Badge tone={product.inStock ? "green" : "red"}>
              {product.inStock ? "IN STOCK" : "OUT OF STOCK"}
            </Badge>
          </div>
        )
      },
      {
        key: "seller",
        header: "Seller",
        cell: (product) => (
          <div>
            <p className="text-sm font-medium text-slate-800">{product.seller?.name || "-"}</p>
            <p className="text-xs text-slate-500">{product.seller?.location || "-"}</p>
          </div>
        )
      },
      {
        key: "actions",
        header: "Actions",
        cell: (product) => (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/products/edit/${product.id}`)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(product)}>
              Delete
            </Button>
          </div>
        )
      }
    ],
    [navigate]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketplace Catalog</h1>
          <p className="text-xs text-slate-500">
            View, inspect, and manage products listed in the mobile marketplace. Total products displayed: {productsQuery.data?.items.length || 0}.
          </p>
        </div>
        <Button onClick={() => navigate("/products/new")}>
          + Add Product
        </Button>
      </div>

      <Card title="Catalog Controls & Filtering" description="Search and filter product catalog in real-time.">
        <div className="grid gap-4 sm:grid-cols-3">
          <InputField
            label="Search"
            placeholder="Product, brand, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <SelectField
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { label: "All Categories", value: "all" },
              { label: "Fertilizers", value: "Fertilizers" },
              { label: "Seeds", value: "Seeds" },
              { label: "Pesticides", value: "Pesticides" },
              { label: "Tools", value: "Tools" }
            ]}
          />
          <SelectField
            label="Stock Status"
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value as any)}
            options={[
              { label: "All Stock Status", value: "all" },
              { label: "In Stock Only", value: "inStock" },
              { label: "Out of Stock Only", value: "outOfStock" }
            ]}
          />
        </div>
      </Card>

      <Card>
        {productsQuery.isLoading && <Loader />}
        {productsQuery.isError && <ErrorState message="Unable to load marketplace products." />}
        {productsQuery.data && (
          <DataTable
            columns={columns}
            data={productsQuery.data.items}
            emptyTitle="No products found matching filters."
          />
        )}
      </Card>
    </div>
  );
};
