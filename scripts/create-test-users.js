const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createTestUsers() {
  const testUsers = [
    {
      email: 'employee@metrobytmobile.com',
      password: 'Employee123!',
      displayName: 'John Employee',
      role: 'employee',
      store: 'ARCHER'
    },
    {
      email: 'manager@metrobytmobile.com',
      password: 'Manager123!',
      displayName: 'Jane Manager',
      role: 'manager',
      store: 'ARCHER'
    },
    {
      email: 'admin@metrobytmobile.com',
      password: 'Admin123!',
      displayName: 'Admin User',
      role: 'admin',
      store: null
    }
  ];

  for (const userData of testUsers) {
    try {
      // Create auth user
      const userRecord = await admin.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        emailVerified: true
      });

      console.log(`✅ Created user: ${userData.email}`);

      // Set custom claims
      await admin.auth().setCustomUserClaims(userRecord.uid, { 
        role: userData.role 
      });

      console.log(`   Set role: ${userData.role}`);

      // Create Firestore profile
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        store: userData.store,
        phoneNumber: '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        metadata: {
          employeeId: '',
          department: '',
          hireDate: new Date().toISOString().split('T')[0]
        }
      });

      console.log(`   Created Firestore profile\n`);

    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️  User already exists: ${userData.email}\n`);
      } else {
        console.error(`❌ Error creating user ${userData.email}:`, error.message, '\n');
      }
    }
  }

  console.log('\n✅ Test user creation complete!');
  console.log('\nTest Credentials:');
  testUsers.forEach(user => {
    console.log(`\n${user.role.toUpperCase()}:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
  });

  process.exit(0);
}

createTestUsers();
