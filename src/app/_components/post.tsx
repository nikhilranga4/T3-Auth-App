"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "~/components/ui/use-toast";

interface Post {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

export function LatestPost() {
  const [latestPost, setLatestPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const fetchLatestPost = async () => {
    try {
      const response = await fetch("/api/posts/latest");
      if (!response.ok) throw new Error("Failed to fetch latest post");
      const data = (await response.json()) as Post;
      setLatestPost(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch latest post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLatestPost();
  }, []);

  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error("Failed to create post");

      setName("");
      await fetchLatestPost();
      toast({
        description: "Post created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
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
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = (await response.json()) as Post[];
      setPosts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-4">
      {posts?.map((post) => (
        <div key={post.id} className="flex gap-4">
          <h3 className="text-2xl font-bold">{post.name}</h3>
          <p className="text-sm text-gray-400">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
