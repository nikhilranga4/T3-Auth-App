"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";

type Post = RouterOutputs["post"]["getAll"][number];

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ name });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.status === "pending"}
        >
          {createPost.status === "pending" ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export function CreatePost() {
  const [name, setName] = useState("");

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      setName("");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createPost.mutate({ name });
      }}
      className="flex flex-col gap-2"
    >
      <input
        type="text"
        placeholder="Title"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <button
        type="submit"
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={createPost.status === "pending"}
      >
        {createPost.status === "pending" ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

export function PostList() {
  const { data: posts, status } = api.post.getAll.useQuery();

  if (status === "pending") return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-4">
      {posts?.map((post: Post) => (
        <div key={post.id} className="flex gap-4">
          <h3 className="text-2xl font-bold">{post.name}</h3>
          <p className="text-sm text-gray-400">
            {post.createdAt.toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
