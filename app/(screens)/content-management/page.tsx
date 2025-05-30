"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentList } from "@/components/content-management/list";
import { ContentDrawer } from "@/components/content-management/drawer";
import type { ContentItem, ViewMode } from "@/types/content";
import { Filter, Search, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export default function ContentManagementPage() {
  const { data: session } = useSession();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const router = useRouter();
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    action: string;
    contentId: string;
  }>({
    isOpen: false,
    action: "",
    contentId: "",
  });

  // Fetch content data
  useEffect(() => {
    const fetchContents = async () => {
      try {
        setIsLoading(true);
        const token = session?.user?.accessToken;
        if (!token) {
          throw new Error('No authentication token available');
        }

        console.log('Fetching contents with token:', token.substring(0, 10) + '...');
        
        const response = await fetch(
          `http://localhost:3000/reel/many?page=${currentPage}&limit=${itemsPerPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw new Error(`Failed to fetch contents: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Handle both array and object response formats
        const contentData = Array.isArray(data) ? data : data.data;
        
        if (!contentData || !Array.isArray(contentData)) {
          console.error('Invalid data format:', data);
          throw new Error('Invalid data format received from API');
        }

        setContents(contentData);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error fetching contents:', err);
        setError(`Error loading content: ${errorMessage}`);
        setContents([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.accessToken) {
      fetchContents();
    } else {
      setError('Please log in to view content');
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, session?.user?.accessToken]);

  // Filter content based on selected filters and search query
  const filteredContent = contents.filter((item) => {
    if (!item) return false;

    const matchesSearch =
      searchQuery === "" ||
      (item.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (item.profile?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesContentType =
      contentTypeFilter === "all" || item.contentType === contentTypeFilter;

    const matchesMediaType =
      mediaTypeFilter === "all" || item.mediaType === mediaTypeFilter;

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesContentType && matchesMediaType && matchesStatus;
  });

  const handleViewContent = (content: ContentItem) => {
    setSelectedContent(content);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleContentAction = async (contentId: string, action: string) => {
    if (action === "delete" || action === "update") {
      setConfirmationDialog({
        isOpen: true,
        action,
        contentId,
      });
      return;
    }

    await performAction(contentId, action);
  };

  const performAction = async (contentId: string, action: string) => {
    try {
      const token = session?.user?.accessToken;
      if (!token) throw new Error('No authentication token');

      if (action === "update") {
        router.push(`/content-management/update/${contentId}`);
        return;
      } else if (action === "delete") {
        const response = await fetch(`http://localhost:3000/reel/${contentId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Delete Error Response:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw new Error(`Failed to delete content: ${response.status} ${response.statusText}`);
        }

        toast.success("Content deleted successfully");
      }

      // Refresh the content list
      const updatedResponse = await fetch(
        `http://localhost:3000/reel/many?page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!updatedResponse.ok) {
        throw new Error('Failed to refresh content list');
      }

      const updatedData = await updatedResponse.json();
      const contentData = Array.isArray(updatedData) ? updatedData : updatedData.data;
      
      if (!contentData || !Array.isArray(contentData)) {
        throw new Error('Invalid data format received while refreshing content');
      }

      setContents(contentData);
      
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    } catch (error) {
      console.error("Error performing action:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(errorMessage);
    }
  };

  const handleConfirmAction = async () => {
    await performAction(confirmationDialog.contentId, confirmationDialog.action);
    setConfirmationDialog({ isOpen: false, action: "", contentId: "" });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setContentTypeFilter("all");
    setMediaTypeFilter("all");
    setStatusFilter("all");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Contents</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Tabs
            defaultValue="table"
            value={viewMode}
            onValueChange={(value) => setViewMode(value as ViewMode)}
            className="hidden sm:block"
          >
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="cards">Card View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Filter Section */}
      <Card className={`${showFilters ? "block" : "hidden sm:block"}`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full sm:w-auto flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search content or users..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Select
                value={contentTypeFilter}
                onValueChange={setContentTypeFilter}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="comment">Comments</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={mediaTypeFilter}
                onValueChange={setMediaTypeFilter}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Media Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Media</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-9"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      <ContentList
        contentItems={filteredContent}
        viewMode={viewMode}
        onViewContent={handleViewContent}
        onContentAction={handleContentAction}
      />

      {/* Content Drawer */}
      <ContentDrawer
        content={selectedContent}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onContentAction={handleContentAction}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={() => setConfirmationDialog({ isOpen: false, action: "", contentId: "" })}
        onConfirm={handleConfirmAction}
        title={confirmationDialog.action === "delete" ? "Delete Content" : "Update Content"}
        description={
          confirmationDialog.action === "delete"
            ? "Are you sure you want to delete this content? This action cannot be undone."
            : "Are you sure you want to update this content? You will be redirected to the update page."
        }
        confirmText={confirmationDialog.action === "delete" ? "Delete" : "Update"}
      />
    </div>
  );
}
