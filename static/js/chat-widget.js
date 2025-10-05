// static/js/chat-widget.js

(function () {
    // Создание элементов чата один раз при загрузке
    const chatWidget = document.createElement('div');
    chatWidget.className = 'chat-widget';
    chatWidget.innerHTML = `
        <button class="chat-button" id="openChatBtn">
            <span class="chat-icon">💬</span>
        </button>
        <div class="chat-modal" id="chatModal" style="display: none;">
            <div class="chat-modal-content">
                <div class="chat-header">
                    <h3>Чат с поддержкой</h3>
                    <button class="chat-close" id="closeChatBtn">&times;</button>
                </div>
                <div class="chat-body">
                    <p>Опишите ваш вопрос. Мы ответим в течение нескольких часов.</p>
                    <form id="chatForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
                        <input type="text" name="name" placeholder="Ваше имя" required>
                        <input type="email" name="email" placeholder="Ваш email или телефон" required>
                        <textarea name="message" placeholder="Ваше сообщение..." rows="4" required></textarea>
                        <button type="submit" class="chat-submit-btn">Отправить</button>
                    </form>
                    <div class="chat-thank-you" id="chatThankYou" style="display: none; margin-top: 10px; color: #8B5A2B; font-weight: bold;">
                        Спасибо! Мы скоро свяжемся с вами.
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(chatWidget);

    // Стили для модального окна чата
    const style = document.createElement('style');
    style.textContent = `
        .chat-modal {
            position: fixed;
            bottom: 90px;
            right: 20px;
            z-index: 1001;
            width: 320px;
            background: #231A16;
            border: 1px solid #443A30;
            border-radius: 10px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.4);
            overflow: hidden;
        }
        .chat-modal-content {
            padding: 16px;
        }
        .chat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        .chat-header h3 {
            margin: 0;
            color: #E8DCC5;
            font-size: 1.1rem;
        }
        .chat-close {
            background: none;
            border: none;
            color: #D4C4A8;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .chat-close:hover {
            color: #E8DCC5;
        }
        .chat-body p {
            font-size: 0.9rem;
            color: #D4C4A8;
            margin-bottom: 12px;
        }
        .chat-body input,
        .chat-body textarea {
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 5px;
            border: 1px solid #443A30;
            background: #3A2F28;
            color: #F0E6D2;
            font-family: inherit;
            font-size: 0.95rem;
        }
        .chat-submit-btn {
            width: 100%;
            padding: 10px;
            background: #8B5A2B;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.3s;
        }
        .chat-submit-btn:hover {
            background: #A06A37;
        }
        @media (max-width: 480px) {
            .chat-modal {
                width: calc(100% - 40px);
                bottom: 80px;
                right: 20px;
            }
        }
    `;
    document.head.appendChild(style);

    // Обработчики
    const openBtn = document.getElementById('openChatBtn');
    const closeBtn = document.getElementById('closeChatBtn');
    const modal = document.getElementById('chatModal');
    const form = document.getElementById('chatForm');
    const thankYou = document.getElementById('chatThankYou');

    openBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Закрытие по клику вне модального окна (опционально)
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Обработка отправки формы
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Здесь можно добавить валидацию, но для простоты сразу отправляем
            const formData = new FormData(form);
            const action = form.getAttribute('action');

            fetch(action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    form.style.display = 'none';
                    thankYou.style.display = 'block';
                    // Автоматически закрыть через 3 секунды
                    setTimeout(() => {
                        modal.style.display = 'none';
                        form.reset();
                        form.style.display = 'block';
                        thankYou.style.display = 'none';
                    }, 3000);
                } else {
                    alert('Ошибка отправки. Попробуйте позже.');
                }
            })
            .catch(() => {
                alert('Не удалось отправить сообщение. Проверьте подключение.');
            });
        });
    }
})();