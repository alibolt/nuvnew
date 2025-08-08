import { PrismaClient } from '@prisma/client';
import { HybridTemplateLoader } from '@/lib/services/hybrid-template-loader';

const prisma = new PrismaClient();

async function testHybridTemplate() {
  try {
    // Get a test store
    const store = await prisma.store.findFirst({
      include: {
        activeTheme: true
      }
    });

    if (!store) {
      console.log('No store found');
      return;
    }

    console.log('Store:', store.name);
    console.log('Active theme:', store.activeTheme?.code);

    // Test hybrid template loader
    const themeCode = store.activeTheme?.code || 'minimal';
    console.log('\nTesting hybrid template loader...');
    
    const loader = new HybridTemplateLoader();
    const compiledTemplate = await loader.getCompiledTemplate(
      store.id, 
      themeCode, 
      'homepage'
    );

    console.log('Compiled template:', compiledTemplate ? 'Found' : 'Not found');
    console.log('Sections count:', compiledTemplate?.sections?.length || 0);
    
    if (compiledTemplate?.sections) {
      console.log('\nSections:');
      compiledTemplate.sections.forEach((section, index) => {
        console.log(`${index + 1}. ${section.type} (${section.sectionType})`);
      });
    }

    // Test JSON template loading
    console.log('\nTesting JSON template loading...');
    const jsonTemplate = await loader.loadTemplateDefinition(themeCode, 'homepage');
    console.log('JSON template:', jsonTemplate ? 'Found' : 'Not found');
    console.log('JSON sections count:', jsonTemplate?.sections?.length || 0);

    if (jsonTemplate?.sections) {
      console.log('\nJSON Sections:');
      jsonTemplate.sections.forEach((section, index) => {
        console.log(`${index + 1}. ${section.type}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testHybridTemplate();