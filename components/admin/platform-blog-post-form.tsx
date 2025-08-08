
"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { SettingsCard } from "@/components/settings/settings-card";
import { SettingsFormField } from "@/components/settings/settings-form-field";
import { SettingsInput } from "@/components/settings/settings-input";
import { SettingsTextarea } from "@/components/settings/settings-textarea";
import { SettingsToggle } from "@/components/settings/settings-toggle";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createPlatformBlogPostAction, updatePlatformBlogPostAction } from "@/app/actions";
import { toast } from "sonner";
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

interface PlatformBlogPost {
  id: string;
  blogId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  author: string;
  tags: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
}

interface PlatformBlogPostFormProps {
  blogId: string;
  post?: PlatformBlogPost; // Optional for edit mode
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
      ) : (
        "Save Post"
      )}
    </Button>
  );
}

export function PlatformBlogPostForm({ blogId, post }: PlatformBlogPostFormProps) {
  const isEditMode = !!post;
  const action = isEditMode ? updatePlatformBlogPostAction : createPlatformBlogPostAction;

  const [state, formAction] = useFormState(action, {
    message: "",
    success: false,
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Write your blog post content here...',
      }),
    ],
    content: post?.content || '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none',
      },
    },
  });

  // Display toast messages based on form state changes
  useState(() => {
    if (state.success) {
      toast.success(state.message);
    } else if (state.message) {
      toast.error(state.message);
    }
  });

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="blogId" value={blogId} />
      {isEditMode && <input type="hidden" name="postId" value={post.id} />}

      <SettingsCard
        title={isEditMode ? "Edit Blog Post" : "New Blog Post"}
        description="Create or update a platform blog post."
      >
        <SettingsFormField label="Title">
          <SettingsInput
            name="title"
            defaultValue={post?.title || ""}
            placeholder="My Awesome Blog Post"
            required
          />
        </SettingsFormField>
        <SettingsFormField label="Slug (URL Path)">
          <SettingsInput
            name="slug"
            defaultValue={post?.slug || ""}
            placeholder="my-awesome-blog-post"
            required
          />
        </SettingsFormField>
        <SettingsFormField label="Excerpt">
          <SettingsTextarea
            name="excerpt"
            defaultValue={post?.excerpt || ""}
            placeholder="A short summary of your blog post."
          />
        </SettingsFormField>
        <SettingsFormField label="Content">
          <div className="border rounded-md p-2 min-h-[200px]">
            <EditorContent editor={editor} />
          </div>
          <input type="hidden" name="content" value={editor?.getHTML() || ''} />
        </SettingsFormField>
        <SettingsFormField label="Featured Image URL">
          <SettingsInput
            name="featuredImage"
            defaultValue={post?.featuredImage || ""}
            placeholder="https://example.com/image.jpg"
          />
        </SettingsFormField>
        <SettingsFormField label="Author">
          <SettingsInput
            name="author"
            defaultValue={post?.author || "Admin"}
            placeholder="Admin"
            required
          />
        </SettingsFormField>
        <SettingsFormField label="Tags (comma-separated)">
          <SettingsInput
            name="tags"
            defaultValue={post?.tags || ""}
            placeholder="tag1, tag2, tag3"
          />
        </SettingsFormField>
      </SettingsCard>

      <SettingsCard
        title="SEO Settings"
        description="Optimize your blog post for search engines."
      >
        <SettingsFormField label="SEO Title">
          <SettingsInput
            name="seoTitle"
            defaultValue={post?.seoTitle || ""}
            placeholder="SEO Friendly Title"
          />
        </SettingsFormField>
        <SettingsFormField label="SEO Description">
          <SettingsTextarea
            name="seoDescription"
            defaultValue={post?.seoDescription || ""}
            placeholder="A brief description for search engines."
          />
        </SettingsFormField>
      </SettingsCard>

      <SettingsCard
        title="Publishing Options"
        description="Control the visibility of your blog post."
      >
        <SettingsFormField label="Publish Post">
          <SettingsToggle
            name="isPublished"
            defaultChecked={post?.isPublished || false}
          />
        </SettingsFormField>
      </SettingsCard>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
