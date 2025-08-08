// Cleanup script to remove specific sections
// Run with: node cleanup-sections.js

async function cleanupSections() {
  const subdomain = 'cottonyarn'; // Change this to your store subdomain
  const baseUrl = 'http://localhost:3000'; // Change if needed
  
  try {
    // First, list all section types
    console.log('Fetching section types...');
    const listResponse = await fetch(`${baseUrl}/api/stores/${subdomain}/sections/cleanup`, {
      credentials: 'include',
      headers: {
        'Cookie': 'your-session-cookie-here' // You need to add your session cookie
      }
    });
    
    if (!listResponse.ok) {
      console.error('Failed to list sections:', await listResponse.text());
      return;
    }
    
    const { sectionTypes } = await listResponse.json();
    console.log('Found section types:', sectionTypes);
    
    // Clean up specific sections
    console.log('\nCleaning up icon-list and announcement-bar sections...');
    const cleanupResponse = await fetch(`${baseUrl}/api/stores/${subdomain}/sections/cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'your-session-cookie-here' // You need to add your session cookie
      },
      credentials: 'include',
      body: JSON.stringify({
        sectionTypes: ['icon-list', 'icon-group'],
        globalSections: true // This will remove announcement bars
      })
    });
    
    if (!cleanupResponse.ok) {
      console.error('Failed to cleanup sections:', await cleanupResponse.text());
      return;
    }
    
    const result = await cleanupResponse.json();
    console.log('Cleanup result:', result);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Instructions:
console.log(`
To use this script:
1. Open your browser and login to your store dashboard
2. Open Developer Tools (F12)
3. Go to Application/Storage > Cookies
4. Find the session cookie (usually named 'next-auth.session-token' or similar)
5. Copy the cookie value and replace 'your-session-cookie-here' in this script
6. Run: node cleanup-sections.js
`);

// Uncomment to run
// cleanupSections();