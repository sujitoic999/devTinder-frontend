import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect, useRef } from "react";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    if (user) return;

    const controller = new AbortController();
    const fetchUser = async () => {
      try {
        const response = await axios.get(BASE_URL + "/profile/view", {
          withCredentials: true,
          signal: controller.signal,
        });
        dispatch(addUser(response.data));
      } catch (err) {
        if (controller.signal.aborted) return;

        if (err.response?.status === 401 && !userRef.current) {
          navigate("/login");
        }
        console.log(err);
      }
    };

    fetchUser();
    return () => controller.abort();
  }, [dispatch, navigate, user]);
  return (
    <div>
      <Navbar />
      <div className="pt-20">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Body;
