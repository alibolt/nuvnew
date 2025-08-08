// Environment variable checker
console.log('🔍 Checking environment variables...\n');

const required = [
  'DATABASE_URL',
  'NEXTAUTH_URL', 
  'NEXTAUTH_SECRET',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN'
];

const optional = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_ROOT_DOMAIN'
];

let hasErrors = false;

console.log('Required variables:');
required.forEach(key => {
  const value = process.env[key];
  if (!value) {
    console.log(`❌ ${key}: NOT SET`);
    hasErrors = true;
  } else {
    const preview = key.includes('SECRET') || key.includes('TOKEN') 
      ? '***' + value.slice(-4) 
      : value.slice(0, 30) + '...';
    console.log(`✅ ${key}: ${preview}`);
  }
});

console.log('\nOptional variables:');
optional.forEach(key => {
  const value = process.env[key];
  if (!value) {
    console.log(`⚠️  ${key}: NOT SET`);
  } else {
    const preview = key.includes('SECRET') 
      ? '***' + value.slice(-4) 
      : value.slice(0, 30) + '...';
    console.log(`✅ ${key}: ${preview}`);
  }
});

if (hasErrors) {
  console.log('\n❌ Missing required environment variables!');
  console.log('Please check your .env.local file');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
}