import {Kafka} from "kafkajs";

const kafka = new Kafka({
    clientId: 'crm-app',
    brokers: ['localhost:9092']
});

export default kafka;