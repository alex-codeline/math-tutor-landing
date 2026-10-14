/* ==========================================================================
   Проект № 1 — сайт репетитора. JavaScript.

   Что делает этот файл:
   1. Показывает текущий год в подвале.
   2. Открывает и закрывает мобильное меню.
   3. Подсвечивает в меню раздел, который сейчас на экране.
   4. Проверяет демонстрационную форму и показывает честное сообщение.

   ВАЖНО: форма НЕ отправляет данные и НЕ сохраняет их. Это учебный режим.
   ========================================================================== */

// Весь код обёрнут в функцию, чтобы переменные не «протекали» в глобальную область
// и не конфликтовали с другими скриптами, если они появятся на странице.
(function () {
  "use strict"; // строгий режим: JavaScript строже следит за ошибками в коде


  /* ------------------------------------------------------------------
     1. ТЕКУЩИЙ ГОД В ПОДВАЛЕ
     ------------------------------------------------------------------ */
  const yearElement = document.querySelector("#year");   // ищем <span id="year">
  if (yearElement) {                                      // проверка: элемент найден?
    yearElement.textContent = new Date().getFullYear();   // подставляем год с компьютера посетителя
  }


  /* ------------------------------------------------------------------
     2. МОБИЛЬНОЕ МЕНЮ
     ------------------------------------------------------------------ */
  const menuButton = document.querySelector(".nav-toggle");  // кнопка «гамбургер»
  const menu = document.querySelector("#site-nav");          // панель со ссылками

  // Функция: открыть или закрыть меню. Аргумент isOpen: true — открыть, false — закрыть
  function setMenu(isOpen) {
    menu.classList.toggle("is-open", isOpen);                 // добавляем/убираем CSS-класс is-open
    menuButton.setAttribute("aria-expanded", String(isOpen)); // сообщаем программам чтения экрана о состоянии
    // Меняем скрытую подпись кнопки, чтобы она соответствовала действию
    menuButton.querySelector(".visually-hidden").textContent =
      isOpen ? "Закрыть меню" : "Открыть меню";
  }

  if (menuButton && menu) {
    // Нажатие на кнопку: переключаем состояние на противоположное
    menuButton.addEventListener("click", () => {
      setMenu(!menu.classList.contains("is-open"));
    });

    // Нажатие на любую ссылку в меню: закрываем меню, чтобы оно не перекрывало раздел
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {  // closest("a") — клик пришёлся на ссылку или на её содержимое
        setMenu(false);
      }
    });

    // Клавиша Escape закрывает меню и возвращает фокус на кнопку
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        setMenu(false);
        menuButton.focus();
      }
    });

    // Если окно расширили до размера компьютера, сбрасываем состояние меню
    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) {
        setMenu(false);
      }
    });
  }


  /* ------------------------------------------------------------------
     3. ПОДСВЕТКА АКТИВНОГО РАЗДЕЛА В МЕНЮ
     IntersectionObserver сообщает, когда элемент входит в видимую область экрана.
     ------------------------------------------------------------------ */
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]'); // все ссылки меню, ведущие к разделам

  // Проверяем, что браузер поддерживает IntersectionObserver (все современные — поддерживают)
  if (navLinks.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;       // нас интересуют только секции, вошедшие в «полосу наблюдения»

          navLinks.forEach((link) => {
            // Ссылка активна, если её href совпадает с id секции, которая сейчас на экране
            const isActive = link.getAttribute("href") === "#" + entry.target.id;
            if (isActive) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      // rootMargin сужает область наблюдения до узкой полосы в середине экрана,
      // поэтому активной считается секция, которую человек сейчас читает
      { rootMargin: "-45% 0px -50% 0px" }
    );

    // Наблюдаем за каждой секцией, на которую есть ссылка в меню
    navLinks.forEach((link) => {
      const section = document.querySelector(link.getAttribute("href"));
      if (section) observer.observe(section);
    });
  }


  /* ------------------------------------------------------------------
     4. ДЕМОНСТРАЦИОННАЯ ФОРМА
     ------------------------------------------------------------------ */
  const contactForm = document.querySelector("#contact-form");  // сама форма
  const formMessage = document.querySelector("#form-message");  // абзац для итогового сообщения

  if (contactForm && formMessage) {
    // Отключаем стандартные всплывающие подсказки браузера: покажем свои, понятнее.
    // Делаем это в JavaScript: если скрипт не загрузится, сработает обычная проверка браузера.
    contactForm.noValidate = true;

    // ----- Правила проверки полей -----
    // Каждая функция получает значение поля и возвращает текст ошибки.
    // Пустая строка "" означает «всё в порядке».
    const rules = {
      name(value) {
        if (value.trim().length < 2) return "Введите имя — не меньше двух символов.";
        return "";
      },
      grade(value) {
        if (value === "") return "Выберите класс ученика.";
        return "";
      },
      contact(value) {
        const text = value.trim();                       // убираем пробелы по краям
        const looksLikeEmail = /^\S+@\S+\.\S+$/.test(text);        // что-то@что-то.что-то
        const digits = text.replace(/\D/g, "");                    // оставляем только цифры
        const looksLikePhone = /^[\d\s()+\-]+$/.test(text) && digits.length >= 10;
        const looksLikeTelegram = /^@\w{4,}$/.test(text);          // @имя, не короче 4 символов после @
        if (text === "") return "Укажите, как с вами связаться.";
        if (!looksLikeEmail && !looksLikePhone && !looksLikeTelegram) {
          return "Введите телефон, почту или Telegram в формате @имя.";
        }
        return "";
      },
    };

    // ----- Показать или убрать ошибку у одного поля -----
    function showError(input, message) {
      const wrapper = input.closest(".field");                    // блок поля: подпись + поле + ошибка
      const errorElement = document.querySelector("#" + input.id + "-error"); // абзац для текста ошибки
      if (!errorElement) return;

      if (message) {
        errorElement.textContent = message;                       // записываем текст ошибки
        errorElement.hidden = false;                              // показываем абзац
        wrapper.classList.add("has-error");                       // красная рамка через CSS
        input.setAttribute("aria-invalid", "true");               // сообщаем программам чтения экрана
      } else {
        errorElement.textContent = "";
        errorElement.hidden = true;
        wrapper.classList.remove("has-error");
        input.removeAttribute("aria-invalid");
      }
    }

    // ----- Проверить одно поле. Возвращает true, если поле заполнено верно -----
    function validateField(input) {
      const rule = rules[input.name];            // правило ищем по атрибуту name поля
      if (!rule) return true;                    // у поля без правила проверки нет (например, «Тема»)
      const message = rule(input.value);
      showError(input, message);
      return message === "";
    }

    // Поля, которые проверяем
    const checkedFields = Array.from(contactForm.querySelectorAll("input[name], select[name]"));

    // Как только человек исправил поле с ошибкой — сразу убираем ошибку или показываем новую
    checkedFields.forEach((input) => {
      const eventName = input.tagName === "SELECT" ? "change" : "input";
      input.addEventListener(eventName, () => {
        if (input.getAttribute("aria-invalid") === "true") validateField(input);
      });
      // Когда человек уходит из поля (blur) и что-то ввёл — проверяем сразу
      input.addEventListener("blur", () => {
        if (input.value !== "") validateField(input);
      });
    });

    // ----- Отправка формы -----
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();                    // отменяем стандартную отправку (серверной части у нас нет)

      // Проверяем все поля. Не останавливаемся на первой ошибке, чтобы показать все сразу
      const results = checkedFields.map((input) => ({ input, ok: validateField(input) }));
      const firstInvalid = results.find((item) => !item.ok);

      formMessage.classList.remove("is-visible"); // прячем прежнее сообщение

      if (firstInvalid) {
        firstInvalid.input.focus();               // переводим курсор на первое поле с ошибкой
        return;                                   // дальше не идём
      }

      // Всё заполнено верно — показываем честное сообщение
      formMessage.textContent =
        "Форма заполнена верно, но сайт работает в демонстрационном режиме: заявка не отправлена, данные не сохранены.";
      formMessage.classList.add("is-visible");
      formMessage.focus();                        // переводим фокус на сообщение, чтобы его озвучили программы чтения

      contactForm.reset();                        // очищаем поля
    });
  }
})();
