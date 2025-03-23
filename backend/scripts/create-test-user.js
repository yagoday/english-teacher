db = db.getSiblingDB('english-teacher');

const testUser = {
  name: "Test Student",
  email: "test@example.com",
  age: 10,
  nativeLanguage: "Hebrew",
  proficiencyLevel: "beginner",
  createdAt: new Date(),
  lastActive: new Date()
};

db.users.insertOne(testUser); 