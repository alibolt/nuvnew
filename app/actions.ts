'use server';

import { redis } from '@/lib/redis';
import { isValidIcon } from '@/lib/subdomains';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { rootDomain, protocol } from '@/lib/utils';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { cookies } from 'next/headers'; // Import cookies

export async function createSubdomainAction(
  prevState: any,
  formData: FormData
) {
  const subdomain = formData.get('subdomain') as string;
  const icon = formData.get('icon') as string;

  if (!subdomain || !icon) {
    return { success: false, error: 'Subdomain and icon are required' };
  }

  if (!isValidIcon(icon)) {
    return {
      subdomain,
      icon,
      success: false,
      error: 'Please enter a valid emoji (maximum 10 characters)'
    };
  }

  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

  if (sanitizedSubdomain !== subdomain) {
    return {
      subdomain,
      icon,
      success: false,
      error:
        'Subdomain can only have lowercase letters, numbers, and hyphens. Please try again.'
    };
  }

  const subdomainAlreadyExists = await redis.get(
    `subdomain:${sanitizedSubdomain}`
  );
  if (subdomainAlreadyExists) {
    return {
      subdomain,
      icon,
      success: false,
      error: 'This subdomain is already taken'
    };
  }

  await redis.set(`subdomain:${sanitizedSubdomain}`, {
    emoji: icon,
    createdAt: Date.now()
  });

  redirect(`${protocol}://${sanitizedSubdomain}.${rootDomain}`);
}

export async function deleteSubdomainAction(
  prevState: any,
  formData: FormData
) {
  const subdomain = formData.get('subdomain');
  await redis.del(`subdomain:${subdomain}`);
  revalidatePath('/admin');
  return { success: 'Domain deleted successfully' };
}

export async function deleteUserAction(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: You must be an admin to perform this action.');
  }

  if (session.user.id === userId) {
    throw new Error('Bad Request: Admins cannot delete their own accounts.');
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    // Revalidate the users list page to show the change immediately
    revalidatePath('/admin/users');
    
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error('Database Error: Failed to delete user.');
  }

  // Redirect to the users list after successful deletion
  redirect('/admin/users');
}

export async function deleteStoreAction(subdomain: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: You must be an admin to perform this action.');
  }

  try {
    // First find the store by subdomain
    const store = await prisma.store.findFirst({
      where: { subdomain: subdomain }
    });
    
    if (!store) {
      throw new Error('Store not found');
    }

    await prisma.store.delete({
      where: { id: store.id },
    });

    // Revalidate the stores list page to show the change immediately
    revalidatePath('/admin/stores');
    
  } catch (error) {
    console.error("Error deleting store:", error);
    throw new Error('Database Error: Failed to delete store.');
  }

  // Redirect to the stores list after successful deletion
  redirect('/admin/stores');
}

interface FormState {
  message: string;
  success: boolean;
}

