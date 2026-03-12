import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({
    name: "Admin ReadyRoom",
    role: "Administrator",
    avatar: "/profile.jpg",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("adminUser");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      setUser({
        name: parsedUser.name || "Admin ReadyRoom",
        role: parsedUser.role || "Administrator",
        avatar: parsedUser.avatar || "/profile.jpg",
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    toast.success("Logout berhasil");

    setTimeout(() => {
      navigate("/admin/login");
    }, 800);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-6">
        <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>

        <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-3 py-2 w-72">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search hotels, rooms..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer">
          <Bell className="text-gray-600 hover:text-red-600 transition" size={22} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full"></span>
        </div>

        <div className="relative">
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img
              src={user.avatar}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border"
            />

            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role}
              </p>
            </div>

            <ChevronDown size={18} className="text-gray-500" />
          </div>

          {open && (
            <div className="absolute right-0 mt-3 w-48 bg-white border rounded-xl shadow-lg py-2 z-50">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                Profile
              </button>

              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                Settings
              </button>

              <hr className="my-1" />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}