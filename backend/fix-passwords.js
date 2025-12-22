const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// Подключаемся к базе данных
const db = new sqlite3.Database('./database.sqlite');

async function fixPasswords() {
  console.log('🔄 Начинаем исправление паролей...');

  // Получаем все записи с нехэшированными паролями
  db.all("SELECT id, login, password FROM experts WHERE password NOT LIKE '$2%'", async (err, rows) => {
    if (err) {
      console.error('❌ Ошибка получения данных:', err);
      return;
    }

    if (rows.length === 0) {
      console.log('✅ Все пароли уже хэшированы');
      db.close();
      return;
    }

    console.log(`📊 Найдено ${rows.length} нехэшированных паролей`);

    // Обрабатываем каждую запись
    for (const row of rows) {
      try {
        // Хэшируем пароль
        const hashedPassword = await bcrypt.hash(row.password, 10);
        
        // Обновляем в базе данных
        db.run(
          "UPDATE experts SET password = ? WHERE id = ?",
          [hashedPassword, row.id],
          function(err) {
            if (err) {
              console.error(`❌ Ошибка обновления пароля для ${row.login}:`, err);
            } else {
              console.log(`✅ Пароль обновлен для пользователя: ${row.login}`);
            }
          }
        );
      } catch (error) {
        console.error(`❌ Ошибка хэширования пароля для ${row.login}:`, error);
      }
    }

    // Закрываем соединение через 2 секунды (даем время на выполнение всех запросов)
    setTimeout(() => {
      console.log('🏁 Обработка завершена');
      db.close();
    }, 2000);
  });
}

fixPasswords();