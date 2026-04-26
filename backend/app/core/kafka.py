import os
import json
from aiokafka import AIOKafkaProducer
import sentry_sdk

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")

class KafkaService:
    def __init__(self):
        self.producer = None

    async def start(self):
        try:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )
            await self.producer.start()
            print("Kafka Producer started.")
        except Exception as e:
            print(f"Failed to connect to Kafka: {e}")
            sentry_sdk.capture_exception(e)

    async def stop(self):
        if self.producer:
            await self.producer.stop()
            print("Kafka Producer stopped.")

    async def send_message(self, topic: str, message: dict):
        if not self.producer:
            print("Kafka is not connected.")
            return
        await self.producer.send_and_wait(topic, message)

kafka_producer = KafkaService()