export async function updatePlatformSettingsAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return { message: 'Unauthorized: You must be an admin to perform this action.', success: false };
  }

  const platformName = formData.get('platformName') as string;
  const defaultEmail = formData.get('defaultEmail') as string;
  const supportEmail = formData.get('supportEmail') as string;
  const defaultCurrency = formData.get('defaultCurrency') as string;
  const maintenanceMode = formData.get('maintenanceMode') === 'on';
  const maintenanceMessage = formData.get('maintenanceMessage') as string | null;

  // SMTP Settings
  const smtpHost = formData.get('smtpHost') as string | null;
  const smtpPort = parseInt(formData.get('smtpPort') as string) || null;
  const smtpUsername = formData.get('smtpUsername') as string | null;
  const smtpPassword = formData.get('smtpPassword') as string | null;
  const smtpEncryption = formData.get('smtpEncryption') as string | null;

  // General Appearance & Branding
  const platformLogoUrl = formData.get('platformLogoUrl') as string | null;
  const faviconUrl = formData.get('faviconUrl') as string | null;
  const copyrightText = formData.get('copyrightText') as string | null;

  // Analytics & Tracking
  const googleAnalyticsId = formData.get('googleAnalyticsId') as string | null;
  const facebookPixelId = formData.get('facebookPixelId') as string | null;
  const tiktokPixelId = formData.get('tiktokPixelId') as string | null;
  const hotjarId = formData.get('hotjarId') as string | null;

  // Social Media Links (Platform's own)
  const facebookUrl = formData.get('facebookUrl') as string | null;
  const twitterUrl = formData.get('twitterUrl') as string | null;
  const linkedinUrl = formData.get('linkedinUrl') as string | null;
  const instagramUrl = formData.get('instagramUrl') as string | null;
  const youtubeUrl = formData.get('youtubeUrl') as string | null;

  try {
    // Find the single platform settings record, or create it if it doesn't exist
    let settings = await prisma.platformSettings.findFirst();

    if (settings) {
      await prisma.platformSettings.update({
        where: { id: settings.id },
        data: {
          platformName,
          defaultEmail,
          supportEmail,
          defaultCurrency,
          maintenanceMode,
          maintenanceMessage,
          smtpHost,
          smtpPort,
          smtpUsername,
          smtpPassword,
          smtpEncryption,
          platformLogoUrl,
          faviconUrl,
          copyrightText,
          googleAnalyticsId,
          facebookPixelId,
          tiktokPixelId,
          hotjarId,
          facebookUrl,
          twitterUrl,
          linkedinUrl,
          instagramUrl,
          youtubeUrl,
        },
      });
    } else {
      await prisma.platformSettings.create({
        data: {
          platformName,
          defaultEmail,
          supportEmail,
          defaultCurrency,
          maintenanceMode,
          maintenanceMessage,
          smtpHost,
          smtpPort,
          smtpUsername,
          smtpPassword,
          smtpEncryption,
          platformLogoUrl,
          faviconUrl,
          copyrightText,
          googleAnalyticsId,
          facebookPixelId,
          tiktokPixelId,
          hotjarId,
          facebookUrl,
          twitterUrl,
          linkedinUrl,
          instagramUrl,
          youtubeUrl,
        },
      });
    }

    revalidatePath('/admin/settings');
    return { message: 'Platform settings updated successfully!', success: true };
  } catch (error) {
    console.error("Error updating platform settings:", error);
    return { message: 'Failed to update platform settings.', success: false };
  }
}

export async function impersonateUserAction(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: You must be an admin to perform this action.');
  }

  // Store the current admin's session ID in a cookie to revert later
  cookies().set('impersonator_admin_id', session.user.id, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 }); // 1 day
  // Store the target user's ID in another cookie
  cookies().set('impersonate_target_user_id', userId, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 }); // 1 day

  // Redirect to dashboard, auth callback will handle session change
  redirect('/dashboard');
}

export async function stopImpersonatingAction() {
  const session = await getServerSession(authOptions);
  // Only allow stopping impersonation if currently impersonating
  if (!cookies().get('impersonator_admin_id')) {
    redirect('/admin'); // Not impersonating, just go to admin dashboard
  }

  const originalAdminId = cookies().get('impersonator_admin_id')?.value;

  // Clear impersonation cookies
  cookies().delete('impersonator_admin_id');
  cookies().delete('impersonate_target_user_id');

  // If we have the original admin ID, we'll just redirect to admin dashboard and they'll log in normally.
  redirect('/admin');
}

export async function deletePlatformBlogPostAction(postId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: You must be an admin to perform this action.');
  }

  try {
    await prisma.platformBlogPost.delete({
      where: { id: postId },
    });

    revalidatePath('/admin/blog');
    
  } catch (error) {
    console.error("Error deleting platform blog post:", error);
    throw new Error('Database Error: Failed to delete blog post.');
  }

  redirect('/admin/blog');
}

