import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { ProductFormV2 } from '../../new/product-form-v2';

interface EditProductPageProps {
  params: Promise<{
    subdomain: string;
    productId: string;
  }>;
}

async function getProduct(subdomain: string, productId: string, userId: string) {
  // First verify the store belongs to the user
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: userId,
    },
  });

  if (!store) {
    return null;
  }

  // Get the product with all its relations
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      storeId: store.id,
    },
    include: {
      category: true,
      variants: {
        include: {
          images: true,
        },
        orderBy: {
          price: 'asc'
        }
      },
    },
  });
  
  // Get metafields for this product
  const metafields = await prisma.metafield.findMany({
    where: {
      storeId: store.id,
      ownerType: 'Product',
      ownerId: productId
    },
    include: {
      definition: true
    }
  });
  
  // Get available metafield definitions for products
  const metafieldDefinitions = await prisma.metafieldDefinition.findMany({
    where: {
      storeId: store.id,
      appliesTo: 'products'
    }
  });

  // Ensure images is properly formatted
  if (product && product.images) {
    try {
      // If images is a string, parse it
      if (typeof product.images === 'string') {
        product.images = JSON.parse(product.images);
      }
      // Ensure it's an array
      if (!Array.isArray(product.images)) {
        product.images = [];
      }
    } catch (e) {
      console.error('Error parsing product images:', e);
      product.images = [];
    }
  }

  return { product, metafields, metafieldDefinitions };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const { subdomain, productId } = await params;
  
  const data = await getProduct(subdomain, productId, session.user.id);
  
  if (!data || !data.product) {
    redirect(`/dashboard/stores/${subdomain}/products`);
  }

  return (
    <div className="container mx-auto py-6">
      <ProductFormV2 
        subdomain={subdomain}
        product={data.product}
        metafields={data.metafields}
        metafieldDefinitions={data.metafieldDefinitions}
        isEdit={true}
      />
    </div>
  );
}