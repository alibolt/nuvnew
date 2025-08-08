export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  category: 'fashion' | 'electronics' | 'food' | 'beauty' | 'general';
  compatibleThemes?: string[]; // Uyumlu tema listesi
  templates: {
    homepage: any;
    product: any;
    collection: any;
    // ... diğer sayfa tipleri
  };
  globalSections: {
    header: any;
    footer: any;
    announcementBar?: any;
  };
  settings: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    spacing: {
      containerWidth: string;
      sectionPadding: string;
    };
  };
}

import { MODERN_FASHION_PRESET } from './template-presets/modern-fashion';
import { TECH_ELECTRONICS_PRESET } from './template-presets/tech-electronics';
import { LUXURY_FASHION_PRESET } from './template-presets/luxury-fashion';

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  MODERN_FASHION_PRESET,
  TECH_ELECTRONICS_PRESET,
  LUXURY_FASHION_PRESET
];

// Preset'i mağazaya uygulama fonksiyonu
export async function applyTemplatePreset(
  storeId: string, 
  presetId: string,
  prisma: any
) {
  const preset = TEMPLATE_PRESETS.find(p => p.id === presetId);
  if (!preset) throw new Error('Preset not found');

  // 1. Store ayarlarını güncelle - primaryColor'ı ayarla
  await prisma.store.update({
    where: { id: storeId },
    data: {
      primaryColor: preset.settings.colors.primary
    }
  });

  // 2. Template'leri oluştur veya güncelle
  for (const [templateType, templateData] of Object.entries(preset.templates)) {
    // Check if template already exists
    const existingTemplate = await prisma.storeTemplate.findFirst({
      where: {
        storeId,
        templateType,
        isDefault: true
      }
    });

    let template;
    if (existingTemplate) {
      // Template exists, skip creation
      template = existingTemplate;
      console.log(`Template ${templateType} already exists, skipping...`);
      continue; // Skip to next template
    } else {
      // Create new template
      template = await prisma.storeTemplate.create({
        data: {
          store: {
            connect: { id: storeId }
          },
          templateType,
          name: `${preset.name} - ${templateType}`,
          enabled: true,
          isDefault: true
        }
      });
    }

    // 3. Section'ları oluştur
    for (let i = 0; i < templateData.sections.length; i++) {
      const sectionData = templateData.sections[i];
      const section = await prisma.storeSectionInstance.create({
        data: {
          templateId: template.id,
          sectionType: sectionData.type,
          position: i,
          settings: sectionData.settings || {},
          enabled: true
        }
      });

      // 4. Block'ları oluştur
      if (sectionData.blocks) {
        for (let j = 0; j < sectionData.blocks.length; j++) {
          const blockData = sectionData.blocks[j];
          
          // Handle nested blocks (e.g., footer-column with links)
          const blockSettings = { ...blockData.settings };
          if (blockData.blocks) {
            blockSettings.blocks = blockData.blocks;
          }
          
          await prisma.sectionBlock.create({
            data: {
              sectionId: section.id,
              type: blockData.type,
              position: j,
              settings: blockSettings,
              enabled: true
            }
          });
        }
      }
    }
  }

  // 5. Global section'ları (header, footer) oluştur
  const homepageTemplate = await prisma.storeTemplate.findFirst({
    where: {
      storeId,
      templateType: 'homepage'
    }
  });

  if (homepageTemplate) {
    for (const [sectionType, sectionData] of Object.entries(preset.globalSections)) {
      // Check if global section already exists
      const existingSection = await prisma.storeSectionInstance.findFirst({
        where: {
          templateId: homepageTemplate.id,
          sectionType
        }
      });

      if (existingSection) {
        console.log(`Global section ${sectionType} already exists, skipping...`);
        continue;
      }

      const section = await prisma.storeSectionInstance.create({
        data: {
          templateId: homepageTemplate.id,
          sectionType,
          position: sectionType === 'header' ? -1 : 999, // Header en başa, footer en sona
          settings: sectionData.settings || {},
          enabled: true
        }
      });

      if (sectionData.blocks) {
        for (let i = 0; i < sectionData.blocks.length; i++) {
          const blockData = sectionData.blocks[i];
          
          // Handle nested blocks (e.g., footer-column with links)
          const blockSettings = { ...blockData.settings };
          if (blockData.blocks) {
            blockSettings.blocks = blockData.blocks;
          }
          
          await prisma.sectionBlock.create({
            data: {
              sectionId: section.id,
              type: blockData.type,
              position: i,
              settings: blockSettings,
              enabled: true
            }
          });
        }
      }
    }
  }

  return true;
}