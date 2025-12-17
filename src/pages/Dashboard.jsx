import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const STATUSES = ["applied", "interview", "offer", "rejected", "saved"];

const emptyJob = {
  title: "",
  company: "",
  link: "",
  status: "applied",
  appliedDate: "",
  notes: "",
};

export default function Dashboard({ onLogout }) {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyJob);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function fetchJobs() {
    setLoading(true);
    try {
      const { data } = await api.get("/jobs", {
        params: { status: filter, search },
      });
      setJobs(data);
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout?.();
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.company) return;

    try {
      if (editingId) {
        await api.put(`/jobs/${editingId}`, form);
      } else {
        await api.post("/jobs", form);
      }
      setForm(emptyJob);
      setEditingId(null);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(job) {
    setForm({
      title: job.title,
      company: job.company,
      link: job.link || "",
      status: job.status,
      appliedDate: job.appliedDate ? job.appliedDate.slice(0, 10) : "",
      notes: job.notes || "",
    });
    setEditingId(job._id);
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/jobs/${id}`);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  }

  function logout() {
    onLogout?.(); // clears token + localStorage in App
    navigate("/login", { replace: true });
  }

  return (
    <div className="space-y-3">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Your Jobs</h1>
          <p className="text-xs text-slate-500">
            Track your applications in one place
          </p>
        </div>
        <button
          onClick={logout}
          className="text-xs text-rose-600 border border-rose-200 px-2 py-1 rounded-lg"
        >
          Logout
        </button>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-3 space-y-2"
      >
        <div className="flex flex-col gap-2">
          <input
            name="title"
            placeholder="Job title"
            value={form.title}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="company"
            placeholder="Company"
            value={form.company}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="link"
            placeholder="Job link"
            value={form.link}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="appliedDate"
              value={form.appliedDate}
              onChange={handleChange}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <textarea
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full mt-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium"
        >
          {editingId ? "Update job" : "Add job"}
        </button>
      </form>

      <div className="flex gap-2 items-center">
        <input
          placeholder="Search by title or company"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs border ${
              filter === s
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-xs text-slate-500">Loading...</p>
      ) : jobs.length === 0 ? (
        <p className="text-center text-xs text-slate-500">
          No jobs. Add your first application.
        </p>
      ) : (
        <ul className="space-y-2">
          {jobs.map((job) => (
            <li
              key={job._id}
              className="bg-white rounded-xl shadow-sm p-3 flex flex-col gap-1"
            >
              <div className="flex justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold">{job.title}</h3>
                  <p className="text-xs text-slate-500">{job.company}</p>
                  {job.link && (
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 underline"
                    >
                      View posting
                    </a>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-800">
                    {job.status.toUpperCase()}
                  </span>
                  {job.appliedDate && (
                    <p className="text-[10px] text-slate-500">
                      {job.appliedDate.slice(0, 10)}
                    </p>
                  )}
                </div>
              </div>
              {job.notes && (
                <p className="text-xs text-slate-700 mt-1 whitespace-pre-line">
                  {job.notes}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleEdit(job)}
                  className="px-2 py-1 rounded-lg border border-slate-300 text-xs text-slate-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(job._id)}
                  className="px-2 py-1 rounded-lg bg-rose-500 text-white text-xs"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
