import { Section, Block } from '@/app/dashboard/stores/[subdomain]/theme-studio/types';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * Centralized API abstraction layer for Theme Studio
 * Eliminates duplicate fetch patterns and provides consistent error handling
 */
export class ThemeStudioAPI {
  private static baseUrl = '/api/stores';

  /**
   * Generic fetch wrapper with error handling
   */
  private static async fetchWrapper<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const text = await response.text();
      
      if (!text) {
        if (!response.ok) {
          return { success: false, error: 'Empty response from server' };
        }
        return { success: true, data: {} as T };
      }

      let data: T;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response:', text);
        return { success: false, error: 'Invalid response from server' };
      }

      if (!response.ok) {
        return { 
          success: false, 
          error: (data as any)?.error || `Request failed with status ${response.status}` 
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  /**
   * Section operations
   */
  static async updateSection(
    subdomain: string,
    sectionId: string,
    updates: Partial<Section>
  ): Promise<ApiResponse<Section>> {
    return this.fetchWrapper<Section>(
      `${this.baseUrl}/${subdomain}/sections/${sectionId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
  }

  static async addSection(
    subdomain: string,
    templateId: string,
    section: Partial<Section>
  ): Promise<ApiResponse<Section>> {
    return this.fetchWrapper<Section>(
      `${this.baseUrl}/${subdomain}/templates/${templateId}/sections`,
      {
        method: 'POST',
        body: JSON.stringify(section),
      }
    );
  }

  static async deleteSection(
    subdomain: string,
    sectionId: string
  ): Promise<ApiResponse<void>> {
    return this.fetchWrapper<void>(
      `${this.baseUrl}/${subdomain}/sections/${sectionId}`,
      {
        method: 'DELETE',
      }
    );
  }

  static async reorderSections(
    subdomain: string,
    templateId: string,
    sectionIds: string[]
  ): Promise<ApiResponse<void>> {
    return this.fetchWrapper<void>(
      `${this.baseUrl}/${subdomain}/sections/reorder`,
      {
        method: 'PUT',
        body: JSON.stringify({ templateId, sectionIds }),
      }
    );
  }

  /**
   * Block operations
   */
  static async fetchSectionBlocks(
    subdomain: string,
    sectionId: string,
    preview: boolean = true
  ): Promise<ApiResponse<{ blocks: Block[] }>> {
    const url = new URL(`${window.location.origin}${this.baseUrl}/${subdomain}/sections/${sectionId}/blocks`);
    if (preview) {
      url.searchParams.append('preview', 'true');
    }
    
    return this.fetchWrapper<{ blocks: Block[] }>(url.toString());
  }

  static async addBlock(
    subdomain: string,
    sectionId: string,
    block: Partial<Block>
  ): Promise<ApiResponse<Block>> {
    return this.fetchWrapper<Block>(
      `${this.baseUrl}/${subdomain}/sections/${sectionId}/blocks`,
      {
        method: 'POST',
        body: JSON.stringify(block),
      }
    );
  }

  static async updateBlock(
    subdomain: string,
    sectionId: string,
    blockId: string,
    updates: Partial<Block>
  ): Promise<ApiResponse<Block>> {
    return this.fetchWrapper<Block>(
      `${this.baseUrl}/${subdomain}/sections/${sectionId}/blocks/${blockId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
  }

  static async deleteBlock(
    subdomain: string,
    sectionId: string,
    blockId: string
  ): Promise<ApiResponse<void>> {
    return this.fetchWrapper<void>(
      `${this.baseUrl}/${subdomain}/sections/${sectionId}/blocks/${blockId}`,
      {
        method: 'DELETE',
      }
    );
  }

  static async duplicateBlock(
    subdomain: string,
    sectionId: string,
    blockId: string
  ): Promise<ApiResponse<Block>> {
    return this.fetchWrapper<Block>(
      `${this.baseUrl}/${subdomain}/sections/${sectionId}/blocks/${blockId}/duplicate`,
      {
        method: 'POST',
      }
    );
  }

  /**
   * Template operations
   */
  static async saveTemplate(
    subdomain: string,
    templateId: string,
    data: any
  ): Promise<ApiResponse<void>> {
    return this.fetchWrapper<void>(
      `${this.baseUrl}/${subdomain}/templates/${templateId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  static async applyPreset(
    subdomain: string,
    presetId: string
  ): Promise<ApiResponse<void>> {
    return this.fetchWrapper<void>(
      `${this.baseUrl}/${subdomain}/templates/apply-preset`,
      {
        method: 'POST',
        body: JSON.stringify({ presetId }),
      }
    );
  }

  /**
   * Theme settings operations
   */
  static async saveThemeSettings(
    subdomain: string,
    settings: Record<string, any>
  ): Promise<ApiResponse<void>> {
    return this.fetchWrapper<void>(
      `${this.baseUrl}/${subdomain}/settings`,
      {
        method: 'PUT',
        body: JSON.stringify({ themeSettings: settings }),
      }
    );
  }

  /**
   * Global sections operations
   */
  static async saveGlobalSection(
    subdomain: string,
    sectionType: 'header' | 'footer' | 'announcement-bar',
    enabled: boolean
  ): Promise<ApiResponse<void>> {
    return this.fetchWrapper<void>(
      `${this.baseUrl}/${subdomain}/global-sections`,
      {
        method: 'PUT',
        body: JSON.stringify({ 
          [`${sectionType}Enabled`]: enabled 
        }),
      }
    );
  }

  /**
   * Dynamic options loading
   */
  static async fetchDynamicOptions(
    subdomain: string,
    optionType: string
  ): Promise<ApiResponse<Array<{ value: string; label: string }>>> {
    const endpoints: Record<string, string> = {
      menus: `${this.baseUrl}/${subdomain}/menus`,
      collections: `${this.baseUrl}/${subdomain}/categories`,
      pages: `${this.baseUrl}/${subdomain}/pages`,
      blogs: `${this.baseUrl}/${subdomain}/blogs`,
    };

    const endpoint = endpoints[optionType];
    if (!endpoint) {
      return { success: false, error: `Unknown option type: ${optionType}` };
    }

    const response = await this.fetchWrapper<any>(endpoint);
    
    if (!response.success || !response.data) {
      return response;
    }

    // Transform data to consistent format
    let options: Array<{ value: string; label: string }> = [];
    
    switch (optionType) {
      case 'menus':
        options = response.data.menus?.map((menu: any) => ({
          value: menu.handle,
          label: menu.name
        })) || [];
        break;
      case 'collections':
        options = response.data.categories?.map((cat: any) => ({
          value: cat.slug,
          label: cat.name
        })) || [];
        break;
      case 'pages':
        options = response.data.pages?.map((page: any) => ({
          value: page.slug,
          label: page.title
        })) || [];
        break;
      case 'blogs':
        options = response.data.blogs?.map((blog: any) => ({
          value: blog.id,
          label: blog.name
        })) || [];
        break;
    }

    return { success: true, data: options };
  }

  /**
   * Batch operations
   */
  static async batchUpdate(
    subdomain: string,
    operations: Array<{
      type: 'section' | 'block';
      action: 'create' | 'update' | 'delete';
      data: any;
    }>
  ): Promise<ApiResponse<void>> {
    // This could be implemented on the backend for performance
    // For now, we'll execute operations sequentially
    for (const op of operations) {
      let result: ApiResponse<any>;
      
      if (op.type === 'section') {
        switch (op.action) {
          case 'create':
            result = await this.addSection(subdomain, op.data.templateId, op.data.section);
            break;
          case 'update':
            result = await this.updateSection(subdomain, op.data.sectionId, op.data.updates);
            break;
          case 'delete':
            result = await this.deleteSection(subdomain, op.data.sectionId);
            break;
        }
      } else if (op.type === 'block') {
        switch (op.action) {
          case 'create':
            result = await this.addBlock(subdomain, op.data.sectionId, op.data.block);
            break;
          case 'update':
            result = await this.updateBlock(subdomain, op.data.sectionId, op.data.blockId, op.data.updates);
            break;
          case 'delete':
            result = await this.deleteBlock(subdomain, op.data.sectionId, op.data.blockId);
            break;
        }
      }
    }
    
    return { success: true };
  }
}