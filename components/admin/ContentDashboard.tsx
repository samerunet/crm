// components/admin/ContentDashboard.tsx  (NEW)
'use client';
import React, { useState } from 'react';

type Tutorial = {
  id: string;
  title: string;
  category?: string;
  price?: number;
  isSubscription?: boolean;
  files?: File[];
};

type Product = {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
};

export default function ContentDashboard() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const addTutorial = () =>
    setTutorials((t) => [{ id: `t_${Date.now()}`, title: 'New Tutorial', price: 0, isSubscription: false }, ...t]);

  const addProduct = () =>
    setProducts((p) => [{ id: `p_${Date.now()}`, name: 'New Product', price: 0, stock: 0 }, ...p]);

  const saveAll = () => {
    // TODO: call backend to persist
    console.log('SAVE tutorials', tutorials);
    console.log('SAVE products', products);
    alert('Saved (demo). Wire to your DB/storage next!');
  };

  return (
    <section className="rounded-2xl shadow bg-card">
      <div className="p-3 border-b border-border text-sm font-medium">Content & Products</div>
      <div className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Tutorials */}
        <div className="rounded-xl border border-input p-3 bg-popover">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">Tutorial Library</div>
            <button onClick={addTutorial} className="h-8 px-3 rounded-lg border border-border hover:bg-accent/20">Add</button>
          </div>
          <div className="grid gap-3">
            {tutorials.map((t) => (
              <div key={t.id} className="rounded-lg border border-border p-2">
                <div className="grid grid-cols-2 gap-2">
                  <input className="h-9 rounded bg-background px-2" placeholder="Title"
                    value={t.title} onChange={(e)=>setTutorials(arr=>arr.map(x=>x.id===t.id?{...x,title:e.target.value}:x))}/>
                  <input className="h-9 rounded bg-background px-2" placeholder="Category"
                    value={t.category||''} onChange={(e)=>setTutorials(arr=>arr.map(x=>x.id===t.id?{...x,category:e.target.value}:x))}/>
                  <input type="number" className="h-9 rounded bg-background px-2" placeholder="Price"
                    value={t.price||0} onChange={(e)=>setTutorials(arr=>arr.map(x=>x.id===t.id?{...x,price:Number(e.target.value)||0}:x))}/>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!t.isSubscription}
                      onChange={(e)=>setTutorials(arr=>arr.map(x=>x.id===t.id?{...x,isSubscription:e.target.checked}:x))}/>
                    Subscription
                  </label>
                  <input type="file" multiple className="col-span-2"
                    onChange={(e)=>setTutorials(arr=>arr.map(x=>x.id===t.id?{...x,files: e.target.files? Array.from(e.target.files): []}:x))}/>
                </div>
              </div>
            ))}
            {!tutorials.length && <div className="text-sm text-muted-foreground">No tutorials yet.</div>}
          </div>
        </div>

        {/* Products */}
        <div className="rounded-xl border border-input p-3 bg-popover">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">Makeup Products</div>
            <button onClick={addProduct} className="h-8 px-3 rounded-lg border border-border hover:bg-accent/20">Add</button>
          </div>
          <div className="grid gap-3">
            {products.map((p) => (
              <div key={p.id} className="rounded-lg border border-border p-2">
                <div className="grid grid-cols-2 gap-2">
                  <input className="h-9 rounded bg-background px-2" placeholder="Name"
                    value={p.name} onChange={(e)=>setProducts(arr=>arr.map(x=>x.id===p.id?{...x,name:e.target.value}:x))}/>
                  <input className="h-9 rounded bg-background px-2" placeholder="SKU"
                    value={p.sku||''} onChange={(e)=>setProducts(arr=>arr.map(x=>x.id===p.id?{...x,sku:e.target.value}:x))}/>
                  <input type="number" className="h-9 rounded bg-background px-2" placeholder="Price"
                    value={p.price||0} onChange={(e)=>setProducts(arr=>arr.map(x=>x.id===p.id?{...x,price:Number(e.target.value)||0}:x))}/>
                  <input type="number" className="h-9 rounded bg-background px-2" placeholder="Stock"
                    value={p.stock||0} onChange={(e)=>setProducts(arr=>arr.map(x=>x.id===p.id?{...x,stock:Number(e.target.value)||0}:x))}/>
                </div>
              </div>
            ))}
            {!products.length && <div className="text-sm text-muted-foreground">No products yet.</div>}
          </div>
        </div>
      </div>

      <div className="p-3 flex items-center justify-end">
        <button onClick={saveAll} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground">Save</button>
      </div>
    </section>
  );
}
