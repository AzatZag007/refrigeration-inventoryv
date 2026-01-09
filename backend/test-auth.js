// test-auth.js - проверяем что authController работает
const authController = require('./controllers/authController');

console.log('🔍 Проверяем authController...');
console.log('register:', typeof authController.register);
console.log('login:', typeof authController.login);
console.log('getCurrentUser:', typeof authController.getCurrentUser);

if (authController.register && authController.login && authController.getCurrentUser) {
  console.log('✅ Все функции authController найдены!');
} else {
  console.log('❌ Некоторые функции отсутствуют!');
}