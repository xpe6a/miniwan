#!/usr/bin/env python3
import json
from datetime import datetime, date

# Загружаем данные
with open('data/cars.json', 'r', encoding='utf-8') as f:
    cars = json.load(f)

# Устанавливаем доступность для всех машин с сегодняшнего дня до 30 декабря 2030 года
today = date.today()
availability_start = today.strftime('%Y-%m-%d')
availability_end = '2030-12-30'

# Обновляем каждую машину
for car in cars:
    car['availability'] = {
        'startDate': availability_start,
        'endDate': availability_end,
        'isAvailable': True
    }

# Сохраняем обновленные данные
with open('data/cars.json', 'w', encoding='utf-8') as f:
    json.dump(cars, f, ensure_ascii=False, indent=2)

print(f"Обновлено {len(cars)} машин с доступностью с {availability_start} по {availability_end}")