export async function createPlatformBlogPostAction(
  prevState: any,
  formData: FormData
): Promise<FormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return { message: 'Unauthorized: You must be an admin to perform this action.', success: false };
  }

  const blogId = formData.get('blogId') as string;
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string | null;
  const content = formData.get('content') as string;
  const featuredImage = formData.get('featuredImage') as string | null;
  const author = formData.get('author') as string;
  const tags = formData.get('tags') as string | null;
  const seoTitle = formData.get('seoTitle') as string | null;
  const seoDescription = formData.get('seoDescription') as string | null;
  const isPublished = formData.get('isPublished') === 'on';

  if (!title || !slug || !content || !author) {
    return { message: 'Title, Slug, Content, and Author are required.', success: false };
  }

  try {
    await prisma.platformBlogPost.create({
      data: {
        blog: { connect: { id: blogId } },
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        author,
        tags,
        seoTitle,
        seoDescription,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    revalidatePath('/admin/blog');
    return { message: 'Blog post created successfully!', success: true };
  } catch (error) {
    console.error("Error creating blog post:", error);
    return { message: 'Failed to create blog post.', success: false };
  }
}

export async function updatePlatformBlogPostAction(
  prevState: any,
  formData: FormData
): Promise<FormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return { message: 'Unauthorized: You must be an admin to perform this action.', success: false };
  }

  const postId = formData.get('postId') as string;
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string | null;
  const content = formData.get('content') as string;
  const featuredImage = formData.get('featuredImage') as string | null;
  const author = formData.get('author') as string;
  const tags = formData.get('tags') as string | null;
  const seoTitle = formData.get('seoTitle') as string | null;
  const seoDescription = formData.get('seoDescription') as string | null;
  const isPublished = formData.get('isPublished') === 'on';

  if (!postId || !title || !slug || !content || !author) {
    return { message: 'Post ID, Title, Slug, Content, and Author are required.', success: false };
  }

  try {
    await prisma.platformBlogPost.update({
      where: { id: postId },
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        author,
        tags,
        seoTitle,
        seoDescription,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    revalidatePath('/admin/blog');
    return { message: 'Blog post updated successfully!', success: true };
  } catch (error) {
    console.error("Error updating blog post:", error);
    return { message: 'Failed to update blog post.', success: false };
  }
}

export async function createPricingPlanAction(
  prevState: any,
  formData: FormData
): Promise<FormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return { message: 'Unauthorized: You must be an admin to perform this action.', success: false };
  }

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string | null;
  const priceMonthly = parseFloat(formData.get('priceMonthly') as string);
  const priceAnnually = parseFloat(formData.get('priceAnnually') as string);
  const features = JSON.parse(formData.get('features') as string || '[]');
  const isActive = formData.get('isActive') === 'on';

  if (!name || !slug || isNaN(priceMonthly) || isNaN(priceAnnually)) {
    return { message: 'Name, Slug, Monthly Price, and Annually Price are required.', success: false };
  }

  try {
    await prisma.pricingPlan.create({
      data: {
        name,
        slug,
        description,
        priceMonthly,
        priceAnnually,
        features,
        isActive,
      },
    });

    revalidatePath('/admin/pricing');
    return { message: 'Pricing plan created successfully!', success: true };
  } catch (error) {
    console.error("Error creating pricing plan:", error);
    return { message: 'Failed to create pricing plan.', success: false };
  }
}

export async function updatePricingPlanAction(
  prevState: any,
  formData: FormData
): Promise<FormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return { message: 'Unauthorized: You must be an admin to perform this action.', success: false };
  }

  const planId = formData.get('planId') as string;
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string | null;
  const priceMonthly = parseFloat(formData.get('priceMonthly') as string);
  const priceAnnually = parseFloat(formData.get('priceAnnually') as string);
  const features = JSON.parse(formData.get('features') as string || '[]');
  const isActive = formData.get('isActive') === 'on';

  if (!planId || !name || !slug || isNaN(priceMonthly) || isNaN(priceAnnually)) {
    return { message: 'Plan ID, Name, Slug, Monthly Price, and Annually Price are required.', success: false };
  }

  try {
    await prisma.pricingPlan.update({
      where: { id: planId },
      data: {
        name,
        slug,
        description,
        priceMonthly,
        priceAnnually,
        features,
        isActive,
      },
    });

    revalidatePath('/admin/pricing');
    return { message: 'Pricing plan updated successfully!', success: true };
  } catch (error) {
    console.error("Error updating pricing plan:", error);
    return { message: 'Failed to update pricing plan.', success: false };
  }
}

export async function deletePricingPlanAction(planId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: You must be an admin to perform this action.');
  }

  try {
    await prisma.pricingPlan.delete({
      where: { id: planId },
    });

    revalidatePath('/admin/pricing');
    
  } catch (error) {
    console.error("Error deleting pricing plan:", error);
    throw new Error('Database Error: Failed to delete pricing plan.');
  }

  redirect('/admin/pricing');
}
