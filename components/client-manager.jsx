"use client";

import { useState } from "react";

const emptyClient = { name: "", phone: "", email: "", vehiclePlate: "" };

export function ClientManager({ initialClients }) {
  const [clients, setClients] = useState(initialClients);
  const [client, setClient] = useState(emptyClient);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  async function saveClient(event) {
    event.preventDefault();
    setMessage("");

    if (!client.name.trim()) {
      setMessage("Informe o nome do cliente.");
      return;
    }

    const response = await fetch(editingId ? `/api/clients/${editingId}` : "/api/clients", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error || "Nao foi possivel salvar o cliente.");
      return;
    }

    setClients(payload.clients);
    setClient(emptyClient);
    setEditingId(null);
  }

  function editClient(item) {
    setEditingId(item.id);
    setMessage("");
    setClient({
      name: item.name || "",
      phone: item.phone || "",
      email: item.email || "",
      vehiclePlate: item.vehicle_plate || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setMessage("");
    setClient(emptyClient);
  }

  async function removeClient(id) {
    const response = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error || "Nao foi possivel remover o cliente.");
      return;
    }

    setClients(payload.clients);
    if (editingId === id) {
      cancelEdit();
    }
  }

  return (
    <section className="grid gap-5">
      <form
        className="rounded-lg border border-zinc-200/80 bg-white/85 p-5 shadow-xl shadow-zinc-900/[0.04] backdrop-blur"
        onSubmit={saveClient}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Cadastro</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">
              {editingId ? "Editar cliente" : "Novo cliente"}
            </h2>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500">
            {editingId ? "Atualizando cadastro" : "Base comercial"}
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-[repeat(2,minmax(160px,1fr))_140px_116px] lg:grid-cols-[repeat(4,minmax(140px,1fr))_auto] md:items-end">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-600" htmlFor="name">
              Nome
            </label>
            <input
              className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              id="name"
              onChange={(event) =>
                setClient((current) => ({ ...current, name: event.target.value }))
              }
              value={client.name}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-600" htmlFor="phone">
              Telefone
            </label>
            <input
              className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              id="phone"
              onChange={(event) =>
                setClient((current) => ({ ...current, phone: event.target.value }))
              }
              value={client.phone}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-600" htmlFor="email">
              E-mail
            </label>
            <input
              className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              id="email"
              onChange={(event) =>
                setClient((current) => ({ ...current, email: event.target.value }))
              }
              type="email"
              value={client.email}
            />
          </div>
          <div className="grid gap-2">
            <label
              className="text-sm font-medium text-zinc-600"
              htmlFor="vehiclePlate"
            >
              Placa
            </label>
            <input
              className="h-11 rounded-lg border border-zinc-200 bg-white px-3 uppercase text-zinc-950 outline-none transition placeholder:normal-case placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              id="vehiclePlate"
              onChange={(event) =>
                setClient((current) => ({
                  ...current,
                  vehiclePlate: event.target.value.toUpperCase(),
                }))
              }
              placeholder="Sem placa"
              value={client.vehiclePlate}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-800"
              type="submit"
            >
              {editingId ? "Atualizar" : "Salvar"}
            </button>
            {editingId ? (
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                onClick={cancelEdit}
                type="button"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </div>
        {message ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {message}
          </div>
        ) : null}
      </form>

      <div className="overflow-x-auto rounded-lg border border-zinc-200/80 bg-white/85 shadow-xl shadow-zinc-900/[0.04] backdrop-blur">
        <table className="w-full min-w-[860px] border-collapse">
          <thead className="bg-zinc-50/80">
            <tr className="text-left text-xs font-semibold text-zinc-500">
              <th className="px-5 py-4">Nome</th>
              <th className="px-5 py-4">Telefone</th>
              <th className="px-5 py-4">E-mail</th>
              <th className="px-5 py-4">Placa</th>
              <th className="px-5 py-4">Cadastro</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {clients.map((item) => (
              <tr className="text-sm text-zinc-700" key={item.id}>
                <td className="px-5 py-4 font-medium text-zinc-950">{item.name}</td>
                <td className="px-5 py-4">{item.phone || "-"}</td>
                <td className="px-5 py-4">{item.email || "-"}</td>
                <td className="px-5 py-4 font-medium text-zinc-700">
                  {item.vehicle_plate || "Sem placa"}
                </td>
                <td className="px-5 py-4 text-zinc-500">
                  {new Date(`${item.created_at}Z`).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="inline-flex min-h-9 items-center justify-center rounded-lg bg-zinc-100 px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200"
                      onClick={() => editClient(item)}
                      type="button"
                    >
                      Editar
                    </button>
                    <button
                      className="inline-flex min-h-9 items-center justify-center rounded-lg bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      onClick={() => removeClient(item.id)}
                      type="button"
                    >
                      Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!clients.length ? (
          <div className="border-t border-zinc-100 px-6 py-10 text-center text-sm text-zinc-500">
            Nenhum cliente cadastrado ainda.
          </div>
        ) : null}
      </div>
    </section>
  );
}
