import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { addFeed } from '../utils/feedSlice';
import UserCard from './UserCard';

const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);
  const user = useSelector((store) => store.user);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!user || feed !== null) return;

    const controller = new AbortController();
    const getFeed = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await axios.get(BASE_URL + '/feed', {
          withCredentials: true,
          signal: controller.signal,
        });
        if (!Array.isArray(response.data.data)) {
          throw new Error('The feed response was invalid. Please try again.');
        }
        dispatch(addFeed(response.data.data));
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Unable to load the feed.',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    getFeed();
    return () => controller.abort();
  }, [dispatch, feed, retryCount, user]);

  if (!user || (feed === null && isLoading)) {
    return <p className="flex justify-center m-52 text-3xl">Loading feed...</p>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 m-52">
        <p className="text-center text-red-500">{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => setRetryCount((count) => count + 1)}
        >
          Retry
        </button>
      </div>
    );
  }

  if (feed === null) return null;

  if (feed.length <= 0)
    return (
      <h1 className="flex justify-center m-52 text-3xl">No more users!!!!</h1>
    );
  return (
    <div className="flex flex-col items-center gap-4 my-5">
      {feed.map((user) => <UserCard key={user._id} user={user} />)}
    </div>
  );
};

export default Feed;
