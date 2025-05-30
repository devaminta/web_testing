"use client";

import { useState } from "react";
import type { ContentItem, ViewMode } from "@/types/content";
import { TableView } from "./table-view";
import { CardView } from "./card-view";
import { ContentPagination } from "./pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Inbox, MoreHorizontal, Eye, CheckCircle, Trash2 } from "lucide-react";
import Image from "next/image";

interface ContentListProps {
  contentItems: ContentItem[];
  viewMode: ViewMode;
  onViewContent: (content: ContentItem) => void;
  onContentAction: (contentId: string, action: string) => void;
}

export function ContentList({
  contentItems,
  viewMode,
  onViewContent,
  onContentAction,
}: ContentListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(contentItems.length / itemsPerPage);
  const paginatedItems = contentItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      {viewMode === "table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Inbox className="h-8 w-8 mb-2" />
                      <p>No content found</p>
                      <p className="text-sm">Try adjusting your filters or search query</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                contentItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.mediaType === "image" && item.mediaUrl && (
                          <div className="relative h-10 w-10 rounded-md overflow-hidden">
                            <Image
                              src={item.mediaUrl}
                              alt={item.description || "Content image"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="max-w-[300px]">
                          <p className="font-medium line-clamp-1">
                            {item.description || "No description"}
                          </p>
                          {item.mediaType === "video" && (
                            <p className="text-sm text-muted-foreground">Video content</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.profile?.avatarUrl && (
                          <div className="relative h-8 w-8 rounded-full overflow-hidden">
                            <Image
                              src={item.profile.avatarUrl}
                              alt={item.profile.name || "User avatar"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span>{item.profile?.name || "Unknown user"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {item.contentType || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "approved"
                            ? "success"
                            : item.status === "rejected"
                            ? "destructive"
                            : "default"
                        }
                        className="capitalize"
                      >
                        {item.status || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "Unknown date"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewContent(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onContentAction(item.id, "update")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Update
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onContentAction(item.id, "delete")}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentItems.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Inbox className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No content found</p>
              <p className="text-sm">Try adjusting your filters or search query</p>
            </div>
          ) : (
            contentItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {item.mediaType === "image" && item.mediaUrl && (
                      <div className="relative h-48 w-full rounded-md overflow-hidden">
                        <Image
                          src={item.mediaUrl}
                          alt={item.description || "Content image"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="line-clamp-2">
                        {item.description || "No description"}
                      </p>
                      <div className="flex items-center gap-2">
                        {item.profile?.avatarUrl && (
                          <div className="relative h-6 w-6 rounded-full overflow-hidden">
                            <Image
                              src={item.profile.avatarUrl}
                              alt={item.profile.name || "User avatar"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {item.profile?.name || "Unknown user"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {item.contentType || "Unknown"}
                        </Badge>
                        <Badge
                          variant={
                            item.status === "approved"
                              ? "success"
                              : item.status === "rejected"
                              ? "destructive"
                              : "default"
                          }
                          className="capitalize"
                        >
                          {item.status || "Unknown"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "Unknown date"}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewContent(item)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onContentAction(item.id, "update")}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Update
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onContentAction(item.id, "delete")}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {contentItems.length > 0 && (
        <ContentPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={contentItems.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
