import { NextRequest, NextResponse } from 'next/server';
import { CategoriesService } from '@/lib/firebase/services';
import { Category } from '@/lib/firebase/types';

function generateSlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    
    // Get single category by ID
    if (id) {
      const category = await CategoriesService.getById(id);

      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      return NextResponse.json(category);
    }

    // Get single category by slug
    if (slug) {
      const category = await CategoriesService.getBySlug(slug);

      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      return NextResponse.json(category);
    }

    // List categories with pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    
    const result = await CategoriesService.getAll({ limit });
    return NextResponse.json(result.categories);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, slug } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedDescription = description ? description.trim() : null;
    const categorySlug = slug?.trim() || generateSlug(sanitizedName);

    const categoryData: Omit<Category, 'id' | 'createdAt'> = {
      name: sanitizedName,
      slug: categorySlug,
      description: sanitizedDescription
    };

    const newCategory = await CategoriesService.create(categoryData);

    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    if (error instanceof Error && error.message === 'Category with this slug already exists') {
      return NextResponse.json({ 
        error: "Category with this name already exists",
        code: "DUPLICATE_SLUG" 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, slug } = body;

    const updates: Partial<Omit<Category, 'id' | 'createdAt'>> = {};

    if (name !== undefined) {
      if (!name || typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ 
          error: "Name cannot be empty",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updates.name = name.trim();
      // Update slug based on name if slug not explicitly provided
      if (!slug) {
        updates.slug = generateSlug(name.trim());
      }
    }

    if (slug !== undefined) {
      if (typeof slug === 'string') {
        updates.slug = slug.trim();
      }
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    const updated = await CategoriesService.update(id, updates);

    return NextResponse.json(updated);

  } catch (error) {
    console.error('PUT error:', error);
    if (error instanceof Error) {
      if (error.message === 'Category not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === 'Category with this slug already exists') {
        return NextResponse.json({ 
          error: "Category with this name already exists",
          code: "DUPLICATE_SLUG" 
        }, { status: 400 });
      }
    }
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const deleted = await CategoriesService.delete(id);

    return NextResponse.json({
      message: 'Category deleted successfully',
      deletedCategory: deleted
    });

  } catch (error) {
    console.error('DELETE error:', error);
    if (error instanceof Error) {
      if (error.message === 'Category not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('Cannot delete category that has products')) {
        return NextResponse.json({ 
          error: error.message,
          code: "CATEGORY_HAS_PRODUCTS" 
        }, { status: 400 });
      }
    }
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}