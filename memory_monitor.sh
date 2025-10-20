#!/bin/bash

# Скрипт для мониторинга памяти и автоматического завершения Java процессов
# Автор: Anton
# Версия: 1.0

# Конфигурация
MEMORY_THRESHOLD=85  # Порог использования памяти в процентах
LOG_FILE="/tmp/memory_monitor.log"
CHECK_INTERVAL=30    # Интервал проверки в секундах

# Функция логирования
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Функция получения информации о памяти
get_memory_info() {
    # Получаем общую память и свободную память
    local total_mem=$(free | grep '^Mem:' | awk '{print $2}')
    local available_mem=$(free | grep '^Mem:' | awk '{print $7}')
    local used_mem=$((total_mem - available_mem))
    local memory_percent=$((used_mem * 100 / total_mem))
    
    echo "$memory_percent"
}

# Функция получения Java процессов с сортировкой по использованию памяти
get_java_processes() {
    ps aux | grep java | grep -v grep | awk '{print $2, $4, $6}' | sort -k2 -nr
}

# Функция завершения Java процесса
kill_java_process() {
    local pid=$1
    local memory_usage=$2
    
    log_message "Завершаем Java процесс PID: $pid (использование памяти: $memory_usage%)"
    
    # Сначала пытаемся мягко завершить процесс
    kill -TERM "$pid" 2>/dev/null
    
    # Ждем 5 секунд
    sleep 5
    
    # Проверяем, завершился ли процесс
    if kill -0 "$pid" 2>/dev/null; then
        log_message "Процесс $pid не завершился мягко, принудительно завершаем"
        kill -KILL "$pid" 2>/dev/null
    else
        log_message "Процесс $pid успешно завершен"
    fi
}

# Функция мониторинга памяти
monitor_memory() {
    local memory_percent=$(get_memory_info)
    
    log_message "Использование памяти: $memory_percent%"
    
    if [ "$memory_percent" -ge "$MEMORY_THRESHOLD" ]; then
        log_message "КРИТИЧЕСКИЙ УРОВЕНЬ ПАМЯТИ! ($memory_percent% >= $MEMORY_THRESHOLD%)"
        
        # Получаем список Java процессов
        local java_processes=$(get_java_processes)
        
        if [ -n "$java_processes" ]; then
            # Берем первый процесс (с наибольшим использованием памяти)
            local target_pid=$(echo "$java_processes" | head -n1 | awk '{print $1}')
            local target_memory=$(echo "$java_processes" | head -n1 | awk '{print $2}')
            
            if [ -n "$target_pid" ] && [ "$target_pid" != "" ]; then
                kill_java_process "$target_pid" "$target_memory"
                
                # Ждем немного и проверяем память снова
                sleep 10
                local new_memory_percent=$(get_memory_info)
                log_message "Память после завершения процесса: $new_memory_percent%"
            else
                log_message "Java процессы не найдены"
            fi
        else
            log_message "Java процессы не найдены"
        fi
    fi
}

# Функция показа статистики
show_stats() {
    echo "=== Статистика памяти ==="
    free -h
    echo ""
    echo "=== Java процессы ==="
    ps aux | grep java | grep -v grep | awk '{printf "PID: %s, CPU: %s%%, Memory: %s%%\n", $2, $3, $4}'
    echo ""
    echo "=== Лог мониторинга ==="
    tail -n 10 "$LOG_FILE" 2>/dev/null || echo "Лог файл не найден"
}

# Функция запуска мониторинга
start_monitoring() {
    log_message "Запуск мониторинга памяти (порог: $MEMORY_THRESHOLD%, интервал: $CHECK_INTERVAL сек)"
    
    while true; do
        monitor_memory
        sleep "$CHECK_INTERVAL"
    done
}

# Функция показа помощи
show_help() {
    echo "Скрипт мониторинга памяти и автоматического завершения Java процессов"
    echo ""
    echo "Использование:"
    echo "  $0 start          - Запустить мониторинг"
    echo "  $0 stats          - Показать статистику"
    echo "  $0 test           - Тестовая проверка (без завершения процессов)"
    echo "  $0 help           - Показать эту справку"
    echo ""
    echo "Конфигурация:"
    echo "  MEMORY_THRESHOLD=$MEMORY_THRESHOLD%"
    echo "  CHECK_INTERVAL=${CHECK_INTERVAL}с"
    echo "  LOG_FILE=$LOG_FILE"
}

# Функция тестовой проверки
test_check() {
    echo "=== Тестовая проверка памяти ==="
    local memory_percent=$(get_memory_info)
    echo "Использование памяти: $memory_percent%"
    
    if [ "$memory_percent" -ge "$MEMORY_THRESHOLD" ]; then
        echo "⚠️  КРИТИЧЕСКИЙ УРОВЕНЬ ПАМЯТИ!"
        echo "Java процессы, которые будут завершены:"
        get_java_processes | head -n3
    else
        echo "✅ Память в норме"
    fi
}

# Основная логика
case "${1:-help}" in
    start)
        start_monitoring
        ;;
    stats)
        show_stats
        ;;
    test)
        test_check
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "Неизвестная команда: $1"
        show_help
        exit 1
        ;;
esac
