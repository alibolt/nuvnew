import { prisma } from '@/lib/prisma';

export class LogoSyncService {
  /**
   * Sync logo across all storage locations
   * @param storeId - Store ID
   * @param logoUrl - Logo URL to sync
   * @returns Promise with sync results
   */
  static async syncLogo(storeId: string, logoUrl: string) {
    try {
      console.log(`🔄 Starting logo sync for store ${storeId}: ${logoUrl}`);
      
      // 1. Update Store.logo field
      await prisma.store.update({
        where: { id: storeId },
        data: { logo: logoUrl }
      });
      console.log('✅ Updated Store.logo field');

      // 2. Update all header sections
      const headerSections = await prisma.storeSectionInstance.findMany({
        where: {
          template: {
            storeId: storeId
          },
          sectionType: 'header'
        }
      });

      console.log(`📋 Found ${headerSections.length} header sections to update`);

      let updatedSections = 0;
      for (const section of headerSections) {
        const currentSettings = section.settings as any || {};
        await prisma.storeSectionInstance.update({
          where: { id: section.id },
          data: {
            settings: {
              ...currentSettings,
              logo_image: logoUrl
            }
          }
        });
        updatedSections++;
      }

      console.log(`✅ Updated ${updatedSections} header sections`);

      // 3. Update media library usage tracking
      const storeSettings = await prisma.storeSettings.findUnique({
        where: { storeId: storeId }
      });

      if (storeSettings?.mediaLibrary) {
        // Parse mediaLibrary - it's stored as JSON string
        let mediaLibrary: any[] = [];
        try {
          if (typeof storeSettings.mediaLibrary === 'string') {
            mediaLibrary = JSON.parse(storeSettings.mediaLibrary) || [];
          } else if (Array.isArray(storeSettings.mediaLibrary)) {
            mediaLibrary = storeSettings.mediaLibrary;
          }
        } catch (error) {
          console.error('Failed to parse mediaLibrary:', error);
          mediaLibrary = [];
        }
        
        const logoMedia = mediaLibrary.find(media => media.fileUrl === logoUrl);
        
        if (logoMedia) {
          // Update usage tracking
          const currentUsage = logoMedia.usage || [];
          const newUsage = [...currentUsage, 'store_logo', 'header_sections'];
          logoMedia.usage = [...new Set(newUsage)]; // Remove duplicates
          logoMedia.updatedAt = new Date().toISOString();

          await prisma.storeSettings.update({
            where: { storeId: storeId },
            data: { 
              mediaLibrary: JSON.stringify(mediaLibrary) 
            }
          });
          console.log('✅ Updated media library usage tracking');
        }
      }

      return {
        success: true,
        message: 'Logo synced successfully',
        stats: {
          storeUpdated: true,
          sectionsUpdated: updatedSections,
          mediaLibraryUpdated: true
        }
      };

    } catch (error) {
      console.error('❌ Logo sync failed:', error);
      throw error;
    }
  }

  /**
   * Get current logo status for a store
   * @param storeId - Store ID
   * @returns Promise with logo status
   */
  static async getLogoStatus(storeId: string) {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: { storeSettings: true }
      });

      if (!store) {
        throw new Error('Store not found');
      }

      // Check header sections
      const headerSections = await prisma.storeSectionInstance.findMany({
        where: {
          template: {
            storeId: storeId
          },
          sectionType: 'header'
        }
      });

      const headerLogos = headerSections.map(section => {
        const settings = section.settings as any || {};
        return {
          sectionId: section.id,
          logoUrl: settings.logo_image || settings.src,
          hasLogo: !!(settings.logo_image || settings.src)
        };
      });

      // Check media library
      // Parse mediaLibrary - it's stored as JSON string
      let mediaLibrary: any[] = [];
      if (store.storeSettings?.mediaLibrary) {
        try {
          if (typeof store.storeSettings.mediaLibrary === 'string') {
            mediaLibrary = JSON.parse(store.storeSettings.mediaLibrary) || [];
          } else if (Array.isArray(store.storeSettings.mediaLibrary)) {
            mediaLibrary = store.storeSettings.mediaLibrary;
          }
        } catch (error) {
          console.error('Failed to parse mediaLibrary:', error);
          mediaLibrary = [];
        }
      }
      
      const logoFiles = mediaLibrary.filter(file => 
        file.metadata?.folder === 'logos' || 
        file.fileName?.toLowerCase().includes('logo') ||
        file.usage?.includes('store_logo')
      );

      return {
        store: {
          id: store.id,
          name: store.name,
          logo: store.logo,
          hasLogo: !!store.logo
        },
        headerSections: headerLogos,
        mediaLibrary: {
          totalFiles: mediaLibrary.length,
          logoFiles: logoFiles.length,
          logos: logoFiles
        },
        isConsistent: this.checkConsistency(store.logo, headerLogos)
      };

    } catch (error) {
      console.error('❌ Failed to get logo status:', error);
      throw error;
    }
  }

  /**
   * Check if logo is consistent across all locations
   * @param storeLogo - Store logo URL
   * @param headerLogos - Header section logos
   * @returns Consistency check result
   */
  private static checkConsistency(storeLogo: string | null, headerLogos: any[]) {
    const logoUrls = headerLogos.map(h => h.logoUrl).filter(Boolean);
    const uniqueLogos = [...new Set([storeLogo, ...logoUrls].filter(Boolean))];
    
    return {
      isConsistent: uniqueLogos.length <= 1,
      uniqueLogos,
      storeLogo,
      headerLogosCount: headerLogos.length,
      headerLogosWithLogo: headerLogos.filter(h => h.hasLogo).length
    };
  }

  /**
   * Auto-fix logo inconsistencies
   * @param storeId - Store ID
   * @returns Promise with fix results
   */
  static async autoFixLogo(storeId: string) {
    try {
      const status = await this.getLogoStatus(storeId);
      
      if (status.isConsistent) {
        return {
          success: true,
          message: 'Logo is already consistent',
          noActionNeeded: true
        };
      }

      // Priority: Store logo > Most common header logo > Most recent media library logo
      let targetLogo = status.store.logo;
      
      if (!targetLogo) {
        // Find most common header logo
        const headerLogos = status.headerSections
          .map(h => h.logoUrl)
          .filter(Boolean);
        
        if (headerLogos.length > 0) {
          const logoCount = headerLogos.reduce((acc, logo) => {
            acc[logo] = (acc[logo] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          targetLogo = Object.entries(logoCount)
            .sort(([,a], [,b]) => b - a)[0][0];
        }
      }

      if (!targetLogo && status.mediaLibrary.logos.length > 0) {
        // Use most recent media library logo
        const sortedLogos = status.mediaLibrary.logos.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        targetLogo = sortedLogos[0].fileUrl;
      }

      if (targetLogo) {
        await this.syncLogo(storeId, targetLogo);
        return {
          success: true,
          message: 'Logo inconsistencies fixed',
          targetLogo,
          fixedLogo: targetLogo
        };
      } else {
        return {
          success: false,
          message: 'No logo found to sync',
          noLogoFound: true
        };
      }

    } catch (error) {
      console.error('❌ Auto-fix logo failed:', error);
      throw error;
    }
  }
}