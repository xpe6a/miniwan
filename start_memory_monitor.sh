#!/bin/bash

# Быстрый запуск мониторинга памяти
# Автор: Anton

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONITOR_SCRIPT="$SCRIPT_DIR/memory_monitor.sh"

echo "🚀 Запуск мониторинга памяти..."
echo "📁 Директория: $SCRIPT_DIR"
echo ""

# Проверяем существование скрипта
if [ ! -f "$MONITOR_SCRIPT" ]; then
    echo "❌ Скрипт memory_monitor.sh не найден!"
    exit 1
fi

# Проверяем права на выполнение
if [ ! -x "$MONITOR_SCRIPT" ]; then
    echo "🔧 Устанавливаем права на выполнение..."
    chmod +x "$MONITOR_SCRIPT"
fi

echo "✅ Готово! Выберите действие:"
echo ""
echo "1. Тестовая проверка"
echo "2. Показать статистику"
echo "3. Запустить мониторинг"
echo "4. Установить как сервис"
echo ""

read -p "Введите номер (1-4): " choice

case $choice in
    1)
        echo "🧪 Тестовая проверка..."
        "$MONITOR_SCRIPT" test
        ;;
    2)
        echo "📊 Статистика..."
        "$MONITOR_SCRIPT" stats
        ;;
    3)
        echo "🔄 Запуск мониторинга..."
        echo "Для остановки нажмите Ctrl+C"
        "$MONITOR_SCRIPT" start
        ;;
    4)
        echo "⚙️ Установка как сервис..."
        if [ "$EUID" -eq 0 ]; then
            cp "$SCRIPT_DIR/memory-monitor.service" /etc/systemd/system/
            systemctl daemon-reload
            systemctl enable memory-monitor
            systemctl start memory-monitor
            echo "✅ Сервис установлен и запущен!"
            echo "📋 Для управления используйте:"
            echo "   sudo systemctl status memory-monitor"
            echo "   sudo systemctl stop memory-monitor"
        else
            echo "❌ Требуются права root для установки сервиса"
            echo "💡 Запустите: sudo $0"
        fi
        ;;
    *)
        echo "❌ Неверный выбор"
        exit 1
        ;;
esac
