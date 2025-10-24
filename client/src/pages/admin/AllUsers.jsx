import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const AllUsers = () => {
  const [allUser, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/getAllUsers?searchTerm=${search}`);
      const data = await res.json();

      if (data && data?.success === false) {
        setLoading(false);
        setError(data?.message);
      } else {
        setLoading(false);
        setAllUsers(data);
        setError(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getUsers();
    if (search) getUsers();
  }, [search]);

  const handleUserDelete = async (userId) => {
    const CONFIRM = confirm(
      "Are you sure ? the account will be permenantly deleted!"
    );
    if (CONFIRM) {
      setLoading(true);
      try {
        const res = await fetch(`/api/user/delete-user/${userId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data?.success === false) {
          setLoading(false);
          toast.error("Something went wrong!");
          return;
        }
        setLoading(false);
        toast.success(data?.message);
        getUsers();
      } catch (error) {}
    }
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="w-full shadow-lg rounded-lg p-2">
          <h1 className="text-2xl text-center font-bold mb-4">
            {loading ? "Loading..." : "All Registered Users"}
          </h1>
          {error && <h1 className="text-center text-2xl text-red-600">{error}</h1>}
          <div className="mb-4">
            <input
              type="text"
              className="my-3 p-2 rounded-lg border w-full md:w-1/2"
              placeholder="Search name, email or phone..."
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            <h2 className="text-xl font-semibold mb-2 ml-2 text-blue-600">
              Total Registered Users: {allUser.length ? allUser?.length : "Loading..."}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Username</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Address</th>
                  <th className="p-3 text-left">Joined Date</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {allUser && allUser.length > 0 ? (
                  allUser.map((user, i) => (
                    <tr
                      className="border-b hover:bg-gray-50"
                      key={i}
                    >
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3 font-semibold">{user.username}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">{user.phone || 'N/A'}</td>
                      <td className="p-3">{user.address || 'N/A'}</td>
                      <td className="p-3">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}</td>
                      <td className="p-3 text-center">
                        <button
                          disabled={loading}
                          className="p-2 text-red-500 hover:bg-red-100 rounded hover:scale-110 disabled:opacity-80 transition-all"
                          onClick={() => handleUserDelete(user._id)}
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllUsers;
