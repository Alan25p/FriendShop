import { FormEvent, useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Trash2, Upload, X, Edit3, Package, LayoutDashboard, 
  ShoppingBag, PlusCircle, CheckCircle, Truck, MapPin, 
  Search, Calendar, ChevronRight, Tag 
} from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import { womenProductTypes, menProductTypes, makeupTypes, shoeTypes, accessoryTypes } from "@/data/products";

type Category = "women" | "men" | "unisex";
type StockStatus = "disponible" | "agotado_restock" | "agotado";
type TabType = "dashboard" | "products" | "orders" | "create";

type ProductForm = {
  name: string;
  price: string;
  originalPrice: string;
  description: string;
  category: Category;
  subcategory: string;
  productType: string;
  stockStatus: StockStatus;
};

const initialForm: ProductForm = {
  name: "",
  price: "",
  originalPrice: "",
  description: "",
  category: "women",
  subcategory: "ropa",
  productType: "blusa",
  stockStatus: "disponible",
};

export default function AdminProductsPage() {
  const { refreshProducts } = useProducts();
  const [tab, setTab] = useState<TabType>("dashboard");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [form, setForm] = useState<ProductForm>(initialForm);
  const [images, setImages] = useState<File[]>([]);
  const [hasSizes, setHasSizes] = useState(false);
  const [sizes, setSizes] = useState({ ECH: "", CH: "", M: "", G: "", EG: "" });

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showOutStockOnly, setShowOutStockOnly] = useState(false);
  const [showMonthlyDetails, setShowMonthlyDetails] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  async function loadProducts() {
    const { data } = await (supabase as any).from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
  }

  async function loadOrders() {
    try {
      const { data, error } = await (supabase as any)
        .from("orders")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });

      if (error) {
        const { data: fallbackData } = await (supabase as any).from("orders").select("*").order("created_at", { ascending: false });
        setOrders(fallbackData || []);
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const getMonthlyEarnings = () => {
    const months: { [key: string]: number } = {};
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const monthYear = date.toLocaleString('es-MX', { month: 'long', year: 'numeric' });
      months[monthYear] = (months[monthYear] || 0) + Number(order.total || 0);
    });
    return Object.entries(months).reverse();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock = showOutStockOnly ? product.stock_status !== "disponible" : true;
    return matchesSearch && matchesStock;
  });

  function updateField(field: keyof ProductForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateSize(size: keyof typeof sizes, value: string) {
    setSizes((prev) => ({ ...prev, [size]: value }));
  }

  function resetForm() {
    setForm(initialForm);
    setImages([]);
    setHasSizes(false);
    setSizes({ ECH: "", CH: "", M: "", G: "", EG: "" });
  }

  async function uploadImagesToStorage(fileList: File[]) {
    const urls: string[] = [];
    for (const image of fileList) {
      const ext = image.name.split(".").pop() || "jpg";
      const fileName = `${crypto.randomUUID()}.${ext}`;
      await supabase.storage.from("products").upload(fileName, image);
      const { data } = supabase.storage.from("products").getPublicUrl(fileName);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  const getProductTypeOptions = (subcategory: string, category: string) => {
    if (subcategory === "maquillaje") return makeupTypes;
    if (subcategory === "zapatos") return shoeTypes;
    if (subcategory === "accesorios") return accessoryTypes;
    const baseList = category === 'men' ? menProductTypes : womenProductTypes;
    return baseList.filter(t => !['all', 'accesorio', 'zapato', 'maquillaje'].includes(t.id));
  };

  const getSubcategoryOptions = (category: string) => {
    const base = [
      { id: "ropa", label: "Ropa" },
      { id: "accesorios", label: "Accesorios" },
      { id: "zapatos", label: "Zapatos" }
    ];
    if (category === "women") {
      base.splice(1, 0, { id: "maquillaje", label: "Maquillaje" });
    }
    return base;
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const price = Number(form.price);
      if (!form.name.trim() || price <= 0) throw new Error("Nombre y precio son obligatorios.");
      const imageUrls = await uploadImagesToStorage(images);
      const productData = {
        name: form.name.trim(),
        price,
        original_price: form.originalPrice ? Number(form.originalPrice) : null,
        images: imageUrls,
        category: form.category,
        subcategory: form.subcategory,
        product_type: form.productType,
        stock_status: form.stockStatus,
        description: form.description.trim(),
        has_sizes: hasSizes,
        sizes: hasSizes ? {
          ECH: Number(sizes.ECH || 0),
          CH: Number(sizes.CH || 0),
          M: Number(sizes.M || 0),
          G: Number(sizes.G || 0),
          EG: Number(sizes.EG || 0),
        } : {},
      };
      const { error } = await (supabase as any).from("products").insert([productData]);
      if (error) throw error;
      alert("Producto creado correctamente.");
      resetForm();
      await loadProducts();      
      await refreshProducts();   
      setTab("products");
    } catch (err: any) {
      alert(err.message || "Error al crear producto.");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveProductChanges() {
    if (!editingProduct) return;
    setEditLoading(true);
    try {
      let finalImages = editingProduct.images || [];
      if (editImages.length > 0) {
        const newUrls = await uploadImagesToStorage(editImages);
        finalImages = [...finalImages, ...newUrls];
      }
      const updateData = {
        name: editingProduct.name,
        price: Number(editingProduct.price),
        original_price: editingProduct.original_price ? Number(editingProduct.original_price) : null,
        description: editingProduct.description,
        stock_status: editingProduct.stock_status,
        images: finalImages,
        category: editingProduct.category,
        subcategory: editingProduct.subcategory,
        product_type: editingProduct.product_type,
        has_sizes: editingProduct.has_sizes,
        sizes: editingProduct.has_sizes ? {
          ECH: Number(editingProduct.sizes?.ECH || 0),
          CH: Number(editingProduct.sizes?.CH || 0),
          M: Number(editingProduct.sizes?.M || 0),
          G: Number(editingProduct.sizes?.G || 0),
          EG: Number(editingProduct.sizes?.EG || 0),
        } : {},
      };
      const { error } = await (supabase as any).from("products").update(updateData).eq("id", editingProduct.id);
      if (error) throw error;
      setEditingProduct(null);
      setEditImages([]);
      await loadProducts();
      await refreshProducts();
      alert("Cambios guardados con éxito.");
    } catch (err: any) {
      alert("Error al actualizar: " + err.message);
    } finally {
      setEditLoading(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    await supabase.from("products").delete().eq("id", id);
    await loadProducts();
    await refreshProducts();
  }

  async function updateOrderStatus(id: string, status: string) {
    await (supabase as any).from("orders").update({ status: status }).eq("id", id);
    loadOrders();
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const TabButton = ({ id, label, icon: Icon }: { id: TabType; label: string; icon: any }) => (
    <button
      onClick={() => {
        setTab(id);
        if (id === 'products') setShowOutStockOnly(false);
      }}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition ${
        tab === id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted hover:bg-muted/80 text-muted-foreground"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <section className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Panel Administrativo</p>
            <h1 className="text-4xl font-heading font-bold italic">FriendShop Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <TabButton id="dashboard" label="Escritorio" icon={LayoutDashboard} />
            <TabButton id="products" label="Inventario" icon={ShoppingBag} />
            <TabButton id="orders" label="Pedidos" icon={Package} />
            <TabButton id="create" label="Crear Producto" icon={PlusCircle} />
          </div>
        </header>

        {tab === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card title="Total Productos" value={products.length} color="border-blue-500" />
              <Card title="Pedidos Totales" value={orders.length} color="border-purple-500" />
              <Card 
                title="Ingresos (Ver Meses)" 
                value={`$${orders.reduce((acc, item) => acc + Number(item.total || 0), 0).toLocaleString()}`} 
                color="border-green-500" 
                onClick={() => setShowMonthlyDetails(!showMonthlyDetails)}
                interactive
              />
              <Card 
                title="Sin Stock (Ver cuáles)" 
                value={products.filter((item) => item.stock_status !== "disponible").length} 
                color="border-red-500" 
                onClick={() => {
                  setTab("products");
                  setShowOutStockOnly(true);
                }}
                interactive
              />
            </div>

            {showMonthlyDetails && (
              <div className="rounded-3xl border bg-card p-6 animate-fade-up">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="text-muted-foreground" size={20} />
                  <h3 className="text-xl font-bold font-heading italic">Desglose de Ganancias</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {getMonthlyEarnings().map(([month, total]) => (
                    <div key={month} className="p-4 rounded-2xl bg-muted/50 border border-border flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-muted-foreground">{month}</span>
                      <span className="text-lg font-bold text-foreground">${total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "products" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-3xl border shadow-sm">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar producto..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
              </div>
              <button 
                onClick={() => setShowOutStockOnly(!showOutStockOnly)}
                className={`w-full md:w-auto px-6 py-3 rounded-2xl text-xs font-bold uppercase transition-all ${
                  showOutStockOnly ? 'bg-red-500 text-white shadow-lg' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {showOutStockOnly ? 'Mostrando Faltantes' : 'Filtrar Sin Stock'}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((item) => (
                <div key={item.id} className="group relative overflow-hidden rounded-3xl border bg-card p-4 transition-all hover:shadow-xl animate-fade-up">
                  <div className="flex gap-4">
                    <img src={item.images?.[0] || "/placeholder.svg"} className="h-24 w-20 rounded-2xl object-cover bg-muted" alt={item.name} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{item.name}</h3>
                      <p className="text-foreground font-semibold text-sm">
                        ${item.price} {item.original_price && <span className="text-xs text-muted-foreground line-through ml-1">${item.original_price}</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">{item.product_type}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.stock_status === 'disponible' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {item.stock_status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setEditingProduct(item)} className="flex-1 bg-secondary text-secondary-foreground py-2 rounded-xl text-xs font-bold hover:bg-secondary/80 flex items-center justify-center gap-1">
                      <Edit3 size={14} /> Editar
                    </button>
                    <button onClick={() => deleteProduct(item.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "orders" && (
           <div className="overflow-x-auto rounded-3xl border bg-card animate-fade-in">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-xs font-bold uppercase">Cliente</th>
                    <th className="p-4 text-xs font-bold uppercase">Entrega / Dirección</th>
                    <th className="p-4 text-xs font-bold uppercase">Fecha del Pedido</th>
                    <th className="p-4 text-xs font-bold uppercase">Total</th>
                    <th className="p-4 text-xs font-bold uppercase">Estado Actual</th>
                    <th className="p-4 text-xs font-bold uppercase text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-semibold text-sm">{order.profiles?.full_name || "Cliente Desconocido"}</td>
                      <td className="p-4">
                        {order.shipping_details?.method === 'national' ? (
                          <div className="text-[10px] leading-tight max-w-[250px]">
                            <span className="font-bold text-blue-600 flex items-center gap-1 mb-1 uppercase tracking-tighter">
                              <Truck size={10} /> Envío Nacional
                            </span>
                            <p className="text-muted-foreground">
                              {order.shipping_details.address}, {order.shipping_details.colony}<br/>
                              {order.shipping_details.city}, {order.shipping_details.state}, CP {order.shipping_details.zip}
                              {order.shipping_details.reference && (
                                <><br/><span className="italic text-[9px] text-foreground/70">Ref: {order.shipping_details.reference}</span></>
                              )}
                            </p>
                          </div>
                        ) : (
                          <div className="text-[10px]">
                            <span className="font-bold text-green-600 flex items-center gap-1 uppercase tracking-tighter">
                              <MapPin size={10} /> Entrega Local
                            </span>
                            <p className="text-muted-foreground">Orizaba y alrededores</p>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">{formatDateTime(order.created_at)}</td>
                      <td className="p-4 font-bold text-sm">${order.total}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          order.status === 'pendiente' ? 'bg-yellow-500/10 text-yellow-600' :
                          order.status === 'enviado' ? 'bg-blue-500/10 text-blue-600' :
                          order.status === 'entregado' ? 'bg-green-500/10 text-green-600' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => updateOrderStatus(order.id, "pendiente")} className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-600 text-[10px] font-bold uppercase">Pendiente</button>
                        <button onClick={() => updateOrderStatus(order.id, "enviado")} className="px-2 py-1 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase">Enviado</button>
                        <button onClick={() => updateOrderStatus(order.id, "entregado")} className="px-2 py-1 rounded bg-green-500/10 text-green-600 text-[10px] font-bold uppercase flex items-center gap-1">
                          <CheckCircle size={12} /> Entregado
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        )}

        {tab === "create" && (
          <section className="mx-auto max-w-3xl rounded-3xl border bg-card p-8 shadow-sm animate-fade-up">
            <h2 className="text-2xl font-bold italic mb-6 font-heading">Crear Producto</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase ml-1">Nombre</label>
                  <input placeholder="Ej: Vestido Gala" value={form.name} onChange={(e) => updateField("name", e.target.value)} className="w-full rounded-2xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase ml-1">Precio Venta ($)</label>
                  <input type="number" placeholder="Ej: 50" value={form.price} onChange={(e) => updateField("price", e.target.value)} className="w-full rounded-2xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase ml-1">Precio Original / Descuento ($)</label>
                  <input type="number" placeholder="Opcional" value={form.originalPrice} onChange={(e) => updateField("originalPrice", e.target.value)} className="w-full rounded-2xl border bg-zinc-50 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase ml-1">Género</label>
                  <select 
                    value={form.category} 
                    onChange={(e) => {
                      updateField("category", e.target.value);
                      updateField("subcategory", "ropa"); 
                      const newOptions = getProductTypeOptions("ropa", e.target.value);
                      if (newOptions.length > 0) updateField("productType", newOptions[0].id);
                    }} 
                    className="w-full rounded-2xl border bg-background px-4 py-3 h-[50px] text-sm"
                  >
                    <option value="women">Mujer</option><option value="men">Hombre</option><option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase ml-1">Sección</label>
                  <select 
                    value={form.subcategory} 
                    onChange={(e) => {
                      updateField("subcategory", e.target.value);
                      const newOptions = getProductTypeOptions(e.target.value, form.category);
                      if (newOptions.length > 0) updateField("productType", newOptions[0].id);
                    }} 
                    className="w-full rounded-2xl border bg-background px-4 py-3 h-[50px] text-sm"
                  >
                    {getSubcategoryOptions(form.category).map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase ml-1">Tipo de Prenda</label>
                  <select 
                    value={form.productType} 
                    onChange={(e) => updateField("productType", e.target.value)} 
                    className="w-full rounded-2xl border bg-background px-4 py-3 h-[50px] text-sm"
                  >
                    {getProductTypeOptions(form.subcategory, form.category).map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase ml-1">Inventario</label>
                  <select value={form.stockStatus} onChange={(e) => updateField("stockStatus", e.target.value)} className="w-full rounded-2xl border bg-background px-4 py-3 h-[50px] text-sm font-medium">
                    <option value="disponible">Disponible</option><option value="agotado_restock">Próximamente</option><option value="agotado">Agotado</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border p-4 bg-muted/30 space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={hasSizes} onChange={(e) => setHasSizes(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary" />
                    <span className="text-sm font-bold uppercase">Gestionar Tallas</span>
                  </label>

                  {hasSizes && (
                    <div className="grid gap-4 md:grid-cols-5 bg-background p-4 rounded-xl border">
                      {["ECH", "CH", "M", "G", "EG"].map((size) => (
                        <div key={size}>
                          <p className="text-[10px] font-bold uppercase mb-2 text-muted-foreground text-center">{size}</p>
                          <input type="number" min="0" placeholder="0" value={sizes[size as keyof typeof sizes]} onChange={(e) => updateSize(size as keyof typeof sizes, e.target.value)} className="w-full rounded-xl border bg-background px-2 py-2 text-sm text-center" />
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase ml-1">Descripción</label>
                <textarea placeholder="Describe el producto..." value={form.description} onChange={(e) => updateField("description", e.target.value)} className="w-full min-h-[100px] rounded-2xl border bg-background px-4 py-3 resize-none" />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase ml-1">Imágenes</label>
                <div onClick={() => fileInputRef.current?.click()} className="group border-2 border-dashed border-muted-foreground/20 rounded-3xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/5 transition-all bg-background/50">
                  <Upload className="text-muted-foreground group-hover:text-primary" size={32} />
                  <p className="text-sm font-medium">Subir archivos</p>
                </div>
                {images.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-green-600">Archivos seleccionados:</p>
                    {images.map((img, i) => (
                      <p key={i} className="text-xs text-muted-foreground truncate italic">✓ {img.name}</p>
                    ))}
                  </div>
                )}
                <input type="file" ref={fileInputRef} multiple onChange={(e) => setImages(Array.from(e.target.files || []))} className="hidden" accept="image/*" />
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg hover:opacity-90 transition-all active:scale-[0.98]">
                {isLoading ? "CREANDO..." : "CREAR PRODUCTO"}
              </button>
            </form>
          </section>
        )}
      </section>

      {/* --- MODAL DE EDICIÓN ACTUALIZADO CON DESCUENTO --- */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-[32px] border bg-card p-6 md:p-10 space-y-8 shadow-2xl my-auto animate-scale-in">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 rounded-lg"><Edit3 size={18}/></div>
                <h2 className="text-2xl font-bold italic font-heading">Editar Artículo</h2>
              </div>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20}/></button>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* GALERÍA EN EDICIÓN */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em]">Galería del Producto</label>
                <div className="grid grid-cols-3 gap-2">
                  {editingProduct.images?.map((url: string, i: number) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50">
                      <img src={url} className="h-full w-full object-cover" />
                      <button 
                        onClick={() => setEditingProduct({...editingProduct, images: editingProduct.images.filter((_:any, idx:number) => idx !== i)})} 
                        className="absolute inset-0 bg-red-600/90 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => editFileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center text-zinc-300 hover:text-primary hover:border-primary transition-all">
                    <PlusCircle size={24} />
                  </button>
                </div>
                <input type="file" ref={editFileInputRef} multiple className="hidden" onChange={(e) => setEditImages(Array.from(e.target.files || []))} />
              </div>

              {/* CAMPOS DE TEXTO EN EDICIÓN */}
              <div className="space-y-5">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Nombre del Producto</label>
                   <input 
                    value={editingProduct.name} 
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} 
                    className="w-full rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/10 transition-all" 
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Sección</label>
                      <select 
                        value={editingProduct.subcategory} 
                        onChange={(e) => {
                          const newOptions = getProductTypeOptions(e.target.value, editingProduct.category);
                          setEditingProduct({
                            ...editingProduct, 
                            subcategory: e.target.value,
                            product_type: newOptions.length > 0 ? newOptions[0].id : ""
                          });
                        }} 
                        className="w-full rounded-xl border border-zinc-100 bg-white px-3 py-2 text-xs font-bold h-[42px]"
                      >
                        {getSubcategoryOptions(editingProduct.category).map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.label}</option>
                        ))}
                      </select>
                   </div>
                   
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tipo</label>
                      <select 
                        value={editingProduct.product_type} 
                        onChange={(e) => setEditingProduct({...editingProduct, product_type: e.target.value})} 
                        className="w-full rounded-xl border border-zinc-100 bg-white px-3 py-2 text-xs font-bold h-[42px]"
                      >
                        {getProductTypeOptions(editingProduct.subcategory, editingProduct.category).map(t => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                   </div>
                </div>

                {/* NUEVO: PRECIO Y DESCUENTO EN EDICIÓN */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-50 mt-2">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Precio Venta ($)</label>
                      <input 
                        type="number" 
                        value={editingProduct.price} 
                        onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} 
                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-black text-zinc-900" 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Precio Orig. ($)</label>
                      <input 
                        type="number" 
                        value={editingProduct.original_price || ''} 
                        onChange={(e) => setEditingProduct({...editingProduct, original_price: e.target.value})} 
                        className="w-full rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-400" 
                        placeholder="Opcional"
                      />
                   </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Estado de Inventario</label>
                  <select 
                    value={editingProduct.stock_status} 
                    onChange={(e) => setEditingProduct({...editingProduct, stock_status: e.target.value})} 
                    className="w-full rounded-xl border border-zinc-100 bg-white px-3 py-2 text-xs font-bold h-[42px]"
                  >
                     <option value="disponible">✅ Disponible</option>
                     <option value="agotado_restock">⏳ Próximamente</option>
                     <option value="agotado">❌ Agotado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* GESTIÓN DE TALLAS EN EDICIÓN */}
            <div className="rounded-[24px] border border-zinc-100 p-5 bg-zinc-50/50 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingProduct.has_sizes || false} 
                    onChange={(e) => setEditingProduct({...editingProduct, has_sizes: e.target.checked})} 
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-0" 
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Gestionar Inventario de Tallas</span>
                </label>

                {editingProduct.has_sizes && (
                  <div className="grid grid-cols-5 gap-2 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                    {["ECH", "CH", "M", "G", "EG"].map((size) => (
                      <div key={size}>
                        <p className="text-[9px] font-black uppercase mb-1.5 text-zinc-400 text-center">{size}</p>
                        <input 
                          type="number" 
                          min="0" 
                          placeholder="0" 
                          value={editingProduct.sizes?.[size] || ""} 
                          onChange={(e) => setEditingProduct({
                            ...editingProduct, 
                            sizes: { ...editingProduct.sizes, [size]: e.target.value }
                          })} 
                          className="w-full rounded-lg border border-zinc-100 bg-zinc-50 px-1 py-2 text-xs text-center font-bold focus:bg-white transition-all" 
                        />
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Descripción Corta</label>
                <textarea 
                  value={editingProduct.description} 
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} 
                  className="w-full min-h-[80px] rounded-2xl border border-zinc-100 bg-white px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-primary/5 transition-all" 
                />
            </div>

            <div className="flex gap-4 pt-4 border-t border-zinc-50">
              <button 
                onClick={saveProductChanges} 
                disabled={editLoading} 
                className="flex-[2] rounded-2xl bg-zinc-900 py-4 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
              >
                {editLoading ? "PROCESANDO..." : "GUARDAR CAMBIOS"}
              </button>
              <button 
                onClick={() => setEditingProduct(null)} 
                className="flex-1 rounded-2xl border border-zinc-200 py-4 font-bold hover:bg-zinc-50 transition-all text-[10px] uppercase tracking-widest text-zinc-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Card({ title, value, color, onClick, interactive }: { title: string; value: any; color: string; onClick?: () => void; interactive?: boolean }) {
  return (
    <div 
      onClick={onClick}
      className={`rounded-3xl border-l-4 bg-card p-6 shadow-sm ${color} border-muted transition-all ${
        interactive ? 'cursor-pointer hover:translate-y-[-4px] hover:shadow-lg active:scale-95' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{title}</p>
        {interactive && <ChevronRight size={14} className="text-muted-foreground" />}
      </div>
      <h3 className="mt-2 text-4xl font-heading font-bold">{value}</h3>
    </div>
  );
}