import asyncio
import json
import os
import httpx
from aiokafka import AIOKafkaConsumer

KAFKA_BROKER = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
TOPIC = "order_events"


async def process_and_export_json(order_data: dict):
    order_id = order_data.get("order_id")
    print(f"[INTEGRATION] Обработка заказа {order_id}...")
    os.makedirs("/app/exports", exist_ok=True)
    file_path = f"/app/exports/order_{order_id}.json"
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(order_data, f, ensure_ascii=False, indent=4)

    print(f"[INTEGRATION] Данные заказа {order_id} успешно сдублированы.")


async def consume():
    """Основной цикл Kafka Consumer"""
    consumer = AIOKafkaConsumer(
        TOPIC,
        bootstrap_servers=KAFKA_BROKER,
        # Автоматически парсим байты в JSON
        value_deserializer=lambda m: json.loads(m.decode('utf-8')),
        group_id="integration_workers_group"  # Имя группы слушателей
    )

    while True:
        try:
            await consumer.start()
            print(f"✅ Воркер интеграций подключился к Kafka. Слушаем топик: {TOPIC}")
            break
        except Exception as e:
            print(f"⏳ Ожидание Kafka... ({e})")
            await asyncio.sleep(5)

    try:
        async for msg in consumer:
            payload = msg.value
            event_type = payload.get("event_type")

            if event_type == "ORDER_CREATED":
                asyncio.create_task(process_and_export_json(payload))

            elif event_type == "ORDER_STATUS_CHANGED":
                print(f"[INTEGRATION] Обновление статуса: {payload.get('order_id')} -> {payload.get('new_status')}")

    finally:
        await consumer.stop()


if __name__ == "__main__":
    asyncio.run(consume())