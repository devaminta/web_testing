"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import type { ContentItem } from "@/types/content";

export default function UpdateContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    status: "",
    contentType: "",
    mediaType: "",
  });

  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const contentId = resolvedParams.id;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const token = session?.user?.accessToken;
        if (!token) throw new Error('No authentication token');

        const response = await fetch(`http://localhost:3000/reel/${contentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch content');
        const data = await response.json();
        setContent(data);
        setFormData({
          description: data.description || "",
          status: data.status || "",
          contentType: data.contentType || "",
          mediaType: data.mediaType || "",
        });
      } catch (error) {
        console.error('Error fetching content:', error);
        toast.error('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.accessToken) {
      fetchContent();
    }
  }, [contentId, session?.user?.accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = session?.user?.accessToken;
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`http://localhost:3000/reel/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update content');
      
      toast.success('Content updated successfully');
      router.push('/content-management');
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Content not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Update Content</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter content description"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="contentType" className="text-sm font-medium">
                Content Type
              </label>
              <Select
                value={formData.contentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, contentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="mediaType" className="text-sm font-medium">
                Media Type
              </label>
              <Select
                value={formData.mediaType}
                onValueChange={(value) =>
                  setFormData({ ...formData, mediaType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select media type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/content-management')}
              >
                Cancel
              </Button>
              <Button type="submit">Update Content</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 