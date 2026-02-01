import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await fetch("http://localhost:5000/api/admin/users", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();
    setUsers(data.users || []);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">User Directory</h1>

      {users.map(u => (
        <div key={u.id} className="bg-slate-800 p-4 mb-3 rounded">
          <p className="font-semibold">{u.email}</p>
          <p className="text-gray-400 text-sm">
            Joined: {new Date(u.created_at).toDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
