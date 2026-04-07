import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import BroadcastModal from "./BroadcastModal";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({
    id: null,
    name: "Admin ReadyRoom",
    role: "Administrator",
    avatar: "/profile.jpg",
  });

  const [broadcasts, setBroadcasts] = useState([]);
  const [activeBroadcast, setActiveBroadcast] = useState(null);
  const [closingBroadcast, setClosingBroadcast] = useState(false);

  const navigate = useNavigate();

  const normalizedRole = useMemo(() => {
    return (user?.role || "").toLowerCase();
  }, [user]);

  const shouldShowBroadcast =
    normalizedRole &&
    user?.id &&
    !["boss", "it", "administrator"].includes(normalizedRole);

  const fetchActiveBroadcasts = useCallback(async (role, userId) => {
    if (!role || !userId) return;

    try {
      const response = await api.get(
        `/admin/internal-broadcasts/active?role=${role}&user_id=${userId}`
      );

      const broadcastData = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];

      setBroadcasts(broadcastData);

      if (broadcastData.length > 0) {
        setActiveBroadcast(broadcastData[0]);
      } else {
        setActiveBroadcast(null);
      }
    } catch (error) {
      console.error(
        "GET ACTIVE BROADCAST ERROR:",
        error.response?.data || error
      );
      setBroadcasts([]);
      setActiveBroadcast(null);
    }
  }, []);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("adminUser") || localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      setUser({
        id: parsedUser.id || null,
        name: parsedUser.name || "Admin ReadyRoom",
        role: parsedUser.role || "Administrator",
        avatar: parsedUser.avatar || "/profile.jpg",
      });
    }
  }, []);

  useEffect(() => {
    if (!shouldShowBroadcast) {
      setBroadcasts([]);
      setActiveBroadcast(null);
      return;
    }

    fetchActiveBroadcasts(normalizedRole, user.id);
  }, [normalizedRole, shouldShowBroadcast, user?.id, fetchActiveBroadcasts]);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    toast.success("Logout berhasil");

    setTimeout(() => {
      navigate("/admin/login");
    }, 800);
  };

  const handleCloseBroadcast = async () => {
    if (!activeBroadcast?.id || !user?.id || closingBroadcast) {
      setActiveBroadcast(null);
      return;
    }

    try {
      setClosingBroadcast(true);

      await api.post(
        `/admin/internal-broadcasts/${activeBroadcast.id}/dismiss`,
        {
          user_id: user.id,
        }
      );

      const nextBroadcasts = broadcasts.filter(
        (item) => Number(item.id) !== Number(activeBroadcast.id)
      );

      setBroadcasts(nextBroadcasts);
      setActiveBroadcast(nextBroadcasts.length > 0 ? nextBroadcasts[0] : null);
    } catch (error) {
      console.error(
        "DISMISS BROADCAST ERROR:",
        error.response?.data || error
      );
      toast.error(
        error.response?.data?.message || "Gagal menutup broadcast"
      );
    } finally {
      setClosingBroadcast(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>

          <div className="hidden w-72 items-center rounded-xl bg-gray-100 px-3 py-2 md:flex">
            <Search size={18} className="mr-2 text-gray-400" />
            <input
              type="text"
              placeholder="Search hotels, rooms..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer">
            <Bell
              className="text-gray-600 transition hover:text-red-600"
              size={22}
            />
            {broadcasts.length > 0 && shouldShowBroadcast && (
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-600"></span>
            )}
          </div>

          <div className="relative">
            <div
              onClick={() => setOpen(!open)}
              className="flex cursor-pointer items-center gap-3"
            >
              <img
                src={user.avatar}
                alt="Profile"
                className="h-10 w-10 rounded-full border object-cover"
              />

              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-gray-800">
                  {user.name}
                </p>
                <p className="text-xs capitalize text-gray-500">{user.role}</p>
              </div>

              <ChevronDown size={18} className="text-gray-500" />
            </div>

            {open && (
              <div className="absolute right-0 z-50 mt-3 w-48 rounded-xl border bg-white py-2 shadow-lg">
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                  Profile
                </button>

                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                  Settings
                </button>

                <hr className="my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <BroadcastModal
        broadcast={activeBroadcast}
        onClose={handleCloseBroadcast}
      />
    </>
  );
}